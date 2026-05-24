import { useState } from 'react';

export default function CustomerForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', serviceId: '1' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    try {
      const response = await fetch('http://localhost:8000/api/request-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, serviceId: Number(formData.serviceId) })
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({ type: 'error', message: data.error || 'Something went wrong' });
      } else {
        setStatus({ type: 'success', message: `Success! Lead assigned to Providers: ${data.assignedTo.join(', ')}` });
        setFormData({ name: '', phone: '', city: '', serviceId: '1' }); // Reset form
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network Error. Is backend running?' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0 }}>Request a Service</h2>
      
      {status.message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', background: status.type === 'error' ? '#ffebee' : '#e8f5e9', color: status.type === 'error' ? '#c62828' : '#2e7d32' }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
        <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
        <input required type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={inputStyle} />
        <select value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} style={inputStyle}>
          <option value="1">Service 1</option>
          <option value="2">Service 2</option>
          <option value="3">Service 3</option>
        </select>
        <button type="submit" disabled={status.type === 'loading'} style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          {status.type === 'loading' ? 'Processing...' : 'Submit Form'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' };