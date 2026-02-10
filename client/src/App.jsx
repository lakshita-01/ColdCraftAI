import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Optimizer from './pages/Optimizer';
import Dashboard from './pages/Dashboard';
import SMTPSettings from './components/SMTPSettings';
import DemoModal from './components/DemoModal';

function App() {
  const [showSmtp, setShowSmtp] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-x-hidden bg-obsidian text-white">
        <Navbar onOpenSmtp={() => setShowSmtp(true)} />
        <Routes>
          <Route path="/" element={<LandingPage onOpenDemo={() => setShowDemo(true)} />} />
          <Route path="/optimize" element={<Optimizer />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <SMTPSettings open={showSmtp} onClose={() => setShowSmtp(false)} />
        <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
