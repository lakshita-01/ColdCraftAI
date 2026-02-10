import { useEffect, useState } from 'react';
import API_URL from '../config/api';

export default function SMTPSettings({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ host: '', port: 587, secure: false, user: '', pass: '', fromAddress: '' });

  useEffect(() => {
    if (!open) return;
    setStatus('');
    fetch(`${API_URL}/api/smtp`).then(r => r.json()).then(data => {
      if (data) setForm({ host: data.host || '', port: data.port || 587, secure: !!data.secure, user: data.user || '', pass: data.pass || '', fromAddress: data.fromAddress || '' });
    }).catch(() => {});
  }, [open]);

  const save = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_URL}/api/smtp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await res.json();
      if (j.ok) setStatus('Saved'); else setStatus('Save failed');
    } catch (e) { setStatus('Save failed'); }
    setLoading(false);
  };

  const test = async () => {
    setTesting(true);
    setStatus('');
    try {
      const res = await fetch(`${API_URL}/api/smtp/test`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, to: form.fromAddress || form.user }) });
      const j = await res.json();
      if (j.ok) setStatus('Test succeeded'); else setStatus('Test failed');
    } catch (e) { setStatus('Test failed: ' + (e.message || '')); }
    setTesting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-obsidian max-w-xl w-full p-6 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">SMTP Settings</h3>
          <button onClick={onClose} className="text-slate-400">Close</button>
        </div>
        <div className="space-y-3">
          <input value={form.host} onChange={e => setForm({...form, host: e.target.value})} placeholder="SMTP Host" className="w-full p-3 rounded bg-white/5" />
          <div className="flex gap-2">
            <input value={form.port} onChange={e => setForm({...form, port: Number(e.target.value)})} placeholder="Port" className="w-1/3 p-3 rounded bg-white/5" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.secure} onChange={e => setForm({...form, secure: e.target.checked})} /> Secure</label>
          </div>
          <input value={form.user} onChange={e => setForm({...form, user: e.target.value})} placeholder="Username" className="w-full p-3 rounded bg-white/5" />
          <input value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} placeholder="Password" className="w-full p-3 rounded bg-white/5" />
          <input value={form.fromAddress} onChange={e => setForm({...form, fromAddress: e.target.value})} placeholder="From address" className="w-full p-3 rounded bg-white/5" />
          <div className="flex gap-3 mt-2">
            <button onClick={save} disabled={loading} className="px-4 py-2 bg-violet-vibrant rounded">{loading ? 'Saving...' : 'Save'}</button>
            <button onClick={test} disabled={testing} className="px-4 py-2 bg-cyan-vibrant rounded">{testing ? 'Testing...' : 'Test Connection'}</button>
            <div className="flex-1 text-sm text-slate-400">{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
