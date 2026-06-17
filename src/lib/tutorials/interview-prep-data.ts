export interface InterviewPrepLesson {
  id: number;
  title: string;
  concept: string;
  quickAnswer: string;
  definition: string;
  whyItExists: string;
  coreConcepts: string;
  stepByStep: string;
  visualExplanation: string;
  analogy: string;
  beginnerExample: string;
  intermediateExample: string;
  advancedExample: string;
  internalWorking: string;
  advantages: string;
  disadvantages: string;
  commonMistakes: string[];
  bestPractices: string[];
  performanceConsiderations: string;
  securityConsiderations: string;
  industryUseCases: string;
  interviewQuestions: { q: string; a: string }[];
  faqs: { q: string; a: string }[];
  relatedConcepts: string[];
  summary: string;
  resources: string[];
}

export const interviewPrepLessons: InterviewPrepLesson[] = [
  {
    id: 1,
    title: "Retrieval & Column Projection (SELECT)",
    concept: "SELECT",
    quickAnswer: "SELECT specifies which columns of data to retrieve from one or more tables. Rather than retrieving all columns using SELECT *, professional practice demands specifying exact columns to reduce network load, memory consumption, and disk I/O.",
    definition: "The SELECT clause is the projection operator in relational algebra. It defines the vertical subset of columns returned in the final result set, mapping attributes from the logical table schemas to the query output schema.",
    whyItExists: "Without projection, every query would transfer entire tables across the network, wasting database buffer pool space and client memory. Selective projection allows the engine to fetch only what is requested, enabling optimizations like Index-Only Scans.",
    coreConcepts: "SELECT [ALL | DISTINCT] column_list FROM table_name;\n- DISTINCT: Filters out duplicate rows from the projected set.\n- Column Aliasing (AS): Renames columns for output clarity.\n- Expressions: Select can project computed fields (e.g., salary * 1.1).",
    stepByStep: "1. FROM loads the table metadata and data blocks.\n2. WHERE evaluates row filtering conditions (if present).\n3. GROUP BY clusters rows (if present).\n4. HAVING filters groups (if present).\n5. SELECT identifies the columns to project.\n6. DISTINCT removes duplicates.\n7. ORDER BY sorts the projected set.\n8. LIMIT/OFFSET truncates the final stream.",
    visualExplanation: "Source Table Rows (All Columns):\n[ID: 1 | Name: Alice | Salary: 95000 | Address: 123 Pine St | Notes: ...]\n[ID: 2 | Name: Bob   | Salary: 72000 | Address: 456 Oak St  | Notes: ...]\n\nSELECT name, salary FROM employees;\n(Projecting only 'name' and 'salary' columns):\n+---------+--------+\n| name    | salary |\n+---------+--------+\n| Alice   | 95000  |\n| Bob     | 72000  |\n+---------+--------+",
    analogy: "Think of a spreadsheet representing a company org chart. SELECT * is equivalent to copying the entire spreadsheet with all personal details. Projections (SELECT name, role) are equivalent to copying only the name and role columns for a public announcement sheet.",
    beginnerExample: "SELECT name, role FROM employees;",
    intermediateExample: "SELECT DISTINCT role, department_id FROM employees WHERE department_id IS NOT NULL;",
    advancedExample: "SELECT id, name, salary, (salary * 0.15) AS estimated_tax FROM employees ORDER BY estimated_tax DESC LIMIT 5;",
    internalWorking: "When executing SELECT columns, the storage engine reads pages from disk into the buffer pool. If the columns are covered by a B-Tree index, the engine performs an 'Index-Only Scan' (no table heap lookups). If SELECT * is used, the engine must perform a 'Table Scan' or 'Clustered Index Scan' to read all attributes, including large VARCHAR or LOB fields from overflow pages.",
    advantages: "1. Drastically reduces network payload sizes.\n2. Saves database server buffer pool memory.\n3. Enables index-only execution paths, which are magnitudes faster.\n4. Avoids breaking application code when schemas add new columns.",
    disadvantages: "1. Requires developers to explicitly list columns, slightly increasing query length.\n2. Ad-hoc schema updates might require updating multiple queries.",
    commonMistakes: [
      "Using SELECT * in production application codes, leading to unnecessary data overhead.",
      "Using SELECT DISTINCT unnecessarily, forcing the engine to perform a costly sorting/hashing dedup process."
    ],
    bestPractices: [
      "Always project explicit columns in application queries.",
      "Keep calculations and string formatting out of SELECT if they can be handled by the client application."
    ],
    performanceConsiderations: "Avoid projecting columns containing large text blobs (CLOB/TEXT) unless absolutely necessary, as they require extra page reads and cache allocations.",
    securityConsiderations: "Using explicit column names prevents accidental exposure of sensitive fields (like hashed_password) that could happen if SELECT * is dynamically mapped to a client-facing JSON endpoint.",
    industryUseCases: "Reporting dashboards fetching user summary tables, API endpoints delivering specific payload objects, mobile apps loading truncated lists.",
    interviewQuestions: [
      {
        q: "What is the primary performance downside of using SELECT * in production queries?",
        a: "SELECT * forces the database engine to perform a heap look up or scan the entire table structure, reading every column from disk/cache. It prevents index-only scans, inflates network transfer sizes, wastes buffer memory, and can break applications if columns are added or reordered."
      },
      {
        q: "How does SELECT DISTINCT impact performance?",
        a: "DISTINCT requires the engine to scan the selected values and group or sort them to filter out duplicates. This translates to an O(N log N) sorting operation or an O(N) hash-table build in memory, which adds latency on larger datasets."
      }
    ],
    faqs: [
      {
        q: "Does SELECT 1 or SELECT * perform better in EXISTS clauses?",
        a: "Most modern database optimizers treat EXISTS (SELECT 1 ...) and EXISTS (SELECT * ...) identically because EXISTS only checks for row presence and does not project any columns."
      }
    ],
    relatedConcepts: [
      "Index-Only Scans",
      "Clustered vs Non-Clustered Indexes",
      "Table Heap Allocation"
    ],
    summary: "SELECT governs column projections. Best practices dictate explicitly listing desired fields to minimize memory, network, and execution latency.",
    resources: [
      "High Performance MySQL (Chapter 5: Indexing for Projections)",
      "PostgreSQL Official Documentation: SELECT clause"
    ]
  },
  {
    id: 2,
    title: "Conditional Filtering (WHERE & NULLs)",
    concept: "WHERE",
    quickAnswer: "WHERE filters rows before any grouping or projections occur. A primary interview concept is SQL's three-valued logic (TRUE, FALSE, UNKNOWN), which dictates that NULL comparisons must use 'IS NULL' rather than '= NULL'.",
    definition: "The WHERE clause represents the Selection operator (sigma) in relational algebra. It defines the horizontal subset of rows from the source relations that satisfy a boolean predicate.",
    whyItExists: "Instead of transferring entire datasets to client systems to filter in code, the database filters records close to the storage layer, leveraging indexes to skip non-matching data blocks entirely.",
    coreConcepts: "WHERE condition1 AND/OR/NOT condition2;\n- Three-valued logic: Expressions evaluate to TRUE, FALSE, or UNKNOWN (NULL).\n- IS NULL / IS NOT NULL: Checked because NULL is a state of missing data, not a value.\n- IN / BETWEEN: Shorthands for multiple OR / range queries.",
    stepByStep: "1. FROM identifies the tables.\n2. The engine evaluates the WHERE clause predicates row by row (or via index seeks).\n3. Rows satisfying the predicate are passed to the next phase (JOIN/GROUP BY).\n4. Unmatched rows are discarded immediately.",
    visualExplanation: "Source Rows:\n[Name: Alice | Dept: Eng | Active: True]\n[Name: Bob   | Dept: HR  | Active: Null]\n[Name: Carol | Dept: Eng | Active: False]\n\nWHERE Dept = 'Eng' AND Active IS NOT NULL:\n- Alice: 'Eng' = 'Eng' (True) AND True is not null (True) => PASS\n- Bob: 'HR' = 'Eng' (False) => DISCARD\n- Carol: 'Eng' = 'Eng' (True) AND False is not null (True) => PASS\n\nResult:\n+---------+------+\n| name    | dept |\n+---------+------+\n| Alice   | Eng  |\n| Carol   | Eng  |\n+---------+------+",
    analogy: "Think of an event organizer filtering a guest list. The WHERE clause is the bouncer at the door check: 'Is the attendee on the list?' and 'Are they wearing a tie?'. If they don't meet the conditions, they never enter the building (the query pipeline).",
    beginnerExample: "SELECT name, salary FROM employees WHERE salary > 60000;",
    intermediateExample: "SELECT name, role FROM employees WHERE department_id IS NULL OR role = 'Intern';",
    advancedExample: "SELECT name, role, salary FROM employees WHERE role IN ('Software Engineer', 'Manager') AND (salary BETWEEN 70000 AND 120000);",
    internalWorking: "The optimizer parses WHERE predicates to choose access paths: 'Index Seek' (navigating B-Tree branches to fetch specific records) or 'Index Scan/Table Scan' (reading the whole index/table). Predicates that apply functions to columns (e.g., WHERE UPPER(name) = 'ALICE') are non-sargable (Search Argument Able) and force full scans.",
    advantages: "1. Eliminates unwanted records early, reducing execution cost.\n2. Maximizes index utilization, achieving O(log N) retrieval via index seeks.\n3. Keeps memory buffers focused only on pertinent transaction records.",
    disadvantages: "1. Non-sargable conditions or bad wildcard placement can severely degrade performance.\n2. Inappropriate indexing on filtered columns can lead to slow scans.",
    commonMistakes: [
      "Writing 'WHERE column = NULL' which always evaluates to UNKNOWN, returning zero rows.",
      "Writing queries like 'WHERE YEAR(join_date) = 2025' which disables index use on join_date."
    ],
    bestPractices: [
      "Use IS NULL and IS NOT NULL for checking missing data.",
      "Avoid wrapping index columns in functions within the WHERE clause; write range checks instead (e.g., join_date >= '2025-01-01')."
    ],
    performanceConsiderations: "Create composite indexes on columns frequently combined in WHERE clauses, matching the left-to-right column order in the index with query predicates.",
    securityConsiderations: "Always parameterize values in the WHERE clause (e.g., WHERE user_id = ?) to prevent SQL injection attacks.",
    industryUseCases: "Logging systems fetching errors from the last 24 hours, login endpoints verifying usernames, search inputs filtering catalog items.",
    interviewQuestions: [
      {
        q: "What is three-valued logic in SQL and how does it relate to NULL?",
        a: "SQL logic includes three truth values: TRUE, FALSE, and UNKNOWN. Since NULL represents an unknown or missing value, any comparison like 'x = NULL' or 'x != NULL' evaluates to UNKNOWN. To filter for NULLs, you must use 'IS NULL' or 'IS NOT NULL'."
      },
      {
        q: "What does it mean for a query to be 'sargable'?",
        a: "A query is sargable (Search Argument Able) if the database engine can use an index to speed up execution of the WHERE clause. Non-sargable queries apply functions or operators (like LIKE '%xyz' or ABS(col)) to columns, preventing the optimizer from doing B-Tree binary search seeks."
      }
    ],
    faqs: [
      {
        q: "Is there a performance difference between IN and OR in a WHERE clause?",
        a: "Generally, no. Most modern database optimizers rewrite an IN list (e.g., WHERE id IN (1, 2)) into a series of OR conditions or an internal join/scan structure, executing with identical cost."
      }
    ],
    relatedConcepts: [
      "Sargable Predicates",
      "Index Seeks vs. Index Scans",
      "Three-Valued Logic"
    ],
    summary: "WHERE filters rows early. Master three-valued logic and sargable predicates to write high-speed, index-friendly filters.",
    resources: [
      "SQL Performance Explained by Markus Winand",
      "Use The Index, Luke! - Sargable queries section"
    ]
  },
  {
    id: 3,
    title: "Combining Tables (INNER vs OUTER JOINS)",
    concept: "JOIN",
    quickAnswer: "Joins combine columns from multiple tables. INNER JOIN requires matching keys on both sides; OUTER (LEFT/RIGHT/FULL) JOINS return unmatched rows as well, padding the missing side with NULL columns.",
    definition: "A JOIN is a relational database operator that performs a Cartesian product followed by a filter on the joining keys. It merges tables horizontally based on matching keys.",
    whyItExists: "Relational theory separates data into distinct entities (normalization) to prevent duplicate fields and anomalies. Joins are the mechanism to stitch these split entities back together during query execution.",
    coreConcepts: "FROM table_a [INNER | LEFT | RIGHT | FULL] JOIN table_b ON table_a.key = table_b.key;\n- INNER JOIN: Matches rows where keys exist on both tables.\n- LEFT JOIN: Preserves all rows of the left table, padding right columns with NULL when no match exists.\n- CROSS JOIN: Cartesian product of all rows.",
    stepByStep: "1. FROM loads the first table.\n2. JOIN scans/hashes the second table.\n3. The engine evaluates the ON condition to match row columns.\n4. Matching rows are combined; unmatched OUTER rows are padded with NULL.\n5. Output rows are forwarded to WHERE for filtering.",
    visualExplanation: "Table A (Employees):\n[Emp: Alice | DeptID: 1]\n[Emp: Bob   | DeptID: 3]\n\nTable B (Departments):\n[ID: 1 | DeptName: Engineering]\n[ID: 2 | DeptName: Sales]\n\nINNER JOIN:\n+---------+-------------+\n| Emp     | DeptName    |\n+---------+-------------+\n| Alice   | Engineering |\n+---------+-------------+\n\nLEFT JOIN:\n+---------+-------------+\n| Emp     | DeptName    |\n+---------+-------------+\n| Alice   | Engineering |\n| Bob     | NULL        |\n+---------+-------------+",
    analogy: "Think of matching airline passengers (Left table) to flight seat numbers (Right table). An INNER JOIN list shows only passengers who got seats. A LEFT JOIN list shows ALL passengers, leaving seat columns blank (NULL) for those on standby.",
    beginnerExample: "SELECT e.name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id;",
    intermediateExample: "SELECT e.name, d.department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE d.id IS NULL;",
    advancedExample: "SELECT d.department_name, COALESCE(AVG(e.salary), 0) AS avg_salary FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.department_name ORDER BY avg_salary DESC;",
    internalWorking: "Database engines implement joins in three primary ways:\n1. Nested Loop Join: For small tables; scans one table and loops to search the other (O(N*M) or O(N log M) with index).\n2. Hash Join: Hashes join keys of one table into memory, then matches the second table against the hash table (O(N+M)).\n3. Merge Join: Sorts both tables by join key first, then merges them in a single sweep (O(N log N + M log M)).",
    advantages: "1. Enables flexible query-time data modeling.\n2. Maintains strict database normalization without redundant stores.\n3. Allows aggregation across linked entities.",
    disadvantages: "1. Expensive resource utilization (sorting, hashing, nested CPU loops).\n2. Poorly indexed joins can lead to severe query locks and timeouts.",
    commonMistakes: [
      "Accidentally creating a Cartesian Product (Cross Join) by omitting or misspelling the ON clause.",
      "Filtering a LEFT JOINed table column in the WHERE clause, which implicitly converts the join back to an INNER JOIN."
    ],
    bestPractices: [
      "Always ensure join condition keys have indexes (Primary Key to Foreign Key relations).",
      "Explicitly state the JOIN type (prefer INNER/LEFT over old comma-separated joins)."
    ],
    performanceConsiderations: "If you LEFT JOIN table B and filter table B's fields in WHERE, move the filter to the ON clause instead to preserve the outer join logic and optimize index checks.",
    securityConsiderations: "When joining user tables to privilege tables, double-check outer join conditions to prevent users from gaining unauthorized access via fallback NULL entries.",
    industryUseCases: "Stitching customer billing details with order line items, linking transaction logs to product catalogs, pulling movie cast profiles.",
    interviewQuestions: [
      {
        q: "What are the three physical Join algorithms used by databases internally?",
        a: "The three physical join algorithms are: Nested Loop Join (ideal for small tables with indexed join keys), Hash Join (ideal for large, unsorted tables where the engine builds an in-memory hash table of the smaller relation), and Merge Join (ideal when both inputs are already sorted by the join keys)."
      },
      {
        q: "How does a LEFT JOIN turn into an INNER JOIN accidentally?",
        a: "If you perform a LEFT JOIN on table B, and then add a WHERE clause condition like 'WHERE B.status = AActive', rows where B was NULL (unmatched) are filtered out since 'NULL = AActive' is UNKNOWN. This converts the query's behavior into an INNER JOIN. To fix it, move the condition to the ON clause."
      }
    ],
    faqs: [
      {
        q: "Which join is faster: INNER JOIN or LEFT JOIN?",
        a: "INNER JOIN is generally faster or equal to LEFT JOIN because it allows the optimizer more flexibility in choosing the join order and discards non-matching rows earlier, reducing the data volume processed in subsequent steps."
      }
    ],
    relatedConcepts: [
      "Hash Joins",
      "Foreign Key Constraints",
      "Cartesian Product"
    ],
    summary: "Joins combine tables. Keep keys indexed, know nested/hash/merge internals, and handle OUTER join NULL padding carefully.",
    resources: [
      "Designing Data-Intensive Applications (Chapter 2: Query Languages and Relational Joins)",
      "Use The Index, Luke! - Join Performance Guide"
    ]
  },
  {
    id: 4,
    title: "Data Aggregations (GROUP BY)",
    concept: "GROUP BY",
    quickAnswer: "GROUP BY collapses multiple rows sharing identical values into single summary rows. Any column projected in the SELECT clause must either be part of the GROUP BY clause or wrapped inside an aggregate function.",
    definition: "The GROUP BY operator partitions a relation into groups of rows sharing matching values on the grouping columns, then computes aggregate calculations (SUM, AVG, COUNT, MIN, MAX) over each group.",
    whyItExists: "Raw data is too granular for executive decision making. GROUP BY provides the mechanism to synthesize high-volume transactions into structural summaries (e.g., regional revenue, hourly traffic).",
    coreConcepts: "GROUP BY column_1, column_2;\n- Aggregate Functions: Summarize group rows (COUNT, SUM, AVG, MIN, MAX).\n- Collapsing constraint: Non-grouped, non-aggregated columns cannot be projected because they have multiple values per group.",
    stepByStep: "1. FROM/JOIN loads and combines source tables.\n2. WHERE filters out individual rows.\n3. The engine sorts or hashes rows by the GROUP BY columns to cluster them.\n4. Aggregate functions are evaluated for the rows in each group cluster.\n5. SELECT projects the group keys and aggregate results.",
    visualExplanation: "Raw Rows:\n[Dept: Sales | Name: Alice   | Salary: 80000]\n[Dept: Eng   | Name: Bob     | Salary: 95000]\n[Dept: Sales | Name: Charlie | Salary: 60000]\n\nGROUP BY Dept SELECT Dept, AVG(Salary):\n1. Clusters rows into Sales bucket and Eng bucket.\n2. Sales bucket: Alice, Charlie. Avg salary = (80000 + 60000)/2 = 70000.\n3. Eng bucket: Bob. Avg salary = 95000.\n\nResult:\n+-------+-------------+\n| Dept  | AVG(Salary) |\n+-------+-------------+\n| Sales | 70000       |\n| Eng   | 95000       |\n+-------+-------------+",
    analogy: "Think of sorting a deck of playing cards. GROUP BY Suit clusters the cards into four piles: Hearts, Diamonds, Clubs, Spades. You can then count the cards in each pile (COUNT(*)) or sum their face values (SUM(Value)). You cannot write down a single card's 'rank' for a pile because there are 13 different ranks in each pile.",
    beginnerExample: "SELECT department_id, COUNT(*) AS staff_count FROM employees GROUP BY department_id;",
    intermediateExample: "SELECT role, AVG(salary) AS average_salary, MAX(salary) AS max_salary FROM employees WHERE salary > 50000 GROUP BY role;",
    advancedExample: "SELECT department_id, role, SUM(salary) AS total_payroll, COUNT(id) AS active_headcount FROM employees GROUP BY department_id, role ORDER BY total_payroll DESC;",
    internalWorking: "To execute GROUP BY, databases use two main techniques:\n1. Hash Aggregation: The engine creates a temporary hash table in memory where the key is the grouping columns, and the values are the running aggregate accumulators. High speed (O(N)), but can fall back to disk if hash table exceeds memory limits.\n2. Sort Aggregation: The engine sorts the records by the grouping columns (O(N log N)), then performs a single pass over the sorted data to aggregate values as they change. Efficient if an index already provides sorted data.",
    advantages: "1. Powerfully synthesizes transaction-level data.\n2. Reduces payload size transferred to reporting systems.\n3. Extremely fast when backed by composite indexing.",
    disadvantages: "1. High memory footprint for Hash Aggregation on high-cardinality keys.\n2. Sorting aggregations can cause spill-to-disk (tempdb) bottlenecks.",
    commonMistakes: [
      "Selecting a column that is not in the GROUP BY clause and not wrapped in an aggregate function (violates SQL standard; fails or returns random data).",
      "Filtering aggregated values in the WHERE clause instead of using HAVING."
    ],
    bestPractices: [
      "Only include columns in the SELECT clause that are grouping keys or aggregate outputs.",
      "Keep group-by column cardinalities in mind: grouping by unique columns (like email) defeats the purpose and wastes memory."
    ],
    performanceConsiderations: "If grouping columns have a B-Tree index, the database can perform Sort Aggregation directly without sorting the table in temporary memory, yielding immediate results.",
    securityConsiderations: "Be careful when exposing group statistics that could leak private data (e.g., if a group contains only 1 member, an average salary exposes that user's exact salary).",
    industryUseCases: "E-commerce monthly revenue calculation, system monitor resource averages, voter demographic analytics.",
    interviewQuestions: [
      {
        q: "Why does selecting columns that are neither grouped nor aggregated trigger a compilation error?",
        a: "Because GROUP BY collapses multiple input rows into a single summary row per group. If a column is not in the GROUP BY clause, it can have multiple different values within a group. The database engine cannot know which specific row's value to display, violating relational logic. Thus, it must be summarized via an aggregate function (like MIN/MAX/SUM) or included in the grouping keys."
      },
      {
        q: "What is the difference between Hash Aggregation and Sort Aggregation?",
        a: "Hash Aggregation builds a hash table in memory to cluster rows. It is very fast O(N) but memory-intensive. Sort Aggregation sorts the rows by grouping columns first (O(N log N)) and then aggregates. Databases use Sort Aggregation if the tables are already sorted by an index, avoiding the sort step."
      }
    ],
    faqs: [
      {
        q: "Does COUNT(*) include NULL values?",
        a: "Yes, COUNT(*) counts the total rows in the group, regardless of NULL columns. In contrast, COUNT(column_name) only counts rows where that specific column is NOT NULL."
      }
    ],
    relatedConcepts: [
      "Hash Aggregation",
      "Aggregate Functions",
      "HAVING Clause"
    ],
    summary: "GROUP BY aggregates data. Grouping keys and aggregates are the only valid selections. Watch memory limits on high-cardinality keys.",
    resources: [
      "SQL Cookbook (Chapter 8: Grouping and Aggregating)",
      "High Performance SQL: Optimizing Aggregation Plans"
    ]
  },
  {
    id: 5,
    title: "Group Filters (HAVING vs WHERE)",
    concept: "HAVING",
    quickAnswer: "WHERE filters raw rows before aggregation is computed. HAVING filters aggregated group buckets after GROUP BY executes. Aggregate functions cannot be placed in the WHERE clause.",
    definition: "The HAVING clause specifies a search condition for groups of rows. It behaves identically to the WHERE clause, but operates on aggregated columns and group keys rather than raw records.",
    whyItExists: "Since the WHERE clause runs before rows are grouped, it cannot see aggregated summaries (e.g., SUM(salary)). HAVING exists to provide conditional filtering on aggregated metrics.",
    coreConcepts: "GROUP BY columns HAVING aggregate_condition;\n- WHERE: Runs before GROUP BY; filters input rows.\n- HAVING: Runs after GROUP BY; filters output groups.\n- Efficiency: Filter raw rows in WHERE whenever possible to reduce grouping memory.",
    stepByStep: "1. FROM/JOIN gathers data.\n2. WHERE filters raw rows (aggregations NOT allowed here).\n3. GROUP BY clusters surviving rows.\n4. Aggregate values are calculated per group.\n5. HAVING evaluates conditions on the group metrics, discarding non-matching groups.\n6. SELECT projects final columns.\n7. ORDER BY sorts output.",
    visualExplanation: "Raw Employees: [Eng, 100K], [Eng, 90K], [HR, 50K], [HR, 40K]\n\nSELECT Dept, SUM(Salary) FROM employees GROUP BY Dept HAVING SUM(Salary) > 100K;\n\n1. Group into Depts:\n   - Eng: [100K, 90K] => SUM = 190K\n   - HR:  [50K, 40K]   => SUM = 90K\n2. Evaluate HAVING SUM(Salary) > 100K:\n   - Eng: 190K > 100K => PASS\n   - HR:  90K > 100K  => DISCARD\n\nResult:\n+-------+-------------+\n| Dept  | SUM(Salary) |\n+-------+-------------+\n| Eng   | 190000      |\n+-------+-------------+",
    analogy: "Think of sorting marbles by color. The WHERE clause is filtering out cracked marbles before putting them into color boxes (filtering raw data). The HAVING clause is checking the finished boxes and discarding any color box that contains fewer than 5 marbles.",
    beginnerExample: "SELECT department_id, COUNT(*) FROM employees GROUP BY department_id HAVING COUNT(*) > 2;",
    intermediateExample: "SELECT role, AVG(salary) FROM employees WHERE department_id IS NOT NULL GROUP BY role HAVING AVG(salary) >= 70000;",
    advancedExample: "SELECT department_id, SUM(salary) AS budget FROM employees GROUP BY department_id HAVING COUNT(id) >= 2 AND SUM(salary) BETWEEN 100000 AND 300000 ORDER BY budget DESC;",
    internalWorking: "When processing a query, the query planner executes WHERE clauses using indexes. Rows that fail are immediately dropped. Grouping then clusters the remaining rows. If HAVING is present, the engine evaluates it against the aggregate values stored in the group buckets. If the condition is met, the group is emitted. Placing non-aggregated filters in HAVING (e.g., HAVING department_id = 1) is a major anti-pattern because it forces the database to group rows it could have filtered out much earlier in WHERE.",
    advantages: "1. Allows filtering on aggregate metrics (sums, averages, counts).\n2. Enables complex grouping workflows and group-level data validation.",
    disadvantages: "1. Can lead to slow performance if developers misuse it to filter raw columns.\n2. Forces memory allocation for groups that could have been dropped earlier.",
    commonMistakes: [
      "Writing 'WHERE SUM(salary) > 50000', which triggers a compilation error because WHERE cannot handle aggregates.",
      "Placing a raw column condition in HAVING (e.g. HAVING salary > 50000) when it should be in WHERE, resulting in massive wasted grouping calculations."
    ],
    bestPractices: [
      "Always filter individual rows in the WHERE clause.",
      "Use HAVING strictly for conditions involving aggregate functions."
    ],
    performanceConsiderations: "Filtering as many rows as possible in the WHERE clause reduces the size of the intermediate table structure, making GROUP BY and HAVING significantly faster.",
    securityConsiderations: "Aggregated stats in HAVING can be exploited via side-channel analysis to guess values of hidden rows if group sizes are too small.",
    industryUseCases: "Audit tools identifying departments exceeding payroll budgets, inventory monitors flagging low-stock categories, spam filters flagging IP addresses with > 100 requests per minute.",
    interviewQuestions: [
      {
        q: "What is the key difference between WHERE and HAVING in SQL?",
        a: "WHERE filters raw individual records before they are grouped. It cannot contain aggregate functions. HAVING filters aggregated group clusters after GROUP BY executes. It can contain aggregate checks."
      },
      {
        q: "Why is placing a non-aggregated condition in HAVING instead of WHERE a performance problem?",
        a: "Because it forces the engine to perform group allocations, sorting, and aggregate calculations for rows that will ultimately be discarded. Placing the condition in WHERE drops those rows immediately, avoiding the grouping cost entirely."
      }
    ],
    faqs: [
      {
        q: "Can I use HAVING without GROUP BY?",
        a: "Yes. If HAVING is used without GROUP BY, the entire table is treated as a single group. If the HAVING condition evaluates to TRUE, one summary row is returned; otherwise, zero rows are returned."
      }
    ],
    relatedConcepts: [
      "Execution Order of SQL",
      "Logical Query Processing",
      "Aggregation Performance"
    ],
    summary: "WHERE filters rows; HAVING filters groups. Always filter early in WHERE to optimize grouping speed.",
    resources: [
      "Learn SQL - HAVING Clause Guide",
      "Query Optimizer Internals: Logical Execution Phases"
    ]
  },
  {
    id: 6,
    title: "Conditional Logic (CASE WHEN)",
    concept: "CASE",
    quickAnswer: "CASE WHEN provides conditional branch logic (IF-THEN-ELSE) inside SQL statements. It evaluates conditions sequentially and returns the value of the first matching branch, defaulting to NULL if no ELSE is defined.",
    definition: "The CASE expression is a scalar expression that returns a value based on the conditional evaluation of boolean expressions. It is evaluated by the database compiler inline during projection or filtering.",
    whyItExists: "Queries often need to clean, bucket, or pivot data on the fly. CASE WHEN allows developers to perform conditional formatting and categorical bucketing directly inside the database query.",
    coreConcepts: "CASE \n  WHEN condition1 THEN result1 \n  WHEN condition2 THEN result2 \n  ELSE default_result \nEND;\n- Simple CASE: Compares an expression to static values (CASE val WHEN 1 THEN 'a' END).\n- Searched CASE: Evaluates complex boolean predicates (CASE WHEN val > 10 THEN 'a' END).",
    stepByStep: "1. The engine reaches the CASE clause (in SELECT, WHERE, or ORDER BY).\n2. For the current row, it evaluates the first WHEN condition.\n3. If TRUE, it returns the THEN result and skips the remaining branches.\n4. If FALSE or UNKNOWN, it moves to the next WHEN branch.\n5. If all branches fail, it returns the ELSE value. If no ELSE exists, it returns NULL.",
    visualExplanation: "Row data: [Salary: 95000]\n\nCASE \n  WHEN salary >= 90000 THEN 'Tier A'\n  WHEN salary >= 60000 THEN 'Tier B'\n  ELSE 'Tier C'\nEND;\n\nEvaluation:\n1. 95000 >= 90000? -> True. Return 'Tier A' immediately.\nResult column: 'Tier A'",
    analogy: "Think of a sorting sorter in a fruit factory. Apples arrive on a conveyor belt. The sorting machine tests each apple: 'Is weight > 200g? -> Pack in Large box'. 'Is weight > 100g? -> Pack in Medium box'. Otherwise -> 'Pack in Small box'. Each apple goes to the first box it fits.",
    beginnerExample: "SELECT name, CASE WHEN salary >= 80000 THEN 'Premium' ELSE 'Standard' END AS status FROM employees;",
    intermediateExample: "SELECT department_id, SUM(CASE WHEN role = 'Manager' THEN salary ELSE 0 END) AS manager_payroll FROM employees GROUP BY department_id;",
    advancedExample: "SELECT name, role, salary,\n  CASE \n    WHEN role = 'Software Engineer' AND salary > 90000 THEN 'Senior Eng - High Paid'\n    WHEN role = 'Software Engineer' THEN 'Eng - Normal Paid'\n    WHEN role = 'Manager' THEN 'Management'\n    ELSE 'General'\n  END AS compensation_label\nFROM employees;",
    internalWorking: "The database optimizer compiles CASE expressions into bytecode branch instructions. Simple CASE statements can sometimes be optimized into index lookups or search tables, but searched CASE conditions are evaluated sequentially for every row. If placed inside aggregation functions (e.g. SUM(CASE WHEN...)), they allow conditional aggregation which is highly optimized using parallel query threads.",
    advantages: "1. Enables data cleaning and bucketing without database updates.\n2. Allows conditional aggregation (pivoting data columns).\n3. Standardized across all ANSI SQL compliant engines.",
    disadvantages: "1. Nested or overly complex CASE statements degrade readability.\n2. Can slow down projection steps if they involve expensive string manipulations.",
    commonMistakes: [
      "Forgetting the ELSE clause, which causes unexpected NULL values in the output when no conditions match.",
      "Misordering conditions (e.g., checking salary >= 50000 before salary >= 100000, causing 100K earners to hit the 50K branch)."
    ],
    bestPractices: [
      "Always include an explicit ELSE clause to prevent accidental NULLs.",
      "Order WHEN conditions from most specific to most general to ensure correct evaluation."
    ],
    performanceConsiderations: "Use CASE inside aggregate functions to pivot tables (e.g., counting monthly signups into columns) instead of running separate queries and JOINing them.",
    securityConsiderations: "Avoid exposing database structure hints or sensitive system checks inside public CASE expressions.",
    industryUseCases: "Financial reports categorizing risk values, SaaS applications calculating tiered pricing models, CRM systems pivoting customer feedback statuses.",
    interviewQuestions: [
      {
        q: "What happens in a CASE statement if no condition is met and there is no ELSE clause?",
        a: "If no WHEN condition evaluates to TRUE and there is no ELSE clause, the CASE expression returns NULL."
      },
      {
        q: "How can you use CASE WHEN to perform a pivot operation in SQL?",
        a: "You can combine SUM or COUNT with CASE WHEN. For example, to pivot employee counts by department into columns: SELECT SUM(CASE WHEN dept = 'Eng' THEN 1 ELSE 0 END) AS eng_count, SUM(CASE WHEN dept = 'Sales' THEN 1 ELSE 0 END) AS sales_count FROM employees."
      }
    ],
    faqs: [
      {
        q: "Can I use CASE WHEN in the ORDER BY clause?",
        a: "Yes, this is a common trick to implement custom sorting. For example, placing managers first, engineers second: ORDER BY CASE WHEN role = 'Manager' THEN 1 WHEN role = 'Engineer' THEN 2 ELSE 3 END."
      }
    ],
    relatedConcepts: [
      "COALESCE Function",
      "Pivoting Data",
      "Conditional Aggregations"
    ],
    summary: "CASE WHEN implements conditional branch logic. Always sort conditions by specificity and define an ELSE block to prevent NULL overflows.",
    resources: [
      "SQL For Smarties: Advanced SQL Programming (CASE section)",
      "W3Schools SQL CASE Statement"
    ]
  },
  {
    id: 7,
    title: "Results Sorting & Pagination (ORDER BY & LIMIT)",
    concept: "ORDER BY",
    quickAnswer: "ORDER BY sorts query results in ascending (ASC) or descending (DESC) order. LIMIT restricts the count of returned rows, while OFFSET skips rows. Pagination requires an ORDER BY clause to guarantee stable results.",
    definition: "The ORDER BY clause sorts the rows of a result set based on one or more columns or expressions. LIMIT and OFFSET are windowing clauses that restrict the return slice.",
    whyItExists: "Relational tables are mathematically unsorted sets. Without ORDER BY, the engine returns rows in the easiest order available (heap scan order), which can change between query runs. ORDER BY ensures order stability.",
    coreConcepts: "ORDER BY column_name [ASC | DESC] LIMIT count OFFSET offset;\n- Deterministic sorting: Pagination requires sorting on a unique key (e.g., ID) to avoid duplicate rows on page boundaries.\n- Offset cost: High offsets force the database to read and discard all skipped rows.",
    stepByStep: "1. The engine compiles and filters records.\n2. Projected rows are sent to the sorting buffer (Sort operator).\n3. The engine sorts the records according to the columns specified.\n4. If LIMIT/OFFSET is present, the engine scans the sorted stream, skips the OFFSET count, and returns the next LIMIT count rows, discarding the rest.",
    visualExplanation: "Raw Output Rows (Unsorted):\n[Name: Alice | Salary: 95K], [Name: Bob | Salary: 72K], [Name: Charlie | Salary: 120K]\n\nORDER BY salary DESC LIMIT 2:\n1. Sorted array: [Charlie: 120K], [Alice: 95K], [Bob: 72K]\n2. Slice 0 to 2:\n+---------+--------+\n| name    | salary |\n+---------+--------+\n| Charlie | 120000 |\n| Alice   | 95000  |\n+---------+--------+",
    analogy: "Think of an alphabetical phone book. ORDER BY is the sorting process that arranges names from A-Z. LIMIT 10 OFFSET 20 is equivalent to opening the phone book, flipping past the first 20 names, and reading the next 10 names.",
    beginnerExample: "SELECT name, salary FROM employees ORDER BY salary DESC;",
    intermediateExample: "SELECT name, role, salary FROM employees ORDER BY role ASC, salary DESC;",
    advancedExample: "SELECT id, name, salary FROM employees ORDER BY salary DESC, id ASC LIMIT 5 OFFSET 10;",
    internalWorking: "ORDER BY requires sorting. If the columns are indexed, the database reads rows directly from the index in sorted order, bypassing the sorting step entirely. Without an index, the engine allocates a 'Sort Buffer' in memory. If the dataset fits, it performs QuickSort. If the dataset exceeds the sort buffer (e.g. Postgres work_mem), it dumps chunks to temporary disk files and performs a costly External Merge Sort.",
    advantages: "1. Delivers predictable, organized data views to users.\n2. Enables simple page windowing for user interfaces.\n3. Maximizes index ordering structures.",
    disadvantages: "1. Non-indexed sorts scale to O(N log N) time complexity.\n2. High OFFSET pagination forces the database to read thousands of rows only to throw them away, creating serious performance lag.",
    commonMistakes: [
      "Using LIMIT/OFFSET without an ORDER BY clause, causing inconsistent records to appear across different pages.",
      "Sorting by high-cardinality non-indexed columns on large tables, causing massive tempdb write cycles."
    ],
    bestPractices: [
      "Always combine LIMIT with a unique key ORDER BY to ensure deterministic results.",
      "For high-volume pagination, prefer 'keyset pagination' (WHERE id > last_seen_id ORDER BY id LIMIT 10) instead of OFFSET."
    ],
    performanceConsiderations: "Create indexes on the columns used in the ORDER BY clause. In multi-column indexes, ensure the sort directions match the index definition (e.g., both ASC or both DESC).",
    securityConsiderations: "Never pass unsanitized column names directly into ORDER BY from public variables to avoid SQL Injection in sorting clauses.",
    industryUseCases: "Leaderboards listing top 10 players, search engines showing paginated result sets, auditing logs sorting by timestamp.",
    interviewQuestions: [
      {
        q: "Why is paginating with high OFFSET values (e.g., LIMIT 10 OFFSET 1000000) bad for performance?",
        a: "Because OFFSET forces the database engine to fetch, sort, and process all 1,000,010 rows, only to discard the first 1,000,000 and return the last 10. This results in heavy disk I/O and CPU overhead. Keyset pagination should be used instead."
      },
      {
        q: "How does the database execute an ORDER BY clause without sorting?",
        a: "If the ORDER BY column has a B-Tree index, the database can traverse the leaf nodes of the B-Tree index in order. This fetches the rows in the required sorted sequence directly, skipping the sorting phase entirely."
      }
    ],
    faqs: [
      {
        q: "Does SQL sort NULL values first or last?",
        a: "In ANSI SQL, this is database-dependent. PostgreSQL sorts NULLs as larger than any value (first in DESC, last in ASC). MySQL and SQL Server treat NULLs as the lowest possible value. You can explicitly control this with 'NULLS FIRST' or 'NULLS LAST' in many dialects."
      }
    ],
    relatedConcepts: [
      "Keyset Pagination vs. Offset Pagination",
      "External Merge Sort",
      "B-Tree Index Ordering"
    ],
    summary: "ORDER BY arranges rows; LIMIT/OFFSET slices them. Ensure sorting columns are indexed and pagination uses stable, unique keys.",
    resources: [
      "SQL Keyset Pagination Guide",
      "PostgreSQL Documentation: LIMIT and OFFSET"
    ]
  },
  {
    id: 8,
    title: "Set Operations (UNION vs UNION ALL)",
    concept: "UNION",
    quickAnswer: "UNION combines results from two queries into a single set, removing duplicates. UNION ALL combines the results directly, retaining duplicates. UNION ALL is faster because it bypasses the duplicate removal sorting pass.",
    definition: "Set operations combine the result sets of two or more SELECT statements vertically. The SELECT queries must have the same number of columns with compatible data types in the same order.",
    whyItExists: "Databases often store similar records in separate tables or require merging distinct query results (e.g., combining active user tables and archived user tables) into a single unified data stream.",
    coreConcepts: "SELECT columns FROM table_a UNION [ALL] SELECT columns FROM table_b;\n- UNION: Deduplicates rows (set union).\n- UNION ALL: Simple concatenation (multiset union).\n- Type Compatibility: The corresponding columns in each query must share matching or castable data types.",
    stepByStep: "1. The engine executes the first SELECT query.\n2. The engine executes the second SELECT query.\n3. If UNION ALL is used, it appends the streams and returns them directly.\n4. If UNION is used, the engine feeds both streams into a sorting or hashing buffer to identify and drop duplicate rows, then emits the unique records.",
    visualExplanation: "Query 1 Results: [Alice], [Bob]\nQuery 2 Results: [Bob], [Charlie]\n\nUNION ALL:\n[Alice], [Bob], [Bob], [Charlie] (Simple append)\n\nUNION:\n1. Combine: [Alice], [Bob], [Bob], [Charlie]\n2. Sort/Hash to dedup: [Alice], [Bob], [Charlie]\nResult:\n+---------+\n| name    |\n+---------+\n| Alice   |\n| Bob     | \n| Charlie |\n+---------+",
    analogy: "Think of two guest lists. UNION ALL is copying the second guest list directly onto the bottom of the first list, even if some guests are written twice. UNION is cross-checking both lists and writing down each unique name once on a new clean sheet.",
    beginnerExample: "SELECT name FROM employees WHERE role = 'Manager' UNION ALL SELECT name FROM employees WHERE salary > 90000;",
    intermediateExample: "SELECT name, role, salary FROM employees WHERE role = 'Intern' UNION SELECT name, role, salary FROM employees WHERE department_id = 1;",
    advancedExample: "SELECT 'Active' AS status, id, name FROM employees UNION ALL SELECT 'Archived' AS status, id, name FROM archived_employees ORDER BY name ASC;",
    internalWorking: "UNION requires deduplication. To accomplish this, database engines use either **Hash Duplicate Elimination** (building an in-memory hash table of all rows and discarding collisions) or **Sort Duplicate Elimination** (sorting both result sets together and skipping identical adjacent rows). Both techniques are O(N log N) or O(N) memory operations. UNION ALL avoids this entirely, executing as a simple streaming union with O(1) extra complexity.",
    advantages: "1. Combines distinct data sources into a single consistent stream.\n2. Allows vertical merging of tables with similar schemas.",
    disadvantages: "1. UNION is slow on large datasets due to sorting/dedup phases.\n2. Requires strict alignment of column types and counts.",
    commonMistakes: [
      "Using UNION when duplicate rows are impossible or acceptable, wasting CPU cycles on a deduplication pass.",
      "Mismating column types (e.g., SELECTing a string in Query 1 and an integer in the same position in Query 2), leading to type errors."
    ],
    bestPractices: [
      "Default to UNION ALL unless you explicitly require duplicate rows to be filtered.",
      "Place ORDER BY clauses at the very end of the set query, rather than inside individual SELECT queries."
    ],
    performanceConsiderations: "If you must use UNION to remove duplicates, ensure the individual queries return as few rows as possible to minimize the sorting memory footprint.",
    securityConsiderations: "Ensure columns match up correctly when combining tables from different business domains to prevent leaking sensitive variables into public columns.",
    industryUseCases: "Consolidating active and historical transaction ledgers, merging distinct customer datasets for mailing lists, combining search results from multiple indexed sub-tables.",
    interviewQuestions: [
      {
        q: "What is the differences between UNION and UNION ALL, and which is faster?",
        a: "UNION combines result sets and removes duplicate rows, requiring an expensive sorting or hashing pass in memory. UNION ALL simply appends the result sets together, keeping duplicates. UNION ALL is significantly faster because it avoids this deduplication overhead."
      },
      {
        q: "What are the structural requirements for a set operation (UNION/INTERSECT) to compile?",
        a: "Both SELECT queries must project the exact same number of columns, and the columns in corresponding positions must have compatible data types (e.g., both strings, or both integers, or implicitly castable types)."
      }
    ],
    faqs: [
      {
        q: "Can I use UNION to combine tables with different columns?",
        a: "Yes, but you must manually align the columns by projecting dummy values or NULLs. For example: SELECT id, name, NULL AS address FROM table_a UNION SELECT id, name, address FROM table_b."
      }
    ],
    relatedConcepts: [
      "INTERSECT and EXCEPT operators",
      "Multiset vs. Set relations",
      "Duplicate Elimination Algorithms"
    ],
    summary: "Set operations merge datasets vertically. Use UNION ALL by default to optimize speed; use UNION only when duplicate removal is necessary.",
    resources: [
      "SQL Set Operators Tutorial",
      "Database Query Compilation: Processing Set Queries"
    ]
  },
  {
    id: 9,
    title: "Subqueries & Uncorrelated Lookups",
    concept: "SUBQUERY",
    quickAnswer: "A subquery is a query nested inside another query. Uncorrelated subqueries execute independently of the outer query once and cache their results; correlated subqueries reference outer column values and execute repeatedly for every row.",
    definition: "A subquery is a nested SELECT expression enclosed in parentheses. It can act as a scalar value, a single-column list, or a derived table within the outer SELECT statement.",
    whyItExists: "Many database questions require multi-stage queries (e.g., 'Find employees earning more than the average'). Subqueries provide a modular way to compute intermediate values on the fly without writing scripts.",
    coreConcepts: "SELECT ... WHERE col = (SELECT ...);\n- Uncorrelated Subquery: Does not reference outer query fields. Evaluated once.\n- Correlated Subquery: References outer query columns (e.g. e.dept_id = outer_dept.id). Evaluated per row.\n- EXISTS / NOT EXISTS: Highly optimized boolean checks for row matching.",
    stepByStep: "1. The engine checks if the subquery is uncorrelated.\n2. If uncorrelated, the engine executes the nested query first, gets the results (e.g., average salary), caches them, and inserts them into the outer query.\n3. The engine then runs the outer query once using the cached values.\n4. If correlated, the engine loops through each row of the outer query, runs the subquery with the current row's parameters, and evaluates the check.",
    visualExplanation: "Query: SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);\n\n1. Subquery is uncorrelated: SELECT AVG(salary) FROM employees => 60000\n2. Rewrite outer query: SELECT name FROM employees WHERE salary > 60000\n3. Execute simple scan. Cost: Subquery (1 scan) + Outer (1 scan) = O(N).",
    analogy: "Think of an uncorrelated subquery like checking the weather report once before going to a party to decide if you need a jacket. A correlated subquery is like holding up an umbrella and checking if it's raining every single time you step into a new room at the party.",
    beginnerExample: "SELECT name FROM employees WHERE department_id = (SELECT id FROM departments WHERE department_name = 'Engineering');",
    intermediateExample: "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);",
    advancedExample: "SELECT name, salary, department_id FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department_id = e.department_id);",
    internalWorking: "Uncorrelated subqueries are evaluated once. The optimizer materializes the result in memory as a virtual temp table or cache. Correlated subqueries are historically executed as nested loops, scanning the inner table N times (O(N*M)). Modern optimizers try to rewrite correlated subqueries into INNER or LEFT JOINS (a process called 'subquery flattening' or 'decorrelation') to execute via faster Hash or Merge Joins.",
    advantages: "1. Extremely useful for expressing complex multi-stage filtering logic.\n2. Avoids storing intermediate data in temporary database tables.\n3. Enhances query modularity and readability for simple lookups.",
    disadvantages: "1. Correlated subqueries scale poorly if the optimizer cannot flatten them.\n2. Nested subqueries can make SQL hard to read and debug compared to CTEs.",
    commonMistakes: [
      "Using a subquery that returns multiple rows with a single-value comparison operator (e.g., WHERE id = (SELECT...)), resulting in a runtime crash.",
      "Using NOT IN with a subquery that returns a NULL value, which causes the entire outer query to return zero rows."
    ],
    bestPractices: [
      "Use EXISTS or JOIN instead of IN when checking for row presence in related tables.",
      "Ensure subqueries designed for scalar comparisons (e.g. WHERE salary > (SELECT...)) return at most one row."
    ],
    performanceConsiderations: "NOT EXISTS is generally faster than NOT IN because NOT IN evaluates to UNKNOWN (and returns nothing) if the subquery returns any NULLs, forcing the engine to scan values thoroughly.",
    securityConsiderations: "Verify access controls: subqueries bypass simple client-side checks and can access tables if not restricted at the database user role level.",
    industryUseCases: "Finding top performers per category, removing orphan records, checking permissions in secure tables.",
    interviewQuestions: [
      {
        q: "What is the difference between correlated and uncorrelated subqueries?",
        a: "An uncorrelated subquery does not reference columns from the outer query; it runs once, caches its result, and passes it to the outer query. A correlated subquery references outer query columns; it must execute repeatedly, once for every candidate row in the outer query, making it slower unless optimized."
      },
      {
        q: "Why does a subquery using NOT IN return zero rows if the subquery contains a NULL?",
        a: "Because NOT IN evaluates as 'val != row1 AND val != row2 AND val != NULL'. Since comparing anything to NULL results in UNKNOWN, the entire AND chain evaluates to UNKNOWN. As a result, no rows satisfy the condition. Use NOT EXISTS instead to avoid this issue."
      }
    ],
    faqs: [
      {
        q: "Are subqueries slower than joins?",
        a: "In modern databases, the optimizer compiles subqueries and joins into identical execution plans if they perform the same logical work, meaning they have equal performance. However, joins are generally safer and easier for the engine to optimize."
      }
    ],
    relatedConcepts: [
      "Subquery Flattening",
      "EXISTS vs IN",
      "Correlated Queries"
    ],
    summary: "Subqueries nest queries. Keep lookups uncorrelated to run them once, and favor EXISTS over IN to prevent NULL comparison pitfalls.",
    resources: [
      "SQL Subqueries Made Simple",
      "Database Optimizer Internals: Decorrelating Subqueries"
    ]
  },
  {
    id: 10,
    title: "Common Table Expressions (CTEs)",
    concept: "CTE",
    quickAnswer: "A Common Table Expression (CTE) defines a temporary named result set within the scope of a single query. Unlike subqueries, CTEs improve query organization and support recursion (RECURSIVE) for hierarchical data.",
    definition: "A CTE is an ANSI SQL standard mechanism defined using the WITH clause. It acts as a temporary view that exists only during the compilation and execution of a single SQL statement.",
    whyItExists: "Subqueries can become unreadable when nested multiple layers deep. CTEs let developers declare temporary tables sequentially at the top of a query, making complex queries readable and maintainable.",
    coreConcepts: "WITH cte_name AS (SELECT ...) SELECT ... FROM cte_name;\n- WITH: Keyword initializing the CTE.\n- Multiple CTEs: Can be defined in sequence, comma-separated.\n- RECURSIVE: Allows a CTE to reference itself to traverse graphs or trees.",
    stepByStep: "1. The engine parses the WITH clause.\n2. In PostgreSQL (pre-v12) or when materialized, the engine executes the CTE and stores the results in a temporary memory buffer.\n3. In other databases (like SQL Server/MySQL) or inline CTEs, the optimizer merges the CTE query directly into the main query.\n4. The main SELECT query executes using the compiled CTE structure.",
    visualExplanation: "WITH HighSalaries AS (\n  SELECT name, salary FROM employees WHERE salary > 80000\n)\nSELECT * FROM HighSalaries;\n\n1. Defines virtual table 'HighSalaries' with Alice and Carol.\n2. Outer query scans 'HighSalaries' directly.\n+---------+--------+\n| name    | salary |\n+---------+--------+\n| Alice   | 95000  |\n| Carol   | 85000  |\n+---------+--------+",
    analogy: "Think of cooking a complex meal. Subqueries are like chopping onions, peeling garlic, and boiling pasta all in the middle of stir-frying (chaotic and hard to manage). CTEs are prep bowls: you chop the onions (CTE 1) and boil the pasta (CTE 2) beforehand, then combine them sequentially in the pan.",
    beginnerExample: "WITH DeptCounts AS (SELECT department_id, COUNT(*) AS count FROM employees GROUP BY department_id) SELECT * FROM DeptCounts WHERE count > 2;",
    intermediateExample: "WITH HighEarners AS (SELECT id, name, salary, department_id FROM employees WHERE salary >= 80000), DeptNames AS (SELECT id, department_name FROM departments) SELECT h.name, h.salary, d.department_name FROM HighEarners h JOIN DeptNames d ON h.department_id = d.id;",
    advancedExample: "WITH RECURSIVE OrgChart AS (\n  SELECT id, name, manager_id, 1 AS level FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, o.level + 1 FROM employees e JOIN OrgChart o ON e.manager_id = o.id\n) SELECT * FROM OrgChart ORDER BY level ASC;",
    internalWorking: "Historically, CTEs were 'optimization barriers' (especially in PostgreSQL), meaning they were always materialized as temporary tables in memory/disk first, preventing the optimizer from pushing outer WHERE filters down inside the CTE. Modern database engines inline CTEs by default unless you explicitly request materialization (WITH cte AS MATERIALIZED...), allowing query optimizations to pass through.",
    advantages: "1. Drastically improves query readability and structures complex code.\n2. Can reference the same CTE multiple times in a single query.\n3. Enables recursive operations to query trees, organizational charts, and networks.",
    disadvantages: "1. If materialized, it can bypass index scans on the outer query.\n2. Cannot be indexed directly (unlike temp tables).",
    commonMistakes: [
      "Assuming CTEs persist across queries; they exist only for the single statement they precede.",
      "Creating recursive CTEs without a termination condition, causing an infinite execution loop."
    ],
    bestPractices: [
      "Use CTEs instead of complex subqueries to make queries easier to read and maintain.",
      "Check execution plans to ensure the optimizer is inlining CTE queries rather than materializing them unnecessarily."
    ],
    performanceConsiderations: "In PostgreSQL 12+, CTEs are automatically inlined if they are not recursive, have no side effects, and are referenced only once. If you reference them multiple times, verify whether materializing them is beneficial.",
    securityConsiderations: "Recursive CTEs can be used to perform Denial of Service (DoS) attacks on databases by eating up temp memory if recursion depth is not restricted by database limits.",
    industryUseCases: "Traversing corporate reporting hierarchies, calculating multi-step sales commissions, mapping network graph paths in logistics.",
    interviewQuestions: [
      {
        q: "What is a CTE and how does it compare to a subquery?",
        a: "A Common Table Expression (CTE) is a temporary result set defined using the 'WITH' clause. Unlike subqueries, which are nested inside the SELECT/WHERE clauses, CTEs are declared at the top of the query. They improve readability, can be referenced multiple times, and support recursive structures."
      },
      {
        q: "What is an optimization barrier in the context of CTEs?",
        a: "An optimization barrier means the database engine executes the CTE independently, writes the result to a temporary space (materializes it), and then uses it. This prevents the optimizer from pushing filters from the outer query down into the CTE, which can lead to slow table scans. Modern databases inline CTEs to avoid this barrier."
      }
    ],
    faqs: [
      {
        q: "Can you update data using CTEs?",
        a: "Yes, in databases like PostgreSQL, you can write writable CTEs (WITH moved_rows AS (DELETE... RETURNING *) INSERT INTO archive SELECT * FROM moved_rows)."
      }
    ],
    relatedConcepts: [
      "Recursive Queries",
      "Optimization Barriers",
      "Views vs. CTEs"
    ],
    summary: "CTEs declare temporary sequential result sets. Use them to organize complex queries and traverse hierarchical structures recursively.",
    resources: [
      "PostgreSQL Documentation: WITH queries",
      "Use The Index, Luke! - The CTE optimization barrier explained"
    ]
  },
  {
    id: 11,
    title: "Window Functions & Rankings",
    concept: "WINDOW",
    quickAnswer: "Window functions perform calculations across a partition of rows associated with the current row, without collapsing the individual rows. This differs from GROUP BY, which collapses the result set down to a single row per group.",
    definition: "A window function applies an aggregate or ranking function over a defined set of rows (the 'window') using the OVER() clause, which controls partitioning (PARTITION BY) and ordering (ORDER BY) of the active window frame.",
    whyItExists: "Queries often need to calculate running totals, moving averages, or rank rows relative to their group (e.g., finding the top 2 salaries per department) while still displaying all detailed columns.",
    coreConcepts: "function() OVER (PARTITION BY group_col ORDER BY sort_col);\n- PARTITION BY: Divides rows into groups (similar to GROUP BY).\n- ORDER BY: Sets the sequence in which the function is evaluated.\n- ROW_NUMBER() vs RANK() vs DENSE_RANK(): Row numbering systems with different tie-handling rules.",
    stepByStep: "1. The engine filters and groups rows (WHERE/GROUP BY execute first).\n2. The remaining rows are partitioned into window subsets based on the PARTITION BY clause.\n3. Within each partition, rows are sorted based on the ORDER BY clause.\n4. The window function calculates a value for each row based on the defined window frame.\n5. SELECT projects the final columns, including the window calculation column.",
    visualExplanation: "Rows: [Eng, Alice, 95K], [Eng, Bob, 72K], [HR, Carol, 80K]\n\nSELECT Dept, Name, Salary, RANK() OVER(PARTITION BY Dept ORDER BY Salary DESC) as rank:\n1. Partition 'Eng':\n   - Alice (95K) => Rank 1\n   - Bob (72K)   => Rank 2\n2. Partition 'HR':\n   - Carol (80K) => Rank 1\n\nResult:\n+------+-------+--------+------+\n| Dept | Name  | Salary | rank |\n+------+-------+--------+------+\n| Eng  | Alice | 95000  | 1    |\n| Eng  | Bob   | 72000  | 2    |\n| HR   | Carol | 80000  | 1    |\n+------+-------+--------+------+",
    analogy: "Think of a school race. GROUP BY is like calculating the average running time of all runners in each house (collapsing the runner details into 1 summary row per house). Window ranking is like awarding medals (Gold, Silver, Bronze) to individual runners within their houses (preserving the runners' details while showing their ranks).",
    beginnerExample: "SELECT name, department_id, salary, AVG(salary) OVER(PARTITION BY department_id) AS dept_avg_salary FROM employees;",
    intermediateExample: "SELECT name, department_id, salary, ROW_NUMBER() OVER(PARTITION BY department_id ORDER BY salary DESC) AS salary_rank FROM employees;",
    advancedExample: "WITH RankedSales AS (\n  SELECT employee_id, sales_amount, \n         DENSE_RANK() OVER(PARTITION BY department_id ORDER BY sales_amount DESC) as rank\n  FROM sales\n) SELECT * FROM RankedSales WHERE rank <= 2;",
    internalWorking: "Window functions execute late in the query pipeline. The engine sorts the records in memory by the PARTITION and ORDER BY columns. It then streams the rows and evaluates the window function. For frame boundaries (like running sums), the engine tracks a sliding window of row addresses (using buffers in memory or disk), calculating values on the fly. Because of this sorting pass, window functions can be CPU-intensive.",
    advantages: "1. Computes calculations across subsets without collapsing row details.\n2. Solves complex ranking and time-series problems (running averages, lead/lag comparisons) in clean SQL.\n3. Replaces slow, self-joining subqueries with faster linear scans.",
    disadvantages: "1. Sorting multiple window partitions in one query adds heavy CPU load.\n2. Cannot be checked directly in the WHERE or HAVING clauses.",
    commonMistakes: [
      "Attempting to write 'WHERE ROW_NUMBER() OVER(...) = 1' directly. Window functions run AFTER the WHERE clause, so this is a syntax error. Wrap the query in a CTE/subquery instead.",
      "Confusing RANK() (skips rank numbers on ties: 1, 2, 2, 4) with DENSE_RANK() (does not skip numbers: 1, 2, 2, 3)."
    ],
    bestPractices: [
      "Use window functions instead of self-joins to compare a row against group averages.",
      "Check execution plans to ensure the database is leveraging indexes to satisfy window ORDER BY clauses without resorting."
    ],
    performanceConsiderations: "If you have a composite index matching `(partition_column, order_column)`, the database can read the index directly, eliminating the need to sort the dataset in memory to calculate the window function.",
    securityConsiderations: "Be careful with row rankings in paging interfaces; missing gaps in dense rank IDs might expose the presence of deleted or restricted data rows.",
    industryUseCases: "Financial reports tracking daily running balances, leaderboards highlighting top sales agents, time-series analysis comparing month-over-month growth using LAG/LEAD.",
    interviewQuestions: [
      {
        q: "What is the difference between GROUP BY and window functions?",
        a: "GROUP BY collapses multiple rows into a single summary row per group. Window functions perform calculations over a partition of rows while preserving the identity and details of every individual row in the result set."
      },
      {
        q: "Explain the differences between ROW_NUMBER(), RANK(), and DENSE_RANK().",
        a: "ROW_NUMBER() assigns a unique, sequential integer to each row in the partition (1, 2, 3, 4). RANK() assigns the same rank to ties but skips rank numbers for subsequent rows (1, 2, 2, 4). DENSE_RANK() assigns the same rank to ties without skipping numbers (1, 2, 2, 3)."
      }
    ],
    faqs: [
      {
        q: "Can I use window functions in UPDATE statements?",
        a: "No, window functions are restricted to SELECT and ORDER BY clauses. However, you can use them in subqueries to target updates."
      }
    ],
    relatedConcepts: [
      "LAG and LEAD Functions",
      "Sliding Window Frames (ROWS BETWEEN)",
      "Analytical Query Optimization"
    ],
    summary: "Window functions analyze partitions without collapsing rows. Master ranking functions and the logical execution order to use them effectively.",
    resources: [
      "PostgreSQL Window Functions Tutorial",
      "SQL Window Functions Explained"
    ]
  },
  {
    id: 12,
    title: "Index Optimization & Scan Pathways",
    concept: "INDEX",
    quickAnswer: "An index is a pointer structure (typically a B-Tree) that speeds up data retrieval. Database engines choose between Index Seeks (traversing B-Tree pointers for specific matches) and Index/Table Scans (reading entire datasets), depending on query predicates.",
    definition: "An index is a database schema object containing a sorted copy of selected table columns. It allows the database storage engine to locate data pages in O(log N) operations rather than performing linear O(N) table scans.",
    whyItExists: "Reading gigabytes of raw data from physical disks to find a single customer record is incredibly slow. Indexes provide high-speed maps to route the engine directly to the exact disk location of the requested data.",
    coreConcepts: "CREATE INDEX index_name ON table(column);\n- B-Tree Index: Balanced tree structure optimized for equality and range searches.\n- Index Seek: Direct path navigation to specific rows.\n- Index Scan: Reading the index pages sequentially.\n- Table Scan: Reading all heap pages sequentially.",
    stepByStep: "1. The query compiler parses the WHERE clause.\n2. The cost-based optimizer (CBO) estimates the cost of reading the index vs. scanning the table.\n3. If an index seek is selected, the engine starts at the root node of the B-Tree.\n4. It compares keys and traverses down branch nodes to the leaf nodes.\n5. Leaf nodes contain pointers to the actual data pages on disk.\n6. The engine fetches the data page from disk/buffer pool to project the final columns.",
    visualExplanation: "B-Tree Node Structure (Searching for ID 5):\n         [Root: ID 10]\n         /            \\\n    [Branch: 5]      [Branch: 15]\n    /         \\\n[Leaf 1-4]   [Leaf 5-9] ===> Points directly to Data Page for Row 5\n\n- Index Seek: Follows pointers. Cost: 3 page reads. O(log N)\n- Table Scan: Reads all pages. Cost: 10,000 page reads. O(N)",
    analogy: "Think of a library. A Table Scan is walking down every single aisle looking at every book cover until you find 'Moby Dick'. An Index Seek is checking the library catalog card (which lists books alphabetically by title), finding 'Moby Dick' under 'M', getting the shelf number 'Aisle 4, Shelf 2', and walking directly there.",
    beginnerExample: "CREATE INDEX idx_emp_id ON employees(id);",
    intermediateExample: "CREATE INDEX idx_emp_dept_salary ON employees(department_id, salary);",
    advancedExample: "SELECT name FROM employees WHERE department_id = 2 AND salary > 80000;\n-- Optimized by a composite index: (department_id, salary)",
    internalWorking: "B-Tree indexes sort keys from left to right. In a composite index `(col_a, col_b)`, the index is sorted primarily by `col_a`, and secondarily by `col_b`. A query filtering only on `col_b` (e.g. WHERE col_b = 5) cannot perform a seek because it lacks the leading column. This is the **Leftmost Prefix Rule**. Optimizers use statistics (histograms) to decide if an index is selective enough; if a query returns >20% of the table, the optimizer may discard the index and scan the whole table, as random disk seeks are slower than sequential table scans.",
    advantages: "1. Speeds up data retrieval from O(N) to O(log N) complexity.\n2. Bypasses sorting steps for ORDER BY and GROUP BY queries.\n3. Enforces column uniqueness constraints (Unique Indexes).",
    disadvantages: "1. Slows down write operations (INSERT/UPDATE/DELETE) because the index tree must be updated.\n2. Consumes physical storage disk space.",
    commonMistakes: [
      "Applying functions to indexed columns in WHERE clauses (e.g., WHERE ABS(id) = 5), which invalidates index seeks.",
      "Over-indexing: creating indexes on every single column, which degrades write speeds and inflates database storage footprint."
    ],
    bestPractices: [
      "Create indexes on columns frequently used in JOIN, WHERE, and ORDER BY clauses.",
      "Place the most selective columns first in composite indexes to maximize B-Tree partitioning."
    ],
    performanceConsiderations: "Monitor index fragmentation. Regular inserts/updates can cause B-Tree leaf pages to split, leading to gaps. Rebuild or reorganize indexes periodically to maintain peak search performance.",
    securityConsiderations: "Ensure index metadata is secure; listing index names can reveal underlying table structures to attackers.",
    industryUseCases: "E-commerce platforms searching product SKU numbers, banking ledgers looking up account IDs, SaaS systems filtering active subscription records.",
    interviewQuestions: [
      {
        q: "What is the difference between an Index Seek and an Index Scan?",
        a: "An Index Seek traverses the B-Tree from the root to find specific matching values in O(log N) operations. An Index Scan reads the entire leaf level of the index in order (O(N) of index size), which is faster than a table scan but still reads all rows."
      },
      {
        q: "What is the Leftmost Prefix Rule in composite indexes?",
        a: "The leftmost prefix rule states that a composite index on (ColumnA, ColumnB) can only be used for seeks if ColumnA is specified in the WHERE clause query. If you only filter on ColumnB, the engine cannot navigate the index branches because they are sorted primarily by ColumnA."
      }
    ],
    faqs: [
      {
        q: "Does a database use indexes for wildcard LIKE queries?",
        a: "If the wildcard is at the start (e.g., LIKE '%name'), the engine cannot seek and must perform a scan. If the wildcard is at the end (e.g., LIKE 'name%'), it can perform a B-Tree range seek."
      }
    ],
    relatedConcepts: [
      "Leftmost Prefix Rule",
      "Clustered vs. Non-Clustered Indexes",
      "Sargability"
    ],
    summary: "Indexes speed up data lookup. Design composite indexes following the leftmost prefix rule and keep columns free of functions in filters.",
    resources: [
      "Use The Index, Luke! - The complete guide to database index performance",
      "SQL Server Index Design Guide: B-Trees"
    ]
  }
];
