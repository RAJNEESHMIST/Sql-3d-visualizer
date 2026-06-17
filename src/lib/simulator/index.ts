import { ParsedQuery, ParsedSelectColumn, ParsedJoin, ParsedOrderBy } from '../parser/sql-parser';
import { datasets, TableData } from '../datasets/sample-datasets';

export interface ExecutionStep {
  id: number;
  type:
    | 'LOAD_TABLE'
    | 'SCAN_ROW'
    | 'JOIN_SCAN'
    | 'JOIN_MATCH'
    | 'JOIN_MISMATCH'
    | 'FILTER_EVAL'
    | 'FILTER_PASS'
    | 'FILTER_FAIL'
    | 'GROUP_CREATE'
    | 'GROUP_ADD'
    | 'AGGREGATE_ACCUMULATE'
    | 'AGGREGATE_FINAL'
    | 'HAVING_EVAL'
    | 'SORT_SWAP'
    | 'PROJECT_COLUMN'
    | 'RETURN_RESULT';
  description: string;
  table?: string;
  rowId?: number; // Primary key or index of row
  secondaryRowId?: number; // For JOIN right row
  groupKey?: string;
  data?: Record<string, any>;
  accumulated?: Record<string, any>;
}

export interface SimulationResult {
  steps: ExecutionStep[];
  columns: string[];
  rows: Record<string, any>[];
}

/**
 * Resolves a column value from row data supporting aliases and table names.
 */
function resolveColumnValue(colRef: { table: string | null; column: string }, row: Record<string, any>, aliases: Record<string, string>): any {
  const colName = colRef.column;
  const tableName = colRef.table;

  if (tableName) {
    // Check if tableName matches an alias or the original table name
    const resolvedTable = aliases[tableName] || tableName;
    const key = `${resolvedTable}.${colName}`;
    if (key in row) return row[key];
    
    // Fallback search
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === key.toLowerCase() || k.toLowerCase().endsWith(`.${colName.toLowerCase()}`)) {
        return row[k];
      }
    }
  }

  // Without table prefix, search for the column name directly
  if (colName in row) return row[colName];

  // Try finding a key that ends with the column name
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === colName.toLowerCase() || k.split('.').pop()?.toLowerCase() === colName.toLowerCase()) {
      return row[k];
    }
  }

  return undefined;
}

/**
 * Evaluates binary expressions and column references.
 */
function evaluateCondition(expr: any, row: Record<string, any>, aliases: Record<string, string>): any {
  if (!expr) return true;

  if (expr.type === 'column_ref') {
    return resolveColumnValue({ table: expr.table, column: expr.column }, row, aliases);
  }

  if (expr.type === 'number') {
    return Number(expr.value);
  }

  if (expr.type === 'string' || expr.type === 'single_quote_string') {
    return String(expr.value);
  }

  if (expr.type === 'binary_expr') {
    const leftVal = evaluateCondition(expr.left, row, aliases);
    const rightVal = evaluateCondition(expr.right, row, aliases);
    const op = expr.operator.toUpperCase();

    switch (op) {
      case '=':
        return leftVal == rightVal;
      case '!=':
      case '<>':
        return leftVal != rightVal;
      case '>':
        return Number(leftVal) > Number(rightVal);
      case '<':
        return Number(leftVal) < Number(rightVal);
      case '>=':
        return Number(leftVal) >= Number(rightVal);
      case '<=':
        return Number(leftVal) <= Number(rightVal);
      case 'AND':
        return Boolean(leftVal) && Boolean(rightVal);
      case 'OR':
        return Boolean(leftVal) || Boolean(rightVal);
      case 'LIKE':
        if (typeof leftVal !== 'string' || typeof rightVal !== 'string') return false;
        // Simple LIKE mapping (% to .*)
        const regexStr = '^' + rightVal.replace(/%/g, '.*').replace(/_/g, '.') + '$';
        return new RegExp(regexStr, 'i').test(leftVal);
      default:
        return false;
    }
  }

  return false;
}

/**
 * Stringifies condition for visual explanations.
 */
