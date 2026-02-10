/**
 * Waits for Puter.js to be loaded and ready
 */
export const waitForPuter = async () => {
  return new Promise((resolve) => {
    const checkPuter = () => {
      if (window.puter && window.puter.ai) {
        resolve();
      } else {
        setTimeout(checkPuter, 100);
      }
    };
    checkPuter();
  });
};

/**
 * Generates email content using Puter.js with full context
 */
export const generateAIResponse = async (prompt, resumeContent = null) => {
  if (!window.puter) {
    throw new Error("Puter.js not loaded");
  }

  try {
    // The prompt already includes context from both resume and experience
    // If the Puter API supports options, a smaller generation length helps speed.
    // We pass a short instruction in the prompt to limit output length (3-4 sentences).
    const response = await window.puter.ai.chat(prompt);
    return response.toString();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating email. Please try again.";
  }
};

/**
 * Pre-warm Puter by sending a tiny request so the engine is ready when user generates.
 * Keeps response small and quick.
 */
export const prewarmPuter = async () => {
  if (!window.puter || !window.puter.ai) return;
  try {
    // Fire-and-forget a tiny prompt to reduce first-call latency
    window.puter.ai.chat('Warm up. Please reply with OK in one word.').then(() => {}).catch(() => {});
  } catch (e) {
    // ignore
  }
};

/**
 * Lightweight local summarizer to reduce prompt size and speed up generation.
 * Extracts important lines and numeric facts, and truncates to a short summary.
 */
export const summarizeResumeLocal = (text, maxChars = 600) => {
  if (!text || typeof text !== 'string') return '';

  // Normalize newlines and split into lines
  const lines = text.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);

  // Collect lines with years/numbers or long hyphen bullets
  const important = [];
  const yearRegex = /\b(19|20)\d{2}\b/;
  const numRegex = /\d{2,}|%|\byears?\b/i;

  for (const line of lines) {
    if (yearRegex.test(line) || numRegex.test(line) || line.length > 60 || line.includes('-') || line.includes('•')) {
      important.push(line);
    }
    if (important.join(' ').length > maxChars) break;
  }

  // Fallback: use the first N characters
  let summary = important.length ? important.join(' \n') : lines.slice(0,5).join(' \n');
  if (summary.length > maxChars) {
    summary = summary.slice(0, maxChars) + '...';
  }
  return summary;
};

/**
 * Extracts text from PDF files using PDF.js
 */
