import { useState } from 'react';

export default function TestTools() {
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));

  // --- 1. SEED DB ---
  const handleSeed = async () => {
    addLog('Seeding Database...');
    const res = await fetch('http://localhost:8000/api/seed');
    const data = await res.json();
    addLog(data.message || 'Seeded successfully');
  };

  // --- 2. WEBHOOK IDEMPOTENCY TEST ---
  const handleWebhook = async () => {
    addLog('Calling Webhook (Idempotency Key: TEST-KEY-1)...');
    const res = await fetch('http://localhost:8000/api/webhook/reset-quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId: 1, idempotencyKey: 'TEST-KEY-1' })
    });
    const data = await res.json();
    addLog(`Webhook Result: ${data.message}`);
  };

  // --- 3. CONCURRENCY TEST (10 Request Ek Sath) ---
  const handleConcurrency = async () => {
    addLog('Firing 10 simultaneous requests to Service 3...');
    
    // Promise.all use karke 10 request ek hi exact second pe fire karna
    const requests = Array.from({ length: 10 }).map((_, i) => {
      return fetch('http://localhost:8000/api/request-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Concurrent User ${i}`,
          phone: `55500000${i}`,
          city: 'Test City',
          serviceId: 3 // Sending all to service 3 to heavily test logic
        })
      }).then(res => res.json());
    });

    const results = await Promise.all(requests);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    addLog(`Concurrency Done: ${successCount} Success, ${failCount} Failed (Due to Quota full)`);
  };

  return (
    <div style={{ display: 'flex', gap: '30px' }}>
      {/* Controls */}
      <div style={{ flex: 1 }}>
        <h2>Simulation & Test Panel</h2>
        <p>Use these buttons to simulate edge cases mentioned in the assignment.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <button onClick={handleSeed} style={btnStyle}>1. Seed/Reset Full Database</button>
          
          <button onClick={handleWebhook} style={{...btnStyle, background: '#ff9800'}}>
            2. Trigger Webhook (Test Idempotency) <br/>
            <small style={{ fontWeight: 'normal' }}>(Click me 3-4 times fast. It should only update once!)</small>
          </button>
          
          <button onClick={handleConcurrency} style={{...btnStyle, background: '#f44336'}}>
            3. Generate 10 Leads Instantly (Test Concurrency)
          </button>
        </div>
      </div>

      {/* Live Logs */}
      <div style={{ flex: 1, background: '#222', color: '#0f0', padding: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
        <h3>Action Logs:</h3>
        {logs.length === 0 ? <p style={{ color: '#888' }}>No actions taken yet.</p> : null}
        {logs.map((log, idx) => <p key={idx} style={{ margin: '5px 0' }}>{log}</p>)}
      </div>
    </div>
  );
}

const btnStyle = { padding: '15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', textAlign: 'left' };