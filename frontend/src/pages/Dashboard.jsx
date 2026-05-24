import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard');
      const data = await response.json();
      setProviders(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  useEffect(() => {
    fetchStats(); // Pehli baar turant fetch karo

    // REAL-TIME MAGIC: Har 2.5 seconds mein background mein fetch karo
    const intervalId = setInterval(fetchStats, 2500);
    return () => clearInterval(intervalId); // Component band hone par roko
  }, []);

  if (loading) return <h3>Loading Live Dashboard...</h3>;

  return (
    <div>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        Provider Dashboard 
        <span style={{ fontSize: '12px', background: '#e8f5e9', color: '#2e7d32', padding: '3px 8px', borderRadius: '10px' }}>🟢 LIVE</span>
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {providers.map((p) => (
          <div key={p.providerId} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderTop: p.quota === 0 ? '4px solid #f44336' : '4px solid #4caf50' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{p.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
              Remaining Quota: <strong style={{ color: p.quota === 0 ? '#f44336' : '#4caf50', fontSize: '18px' }}>{p.quota} / 10</strong>
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
              Leads Assigned: <strong>{p.leadsCount}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}