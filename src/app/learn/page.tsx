'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSqlStore } from '../../store/useSqlStore';
import { lessons, Lesson } from '../../lib/tutorials/lessons';
import { interviewPrepLessons, InterviewPrepLesson } from '../../lib/tutorials/interview-prep-data';
import { 
  BookOpen, Check, HelpCircle, ArrowRight, Award, Sparkles, 
  Copy, Play, Cpu, AlertTriangle, Shield, CheckCircle2, 
  Terminal, HelpCircle as FaqIcon, Compass, BookOpen as BookIcon, ChevronDown, ChevronRight
} from 'lucide-react';

const AccordionSection = ({ 
  title, 
  children, 
  colorClass = 'text-neon-purple',
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  colorClass?: string;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40 mb-3 transition-all hover:border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex justify-between items-center text-xs md:text-sm font-bold uppercase tracking-wider bg-white/2 hover:bg-white/5 transition-all outline-none"
      >
        <span className={colorClass}>{title}</span>
        <span className="text-gray-400 font-mono text-xs">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 text-xs md:text-sm text-gray-300 leading-relaxed border-t border-white/5 bg-black/20">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Learn() {
  const router = useRouter();
  const { setQuery, setDataset } = useSqlStore();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0]);
  
  // Dual-mode state
  const [activeMode, setActiveMode] = useState<'quiz' | 'prep'>('prep');
  
  // Interactive Quiz state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Copy status state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const matchedPrepLesson = interviewPrepLessons.find(l => l.id === selectedLesson.id) || interviewPrepLessons[0];

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  const handleOptionSelect = (option: string) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    const correct = selectedOption === selectedLesson.correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleLaunchPlayground = () => {
    setQuery(selectedLesson.query);
    setDataset(selectedLesson.datasetName);
    router.push('/playground');
  };

  const handleLaunchCustomQuery = (queryText: string) => {
    setQuery(queryText);
    setDataset(selectedLesson.datasetName);
    router.push('/playground');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="w-full flex-1 grid-bg px-4 py-8 md:px-16 flex flex-col gap-8">
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20 z-0" />

      {/* Page Header */}
      <div className="max-w-4xl z-10">
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase font-sans tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
          SQL Course Curriculum
        </h1>
        <p className="text-gray-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
          Master standard SQL and dialect internals. Study the interview preparation guide, challenge yourself with predictive quizzes, and run lessons in interactive 3D space.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 flex-1">
        
        {/* Left column: Lesson Index */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Lessons</h3>
          <div className="flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
            {lessons.map((lesson) => {
              const isActive = selectedLesson.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-neon-blue/5 border-neon-blue text-white shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                      : 'glass-card text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded w-fit ${
                      isActive ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/5 text-gray-500'
                    }`}>
                      {lesson.concept}
                    </span>
                    <span className="font-bold text-sm mt-1">{lesson.title}</span>
                  </div>
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Study Area & Mode Toggle */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Mode Selector Tabs */}
          <div className="flex bg-black/40 border border-white/5 rounded-xl p-1.5 self-start">
            <button
              onClick={() => setActiveMode('prep')}
              className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeMode === 'prep' 
                  ? 'bg-neon-blue/15 border border-neon-blue/30 text-neon-blue shadow-sm' 
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              <Award className="w-4 h-4" />
              Interview Study Guide
            </button>
            <button
              onClick={() => setActiveMode('quiz')}
              className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeMode === 'quiz' 
                  ? 'bg-neon-purple/15 border border-neon-purple/30 text-neon-purple shadow-sm' 
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Interactive Quiz & 3D Play
            </button>
          </div>

          <div className="glass-panel border p-6 rounded-2xl flex flex-col gap-5">
            
            {/* Lesson Title Section */}
            <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
              <span className="text-xs text-neon-blue font-bold font-mono uppercase">// LESSON {String(selectedLesson.id).padStart(2, '0')}</span>
              <h2 className="text-xl md:text-2xl font-bold text-white font-sans">{selectedLesson.title}</h2>
              <p className="text-gray-300 text-sm leading-relaxed mt-1">{selectedLesson.description}</p>
            </div>

            {/* PREPARATION MODE */}
            {activeMode === 'prep' && (
              <div className="flex flex-col gap-4">
                
                {/* 1. Quick Answer */}
                <div className="border border-neon-blue/20 bg-neon-blue/5 p-4 rounded-xl">
                  <h4 className="font-bold text-xs md:text-sm text-neon-blue uppercase mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5" /> 01. Quick Answer
                  </h4>
                  <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-sans">{matchedPrepLesson.quickAnswer}</p>
                </div>

                {/* 2. Definition & Why It Exists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-neon-purple font-mono font-bold uppercase tracking-wider block mb-1.5">02. Academic Definition</span>
                    <p className="text-xs text-gray-300 leading-relaxed">{matchedPrepLesson.definition}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-neon-green font-mono font-bold uppercase tracking-wider block mb-1.5">03. Why It Exists</span>
                    <p className="text-xs text-gray-300 leading-relaxed">{matchedPrepLesson.whyItExists}</p>
                  </div>
                </div>

                {/* 3. Core Concepts */}
                <AccordionSection title="04. Core Concepts & Keywords" colorClass="text-neon-blue" defaultOpen={true}>
                  <div className="whitespace-pre-wrap font-sans text-xs md:text-sm text-gray-300 leading-relaxed">
                    {matchedPrepLesson.coreConcepts}
                  </div>
                </AccordionSection>

                {/* 4. Step-by-Step Execution */}
                <AccordionSection title="05. Step-by-Step Database Execution" colorClass="text-neon-green">
                  <div className="whitespace-pre-wrap font-mono text-xs text-emerald-400 bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                    {matchedPrepLesson.stepByStep}
                  </div>
                </AccordionSection>

                {/* 5. Visual Explanation (ASCII) */}
                <AccordionSection title="06. Visual Flow Diagram (ASCII)" colorClass="text-neon-orange">
                  <pre className="font-mono text-[11px] text-orange-400 bg-black/60 p-4 rounded-lg border border-white/5 overflow-x-auto whitespace-pre leading-normal">
                    {matchedPrepLesson.visualExplanation}
                  </pre>
                </AccordionSection>

                {/* 6. Real-World Analogy */}
                <AccordionSection title="07. Real-World Analogy" colorClass="text-neon-purple">
                  <p className="italic text-gray-300 text-xs md:text-sm leading-relaxed border-l-2 border-neon-purple/50 pl-3">
                    "{matchedPrepLesson.analogy}"
                  </p>
                </AccordionSection>

                {/* 7. Code Examples (Beginner, Intermediate, Advanced) */}
                <div className="border border-white/5 bg-white/2 rounded-xl p-5 flex flex-col gap-4">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Terminal className="w-4.5 h-4.5 text-neon-blue" />
                    08. Interview & Production Code Examples
                  </h4>
                  
                  {/* Examples Carousel / Stack */}
                  <div className="flex flex-col gap-5">
                    {[
                      { type: 'Beginner', code: matchedPrepLesson.beginnerExample },
                      { type: 'Intermediate', code: matchedPrepLesson.intermediateExample },
                      { type: 'Advanced', code: matchedPrepLesson.advancedExample }
                    ].map((example, idx) => (
                      <div key={idx} className="flex flex-col rounded-lg overflow-hidden border border-white/5 bg-black/40">
                        <div className="bg-white/2 py-2 px-4 border-b border-white/5 flex justify-between items-center text-xs text-gray-400">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-neon-blue">// {example.type} Level Query</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopyCode(example.code)}
                              className="hover:text-neon-blue flex items-center gap-1 transition-all"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedText === example.code ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={() => handleLaunchCustomQuery(example.code)}
                              className="hover:text-neon-green flex items-center gap-1 transition-all"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Visualize
                            </button>
                          </div>
                        </div>
                        <pre className="p-3 text-emerald-400 font-mono text-xs md:text-sm overflow-x-auto whitespace-pre-wrap">
                          {example.code}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. Relational Engine Internals */}
                <AccordionSection title="09. Relational Engine Internals & Architecture" colorClass="text-neon-red">
                  <div className="flex items-start gap-3">
                    <Cpu className="w-6 h-6 text-neon-red flex-shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                      {matchedPrepLesson.internalWorking}
                    </p>
                  </div>
                </AccordionSection>

                {/* 9. Advantages & Disadvantages */}
                <AccordionSection title="10. Design Trade-offs & Analysis" colorClass="text-neon-purple">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-emerald-500/10 bg-emerald-500/5 p-3 rounded-lg">
                      <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">Advantages / Pros</span>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{matchedPrepLesson.advantages}</p>
                    </div>
                    <div className="border border-rose-500/10 bg-rose-500/5 p-3 rounded-lg">
                      <span className="text-neon-red font-bold text-xs uppercase block mb-1">Disadvantages / Cons</span>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{matchedPrepLesson.disadvantages}</p>
                    </div>
                  </div>
                </AccordionSection>

                {/* 10. Common Mistakes */}
                <AccordionSection title="11. Common Mistakes & Pitfalls" colorClass="text-neon-red">
                  <ul className="flex flex-col gap-2">
                    {matchedPrepLesson.commonMistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                        <AlertTriangle className="w-4 h-4 text-neon-red flex-shrink-0 mt-0.5" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>

                {/* 11. Production Best Practices */}
                <AccordionSection title="12. Production Best Practices" colorClass="text-neon-green">
                  <ul className="flex flex-col gap-2">
                    {matchedPrepLesson.bestPractices.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>

                {/* 12. Performance & Security Considerations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-neon-orange font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> 13. Performance Details
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">{matchedPrepLesson.performanceConsiderations}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-neon-red font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> 14. Security Measures
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">{matchedPrepLesson.securityConsiderations}</p>
                  </div>
                </div>

                {/* 13. Industry Use Cases */}
                <AccordionSection title="15. Industry Use Cases" colorClass="text-neon-blue">
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                    {matchedPrepLesson.industryUseCases}
                  </p>
                </AccordionSection>

                {/* 14. Interview Q&As */}
                <AccordionSection title="16. Real Interview Questions & Answers" colorClass="text-neon-purple">
                  <div className="flex flex-col gap-4">
                    {matchedPrepLesson.interviewQuestions.map((qa, i) => (
                      <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0 flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-neon-purple flex items-start gap-1">
                          <span className="bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded font-mono mr-1">Q</span>
                          {qa.q}
                        </span>
                        <p className="text-xs md:text-sm text-gray-300 pl-6 leading-relaxed">
                          <span className="font-semibold text-white">Answer:</span> {qa.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                {/* 15. FAQs */}
                <AccordionSection title="17. Frequently Asked Questions (FAQs)" colorClass="text-neon-blue">
                  <div className="flex flex-col gap-4">
                    {matchedPrepLesson.faqs.map((faq, i) => (
                      <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0 flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-cyan-400 flex items-start gap-1">
                          <span className="bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded font-mono mr-1">FAQ</span>
                          {faq.q}
                        </span>
                        <p className="text-xs md:text-sm text-gray-300 pl-8 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionSection>

                {/* 16. Related Concepts & Further Learning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-neon-green font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> 18. Related Concepts
                    </span>
                    <ul className="list-disc list-inside text-xs text-gray-400 flex flex-col gap-1.5">
                      {matchedPrepLesson.relatedConcepts.map((concept, i) => (
                        <li key={i} className="hover:text-white cursor-pointer transition-all">{concept}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-neon-orange font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <BookIcon className="w-3.5 h-3.5" /> 19. Further Resources
                    </span>
                    <ul className="list-disc list-inside text-xs text-gray-400 flex flex-col gap-1.5">
                      {matchedPrepLesson.resources.map((res, i) => (
                        <li key={i} className="hover:text-white cursor-pointer transition-all">{res}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Summary Takeaway */}
                <div className="border border-white/5 bg-black/40 rounded-xl p-4 mt-2">
                  <span className="text-[10px] text-neon-orange font-mono font-bold uppercase tracking-wider block mb-1">20. Lesson Summary</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{matchedPrepLesson.summary}</p>
                </div>

              </div>
            )}

            {/* INTERACTIVE QUIZ MODE */}
            {activeMode === 'quiz' && (
              <div className="flex flex-col gap-5">
                
                {/* Query code container */}
                <div className="flex flex-col rounded-xl overflow-hidden border border-white/5 bg-black/60 font-mono text-xs md:text-sm">
                  <div className="bg-white/2 py-2 px-4 border-b border-white/5 text-gray-500 text-xs">
                    SQL Query Lesson Preset
                  </div>
                  <pre className="p-4 text-emerald-400 overflow-x-auto whitespace-pre-wrap">{selectedLesson.query}</pre>
                </div>

                {/* Predictive Quiz Card */}
                <div className="border border-white/5 bg-white/2 rounded-xl p-5 flex flex-col gap-4">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-neon-purple" />
                    Predictive Challenge Question
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedLesson.challengeQuestion}</p>

                  {/* Options */}
                  <div className="flex flex-col gap-2 mt-2">
                    {selectedLesson.challengeOptions.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(opt)}
                          className={`w-full text-left p-3 rounded-lg border text-xs md:text-sm transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-neon-purple/10 border-neon-purple text-white'
                              : 'bg-black/30 border-white/5 text-gray-400 hover:bg-white/2 hover:text-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'border-neon-purple text-neon-purple' : 'border-gray-600 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit answer / Actions */}
                  <div className="flex justify-between items-center gap-4 mt-3">
                    {!submitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption}
                        className="bg-neon-purple/10 hover:bg-neon-purple border border-neon-purple hover:text-white text-neon-purple text-xs font-semibold py-2 px-6 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Submit Prediction
                      </button>
                    ) : (
                      <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-2.5">
                          {isCorrect ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded flex items-center gap-2 text-xs">
                              <Check className="w-4 h-4" /> Correct Prediction!
                            </div>
                          ) : (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-neon-red p-2 rounded flex items-center gap-2 text-xs">
                              Incorrect. Read the explanation below.
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleLaunchPlayground}
                          className="flex items-center gap-1.5 bg-neon-blue/10 hover:bg-neon-blue border border-neon-blue hover:text-black neon-text-blue text-xs font-bold py-2 px-5 rounded-md transition-all duration-300"
                        >
                          Visualize in 3D <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Explanation text */}
                  {submitted && (
                    <div className="mt-2 text-xs border-t border-white/5 pt-4 text-gray-400 leading-relaxed flex flex-col gap-1.5 animate-fadeIn">
                      <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                        <Award className="w-3.5 h-3.5 text-neon-orange" /> Concept Explanation
                      </span>
                      {selectedLesson.explanation}
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

