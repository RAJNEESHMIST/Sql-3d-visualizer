'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSqlStore } from '../../store/useSqlStore';
import { parseSqlQuery } from '../../lib/parser/sql-parser';
import { simulateQuery } from '../../lib/simulator';
import { Trophy, Shield, HelpCircle, CheckCircle, Lock, ArrowRight, Star, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChallengeTask {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  datasetName: string;
  initialQuery: string;
  expectedRowCount: number;
  expectedColumns: string[];
  hint: string;
  validationCheck: (rows: Record<string, any>[]) => boolean;
}

const challengeTasks: ChallengeTask[] = [
  {
    id: 1,
    title: 'High-Earning Engineers',
    difficulty: 'EASY',
    description: 'Retrieve the names and salaries of all employees in the "employees" table who earn a salary strictly greater than 80,000.',
    datasetName: 'employees',
    initialQuery: 'SELECT name, salary FROM employees WHERE ...',
    expectedRowCount: 6,
    expectedColumns: ['name', 'salary'],
    hint: 'Use the WHERE clause: salary > 80000',
    validationCheck: (rows) => {
      if (rows.length !== 6) return false;
      return rows.every(r => r.salary > 80000 && 'name' in r && 'salary' in r);
    }
  },
  {
    id: 2,
    title: 'Silicon Tower Buildings',
    difficulty: 'EASY',
    description: 'Find the names and budgets of departments located in any building with "Silicon Tower" in its name.',
    datasetName: 'departments',
    initialQuery: 'SELECT department_name, budget FROM departments WHERE ...',
    expectedRowCount: 2,
    expectedColumns: ['department_name', 'budget'],
    hint: 'Use the LIKE operator with wildcards: building LIKE \'%Silicon Tower%\'',
    validationCheck: (rows) => {
      if (rows.length !== 2) return false;
      return rows.some(r => r.department_name === 'Engineering') && rows.some(r => r.department_name === 'Product & Design');
    }
  },
  {
    id: 3,
    title: 'E-commerce Purchase Quantities',
    difficulty: 'MEDIUM',
    description: 'Identify all orders in the "orders" table where the quantity purchased is 3 or more. Project the order id and quantity.',
    datasetName: 'orders',
    initialQuery: 'SELECT id, quantity FROM orders WHERE ...',
    expectedRowCount: 2,
    expectedColumns: ['id', 'quantity'],
    hint: 'Filter on the "quantity" column being greater than or equal to 3.',
    validationCheck: (rows) => {
      if (rows.length !== 2) return false;
      return rows.every(r => r.quantity >= 3);
    }
  },
  {
    id: 4,
    title: 'Staffing Powerhouses',
    difficulty: 'MEDIUM',
    description: 'Find departments with a staff size (COUNT) of at least 3 employees. Select the department_id and its employee count alias named "staff_count".',
    datasetName: 'employees',
    initialQuery: 'SELECT department_id, COUNT(*) as staff_count FROM employees GROUP BY department_id HAVING ...',
    expectedRowCount: 2,
    expectedColumns: ['department_id', 'staff_count'],
    hint: 'Combine GROUP BY department_id with HAVING COUNT(*) >= 3.',
    validationCheck: (rows) => {
      if (rows.length !== 2) return false;
      return rows.every(r => r.staff_count >= 3);
    }
  },
  {
    id: 5,
    title: 'Top Tier Books catalog',
    difficulty: 'HARD',
    description: 'Retrieve all books priced under 15 dollars that were published after the year 1935. Project the book title, genre, and price.',
    datasetName: 'books',
    initialQuery: 'SELECT title, genre, price FROM books WHERE ...',
    expectedRowCount: 2,
    expectedColumns: ['title', 'genre', 'price'],
    hint: 'Combine multiple criteria using AND: price < 15.00 AND publish_year > 1935',
    validationCheck: (rows) => {
      if (rows.length !== 2) return false;
      return rows.every(r => r.price < 15 && r.publish_year > 1935);
    }
  }
];

export default function ChallengeMode() {
  const router = useRouter();
  const { setQuery, setDataset } = useSqlStore();
  
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [userQuery, setUserQuery] = useState<string>('');
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const activeChallenge = challengeTasks[activeChallengeIdx];

  // Set initial query on challenge select
  useEffect(() => {
    if (activeChallenge) {
      setUserQuery(activeChallenge.initialQuery);
      setValidationError(null);
      setIsSuccess(false);
      setShowHint(false);
    }
  }, [activeChallengeIdx]);

  // Load solved state from localstorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sqlvision_solved_challenges');
    if (saved) {
      try {
        setSolvedChallenges(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleChallengeSelect = (idx: number) => {
    setActiveChallengeIdx(idx);
  };

  const handleVerify = () => {
    setValidationError(null);
    setIsSuccess(false);
    
    try {
      // 1. Parse query
      const parsed = parseSqlQuery(userQuery);
      
      // Check if base table is correct
      const baseTableUsed = parsed.from[0]?.table.toLowerCase();
      if (baseTableUsed !== activeChallenge.datasetName.toLowerCase()) {
        throw new Error(`Invalid base table. The challenge requires scanning the "${activeChallenge.datasetName}" table.`);
      }

      // 2. Simulate
      const simulation = simulateQuery(parsed);
      
      // 3. Validate column names
      const cols = simulation.columns.map(c => c.toLowerCase());
      const expectedCols = activeChallenge.expectedColumns.map(c => c.toLowerCase());
      const hasCorrectColumns = expectedCols.every(c => cols.includes(c));
      
      if (!hasCorrectColumns) {
        throw new Error(`Column output mismatch. Expected columns: [${activeChallenge.expectedColumns.join(', ')}]. Received: [${simulation.columns.join(', ')}].`);
      }

      // 4. Validate matching rows criteria
      const passed = activeChallenge.validationCheck(simulation.rows);

      if (passed) {
        setIsSuccess(true);
        // Explode confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00f0ff', '#bd00ff', '#39ff14']
        });

        // Add to solved list
        if (!solvedChallenges.includes(activeChallenge.id)) {
          const newSolved = [...solvedChallenges, activeChallenge.id];
          setSolvedChallenges(newSolved);
          localStorage.setItem('sqlvision_solved_challenges', JSON.stringify(newSolved));
        }
      } else {
        throw new Error(`Incorrect results. Output had ${simulation.rows.length} rows, but values did not satisfy the challenge criteria. Try reviewing the conditions.`);
      }

    } catch (err: any) {
      setValidationError(err.message || 'Simulation completed but output verification failed.');
    }
  };

  const handleVisualizeSolution = () => {
    setQuery(userQuery);
    setDataset(activeChallenge.datasetName);
    router.push('/playground');
  };

  const currentRank = (() => {
    const solvedCount = solvedChallenges.length;
    if (solvedCount === 5) return 'SQL Grandmaster';
    if (solvedCount >= 3) return 'SQL Knight';
    if (solvedCount >= 1) return 'SQL Apprentice';
    return 'SQL Novice';
  })();

  return (
    <div className="w-full flex-1 grid-bg px-6 py-10 md:px-16 flex flex-col gap-8">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20 z-0" />

      {/* Page Header & Stats Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase font-sans tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
            Challenge Arena
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-2 max-w-xl leading-relaxed">
            Test your knowledge! Write queries, verify their output structures, and watch the execution results.
          </p>
        </div>

        {/* Level Stats Badge */}
        <div className="glass-panel border p-4 rounded-xl flex items-center gap-4 bg-white/2 min-w-[240px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center text-white relative shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Trophy className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Rank</span>
            <span className="text-sm font-bold text-white font-sans">{currentRank}</span>
            <span className="text-xs text-neon-blue font-mono mt-0.5">{solvedChallenges.length} / 5 Solved</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 flex-1">
        
        {/* Left Side: Challenge Selector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Challenges Checklist</h3>
          <div className="flex flex-col gap-3">
            {challengeTasks.map((task, idx) => {
              const isSolved = solvedChallenges.includes(task.id);
              const isActive = activeChallengeIdx === idx;
              
              return (
                <button
                  key={task.id}
                  onClick={() => handleChallengeSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-neon-purple/5 border-neon-purple text-white shadow-[0_0_12px_rgba(189,0,255,0.15)]'
                      : 'glass-card text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded ${
                        task.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400' :
                        task.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {task.difficulty}
                      </span>
                      {isSolved && (
                        <span className="text-[9px] bg-neon-green/10 text-neon-green px-1.5 py-0.5 rounded font-mono font-bold">
                          SOLVED
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-sm mt-1">{task.title}</span>
                  </div>
                  {isSolved ? (
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                  ) : (
                    <Shield className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Terminal Workstation */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel border p-6 rounded-2xl flex flex-col gap-5 bg-black/45">
            
            {/* Task Info */}
            <div className="flex flex-col gap-1">
              <div className="text-xs text-neon-purple font-bold font-mono uppercase">// CHALLENGE 0{activeChallenge.id}</div>
              <h2 className="text-xl font-bold text-white font-sans mt-0.5">{activeChallenge.title}</h2>
              <p className="text-gray-300 text-sm leading-relaxed mt-2.5">{activeChallenge.description}</p>
            </div>

            {/* Target Criteria details */}
            <div className="grid grid-cols-2 gap-4 bg-white/2 border border-white/5 p-3.5 rounded-xl text-xs text-gray-400">
              <div>
                <span className="text-gray-600 block mb-1">Target Table:</span>
                <span className="font-mono text-white text-xs">{activeChallenge.datasetName.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Target Columns:</span>
                <span className="font-mono text-white text-xs">[{activeChallenge.expectedColumns.join(', ')}]</span>
              </div>
            </div>

            {/* Terminal input editor */}
            <div className="flex flex-col border border-white/5 rounded-xl overflow-hidden bg-black/70">
              <div className="bg-white/2 py-2 px-4 border-b border-white/5 flex justify-between items-center text-xs text-gray-500">
                <span className="font-mono">SQL TERMINAL</span>
                <span className="font-bold font-mono text-[10px] text-neon-purple">ACTIVE CONTEXT</span>
              </div>
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full resize-none h-[140px] bg-transparent outline-none p-4 text-emerald-400 font-mono text-sm leading-relaxed focus:ring-0"
              />
            </div>

            {/* Action Bar & Hint */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center gap-3">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-gray-500 hover:text-white transition-all font-semibold"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setUserQuery(activeChallenge.initialQuery)}
                    className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Reset Query"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleVerify}
                    className="bg-neon-purple/10 hover:bg-neon-purple border border-neon-purple hover:text-white text-neon-purple text-xs font-semibold py-2 px-6 rounded-md transition-all"
                  >
                    Run & Verify Solution
                  </button>
                </div>
              </div>

              {showHint && (
                <div className="border border-white/5 bg-white/2 p-3 rounded-lg text-xs text-gray-400 leading-relaxed font-mono">
                  <span className="text-neon-orange font-bold mr-1">Hint:</span> {activeChallenge.hint}
                </div>
              )}
            </div>

            {/* Verification Result Output */}
            {validationError && (
              <div className="border border-neon-red/30 bg-neon-red/5 p-4 rounded-xl text-xs text-neon-red leading-relaxed font-mono">
                <span className="font-bold block uppercase mb-1">Verification Failed:</span>
                {validationError}
              </div>
            )}

            {isSuccess && (
              <div className="border border-neon-green/30 bg-neon-green/5 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-neon-green font-bold block text-sm uppercase">Challenge Unlocked!</span>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Your query successfully passed all test suite assertions. Load it in the 3D scene to inspect the query pipeline structure.
                  </p>
                </div>
                <button
                  onClick={handleVisualizeSolution}
                  className="flex items-center gap-1.5 bg-neon-blue/10 hover:bg-neon-blue border border-neon-blue hover:text-black neon-text-blue text-xs font-bold py-2.5 px-6 rounded-md transition-all duration-300 shrink-0"
                >
                  Open in 3D Visualizer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
