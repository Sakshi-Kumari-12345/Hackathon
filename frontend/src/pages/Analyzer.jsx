import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Link as LinkIcon, Upload, CheckCircle, AlertTriangle, XCircle, ChevronRight, Zap } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export default function Analyzer() {
  const [inputType, setInputType] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${API_URL}/live-news`);
        setLiveNews(res.data);
      } catch (err) {
        console.error("Failed to fetch live news");
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleAnalyze = async (e, typeToUse = inputType, contentToUse = content) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('type', typeToUse);

      if (typeToUse === 'text' || typeToUse === 'url') {
        if (!contentToUse) throw new Error('Please enter content to analyze');
        formData.append('content', contentToUse);
      } else if (typeToUse === 'pdf') {
        if (!file) throw new Error('Please select a PDF file');
        formData.append('file', file);
      }

      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
      
      if (e === null) {
        document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const analyzeLiveNews = (url) => {
    setInputType('url');
    setContent(url);
    handleAnalyze(null, 'url', url);
  };

  const getScoreColor = (classification) => {
    switch (classification) {
      case 'Real': return 'var(--success)';
      case 'Misleading': return 'var(--warning)';
      case 'Fake': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const getScoreIcon = (classification) => {
    switch (classification) {
      case 'Real': return <CheckCircle size={32} color="var(--success)" />;
      case 'Misleading': return <AlertTriangle size={32} color="var(--warning)" />;
      case 'Fake': return <XCircle size={32} color="var(--danger)" />;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 350px', 
      gap: '2rem',
      alignItems: 'start'
    }}>
      <div>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Detect Fake News Instantly</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Paste an article, a URL, or upload a document. Our AI will analyze the content for sensationalism, credibility, and verified sources.
          </p>
        </header>

        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              type="button"
              className={`btn ${inputType === 'text' ? 'btn-primary' : ''}`}
              style={{ flex: 1, background: 'white', color: 'black', border: '1px solid var(--border-color)' }}
              onClick={() => setInputType('text')}
            >
              <FileText size={18} /> Paste Text
            </button>
            <button 
              type="button"
              className={`btn ${inputType === 'url' ? 'btn-primary' : ''}`}
              style={{ flex: 1, background: 'white', color: 'black', border: '1px solid var(--border-color)' }}
              onClick={() => setInputType('url')}
            >
              <LinkIcon size={18} /> URL
            </button>
            <button 
              type="button"
              className={`btn ${inputType === 'pdf' ? 'btn-primary' : ''}`}
              style={{ flex: 1, background: 'white', color: 'black', border: '1px solid var(--border-color)' }}
              onClick={() => setInputType('pdf')}
            >
              <Upload size={18} /> PDF
            </button>
          </div>

          <form onSubmit={handleAnalyze}>
            {(inputType === 'text' || inputType === 'url') && (
              <div className="form-group">
                <label className="form-label">{inputType === 'text' ? 'Paste your text below:' : 'Enter article URL:'}</label>
                {inputType === 'text' ? (
                  <textarea 
                    className="form-control" 
                    placeholder="The government recently announced..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                ) : (
                  <input 
                    type="url"
                    className="form-control" 
                    placeholder="https://example.com/news-article"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                )}
              </div>
            )}

            {inputType === 'pdf' && (
              <div className="form-group" style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Upload size={48} color="var(--accent-primary)" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                    {file ? file.name : 'Click to upload PDF'}
                  </span>
                </label>
              </div>
            )}

            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }} disabled={loading}>
              {loading ? <div className="spinner" /> : 'Analyze Content'}
            </button>
          </form>
        </div>

        {result && (
          <div className="glass-panel animate-fade-in" id="analysis-result" style={{ padding: '2rem', borderTop: `4px solid ${getScoreColor(result.classification)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: getScoreColor(result.classification) }}>
                  {getScoreIcon(result.classification)}
                  {result.classification}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Confidence: <strong style={{ color: 'var(--text-primary)' }}>{result.confidence}%</strong>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(result.classification), lineHeight: 1 }}>
                  {result.score}<span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/100</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Trust Score</p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Explainable AI Reasons:</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {result.reasons.map((reason, idx) => (
                  <li key={idx} style={{ 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    marginBottom: '0.5rem', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <ChevronRight size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', height: 'calc(100vh - 120px)', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="var(--warning)" /> Live News Feed
        </h3>
        
        {newsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ borderColor: 'var(--accent-primary)', borderRightColor: 'transparent' }} />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {liveNews.map((news, idx) => (
              <div key={idx} className="card-hover" style={{ 
                padding: '1rem', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {news.source} • {new Date(news.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <h4 style={{ fontSize: '1rem', lineHeight: 1.4 }}>{news.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click analyze to check this live headline...</p>
                <button 
                  className="btn" 
                  style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                  onClick={() => analyzeLiveNews(news.link)}
                >
                  Analyze This
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
