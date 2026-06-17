import { Parser } from 'node-sql-parser';

export interface ParsedSelectColumn {
  expr: any;
  column: string;
  table: string | null;
  as: string | null;
  aggregate: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | null;
}

export interface ParsedJoin {
  type: 'INNER' | 'LEFT' | 'RIGHT';
  table: string;
  as: string | null;
  on: {
    left: { table: string | null; column: string };
    right: { table: string | null; column: string };
    operator: string;
  } | null;
}

export interface ParsedOrderBy {
  column: string;
  table: string | null;
  type: 'ASC' | 'DESC';
}

export interface ParsedQuery {
  raw: string;
  ast: any;
  type: 'select';
  columns: ParsedSelectColumn[] | '*';
  from: { table: string; as: string | null }[];
  joins: ParsedJoin[];
  where: any | null;
  groupBy: { table: string | null; column: string }[] | null;
  having: any | null;
  orderBy: ParsedOrderBy[] | null;
  limit: number | null;
  distinct: boolean;
}

const parser = new Parser();

/**
 * Clean up extra quotes around column or table identifiers (e.g. `employees` or "employees")
 */
function cleanIdentifier(id: string | null | undefined): string {
  if (!id) return '';
  return id.replace(/[`"']/g, '');
}

export function parseSqlQuery(sql: string, dialect: string = 'ansi'): ParsedQuery {
  const cleanSql = sql.trim().replace(/;$/, '');
  
  let rawAst: any;
  try {
    const dbOption = dialect === 'ansi' ? undefined : dialect;
    rawAst = parser.astify(cleanSql, { database: dbOption as any });
  } catch (err: any) {
    throw new Error(`SQL Syntax Error (${dialect.toUpperCase()}): ${err.message || 'Check your query formatting.'}`);
  }

  // Ensure it's a single select query
  const ast = Array.isArray(rawAst) ? rawAst[0] : rawAst;
  if (!ast || ast.type !== 'select') {
    throw new Error('Unsupported Query Type: Only SELECT queries are supported in the visualizer.');
  }

  // Extract DISTINCT
  const distinct = ast.options && ast.options.includes('DISTINCT');

  // Extract Columns
  let columns: ParsedSelectColumn[] | '*' = '*';
  if (ast.columns && ast.columns !== '*') {
    columns = (ast.columns as any[]).map(col => {
      let columnName = '*';
      let table: string | null = null;
      let aggregate: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | null = null;
      
      const expr = col.expr;
      
      if (expr.type === 'column_ref') {
        columnName = cleanIdentifier(expr.column);
        table = cleanIdentifier(expr.table);
      } else if (expr.type === 'aggr_func') {
        const name = expr.name.toUpperCase();
        if (['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(name)) {
          aggregate = name as any;
        } else {
          throw new Error(`Unsupported aggregate function: ${name}`);
        }
        
        // Extract column from aggregate parameter
        const arg = expr.args?.expr;
        if (arg) {
          if (arg.type === 'column_ref') {
            columnName = cleanIdentifier(arg.column);
            table = cleanIdentifier(arg.table);
          } else if (arg.type === 'star') {
            columnName = '*';
          }
        }
      } else if (expr.type === 'star') {
        columnName = '*';
      }

      return {
        expr,
        column: columnName,
        table,
        as: col.as ? cleanIdentifier(col.as) : null,
        aggregate
      };
    });
  }

  // Extract From Tables & Joins
  const fromList: { table: string; as: string | null }[] = [];
  const joins: ParsedJoin[] = [];

  if (!ast.from || ast.from.length === 0) {
    throw new Error('SQL Query missing FROM clause.');
  }

  ast.from.forEach((f: any) => {
    const tableName = cleanIdentifier(f.table);
    const tableAlias = f.as ? cleanIdentifier(f.as) : null;

    if (f.join) {
      // It is a JOIN
      const typeStr = f.join.toUpperCase();
      let type: 'INNER' | 'LEFT' | 'RIGHT' = 'INNER';
      if (typeStr.includes('LEFT')) type = 'LEFT';
      else if (typeStr.includes('RIGHT')) type = 'RIGHT';

      // Parse ON clause
      let on: ParsedJoin['on'] = null;
      if (f.on) {
        // Simple ON clauses: table1.col1 = table2.col2
        const onExpr = f.on;
        if (onExpr.type === 'binary_expr' && onExpr.operator === '=') {
          const left = onExpr.left;
          const right = onExpr.right;
          if (left.type === 'column_ref' && right.type === 'column_ref') {
            on = {
              left: { table: cleanIdentifier(left.table), column: cleanIdentifier(left.column) },
              right: { table: cleanIdentifier(right.table), column: cleanIdentifier(right.column) },
              operator: '='
            };
          }
        } else {
          throw new Error('Supported JOIN conditions are limited to simple equality (e.g. table1.col1 = table2.col2).');
        }
      }

      joins.push({
        type,
        table: tableName,
        as: tableAlias,
        on
      });
    } else {
      // Base table
      fromList.push({
        table: tableName,
        as: tableAlias
      });
    }
  });

  // Extract GROUP BY
  let groupBy: ParsedQuery['groupBy'] = null;
  if (ast.groupby && ast.groupby.columns) {
    groupBy = (ast.groupby.columns as any[]).map(g => {
      if (g.type === 'column_ref') {
        return {
          table: cleanIdentifier(g.table),
          column: cleanIdentifier(g.column)
        };
      }
      throw new Error('Only column references are supported in GROUP BY.');
    });
  }

  // Extract HAVING
  const having = ast.having || null;

  // Extract ORDER BY
  let orderBy: ParsedQuery['orderBy'] = null;
  if (ast.orderby) {
    orderBy = (ast.orderby as any[]).map(o => {
      const expr = o.expr;
      if (expr.type === 'column_ref') {
        return {
          column: cleanIdentifier(expr.column),
          table: cleanIdentifier(expr.table),
          type: o.type || 'ASC'
        };
      }
      throw new Error('Only column references are supported in ORDER BY.');
    });
  }

  // Extract LIMIT
  let limit: number | null = null;
  if (ast.limit && ast.limit.value) {
    const limitObj = ast.limit.value[0];
    if (limitObj && limitObj.type === 'number') {
      limit = parseInt(limitObj.value, 10);
    }
  }

  return {
    raw: sql,
    ast,
    type: 'select',
    columns,
    from: fromList,
    joins,
    where: ast.where || null,
    groupBy,
    having,
    orderBy,
    limit,
    distinct
  };
}
