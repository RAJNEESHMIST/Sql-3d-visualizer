'use client';

import React, { useEffect, useState } from 'react';
import { useSqlStore } from '../../store/useSqlStore';
import { VisualizationCanvas } from '../../components/3d/VisualizationCanvas';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, 
  Database, Sparkles, Terminal, Layers, Info, CheckCircle, XCircle 
} from 'lucide-react';

const AccordionSection = ({ title, children, colorClass = 'text-neon-purple' }: { title: string; children: React.ReactNode; colorClass?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden bg-black/35 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-2.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider bg-white/2 hover:bg-white/5 transition-all outline-none"
      >
        <span className={colorClass}>{title}</span>
        <span className="text-gray-500 font-mono text-[10px]">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="p-3 text-xs text-gray-300 leading-relaxed border-t border-white/5 bg-black/10">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Playground() {
  const {
    query,
    selectedDatasetName,
    availableDatasets,
    sqlDialect,
    setSqlDialect,
    simulationResult,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    parseError,
    aiExplanation,
    isAiLoading,
    setQuery,
    setDataset,
    runVisualization,
    loadPerformanceDataset,
    play,
    pause,
    stepForward,
    stepBackward,
    setStep,
    setSpeed,
    resetTimeline,
    fetchAiExplanation
  } = useSqlStore();

  const [cameraPreset, setCameraPreset] = useState<'front' | 'top' | 'isometric'>('isometric');
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'source' | 'results'>('details');

  // Core visual timeline logic: auto-increment step when playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && simulationResult) {
      const delay = 1500 / playbackSpeed;
      interval = setInterval(() => {
        const { currentStepIndex, stepForward, pause } = useSqlStore.getState();
        if (currentStepIndex < (simulationResult.steps.length - 1)) {
          stepForward();
        } else {
          pause(); // Loop/Stop at end
        }
      }, delay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, simulationResult, playbackSpeed]);

  // Run initial simulation on load
  useEffect(() => {
    runVisualization();
  }, [runVisualization, selectedDatasetName]);

  const activeStep = simulationResult && currentStepIndex >= 0
    ? simulationResult.steps[currentStepIndex]
    : null;

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row bg-bg-dark h-[calc(100vh-100px)] overflow-hidden">
      
      {/* Left Column: Editor & Control Panel */}
      <div className="w-full md:w-5/12 border-r border-white/5 flex flex-col h-full bg-[#07070f] z-10">
        
        {/* Dataset & Dialect selectors */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500 tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Selected Dataset
            </label>
            <div className="flex gap-2">
              <select
                value={selectedDatasetName}
                onChange={(e) => setDataset(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-md p-2 text-sm text-gray-200 outline-none focus:border-neon-blue transition-all"
              >
                {Object.keys(availableDatasets).map((name) => (
                  <option key={name} value={name} className="bg-panel-dark text-white">
                    {name.toUpperCase()} - {availableDatasets[name].description}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (window.confirm('Generate 10,000 mock rows for stress testing? (3D visualizer will adjust to performance mode)')) {
                    loadPerformanceDataset(10000);
                  }
                }}
                className="text-xs border border-orange-500/30 hover:border-orange-500 text-orange-400 bg-orange-500/5 hover:bg-orange-500/10 px-3 rounded-md transition-all font-semibold whitespace-nowrap"
              >
                10K Row Bench
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-semibold text-gray-500 tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> SQL Engine Dialect
            </label>
            <select
              value={sqlDialect}
              onChange={(e) => setSqlDialect(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-md p-2.5 text-sm text-gray-200 outline-none focus:border-neon-blue transition-all"
            >
              <option value="ansi" className="bg-panel-dark text-white">ANSI SQL (Standard)</option>
              <option value="postgresql" className="bg-panel-dark text-white">PostgreSQL</option>
              <option value="mysql" className="bg-panel-dark text-white">MySQL</option>
              <option value="sqlite" className="bg-panel-dark text-white">SQLite</option>
              <option value="oracle" className="bg-panel-dark text-white">Oracle</option>
            </select>
          </div>
        </div>

        {/* SQL Editor Section */}
        <div className="flex-1 flex flex-col min-h-[220px] relative">
          <div className="bg-white/2 border-b border-white/5 px-4 py-2 flex justify-between items-center text-xs text-gray-400">
            <span className="font-mono flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> query.sql</span>
            {parseError && <span className="text-neon-red font-semibold">Syntax Error</span>}
          </div>
          
          <div className="flex-1 flex font-mono text-sm leading-relaxed overflow-hidden relative">
            {/* Custom Line numbers side panel */}
            <div className="w-10 bg-black/30 text-gray-600 text-right pr-2 select-none py-4 border-r border-white/5 flex flex-col">
              {Array.from({ length: query.split('\n').length || 1 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code Textarea */}
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 resize-none bg-transparent outline-none py-4 px-3 text-emerald-400 font-mono focus:ring-0 focus:outline-none placeholder-gray-700"
              placeholder="SELECT * FROM table..."
            />
          </div>
          
          {/* Editor Action Bar */}
          <div className="p-3 border-t border-white/5 bg-black/40 flex justify-between gap-3">
            <button
              onClick={() => runVisualization()}
              className="flex-1 bg-neon-blue/10 hover:bg-neon-blue border border-neon-blue hover:text-black neon-text-blue text-xs font-semibold py-2 px-4 rounded-md transition-all duration-300"
            >
              Visualize Query
            </button>
            <button
              onClick={() => {
                fetchAiExplanation();
                setActiveTab('ai');
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-neon-purple/40 bg-neon-purple/5 hover:bg-neon-purple/20 text-neon-purple hover:text-white rounded-md text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </button>
          </div>
        </div>

        {/* Tabbed Info Panel (Step details / AI explanation / 2D table result) */}
        <div className="h-2/5 border-t border-white/5 flex flex-col bg-black/60 overflow-hidden">
          <div className="flex border-b border-white/5 bg-white/2 text-xs">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 font-semibold transition-all border-b-2 ${
                activeTab === 'details' ? 'border-neon-blue text-neon-blue bg-white/5' : 'border-transparent text-gray-500'
              }`}
            >
              Execution Steps
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 font-semibold transition-all border-b-2 ${
                activeTab === 'ai' ? 'border-neon-purple text-neon-purple bg-white/5' : 'border-transparent text-gray-500'
              }`}
            >
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('source')}
              className={`flex-1 py-2 font-semibold transition-all border-b-2 ${
                activeTab === 'source' ? 'border-neon-blue text-neon-blue bg-white/5' : 'border-transparent text-gray-500'
              }`}
            >
              Source Data
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 py-2 font-semibold transition-all border-b-2 ${
                activeTab === 'results' ? 'border-neon-green text-neon-green bg-white/5' : 'border-transparent text-gray-500'
              }`}
            >
              Result Grid
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-sm">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="flex flex-col gap-3">
                {parseError ? (
                  <div className="flex items-start gap-2 border border-neon-red/30 bg-neon-red/5 p-3 rounded text-neon-red">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase">Compilation Failed</h4>
                      <p className="text-xs text-gray-400 mt-1">{parseError}</p>
                    </div>
                  </div>
                ) : activeStep ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                        ['SCAN_ROW', 'JOIN_SCAN'].includes(activeStep.type) ? 'bg-cyan-500/10 text-cyan-400' :
                        activeStep.type.includes('MATCH') || activeStep.type.includes('PASS') ? 'bg-emerald-500/10 text-emerald-400' :
                        activeStep.type.includes('FAIL') || activeStep.type.includes('MISMATCH') ? 'bg-rose-500/10 text-rose-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {activeStep.type}
                      </span>
                      <span className="text-xs text-gray-500">Step {currentStepIndex + 1} of {simulationResult?.steps.length}</span>
                    </div>
                    <p className="text-gray-300 font-sans leading-relaxed">{activeStep.description}</p>
                    
                    {activeStep.data && (
                      <div className="mt-2 bg-white/2 border border-white/5 p-2 rounded text-xs font-mono text-gray-400">
                        <span className="text-gray-600 block border-b border-white/5 pb-1 mb-1">// Active data context</span>
                        {JSON.stringify(activeStep.data, null, 2)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-6 flex flex-col items-center gap-2">
                    <Info className="w-6 h-6" />
                    <span>No active visualization steps. Click Visualize to compile.</span>
                  </div>
                )}
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div className="flex flex-col gap-3">
                {isAiLoading ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-neon-purple">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-neon-purple animate-spin" />
                    <span className="text-xs font-semibold animate-pulse">Consulting AI Assistant...</span>
                  </div>
                ) : aiExplanation ? (
                  <div className="flex flex-col gap-1 pb-4">
                    {/* Quick Answer (direct answer, highlighted at top) */}
                    <div className="border border-neon-blue/20 bg-neon-blue/5 p-3.5 rounded-lg mb-3">
                      <h4 className="font-bold text-xs text-neon-blue uppercase mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> 01. Quick Answer
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{aiExplanation.quickAnswer}</p>
                    </div>

                    <AccordionSection title="02. Formal Definition" colorClass="text-neon-purple">
                      <p className="font-bold text-[10px] text-neon-purple uppercase mb-1">// Formal Definition</p>
                      <p className="mb-3">{aiExplanation.definition}</p>
                      <p className="font-bold text-[10px] text-neon-purple uppercase mb-1">// Why It Exists</p>
                      <p>{aiExplanation.whyItExists}</p>
                    </AccordionSection>

                    <AccordionSection title="03. Core Syntax Concepts" colorClass="text-neon-blue">
                      <div className="whitespace-pre-wrap">{aiExplanation.coreConcepts}</div>
                    </AccordionSection>

                    <AccordionSection title="04. Execution Pipeline Steps" colorClass="text-neon-green">
                      <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-emerald-400 bg-black/40 p-2.5 rounded border border-white/5">
                        {aiExplanation.stepByStep}
                      </div>
                    </AccordionSection>

                    <AccordionSection title="05. Visual Data Flow" colorClass="text-neon-orange">
                      <pre className="font-mono text-[10px] text-orange-400 bg-black/60 p-3 rounded border border-white/5 overflow-x-auto whitespace-pre">
                        {aiExplanation.visualExplanation}
                      </pre>
                    </AccordionSection>

                    <AccordionSection title="06. Real-World Analogy" colorClass="text-neon-purple">
                      <p className="italic text-gray-300 leading-relaxed">"{aiExplanation.analogy}"</p>
                    </AccordionSection>

                    <AccordionSection title="07. SQL Code Examples" colorClass="text-neon-blue">
                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">// A. Beginner Example</span>
                          <pre className="bg-black/50 p-2 rounded text-[11px] font-mono text-emerald-400 border border-white/5 overflow-x-auto">{aiExplanation.beginnerExample}</pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">// B. Intermediate Example</span>
                          <pre className="bg-black/50 p-2 rounded text-[11px] font-mono text-emerald-400 border border-white/5 overflow-x-auto">{aiExplanation.intermediateExample}</pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-orange-400 font-bold uppercase block mb-1">// C. Advanced Example</span>
                          <pre className="bg-black/50 p-2 rounded text-[11px] font-mono text-emerald-400 border border-white/5 overflow-x-auto">{aiExplanation.advancedExample}</pre>
                        </div>
                      </div>
                    </AccordionSection>

                    <AccordionSection title="08. Relational Engine Internals" colorClass="text-neon-red">
                      <p className="leading-relaxed">{aiExplanation.internalWorking}</p>
                    </AccordionSection>

                    <AccordionSection title="09. Design Tradeoffs (Pros & Cons)" colorClass="text-neon-purple">
                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">Advantages / Pros</span>
                          <div className="whitespace-pre-wrap">{aiExplanation.advantages}</div>
                        </div>
                        <div className="border-t border-white/5 pt-2">
                          <span className="text-[10px] text-neon-red font-bold uppercase block mb-1">Disadvantages / Cons</span>
                          <div className="whitespace-pre-wrap">{aiExplanation.disadvantages}</div>
                        </div>
                      </div>
                    </AccordionSection>

                    <AccordionSection title="10. Student Pitfalls & Mistakes" colorClass="text-neon-red">
                      <ul className="list-disc list-inside flex flex-col gap-2">
                        {aiExplanation.commonMistakes.map((m, idx) => (
                          <li key={idx} className="leading-relaxed text-gray-300">{m}</li>
                        ))}
                      </ul>
                    </AccordionSection>

                    <AccordionSection title="11. Production Best Practices" colorClass="text-neon-green">
                      <ul className="list-disc list-inside flex flex-col gap-2">
                        {aiExplanation.bestPractices.map((b, idx) => (
                          <li key={idx} className="leading-relaxed text-gray-300">{b}</li>
                        ))}
                      </ul>
                    </AccordionSection>

                    <AccordionSection title="12. Performance Optimization" colorClass="text-neon-orange">
                      <p className="leading-relaxed">{aiExplanation.performanceConsiderations}</p>
                    </AccordionSection>

                    <AccordionSection title="13. Security Considerations" colorClass="text-neon-red">
                      <p className="leading-relaxed text-neon-red/80">{aiExplanation.securityConsiderations}</p>
                    </AccordionSection>

                    <AccordionSection title="14. Industry Use Cases" colorClass="text-neon-blue">
                      <p className="leading-relaxed">{aiExplanation.industryUseCases}</p>
                    </AccordionSection>

                    <AccordionSection title="15. Interview Questions & Answers" colorClass="text-neon-purple">
                      <div className="flex flex-col gap-3">
                        {aiExplanation.interviewQuestions.map((q, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-[10px] text-neon-purple font-bold block mb-1">Q: {q.q}</span>
                            <p className="text-gray-300">A: {q.a}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionSection>

                    <AccordionSection title="16. Frequently Asked Questions (FAQs)" colorClass="text-neon-blue">
                      <div className="flex flex-col gap-3">
                        {aiExplanation.faqs.map((f, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-[10px] text-cyan-400 font-bold block mb-1">Q: {f.q}</span>
                            <p className="text-gray-300">A: {f.a}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionSection>

                    <AccordionSection title="17. Related Concepts" colorClass="text-neon-green">
                      <ul className="list-disc list-inside flex flex-col gap-1">
                        {aiExplanation.relatedConcepts.map((c, idx) => (
                          <li key={idx} className="text-gray-300">{c}</li>
                        ))}
                      </ul>
                    </AccordionSection>

                    <AccordionSection title="18. Lesson Summary & Resources" colorClass="text-neon-orange">
                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-[10px] text-neon-orange font-bold uppercase block mb-1">Key Takeaways</span>
                          <p>{aiExplanation.summary}</p>
                        </div>
                        <div className="border-t border-white/5 pt-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Further Learning Resources</span>
                          <ul className="list-disc list-inside flex flex-col gap-1 mt-1">
                            {aiExplanation.resources.map((r, idx) => (
                              <li key={idx} className="text-gray-400">{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionSection>

                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-6 flex flex-col items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <span>Click the Ask AI button to analyze your SQL query structure.</span>
                  </div>
                )}
              </div>
            )}

            {/* Source Data Tab */}
            {activeTab === 'source' && (
              <div className="w-full">
                {availableDatasets[selectedDatasetName] ? (
                  <div className="overflow-x-auto max-h-[160px] border border-white/5 rounded">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-gray-300">
                          {availableDatasets[selectedDatasetName].columns.map((col) => (
                            <th key={col.name} className="p-2 border-r border-white/5">{col.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {availableDatasets[selectedDatasetName].rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/2">
                            {availableDatasets[selectedDatasetName].columns.map((col) => (
                              <td key={col.name} className="p-2 border-r border-white/5 text-gray-400">
                                {row[col.name] === null ? <span className="text-gray-700 italic">NULL</span> : String(row[col.name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-6 flex flex-col items-center gap-2">
                    <Database className="w-6 h-6" />
                    <span>No source dataset selected.</span>
                  </div>
                )}
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="w-full">
                {simulationResult && simulationResult.rows.length > 0 ? (
                  <div className="overflow-x-auto max-h-[160px] border border-white/5 rounded">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-gray-300">
                          {simulationResult.columns.map((col) => (
                            <th key={col} className="p-2 border-r border-white/5">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResult.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/2">
                            {simulationResult.columns.map((col) => (
                              <td key={col} className="p-2 border-r border-white/5 text-gray-400">
                                {row[col] === null ? <span className="text-gray-700 italic">NULL</span> : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-6 flex flex-col items-center gap-2">
                    <Layers className="w-6 h-6" />
                    <span>Output table is empty or query has not been run.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: 3D Scene viewport & playback */}
      <div className="flex-1 flex flex-col h-full bg-[#050508] relative">
        
        {/* Preset View selection */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          {(['front', 'top', 'isometric'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCameraPreset(view)}
              className={`text-xs px-3 py-1.5 rounded border font-semibold transition-all ${
                cameraPreset === view
                  ? 'bg-neon-blue/10 border-neon-blue text-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {view.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 3D Canvas */}
        <div className="flex-1">
          <VisualizationCanvas cameraPreset={cameraPreset} />
        </div>

        {/* Timeline controller box */}
        <div className="p-6 border-t border-white/5 bg-panel-dark/80 backdrop-blur-md flex flex-col gap-4 z-10">
          
          {/* Progress Slider */}
          {simulationResult && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-mono">01</span>
              <input
                type="range"
                min="0"
                max={simulationResult.steps.length - 1}
                value={currentStepIndex === -1 ? 0 : currentStepIndex}
                onChange={(e) => setStep(parseInt(e.target.value, 10))}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-blue outline-none"
              />
              <span className="text-xs text-gray-500 font-mono">
                {String(simulationResult.steps.length).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Timeline Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Speed selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold">SPEED:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="bg-black/35 border border-white/10 rounded px-2.5 py-1 text-xs text-gray-200 outline-none cursor-pointer focus:border-neon-blue"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1.0x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
              </select>
            </div>

            {/* Timeline Controls */}
            <div className="flex gap-2.5">
              <button
                onClick={() => resetTimeline()}
                className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title="Reset Timeline"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
              
              <button
                onClick={() => stepBackward()}
                disabled={currentStepIndex <= 0}
                className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Step"
              >
                <SkipBack className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => (isPlaying ? pause() : play())}
                disabled={!simulationResult}
                className="px-5 py-2 rounded-md border border-neon-blue bg-neon-blue/10 text-neon-blue hover:bg-neon-blue hover:text-black font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>

              <button
                onClick={() => stepForward()}
                disabled={!simulationResult || currentStepIndex >= (simulationResult.steps.length - 1)}
                className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Step"
              >
                <SkipForward className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Current Step Index */}
            <div className="text-xs font-mono text-gray-400 bg-white/2 border border-white/5 px-3 py-1.5 rounded">
              STEP: <span className="text-neon-blue font-bold">
                {currentStepIndex === -1 ? 0 : currentStepIndex + 1}
              </span> / {simulationResult?.steps.length || 0}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
