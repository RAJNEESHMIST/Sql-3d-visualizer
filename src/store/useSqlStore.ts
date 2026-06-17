import { create } from 'zustand';
import { parseSqlQuery, ParsedQuery } from '../lib/parser/sql-parser';
import { simulateQuery, SimulationResult, ExecutionStep } from '../lib/simulator';
import { datasets, generatePerformanceDataset, TableData } from '../lib/datasets/sample-datasets';

interface AIExplanation {
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

interface SqlStore {
  // Queries & Datasets
  query: string;
  selectedDatasetName: string;
  availableDatasets: Record<string, TableData>;
  sqlDialect: 'ansi' | 'postgresql' | 'mysql' | 'sqlite' | 'oracle';
  
  // Parser & Simulation State
  parsedQuery: ParsedQuery | null;
  simulationResult: SimulationResult | null;
  parseError: string | null;
  
  // Timeline State
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1, 1.5, 2
  
  // AI Explanations
  aiExplanation: AIExplanation | null;
  isAiLoading: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setDataset: (name: string) => void;
  setSqlDialect: (dialect: 'ansi' | 'postgresql' | 'mysql' | 'sqlite' | 'oracle') => void;
  runVisualization: () => void;
  loadPerformanceDataset: (count: number) => void;
  
  // Playback Control Actions
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  resetTimeline: () => void;
  
  // AI Actions
  fetchAiExplanation: () => Promise<void>;
}

const defaultQuery = `SELECT e.name, d.department_name
FROM employees e
JOIN departments d
ON e.department_id = d.id
WHERE salary > 50000`;

export const useSqlStore = create<SqlStore>((set, get) => ({
  query: defaultQuery,
  selectedDatasetName: 'employees',
  availableDatasets: datasets,
  sqlDialect: 'ansi',
  
  parsedQuery: null,
  simulationResult: null,
  parseError: null,
  
  currentStepIndex: -1,
  isPlaying: false,
  playbackSpeed: 1,
  
  aiExplanation: null,
  isAiLoading: false,

  setQuery: (query) => set({ query }),
  
  setDataset: (name) => {
    set({ selectedDatasetName: name });
    // Reset explanation when dataset changes
    set({ aiExplanation: null });
  },

  setSqlDialect: (dialect) => {
    set({ sqlDialect: dialect });
    get().runVisualization();
  },

  runVisualization: () => {
    const { query, sqlDialect } = get();
    set({ isPlaying: false, currentStepIndex: -1, parseError: null, aiExplanation: null });
    
    try {
      const parsed = parseSqlQuery(query, sqlDialect);
      const simulation = simulateQuery(parsed);
      
      set({
        parsedQuery: parsed,
        simulationResult: simulation,
        currentStepIndex: 0 // Point to the loaded table step
      });
    } catch (err: any) {
      set({
        parsedQuery: null,
        simulationResult: null,
        parseError: err.message || 'An error occurred during query parsing.'
      });
    }
  },

  loadPerformanceDataset: (count) => {
    const perfDataset = generatePerformanceDataset(count);
    set((state) => ({
      availableDatasets: {
        ...state.availableDatasets,
        [perfDataset.name]: perfDataset
      },
      selectedDatasetName: perfDataset.name
    }));
    get().runVisualization();
  },

  play: () => {
    const { simulationResult, currentStepIndex } = get();
    if (!simulationResult) return;
    
    // If we were at the end, wrap around to start
    const nextIdx = currentStepIndex >= simulationResult.steps.length - 1 ? 0 : currentStepIndex;
    set({ isPlaying: true, currentStepIndex: nextIdx });
  },
  
  pause: () => set({ isPlaying: false }),
  
  stepForward: () => {
    const { simulationResult, currentStepIndex } = get();
    if (!simulationResult) return;
    
    if (currentStepIndex < simulationResult.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false }); // Pause at the end
    }
  },
  
  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },
  
