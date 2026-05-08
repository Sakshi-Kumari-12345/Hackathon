import express from 'express';
import multer from 'multer';
import { analyzeContent } from '../services/aiService.js';
import { extractTextFromUrl, extractTextFromPdf } from '../services/scraperService.js';
import { fetchLiveNews } from '../services/newsService.js';
import Analysis from '../models/Analysis.js';

const router = express.Router();

// Configure multer for memory storage (for PDFs)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const { type, content } = req.body;
    let textToAnalyze = '';
    let inputSnippet = '';

    if (type === 'text') {
      textToAnalyze = content;
      inputSnippet = content.substring(0, 100) + '...';
    } else if (type === 'url') {
      textToAnalyze = await extractTextFromUrl(content);
      inputSnippet = `URL: ${content}`;
    } else if (type === 'pdf') {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }
      textToAnalyze = await extractTextFromPdf(req.file.buffer);
      inputSnippet = `File: ${req.file.originalname}`;
    } else {
      return res.status(400).json({ error: 'Invalid input type' });
    }

    if (!textToAnalyze || textToAnalyze.trim() === '') {
      return res.status(400).json({ error: 'No content to analyze' });
    }

    // Call AI Service
    const analysisResult = await analyzeContent(textToAnalyze, type === 'url' ? content : null);

    // Save to Database
    const newAnalysis = new Analysis({
      contentSnippet: inputSnippet,
      inputType: type,
      classification: analysisResult.classification,
      score: analysisResult.score,
      confidence: analysisResult.confidence,
      reasons: analysisResult.reasons,
      trustedSources: analysisResult.trustedSources
    });

    try {
      await newAnalysis.save();
    } catch (dbError) {
      console.warn("Could not save to DB (Continuing without saving):", dbError.message);
    }

    res.json(newAnalysis);

  } catch (error) {
    console.error("Analyze Route Error:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await Analysis.find().sort({ createdAt: -1 }).limit(20);
    
    // Calculate stats
    const totalCount = await Analysis.countDocuments();
    const fakeCount = await Analysis.countDocuments({ classification: { $in: ['Fake', 'Misleading'] } });
    const realCount = await Analysis.countDocuments({ classification: 'Real' });
    
    res.json({
      history,
      stats: {
        total: totalCount,
        fake: fakeCount,
        real: realCount
      }
    });
  } catch (error) {
    console.warn("History Route Error (DB likely disconnected):", error.message);
    res.json({ history: [], stats: { total: 0, fake: 0, real: 0 } });
  }
});

router.get('/live-news', async (req, res) => {
  try {
    const liveNews = await fetchLiveNews();
    res.json(liveNews);
  } catch (error) {
    console.error("Live News Route Error:", error);
    res.status(500).json({ error: 'Failed to fetch live news' });
  }
});

export default router;
