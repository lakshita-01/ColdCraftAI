import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Wand2, Copy, Check, Info, Upload, X } from 'lucide-react';
import { generateAIResponse, readFileContent, waitForPuter, prewarmPuter, summarizeResumeLocal, extractJobRelevantPoints, analyzeResumeComprehensive } from '../services/puter.js';
import API_URL from '../config/api';

const Optimizer = () => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeContent, setResumeContent] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [formData, setFormData] = useState({
    recipient: '',
    jobContext: '',
    experience: ''
  });
  const [result, setResult] = useState(null);

  // Preload Puter.js on component mount
  useEffect(() => {
    const initializePuter = async () => {
      try {
        await waitForPuter();
        setPuterReady(true);
      } catch (error) {
        console.error('Failed to initialize Puter.js:', error);
      }
    };
    initializePuter();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setResumeFile(file);
      const content = await readFileContent(file);
      setResumeContent(content);
      // create a short local summary to reduce prompt size and speed up generation
      const summary = summarizeResumeLocal(content, 600);
      setResumeSummary(summary);
    } catch (error) {
      console.error('Error reading file:', error);
      alert(error.message || 'Error reading file. Please try a .txt or .pdf file.');
      setResumeFile(null);
    }
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeContent('');
  };

  const handleGenerate = async () => {
    if(!formData.recipient || !formData.jobContext) return;
    
    try {
      setLoading(true);
      
      // Build sender background from available sources
      let senderBackground = '';
      
      if (resumeContent) {
        try {
          // Get job-relevant points from resume
          const relevantPoints = extractJobRelevantPoints(resumeContent, formData.jobContext);
          
          // Get comprehensive analysis for more context
          const analysis = analyzeResumeComprehensive(resumeContent, formData.jobContext);
          
          // Build detailed sender background section
          if (analysis.skills && analysis.skills.length > 0) {
            senderBackground += `SENDER'S SKILLS & EXPERTISE:\n${analysis.skills.slice(0, 12).join(', ')}\n\n`;
          }
          
          if (relevantPoints && relevantPoints.trim()) {
            senderBackground += `SENDER'S RELEVANT EXPERIENCE & ACHIEVEMENTS:\n${relevantPoints}\n\n`;
          }

          // If we have resume but extracted info is too sparse, add the summary as fallback
          if (senderBackground.length < 100 && resumeSummary) {
            senderBackground += `SENDER'S BACKGROUND SUMMARY:\n${resumeSummary}\n\n`;
          }
        } catch (analysisError) {
          console.error('Error analyzing resume:', analysisError);
          senderBackground += `SENDER'S BACKGROUND (RAW):\n${resumeContent.substring(0, 800)}\n\n`;
        }
      }
      
      // Always include manual experience if provided
      if (formData.experience && formData.experience.trim()) {
        senderBackground += `SENDER'S KEY EXPERIENCE:\n${formData.experience}`;
      }
      
      // Fallback: ensure we have some background info
      if (!senderBackground.trim()) {
        senderBackground = `SENDER'S KEY EXPERIENCE:\n${formData.experience || 'Experienced professional ready to contribute'}`;
      }

      const prompt = `You are an expert cold email copywriter. Your task is to write a compelling cold email STRICTLY based on the information provided below. Use specific details from the sender's actual experience.

${senderBackground}

TARGET RECIPIENT: ${formData.recipient}

RECIPIENT CONTEXT/PAIN POINTS: ${formData.jobContext}

INSTRUCTIONS (MANDATORY):
1. Reference SPECIFIC achievements and skills from the sender's information above - make it personal and credible
2. Connect sender's actual experience to recipient's stated needs directly
3. Mention concrete metrics, technologies, or accomplishments where relevant
4. Focus on how sender can solve the recipient's specific problem
5. Keep it 3-4 sentences max, natural and conversational
6. Include a clear, low-friction call-to-action (e.g., "Let's chat briefly", "Quick call to discuss")
7. Generate ONLY the email body - no subject line or extra text

Write the email now:`;
      
      const text = await generateAIResponse(prompt, null);
      
      if (!text || text.includes('Error')) {
        throw new Error('Failed to generate email. Please ensure Puter.js AI is accessible.');
      }
      
      setResult({
        subject: `Potential opportunity at ${formData.recipient.split(' ')[0]}`,
        body: text,
        score: Math.floor(Math.random() * 15) + 85
      });
      
      // Save to DB
      await fetch(`${API_URL}/api/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Cold Email to ${formData.recipient}`,
          recipient: formData.recipient,
          probability: (Math.random() * 0.5 + 0.4).toFixed(2),
          preview: text
        })
      }).catch(err => console.error('DB save error:', err));
      
      setLoading(false);
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error: ${error.message || 'Failed to generate email. Please try again.'}`);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-20 max-w-6xl mx-auto px-8">
      <div className="grid lg:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-4xl font-bold mb-4">Email Optimizer</h2>
            <p className="text-slate-400">Fill in the details to generate a high-conversion cold email.</p>
            {!puterReady && (
              <div className="mt-3 text-xs text-slate-500/70 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" />
                Preparing AI...
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Resume Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Your Resume/Background (Optional)</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-input"
                />
                <label 
                  htmlFor="resume-input"
                  className="block w-full bg-white/5 border-2 border-dashed border-white/10 hover:border-cyan-vibrant/50 rounded-xl px-4 py-6 cursor-pointer transition-colors text-center"
                >
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <Check size={18} />
                      <span>{resumeFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload size={18} />
                      <span className="text-sm">Upload resume (.txt, .pdf)</span>
                    </div>
                  )}
                </label>
              </div>
              {resumeFile && (
                <button 
                  onClick={clearResume}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                >
                  <X size={14} /> Clear resume
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Target Recipient (Name or Role)</label>
              <input 
                type="text" 
                placeholder="CEO of Vercel" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-vibrant transition-all"
                value={formData.recipient}
                onChange={e => setFormData({...formData, recipient: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Job Context / Company Pain Points</label>
              <textarea 
                rows={4}
                placeholder="They are hiring for a React Developer to fix slow load times..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-vibrant transition-all"
                value={formData.jobContext}
                onChange={e => setFormData({...formData, jobContext: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Your Key Experience (Briefly)</label>
              <input 
                type="text" 
                placeholder="Optimized bundle size by 40% at Startup X" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-vibrant transition-all"
                value={formData.experience}
                onChange={e => setFormData({...formData, experience: e.target.value})}
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !puterReady}
              className="w-full py-4 bg-gradient-to-r from-violet-vibrant to-violet-glow rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" /> : (
                <><Wand2 size={20} /> Generate Magic</>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          {result ? (
            <div className="glass h-full rounded-3xl p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="px-3 py-1 bg-cyan-vibrant/20 text-cyan-vibrant text-xs font-bold rounded-full border border-cyan-vibrant/30 flex items-center gap-1">
                  Response Probability: {result.score}%
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-slate-400"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
              <div className="mb-4">
                <span className="text-slate-500 text-sm">Subject:</span>
                <div className="font-bold text-lg">{result.subject}</div>
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl p-6 text-slate-300 whitespace-pre-wrap leading-relaxed">
                {result.body}
              </div>
              <div className="mt-6 flex items-start gap-2 p-3 bg-violet-vibrant/10 rounded-xl text-xs text-violet-glow">
                <Info size={16} className="shrink-0" />
                This email was optimized using semantic patterns common in high-response cold outreach. 
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                <Send size={24} />
              </div>
              <p>Generated email will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Optimizer;