const extractPdfText = async (arrayBuffer) => {
  try {
    // Dynamic import of pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Use unpkg which is generally more reliable for these specific worker files
    const version = pdfjsLib.version || '5.4.624';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    
    // Create a loading task with some essential configuration
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Some environments have issues with ESM workers, so we can try to disable it if it fails
      // but first we try the standard way
    });
    
    const pdf = await loadingTask.promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Filter and join text items
        const pageText = content.items
          .map(item => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' '); // Clean up extra spaces
        text += pageText + '\n';
      } catch (pageErr) {
        console.error(`Error on page ${i}:`, pageErr);
      }
    }
    
    const cleanedText = text.trim();
    if (!cleanedText || cleanedText.length < 20) {
      throw new Error("The PDF seems to have very little or no selectable text. It might be a scanned image or a protected file.");
    }
    
    return cleanedText;
  } catch (err) {
    console.error('PDF JS Error details:', err);
    
    // If the ESM worker failed, try a last-ditch effort with the legacy worker
    if (err.message?.includes('worker') || err.message?.includes('import')) {
      try {
        console.log("Retrying with legacy worker...");
        const pdfjsLib = await import('pdfjs-dist');
        const version = pdfjsLib.version || '5.4.624';
        // Legacy worker is a standard .js file
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/legacy/build/pdf.worker.min.js`;
        
        const retryTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await retryTask.promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str || '').join(' ') + '\n';
        }
        return text.trim();
      } catch (retryErr) {
        console.error('Legacy retry failed:', retryErr);
      }
    }

    if (err.name === 'MissingPDFException') {
      throw new Error("Could not load PDF: File is missing or invalid.");
    } else if (err.name === 'PasswordException') {
      throw new Error("Could not load PDF: File is password protected.");
    }
    throw err;
  }
};

/**
 * Comprehensive resume analyzer - extracts skills, experience, and achievements
 */
export const analyzeResumeComprehensive = (resumeText, jobContext = '') => {
  if (!resumeText) return { skills: [], achievements: [], summary: '', fullText: '' };
  
  const lines = resumeText.split(/[\n\r]+/).filter(line => line.trim().length > 0);
  
  // Extract all skills (look for tech keywords, tools, frameworks)
  const skillKeywords = /\b(react|vue|angular|node|express|python|java|c\+\+|go|rust|javascript|typescript|web|mobile|backend|frontend|full\s*stack|devops|aws|azure|gcp|kubernetes|docker|sql|mongodb|mysql|postgresql|postgres|firebase|redis|elasticsearch|rabbitmq|kafka|graphql|rest|api|microservices|agile|scrum|git|github|gitlab|jenkins|ci\/cd|linux|windows|mac|html|css|scss|sass|webpack|vite|npm|yarn|jest|mocha|selenium|junit|python|django|flask|fastapi|spring|springboot|hibernate|maven|gradle|git|linux|bash|shell|terraform|pulumi|cloudformation|bicep|machine\s*learning|ml|ai|artificial\s*intelligence|pytorch|tensorflow|keras|scikit-learn|sklearn|pandas|numpy|matplotlib|seaborn|nlp|natural\s*language\s*processing|computer\s*vision|cv|bert|transformer|llm|large\s*language\s*model|mlops|sagemaker|mlflow|kubeflow|dvc|wandb|data\s*science|data\s*scientist|reinforcement\s*learning|deep\s*learning|neural\s*networks|cnn|rnn|lstm|xgboost|lightgbm|catboost|statistics|probability|r|julia|scala|spark|hadoop|hive|airflow)\b/gi;
  const skills = [...new Set((resumeText.match(skillKeywords) || []).map(s => s.toLowerCase()))];
  
  // Extract metrics and achievements (lines with numbers, action verbs, percentages)
  const achievements = [];
  const actionVerbs = /\b(led|built|developed|designed|implemented|created|optimized|improved|increased|reduced|managed|launched|delivered|scaled|automated|achieved|accelerated|enhanced|transformed|pioneered|spearheaded|drove|streamlined|established|restructured|oversaw|trained|deployed|evaluated|fine-tuned|collected|scraped|modeled|engineered|architected)\b/i;
  
  lines.forEach(line => {
    if ((actionVerbs.test(line) || /\d+%|\\$\d+|x\d+|\d+\s*(years?|months?|projects?|team|people|accuracy|f1|precision|recall|latency|throughput|parameters|layers)|increase|decrease|growth|revenue|users|customers/i.test(line)) && line.length > 15) {
      achievements.push(line.trim());
    }
  });
  
  // Limit achievements to most important ones
  const topAchievements = achievements.slice(0, 8);
  
  // Create a summary of experience
  const summary = lines
    .filter(line => line.length > 20 && !line.startsWith('-') && !line.startsWith('•'))
    .slice(0, 10)
    .join('\n');
  
  return {
    skills: [...new Set(skills)],
    achievements: topAchievements,
    summary,
    fullText: resumeText
  };
};

/**
 * Analyzes resume text and extracts job-relevant points based on job context
 */
export const extractJobRelevantPoints = (resumeText, jobContext) => {
  if (!resumeText || !jobContext) return '';
  
  const contextLower = jobContext.toLowerCase();
  
  // Extract keywords from job context
  const keywordRegex = /\b(react|vue|angular|node|python|java|c\+\+|go|rust|javascript|typescript|web|mobile|backend|frontend|full\s*stack|devops|aws|azure|gcp|kubernetes|docker|sql|mongodb|database|api|rest|graphql|agile|scrum|leadership|management|sales|marketing|product|design|ui|ux|ml|ai|machine\s*learning|deep\s*learning|nlp|cv|data|analytics|cloud|devops|infrastructure)\b/gi;
  const jobKeywords = contextLower.match(keywordRegex) || [];
  const uniqueKeywords = [...new Set(jobKeywords.map(k => k.toLowerCase()))];
  
  // Split resume into sentences/sections
  const lines = resumeText.split(/[\n\r]+/).filter(line => line.trim().length > 10);
  
  // Score each line based on keyword matches
  const scoredLines = lines.map(line => {
    const lineLower = line.toLowerCase();
    let score = 0;
    
    // Count keyword matches
    uniqueKeywords.forEach(keyword => {
      const count = (lineLower.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length;
      score += count * 2;
    });
    
    // Boost score for lines with numbers (experience, metrics)
    if (/\d+/.test(line)) score += 2;
    
    // Boost score for action words
    if (/led|built|developed|designed|implemented|created|optimized|improved|increased|reduced|managed|trained|deployed|modeled|architected/i.test(line)) {
      score += 3;
    }
    
    return { line: line.trim(), score };
  });
  
  // Filter lines with score > 0 and sort by score - return MORE points (up to 7)
  const relevantLines = scoredLines
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)  // Increased from 3 to 7 for more comprehensive info
    .map(item => item.line);
  
  return relevantLines.join('\n');
};

/**
 * Reads file content as text (supports .txt, .pdf, etc.)
 */
export const readFileContent = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        return reject(new Error("No file selected."));
      }

      if (file.type === 'application/pdf') {
        const arrayBuffer = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target.result);
          reader.onerror = (e) => rej(e);
          reader.readAsArrayBuffer(file);
        });
        
        try {
          const pdfText = await extractPdfText(arrayBuffer);
          resolve(pdfText);
        } catch (pdfError) {
          reject(pdfError);
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("Failed to read text file."));
        reader.readAsText(file);
      } else if (file.type.includes('wordprocessingml') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        reject(new Error("Word documents (.doc, .docx) are not directly supported yet. Please save as PDF or copy-paste the text."));
      } else {
        // Try reading as text but warn
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("Unsupported file type and failed to read as text."));
        reader.readAsText(file);
      }
    } catch (error) {
      reject(error);
    }
  });
};
