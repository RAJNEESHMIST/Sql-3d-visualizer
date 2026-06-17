export interface Lesson {
  id: number;
  title: string;
  concept: string;
  description: string;
  query: string;
  datasetName: string;
  challengeQuestion: string;
  challengeOptions: string[];
  correctAnswer: string;
  explanation: string;
}

export const lessons: Lesson[] = [
  {
    id: 1,
    title: '1. Retrieval & Column Projection (SELECT)',
    concept: 'SELECT',
    description: 'The starting point of any SQL query. SELECT determines which columns (attributes) are projected from the target table. Interviewers check if you select only what is needed instead of using SELECT * to minimize buffer pools.',
    query: `SELECT name, role, salary FROM employees`,
    datasetName: 'employees',
    challengeQuestion: 'Why is using explicit column projections (SELECT name, salary) preferred over SELECT * in production databases?',
    challengeOptions: [
      'It allows database engines to use index-only scans and reduces memory buffer allocation.',
      'It makes the query run in single-threaded mode.',
      'It prevents rows from being locked during transaction blocks.',
      'It is a syntactic requirement; SELECT * is deprecated in ANSI SQL.'
    ],
    correctAnswer: 'It allows database engines to use index-only scans and reduces memory buffer allocation.',
    explanation: 'Explicit projections allow the database optimizer to fetch only the required column data. If the columns are covered by an index, the engine can execute an Index-Only Scan, bypassing table block reads entirely.'
  },
  {
    id: 2,
    title: '2. Conditional Filtering (WHERE & NULLs)',
    concept: 'WHERE',
    description: 'The WHERE clause performs row-level selection. Interviewers frequently test how databases handle NULL values—specifically that NULL represents an unknown state, so checks must use IS NULL instead of = NULL.',
    query: `SELECT name, role, salary FROM employees WHERE salary >= 70000 AND department_id IS NOT NULL`,
    datasetName: 'employees',
    challengeQuestion: 'In SQL, what is the evaluated result of the comparison expression (salary = NULL)?',
    challengeOptions: [
      'FALSE',
      'TRUE',
      'UNKNOWN (NULL)',
      'Syntax Error'
    ],
    correctAnswer: 'UNKNOWN (NULL)',
    explanation: 'In SQL three-valued logic, comparing any value to NULL using standard comparison operators (=, !=, <, >) results in UNKNOWN. You must always use "IS NULL" or "IS NOT NULL" to verify null states.'
  },
  {
    id: 3,
    title: '3. Combining Tables (INNER vs OUTER JOINS)',
    concept: 'JOIN',
    description: 'Joins stitch normalized data across tables. Interviewers look for deep understanding of join logic, matching conditions, and how OUTER joins pad unmatched records with NULLs.',
    query: `SELECT e.name, d.department_name, e.salary
FROM employees e
JOIN departments d
ON e.department_id = d.id`,
    datasetName: 'employees',
    challengeQuestion: 'If the LEFT table has 10 rows and the RIGHT table has 5 rows, what is the maximum possible row count for an INNER JOIN?',
    challengeOptions: [
      '5 rows',
      '10 rows',
      '50 rows',
      '15 rows'
    ],
    correctAnswer: '50 rows',
    explanation: 'If all 10 rows on the left table match all 5 rows on the right table on the JOIN condition (e.g. duplicate keys), the result set scales to a Cartesian product of N * M, which yields exactly 50 rows.'
  },
  {
    id: 4,
    title: '4. Data Aggregations (GROUP BY)',
    concept: 'GROUP BY',
    description: 'GROUP BY aggregates row groups into summary clusters. A classic interview pitfall is attempting to select columns that are neither grouped nor aggregated, which violates SQL standards.',
    query: `SELECT department_id, COUNT(*) as staff_count, AVG(salary) as average_payroll
FROM employees
GROUP BY department_id`,
    datasetName: 'employees',
    challengeQuestion: 'Which columns can be included in the SELECT clause of a query that contains a GROUP BY clause?',
    challengeOptions: [
      'Only columns listed in the GROUP BY clause or columns enclosed in aggregate functions.',
      'Any column in the source tables.',
      'Only numeric columns.',
      'Only columns declared as primary keys.'
    ],
    correctAnswer: 'Only columns listed in the GROUP BY clause or columns enclosed in aggregate functions.',
    explanation: 'If a column is not in the GROUP BY list, it does not have a single value per group. Thus, referencing it directly in the SELECT clause is invalid because the engine wouldn\'t know which row\'s value to display.'
  },
  {
    id: 5,
    title: '5. Group Filters (HAVING vs WHERE)',
    concept: 'HAVING',
    description: 'HAVING filters aggregated groups. A core interview question is distinguishing HAVING (which filters groups *after* aggregation) from WHERE (which filters rows *before* aggregation).',
    query: `SELECT department_id, SUM(salary) as total_budget
FROM employees
GROUP BY department_id
HAVING COUNT(*) >= 3`,
    datasetName: 'employees',
    challengeQuestion: 'Can aggregate functions (e.g., SUM, COUNT) be checked inside a WHERE clause?',
    challengeOptions: [
      'Yes, by nesting them inside a subquery.',
      'No, because WHERE filters individual rows before they are clustered into groups.',
      'Yes, as long as the columns are indexed.',
      'Only in MySQL; other engines throw errors.'
    ],
    correctAnswer: 'No, because WHERE filters individual rows before they are clustered into groups.',
    explanation: 'The WHERE clause operates on raw rows before grouping is executed. Since aggregations (like SUM) don\'t exist yet, you cannot reference aggregate values inside WHERE; you must use HAVING.'
  },
  {
    id: 6,
    title: '6. Conditional Logic (CASE WHEN)',
    concept: 'CASE',
    description: 'CASE WHEN acts as if-else logic in SQL. It is used in interviews to test data pivoting, custom column buckets, or conditional aggregations (e.g. counting specific subsets).',
    query: `SELECT name, salary,
  CASE 
    WHEN salary >= 90000 THEN 'High Tier'
    WHEN salary >= 60000 THEN 'Mid Tier'
    ELSE 'Junior Tier'
  END as compensation_tier
FROM employees`,
    datasetName: 'employees',
    challengeQuestion: 'In a CASE statement, what happens if none of the WHEN conditions are met and there is no ELSE clause?',
    challengeOptions: [
      'The query crashes with an execution error.',
      'The column returns a NULL value.',
      'The column returns an empty string.',
      'The engine defaults to the value of the first WHEN clause.'
    ],
    correctAnswer: 'The column returns a NULL value.',
    explanation: 'If no condition in the CASE statement evaluates to TRUE and no ELSE block is specified, the SQL engine implicitly evaluates the statement to NULL.'
  },
  {
    id: 7,
    title: '7. Results Sorting & Pagination (ORDER BY & LIMIT)',
    concept: 'ORDER BY',
    description: 'ORDER BY sorts query outputs. LIMIT restricts payload size. Interviewers check if you know that ORDER BY is resource-intensive because it requires sorting buffers in temporary memory disk blocks.',
    query: `SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3`,
    datasetName: 'employees',
    challengeQuestion: 'Why is it critical to include an ORDER BY clause when implementing pagination with LIMIT?',
    challengeOptions: [
      'Without ORDER BY, the database does not guarantee a deterministic row sequence, leading to duplicate or missing rows across pages.',
      'The LIMIT clause throws a syntax error if ORDER BY is omitted.',
      'ORDER BY is required to activate index usage on limit offsets.',
      'It forces the query to bypass transaction locks.'
    ],
    correctAnswer: 'Without ORDER BY, the database does not guarantee a deterministic row sequence, leading to duplicate or missing rows across pages.',
    explanation: 'SQL tables are unsorted sets. Without an explicit ORDER BY clause, the database engine returns records in whatever order is most convenient (based on scan paths). Pagination requires ORDER BY to ensure stability.'
  },
  {
    id: 8,
    title: '8. Set Operations (UNION vs UNION ALL)',
    concept: 'UNION',
    description: 'Set operators combine results from multiple SELECT queries. Interviewers frequently ask you to compare UNION (which removes duplicate rows via an expensive sorting dedup phase) with UNION ALL (which combines datasets directly).',
    query: `SELECT name FROM employees WHERE salary > 90000
UNION ALL
SELECT name FROM employees WHERE role = 'Software Engineer'`,
    datasetName: 'employees',
    challengeQuestion: 'Under what conditions is UNION preferred over UNION ALL, and what is its performance cost?',
    challengeOptions: [
      'UNION is preferred when you must exclude duplicate rows, but it incurs a performance cost due to a sorting/hashing deduplication phase.',
      'UNION is always faster because it reduces the volume of rows in memory.',
      'UNION is preferred only when combining columns with different data types.',
      'UNION ALL requires indexing; UNION does not.'
    ],
    correctAnswer: 'UNION is preferred when you must exclude duplicate rows, but it incurs a performance cost due to a sorting/hashing deduplication phase.',
    explanation: 'UNION performs a sorting or hashing pass over the combined results to remove duplicate rows, whereas UNION ALL simply appends the streams. Use UNION ALL unless duplicates must be removed.'
  },
  {
    id: 9,
    title: '9. Subqueries & Uncorrelated Lookups',
    concept: 'SUBQUERY',
    description: 'A subquery is a query nested inside another. Interviewers verify if you understand the execution order—specifically that an uncorrelated subquery runs exactly once and caches its results.',
    query: `SELECT name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)`,
    datasetName: 'employees',
    challengeQuestion: 'What is the distinction between an uncorrelated subquery and a correlated subquery?',
    challengeOptions: [
      'An uncorrelated subquery runs independently of the outer query; a correlated subquery references columns from the outer query and executes for every row processed.',
      'Correlated subqueries do not support aggregation functions.',
      'Uncorrelated subqueries are restricted to the WHERE clause.',
      'Correlated subqueries run faster because they bypass indexes.'
    ],
    correctAnswer: 'An uncorrelated subquery runs independently of the outer query; a correlated subquery references columns from the outer query and executes for every row processed.',
    explanation: 'Uncorrelated subqueries are evaluated once by the query planner. Correlated subqueries reference the outer table, meaning the engine must run the nested query repeatedly for each outer row, scaling to O(N * M).'
  },
  {
    id: 10,
    title: '10. Common Table Expressions (CTEs)',
    concept: 'CTE',
    description: 'CTEs define temporary result sets. They improve query readability over nested subqueries and can support recursive processes. Interviewers value CTEs for structuring complex reporting queries.',
    query: `WITH HighPaidEmployees AS (
  SELECT id, name, salary, department_id 
  FROM employees 
  WHERE salary > 80000
)
SELECT h.name, d.department_name 
FROM HighPaidEmployees h
JOIN departments d ON h.department_id = d.id`,
    datasetName: 'employees',
    challengeQuestion: 'Does a standard, non-recursive CTE act as a temporary table stored on physical disk?',
    challengeOptions: [
      'No, a CTE is a syntax wrapper that the optimizer compiles inline; it behaves like a view and is not materialized unless explicitly supported by the database engine.',
      'Yes, it is physically written to tempdb space.',
      'Yes, and it persists until the database session is closed.',
      'Only when the CTE contains a JOIN clause.'
    ],
    correctAnswer: 'No, a CTE is a syntax wrapper that the optimizer compiles inline; it behaves like a view and is not materialized unless explicitly supported by the database engine.',
    explanation: 'In most SQL engines, CTEs are syntax-level expressions. The query optimizer merges the CTE definition directly into the main query before building the execution plan. It is not materialized on disk.'
  },
  {
    id: 11,
    title: '11. Window Functions & Rankings',
    concept: 'WINDOW',
    description: 'Window functions calculate values across partitions without collapsing rows. This is a highly requested advanced interview topic (ranking salaries, running averages, or computing lag/lead stats).',
    query: `SELECT name, department_id, salary,
  COUNT(*) OVER(PARTITION BY department_id) as dept_staff_count
FROM employees`,
    datasetName: 'employees',
    challengeQuestion: 'What is the key difference between a GROUP BY aggregation and a window function with OVER(PARTITION BY)?',
    challengeOptions: [
      'GROUP BY collapses rows into a single summary row per group; Window functions append the aggregate calculation to each individual row without collapsing them.',
      'Window functions cannot calculate averages (AVG).',
      'GROUP BY can only be executed on indexed primary keys.',
      'Window functions operate on temp tables; GROUP BY operates on source tables.'
    ],
    correctAnswer: 'GROUP BY collapses rows into a single summary row per group; Window functions append the aggregate calculation to each individual row without collapsing them.',
    explanation: 'GROUP BY collapses the result stream so you lose detail rows. Window functions run aggregates over subsets while preserving the identity and columns of every individual row card in the stream.'
  },
  {
    id: 12,
    title: '12. Index Optimization & Scan Pathways',
    concept: 'INDEX',
    description: 'Indexes speed up retrieval. Interviewers check if you know when an index is ignored (e.g. functions applied to columns, mismatched type comparisons, or leading wildcard LIKE searches).',
    query: `SELECT id, name FROM employees WHERE id = 5`,
    datasetName: 'employees',
    challengeQuestion: 'Which of the following WHERE conditions would prevent the query optimizer from executing an index seek on a B-Tree indexed column named "join_date"?',
    challengeOptions: [
      'WHERE YEAR(join_date) = 2025',
      'WHERE join_date = \'2025-01-15\'',
      'WHERE join_date >= \'2025-01-01\' AND join_date <= \'2025-12-31\'',
      'WHERE join_date IS NOT NULL'
    ],
    correctAnswer: 'WHERE YEAR(join_date) = 2025',
    explanation: 'Applying a function (like YEAR) to an indexed column forces the database to evaluate the function for every row in the table, preventing the optimizer from performing a B-Tree search. This is called a non-sargable query.'
  }
];
