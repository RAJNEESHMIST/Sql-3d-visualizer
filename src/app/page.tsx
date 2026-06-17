'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, Play, BookOpen, Trophy, Sparkles, Zap, Layers, RefreshCw } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 80 }
    }
  };

  return (
    <div className="w-full min-h-screen grid-bg relative flex flex-col justify-center items-center px-6 py-12 md:px-16 overflow-hidden">
      {/* Cyber Grid background decorations */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center z-10 flex flex-col items-center gap-6 mt-6"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 border border-neon-blue/20 bg-neon-blue/5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-neon-blue uppercase"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The Future of Database Education
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-600 font-sans uppercase leading-tight select-none"
        >
          Visualize SQL Queries <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-orange font-mono">
            In Interactive 3D
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-gray-400 text-sm md:text-lg max-w-2xl leading-relaxed"
        >
          Don't just write queries—watch them execute. SQLVision 3D animates joins, filters, grouping, and aggregates as floating holographic streams of data.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center px-4"
        >
          <Link
            href="/playground"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-neon-blue bg-neon-blue/10 neon-text-blue font-semibold hover:bg-neon-blue hover:text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            Enter Playground
          </Link>
          <Link
            href="/learn"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-white/10 bg-white/5 font-semibold text-gray-200 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <BookOpen className="w-4.5 h-4.5" />
            Start Tutorials
          </Link>
          <Link
            href="/challenge"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-white/10 bg-white/5 font-semibold text-gray-200 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Trophy className="w-4.5 h-4.5" />
            Challenge Mode
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature cards section */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-xl border flex flex-col gap-4"
        >
          <div className="w-10 h-10 bg-neon-blue/10 rounded-lg flex items-center justify-center text-neon-blue border border-neon-blue/20">
            <Layers className="w-5.5 h-5.5" />
          </div>
          <h3 className="font-bold text-lg text-white font-sans">Holographic 3D Tables</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Represent database tables as floating glass containers in a virtual workspace. Drag, rotate, and zoom into individual records.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 rounded-xl border flex flex-col gap-4"
        >
          <div className="w-10 h-10 bg-neon-purple/10 rounded-lg flex items-center justify-center text-neon-purple border border-neon-purple/20">
            <Zap className="w-5.5 h-5.5" />
          </div>
          <h3 className="font-bold text-lg text-white font-sans">Energy Joins & Filters</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Watch relational records connect via high-speed neon laser beams on JOIN clauses, and glow green or red based on WHERE filters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 rounded-xl border flex flex-col gap-4"
        >
          <div className="w-10 h-10 bg-neon-orange/10 rounded-lg flex items-center justify-center text-neon-orange border border-neon-orange/20">
            <RefreshCw className="w-5.5 h-5.5" />
          </div>
          <h3 className="font-bold text-lg text-white font-sans">Real-time AST Simulator</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Translate standard queries into interactive timelines. Step forward, step backward, or play key frames at your own custom speed.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
