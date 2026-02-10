import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Mail, MousePointer2 } from 'lucide-react';
import API_URL from '../config/api';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resData, resStats] = await Promise.all([
          fetch(`${API_URL}/api/analytics`),
          fetch(`${API_URL}/api/stats`)
        ]);
        setData(await resData.json());
        setStats(await resStats.json());
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="pt-32 flex justify-center">
      <div className="animate-pulse text-violet-vibrant">Loading Database Analytics...</div>
    </div>
  );

  const cardData = [
    { label: 'Total Sent', value: stats?.total.toLocaleString(), icon: Mail, color: 'text-violet-vibrant' },
    { label: 'Avg Probability', value: `${(stats?.avgProb * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-cyan-vibrant' },
    { label: 'Opened', value: stats?.totalOpened, icon: MousePointer2, color: 'text-emerald-400' },
    { label: 'Replied', value: stats?.totalReplied, icon: Users, color: 'text-amber-400' },
  ];

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-8">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2 text-gradient">Performance Insights</h2>
          <p className="text-slate-400">Tracking across {data.length} historical outreach attempts.</p>
        </div>
        <div className="px-4 py-2 glass rounded-xl text-sm font-medium">
          Last updated: Just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cardData.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-slate-500 text-sm font-medium">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-[32px] mb-12 h-[400px]"
      >
        <h3 className="text-xl font-bold mb-8">Optimization Trend (Probability Score Over Time)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.slice(0, 50).reverse()}>
            <defs>
              <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="id" hide />
            <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
              itemStyle={{ color: '#8B5CF6' }}
            />
            <Area type="monotone" dataKey="probability" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorProb)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Table Section */}
      <div className="glass rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-white/10">
          <h3 className="text-xl font-bold">Recent Campaign Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-8 py-4 font-semibold">Subject</th>
                <th className="px-8 py-4 font-semibold">Recipient</th>
                <th className="px-8 py-4 font-semibold">Score</th>
                <th className="px-8 py-4 font-semibold">Status</th>
                <th className="px-8 py-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.slice(0, 50).map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-4 font-medium">{row.subject}</td>
                  <td className="px-8 py-4 text-slate-400">{row.recipient}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      row.probability > 0.8 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {(row.probability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        row.status === 'Replied' ? 'bg-cyan-vibrant' : (row.status === 'Opened' ? 'bg-violet-vibrant' : 'bg-slate-700')
                      }`} />
                      {row.status}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-slate-500 text-sm">{new Date(row.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