  setStep: (index) => {
    const { simulationResult } = get();
    if (!simulationResult) return;
    
    const boundedIdx = Math.max(0, Math.min(index, simulationResult.steps.length - 1));
    set({ currentStepIndex: boundedIdx });
  },
  
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  
  resetTimeline: () => set({ currentStepIndex: 0, isPlaying: false }),

  fetchAiExplanation: async () => {
    const { query, sqlDialect } = get();
    set({ isAiLoading: true, aiExplanation: null });
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dialect: sqlDialect })
      });
      if (!res.ok) throw new Error('Failed to generate AI response');
      const data = await res.json();
      set({ aiExplanation: data, isAiLoading: false });
    } catch (err) {
      console.error(err);
      // Fail-safe mock generation directly on client side if API route fails
      set({
        isAiLoading: false,
        aiExplanation: {
          quickAnswer: "This SELECT query performs an INNER JOIN between the 'employees' (e) and 'departments' (d) tables, filtering records to only display names of employees earning more than 50,000.",
          definition: "A standard projection query incorporating a relational Inner Join and a row Selection filter.",
          whyItExists: "It pulls normalized details across separate tables (Third Normal Form) and compiles them back together into a single report.",
          coreConcepts: "SELECT (projection list), JOIN ON (relation linkage), WHERE (row selector), table aliases (e, d).",
          stepByStep: "1. FROM loads employees.\n2. JOIN scans departments matching department_id with id.\n3. WHERE filters salary > 50000.\n4. SELECT projects employee name and department name.",
          visualExplanation: "+-----------------+          +---------------------+\n|  employees (e)  |          |   departments (d)   | \n+-----------------+          +---------------------+\n| Name: Alice     |==[JOIN]==>| id 1: Engineering   | => MATCH (Salary > 50K)\n| Name: Charlie   |==[JOIN]==>| id 2: HR            | => FILTER DISCARDED\n+-----------------+          +---------------------+",
          analogy: "Think of matching passenger bags to the correct flight rack by ticket number, filtering out tickets that are economy-class.",
          beginnerExample: "SELECT name FROM employees WHERE salary > 50000;",
          intermediateExample: "SELECT name, salary FROM employees WHERE salary > 50000 ORDER BY salary DESC;",
          advancedExample: "SELECT e.name, d.department_name, e.salary FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.salary > 50000 FETCH FIRST 5 ROWS ONLY;",
          internalWorking: "Runs a nested loop or hash join scan to align table buffers, checking index range pointers for the salary column.",
          advantages: "Consolidates attributes efficiently without duplicate data storage. Projecting specific fields reduces payload sizes.",
          disadvantages: "Without indexes on department_id, nested loops scale to O(N * M) complexity.",
          commonMistakes: [
            "Forgetting to specify the join ON predicate, causing a massive Cartesian product.",
            "Forgetting table aliases in SELECT projection lists when referencing columns with duplicate names (e.g. id)."
          ],
          bestPractices: [
            "Use clear, consistent table alias structures.",
            "Avoid SELECT *; list columns explicitly to optimize buffer reads."
          ],
          performanceConsiderations: "Ensure department_id and departments.id are indexed. salary requires B-Tree range indexes.",
          securityConsiderations: "Parameterize filter conditions to block SQL injection attempts.",
          industryUseCases: "Payroll ledgers, corporate org chart reporting, and regional staff budget audits.",
          interviewQuestions: [
            { q: "What is the difference between INNER and LEFT JOIN?", a: "INNER JOIN yields rows with matching keys on both sides. LEFT JOIN preserves unmatched left table records, padding right columns with NULLs." }
          ],
          faqs: [
            { q: "Why filter in WHERE instead of HAVING?", a: "WHERE filters rows before joining and grouping, which drastically reduces memory allocation size." }
          ],
          relatedConcepts: [
            "Window Functions",
            "Common Table Expressions (CTEs)",
            "Correlated Subqueries"
          ],
          summary: "INNER JOINS combine datasets by matching keys; WHERE filters row vectors before SELECT projects output fields.",
          resources: [
            "Official ANSI SQL manual",
            "SQLBolt relational databases tutorials"
          ]
        }
      });
    }
  }
}));