function stringifyExpr(expr: any): string {
  if (!expr) return '';
  if (expr.type === 'column_ref') {
    return expr.table ? `${expr.table}.${expr.column}` : expr.column;
  }
  if (expr.type === 'number' || expr.type === 'string' || expr.type === 'single_quote_string') {
    return String(expr.value);
  }
  if (expr.type === 'binary_expr') {
    return `(${stringifyExpr(expr.left)} ${expr.operator} ${stringifyExpr(expr.right)})`;
  }
  return '';
}

export function simulateQuery(query: ParsedQuery): SimulationResult {
  const steps: ExecutionStep[] = [];
  let stepCounter = 1;

  const addStep = (type: ExecutionStep['type'], description: string, extra?: Partial<ExecutionStep>) => {
    steps.push({
      id: stepCounter++,
      type,
      description,
      ...extra
    });
  };

  // Map of table aliases to actual table names
  const aliases: Record<string, string> = {};
  query.from.forEach(f => {
    if (f.as) {
      aliases[f.as] = f.table;
    }
  });
  query.joins.forEach(j => {
    if (j.as) {
      aliases[j.as] = j.table;
    }
  });

  // Step 1: LOAD base tables
  const baseTableMeta = query.from[0];
  if (!baseTableMeta) {
    throw new Error('No base table specified in FROM clause.');
  }

  const baseTableName = baseTableMeta.table.toLowerCase();
  const baseTable = datasets[baseTableName];
  if (!baseTable) {
    throw new Error(`Table "${baseTableMeta.table}" not found in registered datasets.`);
  }

  addStep('LOAD_TABLE', `Loading base table "${baseTable.name}" into memory.`, {
    table: baseTable.name,
    data: { columns: baseTable.columns, rowsCount: baseTable.rows.length }
  });

  // Load join tables
  query.joins.forEach(j => {
    const joinTable = datasets[j.table.toLowerCase()];
    if (!joinTable) {
      throw new Error(`Joined table "${j.table}" not found in registered datasets.`);
    }
    addStep('LOAD_TABLE', `Loading join table "${joinTable.name}" into memory.`, {
      table: joinTable.name,
      data: { columns: joinTable.columns, rowsCount: joinTable.rows.length }
    });
  });

  // Build working row set (qualifying columns to prevent namespace collisions)
  let workingRows: Record<string, any>[] = baseTable.rows.map(row => {
    const qualRow: Record<string, any> = {};
    Object.keys(row).forEach(k => {
      qualRow[`${baseTable.name}.${k}`] = row[k];
      // Keep direct key if it's the primary key / row id
      if (k === 'id') {
        qualRow['id'] = row[k];
      }
    });
    return qualRow;
  });

  // Step 2: JOINS simulation
  query.joins.forEach(j => {
    const joinTableName = j.table.toLowerCase();
    const joinTable = datasets[joinTableName];
    const joinedRows: Record<string, any>[] = [];

    // For visualization events, step through employee & department scan
    workingRows.forEach((leftRow, leftIdx) => {
      const leftId = leftRow[`${baseTable.name}.id`] || leftRow['id'] || leftIdx;
      addStep('SCAN_ROW', `Scanning row ${leftId} in primary table "${baseTable.name}".`, {
        table: baseTable.name,
        rowId: leftId,
        data: leftRow
      });

      let matchFound = false;

      joinTable.rows.forEach(rightRow => {
        const rightId = rightRow.id || rightRow.product_id || rightRow.movie_id || 0;
        addStep('JOIN_SCAN', `Checking for matches in "${joinTable.name}" row ${rightId}.`, {
          table: joinTable.name,
          rowId: leftId,
          secondaryRowId: rightId,
          data: rightRow
        });

        // Evaluate Join condition
        let isMatch = false;
        if (j.on) {
          const leftVal = resolveColumnValue(j.on.left, leftRow, aliases);
          
          // Qualify right side row momentarily
          const qualifiedRightRow: Record<string, any> = {};
          Object.keys(rightRow).forEach(k => {
            qualifiedRightRow[`${joinTable.name}.${k}`] = rightRow[k];
          });
          const rightVal = resolveColumnValue(j.on.right, qualifiedRightRow, aliases);

          isMatch = (leftVal != null && rightVal != null && leftVal == rightVal);
        }

        if (isMatch) {
          matchFound = true;
          const mergedRow = { ...leftRow };
          Object.keys(rightRow).forEach(k => {
            mergedRow[`${joinTable.name}.${k}`] = rightRow[k];
          });
          joinedRows.push(mergedRow);

          addStep('JOIN_MATCH', `Match found! Linked "${baseTable.name}" and "${joinTable.name}" on condition.`, {
            table: baseTable.name,
            rowId: leftId,
            secondaryRowId: rightId,
            data: mergedRow
          });
        } else {
          addStep('JOIN_MISMATCH', `No match on join condition between row ${leftId} and row ${rightId}.`, {
            table: baseTable.name,
            rowId: leftId,
            secondaryRowId: rightId
          });
        }
      });

      // Handle Left Outer Joins if no match found
      if (!matchFound && j.type === 'LEFT') {
        const mergedRow = { ...leftRow };
        joinTable.columns.forEach(col => {
          mergedRow[`${joinTable.name}.${col.name}`] = null;
        });
        joinedRows.push(mergedRow);
        addStep('JOIN_MATCH', `No join match. Preserving left table row (LEFT JOIN padding with NULL).`, {
          table: baseTable.name,
          rowId: leftId,
          data: mergedRow
        });
      }
    });

    // Handle Right Outer Joins (add right rows that never matched)
    if (j.type === 'RIGHT') {
      joinTable.rows.forEach(rightRow => {
        const rightId = rightRow.id || 0;
        const matched = joinedRows.some(jr => jr[`${joinTable.name}.id`] === rightRow.id);
        if (!matched) {
          const mergedRow: Record<string, any> = {};
          // Pad left with nulls
          baseTable.columns.forEach(col => {
            mergedRow[`${baseTable.name}.${col.name}`] = null;
          });
          // Add right row contents
          Object.keys(rightRow).forEach(k => {
            mergedRow[`${joinTable.name}.${k}`] = rightRow[k];
          });
          joinedRows.push(mergedRow);
          addStep('JOIN_MATCH', `Preserving unmatched right table row (RIGHT JOIN padding with NULL).`, {
            table: joinTable.name,
            secondaryRowId: rightId,
            data: mergedRow
          });
        }
      });
    }

    workingRows = joinedRows;
  });

  // Step 3: WHERE filtration simulation
  if (query.where) {
    const filteredRows: Record<string, any>[] = [];
    const conditionStr = stringifyExpr(query.where);

    workingRows.forEach((row, idx) => {
      const rowId = row[`${baseTable.name}.id`] || row['id'] || idx + 1;
      addStep('FILTER_EVAL', `Evaluating WHERE condition: ${conditionStr} on row ${rowId}.`, {
        rowId,
        data: row
      });

      const passed = evaluateCondition(query.where, row, aliases);

      if (passed) {
        filteredRows.push(row);
        addStep('FILTER_PASS', `Row ${rowId} PASSED filter condition.`, {
          rowId,
          data: row
        });
      } else {
        addStep('FILTER_FAIL', `Row ${rowId} FAILED filter condition.`, {
          rowId,
          data: row
        });
      }
    });

    workingRows = filteredRows;
  }

  // Step 4: GROUP BY clustering
  let groupedData: Record<string, Record<string, any>[]> = {};
  const isGroupedQuery = query.groupBy !== null || (Array.isArray(query.columns) && query.columns.some(c => c.aggregate !== null));

  if (isGroupedQuery) {
    if (query.groupBy) {
      workingRows.forEach((row, idx) => {
        const rowId = row[`${baseTable.name}.id`] || row['id'] || idx + 1;
        // Calculate grouping keys
        const groupKeys = query.groupBy!.map(g => {
          const val = resolveColumnValue(g, row, aliases);
          return val === null ? 'NULL' : String(val);
        });
        const groupKey = groupKeys.join(' | ');

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = [];
          addStep('GROUP_CREATE', `Creating new group container for "${groupKey}".`, {
            groupKey
          });
        }

        groupedData[groupKey].push(row);
        addStep('GROUP_ADD', `Moving row ${rowId} into group cluster: "${groupKey}".`, {
          rowId,
          groupKey,
          data: row
        });
      });
    } else {
      // Aggregate query without GROUP BY (implicit single group)
      groupedData['ALL'] = workingRows;
      addStep('GROUP_CREATE', `Grouping all rows into a single aggregation container.`, {
        groupKey: 'ALL'
      });
      workingRows.forEach((row, idx) => {
        const rowId = row[`${baseTable.name}.id`] || row['id'] || idx + 1;
        addStep('GROUP_ADD', `Adding row ${rowId} to global aggregation container.`, {
          rowId,
          groupKey: 'ALL',
          data: row
        });
      });
    }
  }

  // Step 5: HAVING clause filtration (on groups)
  if (query.having && isGroupedQuery) {
    const filteredGroups: typeof groupedData = {};
    const havingStr = stringifyExpr(query.having);

    Object.keys(groupedData).forEach(groupKey => {
      const groupRows = groupedData[groupKey];
      // Generate summary row for condition check (usually has aggregated inputs)
      // For simplicity in teaching, we evaluate HAVING directly on aggregate mock results
      const summaryRow: Record<string, any> = { ...groupRows[0] };
      
      // Calculate aggregate sums for having checks
      if (Array.isArray(query.columns)) {
        query.columns.forEach(col => {
          if (col.aggregate) {
            const colRef = { table: col.table, column: col.column };
            summaryRow[`${col.aggregate}(${col.column})`] = calculateAggregateVal(col.aggregate, colRef, groupRows, aliases);
          }
        });
      }

      const passed = evaluateCondition(query.having, summaryRow, aliases);
      addStep('HAVING_EVAL', `Evaluating HAVING: ${havingStr} on group "${groupKey}".`, {
        groupKey,
        data: { passed }
      });

      if (passed) {
        filteredGroups[groupKey] = groupRows;
      }
    });

    groupedData = filteredGroups;
  }

  // Step 6: SELECT & Aggregation evaluation
  let projectTargetRows: Record<string, any>[] = [];

  if (isGroupedQuery) {
    Object.keys(groupedData).forEach(groupKey => {
      const groupRows = groupedData[groupKey];
      const resultRow: Record<string, any> = {};

      if (Array.isArray(query.columns)) {
        query.columns.forEach(col => {
          const colRef = { table: col.table, column: col.column };
          const targetKey = col.as || (col.aggregate ? `${col.aggregate}(${col.column})` : col.column);
          
          if (col.aggregate) {
            // Step-by-step accumulation for animation
            let runningVal = 0;
            groupRows.forEach((row, idx) => {
              const rowId = row[`${baseTable.name}.id`] || row['id'] || idx + 1;
              const val = colRef.column === '*' ? 1 : resolveColumnValue(colRef, row, aliases);
              
              if (val != null) {
                if (col.aggregate === 'COUNT') runningVal += 1;
                else if (col.aggregate === 'SUM') runningVal += Number(val);
                else if (col.aggregate === 'AVG') runningVal += Number(val);
                else if (col.aggregate === 'MIN') runningVal = idx === 0 ? Number(val) : Math.min(runningVal, Number(val));
                else if (col.aggregate === 'MAX') runningVal = idx === 0 ? Number(val) : Math.max(runningVal, Number(val));
              }

              addStep('AGGREGATE_ACCUMULATE', `Accumulating value ${val} into ${col.aggregate} for group "${groupKey}".`, {
                rowId,
                groupKey,
                accumulated: { [targetKey]: runningVal }
              });
            });

            // Final value
            let finalVal = runningVal;
            if (col.aggregate === 'AVG' && groupRows.length > 0) {
              finalVal = Number((runningVal / groupRows.length).toFixed(2));
            }
            resultRow[targetKey] = finalVal;
            
            addStep('AGGREGATE_FINAL', `Calculated final ${col.aggregate}(${col.column}) = ${finalVal} for group "${groupKey}".`, {
              groupKey,
              accumulated: { [targetKey]: finalVal }
            });

          } else {
            // Grouping key columns
            const val = resolveColumnValue(colRef, groupRows[0], aliases);
            resultRow[targetKey] = val;
          }
        });
      }

      projectTargetRows.push(resultRow);
    });
  } else {
    // Normal query (non-grouped) projection
    workingRows.forEach((row, idx) => {
      const rowId = row[`${baseTable.name}.id`] || row['id'] || idx + 1;
      const resultRow: Record<string, any> = {};

      if (query.columns === '*') {
        // Project all columns
        Object.keys(row).forEach(k => {
          const cleanK = k.split('.').pop() || k;
          if (cleanK !== 'id') {
            resultRow[cleanK] = row[k];
          }
        });
        addStep('PROJECT_COLUMN', `Projecting all columns for row ${rowId}.`, {
          rowId,
          data: resultRow
        });
      } else {
        const colNamesProj: string[] = [];
        query.columns.forEach(col => {
          const colRef = { table: col.table, column: col.column };
          const val = resolveColumnValue(colRef, row, aliases);
          const targetKey = col.as || col.column;
          resultRow[targetKey] = val;
          colNamesProj.push(targetKey);
        });

        addStep('PROJECT_COLUMN', `Projecting columns [${colNamesProj.join(', ')}] for row ${rowId}.`, {
          rowId,
          data: resultRow
        });
      }

      projectTargetRows.push(resultRow);
    });
  }

  // Handle DISTINCT
  if (query.distinct) {
    const uniqueRows: Record<string, any>[] = [];
    const seen = new Set<string>();
    
    projectTargetRows.forEach(row => {
      const strVal = JSON.stringify(row);
      if (!seen.has(strVal)) {
        seen.add(strVal);
        uniqueRows.push(row);
      }
    });
    
    projectTargetRows = uniqueRows;
  }

  // Step 7: ORDER BY sorting
  if (query.orderBy && projectTargetRows.length > 0) {
    const order = query.orderBy;
    
    projectTargetRows.sort((a, b) => {
      for (const o of order) {
        const key = o.column; // Result keys are projection columns
        const aVal = a[key];
        const bVal = b[key];

        if (aVal === bVal) continue;
        
        const isAsc = o.type === 'ASC';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return isAsc ? aVal - bVal : bVal - aVal;
        }
        return isAsc
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
      return 0;
    });

    addStep('SORT_SWAP', `Sorting results based on ORDER BY directives.`, {
      data: { order: order.map(o => `${o.column} ${o.type}`).join(', ') }
    });
  }

  // Step 8: LIMIT constraints
  if (query.limit !== null && projectTargetRows.length > query.limit) {
    projectTargetRows = projectTargetRows.slice(0, query.limit);
    addStep('SORT_SWAP', `Applying LIMIT of ${query.limit} rows.`, {
      data: { limit: query.limit }
    });
  }

  // Get final visual columns list
  let resultColumns: string[] = [];
  if (projectTargetRows.length > 0) {
    resultColumns = Object.keys(projectTargetRows[0]);
  } else if (query.columns !== '*') {
    resultColumns = query.columns.map(c => c.as || c.column);
  }

  addStep('RETURN_RESULT', `Rendering final query output table (${projectTargetRows.length} rows).`, {
    data: { rowsCount: projectTargetRows.length, columns: resultColumns }
  });

  return {
    steps,
    columns: resultColumns,
    rows: projectTargetRows
  };
}

/**
 * Helper to calculate final aggregate value for HAVING comparisons
 */
function calculateAggregateVal(
  aggregate: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX',
  colRef: { table: string | null; column: string },
  rows: Record<string, any>[],
  aliases: Record<string, string>
): number {
  if (aggregate === 'COUNT') return rows.length;
  
  const values = rows
    .map(r => (colRef.column === '*' ? 1 : resolveColumnValue(colRef, r, aliases)))
    .filter(v => v != null)
    .map(Number);
    
  if (values.length === 0) return 0;
  
  if (aggregate === 'SUM') return values.reduce((sum, v) => sum + v, 0);
  if (aggregate === 'AVG') return Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2));
  if (aggregate === 'MIN') return Math.min(...values);
  if (aggregate === 'MAX') return Math.max(...values);
  
  return 0;
}
