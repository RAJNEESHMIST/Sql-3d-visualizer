import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenerativeAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('Error initializing Google Gen AI:', err);
  }
}

export interface StructuredExplanation {
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

export async function POST(req: NextRequest) {
  try {
    const { query, dialect = 'ansi' } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (aiClient) {
      try {
        const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are an expert SQL educator, database architect, and interviewer. Analyze the following SQL query and explain its execution and concepts assuming the target database dialect is "${dialect.toUpperCase()}".
Return JSON ONLY in the following format (no markdown blocks, no extra text, strictly parsable JSON):
{
  "quickAnswer": "2-3 lines direct answer explaining what the query does.",
  "definition": "Formal educational definition of the SQL features used in the query.",
  "whyItExists": "Why this query structure/feature exists and what problem it solves.",
  "coreConcepts": "Description of the core concepts, syntax keywords, and parameters used in the query.",
  "stepByStep": "Step-by-step chronological database processing of the query (FROM, JOIN, WHERE, GROUP BY, etc.).",
  "visualExplanation": "ASCII text diagram, table, or flowchart representing the rows joining, filtering, or aggregating.",
  "analogy": "A clear, real-world non-technical analogy.",
  "beginnerExample": "A simpler SQL query example demonstrating the basic concept.",
  "intermediateExample": "An intermediate level SQL query with more complex clauses.",
  "advancedExample": "An advanced industry-level example matching the dialect syntax.",
  "internalWorking": "Engine-level explanation (e.g. index lookups, hash joins, sorting buffers, execution plan details for ${dialect.toUpperCase()}).",
  "advantages": "List of advantages of this approach.",
  "disadvantages": "Disadvantages, performance tradeoffs, or storage costs.",
  "commonMistakes": ["Mistake 1 description", "Mistake 2 description"],
  "bestPractices": ["Best practice 1", "Best practice 2"],
  "performanceConsiderations": "Indexing, partition pruning, memory buffers, or full scan costs specific to ${dialect.toUpperCase()}.",
  "securityConsiderations": "SQL injection vectors, query parameterization, and dialect-specific security features.",
  "industryUseCases": "Real-world industry scenarios where this exact query pattern is applied.",
  "interviewQuestions": [
    { "q": "Likely interview question on this topic?", "a": "Clear, expert interview answer." }
  ],
  "faqs": [
    { "q": "Frequently asked student question?", "a": "Answers clarifying common confusion." }
  ],
  "relatedConcepts": ["Concept 1", "Concept 2"],
  "summary": "Key takeaways of the lesson.",
  "resources": ["Further learning resource 1", "Resource 2"]
}

SQL Query to analyze:
${query}`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text().trim();
        const jsonString = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
        const parsedData = JSON.parse(jsonString);
        return NextResponse.json(parsedData);
      } catch (err) {
        console.error('Error calling Gemini API, falling back to rules engine:', err);
      }
    }

    // Heuristics Offline Generator Fallback
    const explanation = generateOfflineExplanation(query, dialect);
    return NextResponse.json(explanation);

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

function generateOfflineExplanation(query: string, dialect: string): StructuredExplanation {
  const qLower = query.toLowerCase();
  const dbName = dialect.toUpperCase();

  // Basic classification
  const isJoin = qLower.includes('join');
  const isGroupBy = qLower.includes('group by');
  const isWhere = qLower.includes('where');

  // Compile dialect-specific details
  const dialectNotes = {
    mysql: {
      engine: 'InnoDB storage engine with clustered primary index lookups.',
      indexType: 'B-Tree indexes',
      limitStyle: 'LIMIT offset, row_count',
      security: 'MySQL Enterprise Audit and SQL injection defense via prepared statements.'
    },
    postgresql: {
      engine: 'PostgreSQL planner using hash joins, nested loops, and bitmap index scans.',
      indexType: 'B-Tree, GIN, and GiST indexes',
      limitStyle: 'LIMIT count OFFSET offset',
      security: 'Row-Level Security (RLS) policies and parameterized protocol binding.'
    },
    sqlite: {
      engine: 'Lightweight in-memory/disk database engine executing single-threaded bytecode.',
      indexType: 'B-Tree indexes',
      limitStyle: 'LIMIT count OFFSET offset',
      security: 'Encrypted databases using SQLCipher and safe runtime bindings.'
    },
    oracle: {
      engine: 'Oracle cost-based optimizer (CBO) choosing index-range scans or hash joins.',
      indexType: 'B-Tree, Bitmap, and Function-based indexes',
      limitStyle: 'OFFSET offset ROWS FETCH NEXT count ROWS ONLY',
      security: 'Oracle Virtual Private Database (VPD) and Transparent Data Encryption (TDE).'
    },
    ansi: {
      engine: 'Standard relational query processor model.',
      indexType: 'Standard relational index models',
      limitStyle: 'FETCH FIRST count ROWS ONLY',
      security: 'Role-based access control and prepared query bindings.'
    }
  }[dialect as 'mysql' | 'postgresql' | 'sqlite' | 'oracle' | 'ansi'] || {
    engine: 'Standard query plan builder.',
    indexType: 'Index lookups',
    limitStyle: 'LIMIT constraints',
    security: 'Standard prepared statement protocols.'
  };

  // 1. Quick Answer
  let quickAnswer = `This query retrieves matching rows from the base dataset. It performs projection to display select fields.`;
  if (isJoin) {
    quickAnswer = `This query combines records from tables using an INNER/OUTER JOIN on matching keys, filtering results to match condition clauses.`;
  } else if (isGroupBy) {
    quickAnswer = `This query groups rows into clusters sharing keys, computing aggregate calculations (e.g. SUM, COUNT, AVG) per cluster.`;
  } else if (isWhere) {
    quickAnswer = `This query scans the source table and filters records so only rows meeting the WHERE clause criteria are processed.`;
  }

  // 2. Definition
  const definition = `A SELECT query that retrieves qualified records. It implements relational algebra operations: Selection (filtering rows via WHERE), Projection (selecting columns via SELECT), and Cartesian Product/Join (linking tables).`;

  // 3. Why It Exists
  const whyItExists = `In normalized databases, information is split across multiple tables to avoid redundancy (3NF). This query pattern exists to dynamically stitch related attributes back together and filter down to actionable information.`;

  // 4. Core Concepts
  const coreConcepts = `
- **SELECT**: Projects specific fields into the final result table.
- **FROM**: Establishes the primary table to scan.
${isJoin ? '- **JOIN/ON**: Directs the engine to align table rows based on matching key values.\n' : ''}
${isWhere ? '- **WHERE**: Filters out individual records before grouping or ordering.\n' : ''}
${isGroupBy ? '- **GROUP BY**: Partitions the records into sets that share the same grouping values.\n' : ''}
- **Dialect Syntax**: Customized and evaluated under the ${dbName} engine rules.`;

  // 5. Step-by-Step Working
  const stepByStep = `
1. **FROM**: The database engine loads the base table.
${isJoin ? `2. **JOIN**: The engine scans the join table, executing a nested loop/hash lookup to match rows on the ON predicate.\n` : ''}
${isWhere ? `3. **WHERE**: The engine evaluates each row against the filter condition, discarding non-matching rows.\n` : ''}
${isGroupBy ? `4. **GROUP BY**: Surviving rows are sorted or hashed into separate group buckets.\n` : ''}
5. **SELECT / AGGREGATE**: The engine retrieves selected fields and evaluates functions (e.g. COUNT) for each group bucket.
6. **LIMIT**: Discards any rows exceeding the limit amount.`;

  // 6. Visual Explanation
  let visualExplanation = `
+--------------------+      +--------------------+
|   employees (e)    |      |  departments (d)   |
+--------------------+      +--------------------+
| id | name | dept_id|      | id | department    |
|----+------+--------|      |----+---------------|
|  1 | Alice|   1    |=====>|  1 | Engineering   | --> JOIN Match!
|  2 | Bob  |   2    |      |  2 | Sales         |
+--------------------+      +--------------------+
`;
  if (!isJoin) {
    visualExplanation = `
+------------------------------------+
|           employees scan           |
+------------------------------------+
| Row 1: Alice (Salary: 85K) -> PASS | ===> Output Result
| Row 2: Charlie (Salary: 54K) -> FAIL| ===> Discarded
+------------------------------------+
`;
  }

  // 7. Analogy
  const analogy = isJoin
    ? `Think of table joins like matching luggage tags. The 'employees' are passengers carrying a luggage tag (department_id), and 'departments' is the storage rack where each shelf has a corresponding number (id). A JOIN is the baggage handler matching the passenger's tag with the correct shelf.`
    : `Think of a table scan like a security checkpoint at an event. The base table is the queue of arriving attendees. The SELECT clause determines what they must show (e.g., ID badge), and the WHERE clause is the security guard checking if their age is > 21.`;

  // 8. Beginner Example
  const beginnerExample = `SELECT name, salary FROM employees;`;

  // 9. Intermediate Example
  const intermediateExample = `SELECT name, salary FROM employees WHERE salary > 60000 ORDER BY salary DESC;`;

  // 10. Advanced Example
  const advancedExample = `
SELECT d.department_name, COUNT(e.id) as employee_count, SUM(e.salary) as payroll
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
WHERE e.salary IS NOT NULL
GROUP BY d.department_name
HAVING SUM(e.salary) > 100000
${dialectNotes.limitStyle.replace('count', '5').replace('row_count', '5').replace('offset', '0')};
`;

  // 11. Internal Working
  const internalWorking = `Under the ${dbName} engine, the optimizer creates an execution plan. It accesses records using ${dialectNotes.engine}. Identifiers are parsed and matched against catalog tables, using ${dialectNotes.indexType} for speed.`;

  // 12. Advantages
  const advantages = `
- Efficiently consolidates normalized attributes.
- Minimizes network traffic by projecting only required columns.
- Leverages database indexing to quickly scan subset records.`;

  // 13. Disadvantages
  const disadvantages = `
- Multi-table joins add execution overhead (Cartesian scaling).
- Full table scans on large tables (no index) lock memory buffers.
- String filters (LIKE '%value%') bypass B-Tree indexes.`;

  // 14. Common Mistakes
  const commonMistakes = [
    `Ambiguous column errors: forgetting table aliases when columns share names (e.g. "id").`,
    `Accidental cross joins: omitting the JOIN ON clause, resulting in N * M records.`,
    `WHERE vs HAVING confusion: attempting to filter aggregations in the WHERE clause.`
  ];

  // 15. Best Practices
  const bestPractices = [
    `Always write explicit aliases for joined tables (e.g. employees e).`,
    `Avoid SELECT * in production queries; request only needed columns.`,
    `Ensure join keys are indexed (typically Primary Key to Foreign Key).`
  ];

  // 16. Performance Considerations
  const performanceConsiderations = `For ${dbName}, index the join predicate columns. Avoid leading wildcards in search conditions (e.g. LIKE '%text') since they invalidate ${dialectNotes.indexType} index range scans.`;

  // 17. Security Considerations
  const securityConsiderations = `Ensure queries are executed via parameterized prepared statements rather than raw string concatenation to defend against SQL Injection vectors in ${dbName}. ${dialectNotes.security}`;

  // 18. Industry Use Cases
  const industryUseCases = `Used in SaaS dashboards to pull user profiles alongside billing info, in HR ledger platforms to calculate departmental payrolls, and in analytics pipelines to aggregate regional metrics.`;

  // 19. Interview Questions
  const interviewQuestions = [
    {
      q: `What is the difference between INNER JOIN and LEFT JOIN?`,
      a: `INNER JOIN returns rows only when there is a match in both tables. LEFT JOIN returns all rows from the left table, plus matched rows from the right table, filling unmatched right cells with NULL.`
    },
    {
      q: `In SQL, does WHERE execute before or after GROUP BY?`,
      a: `WHERE executes BEFORE GROUP BY. It filters individual rows. HAVING executes AFTER GROUP BY to filter the resulting aggregated group buckets.`
    }
  ];

  // 20. FAQs
  const faqs = [
    {
      q: `Why does my query return duplicate rows during a join?`,
      a: `If the join key has a one-to-many relationship (e.g., one department has many employees), the department rows will repeat for each employee match.`
    },
    {
      q: `What happens if I compare a string representation of a number to an integer in ${dbName}?`,
      a: `The engine will perform implicit type casting, which can degrade performance and bypass B-Tree index lookup pathways.`
    }
  ];

  // 21. Related Concepts
  const relatedConcepts = [
    'Common Table Expressions (CTEs)',
    'Subqueries & Correlated Queries',
    'Window Functions (ROW_NUMBER, PARTITION BY)'
  ];

  // 22. Summary
  const summary = `Queries are processed in logical phases: FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT. Understanding this order is key to writing clean, optimized SQL across dialects.`;

  // 23. Resources
  const resources = [
    `${dbName} Official Reference Manual - Query Processing guidelines`,
    `SQLBolt - Interactive SQL lessons`,
    `Use The Index, Luke! - Database indexing performance guide`
  ];

  return {
    quickAnswer,
    definition,
    whyItExists,
    coreConcepts,
    stepByStep,
    visualExplanation,
    analogy,
    beginnerExample,
    intermediateExample,
    advancedExample,
    internalWorking,
    advantages,
    disadvantages,
    commonMistakes,
    bestPractices,
    performanceConsiderations,
    securityConsiderations,
    industryUseCases,
    interviewQuestions,
    faqs,
    relatedConcepts,
    summary,
    resources
  };
}
