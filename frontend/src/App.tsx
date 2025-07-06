import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPortal from './components/AdminPortal';
import UserPortal from './components/UserPortal';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/" element={<UserPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
