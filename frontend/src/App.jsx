import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomerForm from './pages/CustomerForm';
import Dashboard from './pages/Dashboard';
import TestTools from './pages/TestTools';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
        {/* Navigation Bar */}
        <nav style={{ backgroundColor: '#fff', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', gap: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>1. Customer Form</Link>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>2. Provider Dashboard</Link>
          <Link to="/test-tools" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>3. Test Tools</Link>
        </nav>

        {/* Page Content */}
        <div style={{ padding: '30px' }}>
          <Routes>
            <Route path="/" element={<CustomerForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-tools" element={<TestTools />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;