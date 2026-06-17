import { describe, it, expect } from 'vitest';
import { parseSqlQuery } from '../src/lib/parser/sql-parser';
import { simulateQuery } from '../src/lib/simulator';

describe('SQL Parser & Simulator Unit Tests', () => {
  
  it('should parse a simple SELECT query with columns and base table', () => {
    const sql = 'SELECT name, salary, role FROM employees';
    const parsed = parseSqlQuery(sql);
    
    expect(parsed.type).toBe('select');
    expect(parsed.from[0].table).toBe('employees');
    expect(parsed.columns).not.toBe('*');
    if (Array.isArray(parsed.columns)) {
      expect(parsed.columns.length).toBe(3);
      expect(parsed.columns[0].column).toBe('name');
      expect(parsed.columns[1].column).toBe('salary');
      expect(parsed.columns[2].column).toBe('role');
    }
  });

  it('should parse JOIN clauses and conditional operators', () => {
    const sql = `
      SELECT e.name, d.department_name 
      FROM employees e 
      JOIN departments d ON e.department_id = d.id 
      WHERE e.salary > 60000
    `;
    const parsed = parseSqlQuery(sql);
    
    expect(parsed.joins.length).toBe(1);
    expect(parsed.joins[0].table).toBe('departments');
    expect(parsed.joins[0].as).toBe('d');
    expect(parsed.joins[0].on?.left.column).toBe('department_id');
    expect(parsed.joins[0].on?.right.column).toBe('id');
    expect(parsed.where).toBeDefined();
  });

  it('should simulate a query and output sequential visual steps', () => {
    const sql = 'SELECT name, salary FROM employees WHERE salary > 90000';
    const parsed = parseSqlQuery(sql);
    const result = simulateQuery(parsed);
    
    // Validate simulator output structures
    expect(result.steps).toBeDefined();
    expect(result.steps.length).toBeGreaterThan(0);
    
    // Check if LOAD_TABLE step exists
    const loadStep = result.steps.find(s => s.type === 'LOAD_TABLE');
    expect(loadStep).toBeDefined();
    expect(loadStep?.table).toBe('employees');

    // Check final rows projected
    expect(result.columns).toContain('name');
    expect(result.columns).toContain('salary');
    
    // In employees dataset, Bob (92000), Diana (110000), Ian (125000), Julia (95000) match salary > 90000. Exactly 4 rows.
    expect(result.rows.length).toBe(4);
    expect(result.rows.every(r => r.salary > 90000)).toBe(true);
  });

  it('should calculate aggregated query groups correctly', () => {
    const sql = 'SELECT department_id, COUNT(*) as staff_count, SUM(salary) as budget FROM employees GROUP BY department_id';
    const parsed = parseSqlQuery(sql);
    const result = simulateQuery(parsed);
    
    expect(result.columns).toContain('department_id');
    expect(result.columns).toContain('staff_count');
    expect(result.columns).toContain('budget');
    
    // Verify grouping counts
    // Department 1 has 3 employees: Alice (85K), Bob (92K), Fiona (75K). Total = 252K.
    const dept1 = result.rows.find(r => r.department_id === 1);
    expect(dept1).toBeDefined();
    expect(dept1?.staff_count).toBe(3);
    expect(dept1?.budget).toBe(252000);
  });

});
