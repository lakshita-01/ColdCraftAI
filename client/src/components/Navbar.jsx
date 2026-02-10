import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Zap, BarChart3, Mail } from 'lucide-react';

const Navbar = ({ onOpenSmtp }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Optimizer', path: '/optimize', icon: Zap },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass px-8 py-4 rounded-3xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-vibrant rounded-lg flex items-center justify-center">
            <Mail className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-gradient">ColdAI</span>
        </Link>

        <div className="flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'text-violet-vibrant' : 'text-slate-400 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </div>

        <button onClick={() => onOpenSmtp && onOpenSmtp()} className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all">
          Connect SMTP
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
