import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, ShieldCheck, FileSearch, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/history`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" style={{ width: '48px', height: '48px' }} /></div>;
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  const chartData = [
    { name: 'Fake / Misleading', value: data.stats.fake, color: '#ef4444' },
    { name: 'Real', value: data.stats.real, color: '#10b981' }
  ];

  const fakeAlerts = data.history.filter(item => item.classification === 'Fake' || item.classification === 'Misleading').slice(0, 5);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Platform Statistics</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px' }}>
            <FileSearch size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{data.stats.total}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Total Analyses</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
            <ShieldAlert size={32} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{data.stats.fake}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Fake/Misleading Found</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}>
            <ShieldCheck size={32} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{data.stats.real}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Verified Real</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', height: '500px' }}>
        
        {/* Chart Column */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending Alerts Column */}
        <div className="glass-panel" style={{ padding: '2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <TrendingUp size={24} />
            Trending Fake Alerts
          </h3>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fakeAlerts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No fake alerts detected.</p>
            ) : (
              fakeAlerts.map((item, idx) => (
                <div key={idx} style={{ 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--danger)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    SCORE: {item.score}/100
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{item.contentSnippet}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Column */}
        <div className="glass-panel" style={{ padding: '2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {data.history.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No history available yet.</p>
            ) : (
              data.history.map((item, idx) => (
                <div key={item._id} style={{ 
                  padding: '1rem', 
                  borderBottom: idx === data.history.length - 1 ? 'none' : '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        fontSize: '0.75rem', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {item.inputType}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{item.contentSnippet}"
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: item.classification === 'Real' ? 'var(--success)' : item.classification === 'Fake' ? 'var(--danger)' : 'var(--warning)',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      {item.classification}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
