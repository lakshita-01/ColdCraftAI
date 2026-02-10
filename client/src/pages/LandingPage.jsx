import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const LandingPage = ({ onOpenDemo }) => {
  const [isOptimized, setIsOptimized] = useState(false);

  return (
    <div className="pt-32 min-h-screen overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-violet-vibrant/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-vibrant/10 blur-[120px] rounded-full -z-10" />

      <main className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-vibrant/10 border border-violet-vibrant/20 text-violet-glow text-sm font-medium mb-6">
            <Sparkles size={14} />
            Powered by Puter.js AI
          </div>
          <h1 className="text-7xl font-bold leading-[1.1] mb-8">
            Cold emails that <br />
            <span className="text-gradient">actually get replies.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
            Stop guessing. Use vector-trained patterns and AI to craft emails your prospects can't ignore.
          </p>
          <div className="flex gap-4">
            <Link to="/optimize">
              <button className="px-8 py-4 bg-violet-vibrant hover:bg-violet-glow text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-violet-vibrant/20">
                Try for Free <ArrowRight size={20} />
              </button>
            </Link>
            <button onClick={() => onOpenDemo && onOpenDemo()} className="px-8 py-4 glass hover:bg-white/10 rounded-2xl font-bold transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Card Showcase */}
          <div className="glass p-8 rounded-[40px] shadow-2xl relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <button 
                onClick={() => setIsOptimized(!isOptimized)}
                className="text-xs font-bold uppercase tracking-widest text-violet-glow"
              >
                Click to Magic
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isOptimized ? (
                <motion.div
                  key="unoptimized"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="h-4 w-1/3 bg-white/10 rounded-md" />
                  <div className="h-8 w-2/3 bg-white/20 rounded-md" />
                  <div className="h-24 w-full bg-white/5 rounded-xl p-4 text-slate-500 text-sm">
                    Hi, I saw your post. I want to apply for the job. I have 5 years of experience. Let me know.
                  </div>
                  <div className="flex gap-2 pt-4">
                    <div className="h-10 w-full bg-slate-800 rounded-xl" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="optimized"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between">
                    <div className="h-4 w-1/3 bg-cyan-vibrant/20 rounded-md" />
                    <span className="text-cyan-vibrant text-xs font-bold ring-1 ring-cyan-vibrant/50 px-2 py-1 rounded">Score: 92%</span>
                  </div>
                  <div className="h-8 w-4/5 bg-violet-vibrant/20 rounded-md" />
                  <div className="h-24 w-full bg-violet-vibrant/5 border border-violet-vibrant/20 rounded-xl p-4 text-slate-200 text-sm italic font-medium">
                    "I noticed [Company] is scaling their Web3 stack. Based on my work at [Previous], I could help you reduce gas costs by 20%..."
                  </div>
                  <div className="flex items-center gap-2 text-cyan-vibrant text-sm pt-4">
                    <CheckCircle2 size={16} /> Optimized for "Direct & Value-First"
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Decorative Rings */}
          <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/5 rounded-full animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 border border-violet-vibrant/20 rounded-full" />
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
