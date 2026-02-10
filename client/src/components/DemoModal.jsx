export default function DemoModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-obsidian max-w-3xl w-full p-6 rounded-2xl border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Watch Demo</h3>
          <button onClick={onClose} className="text-slate-400">Close</button>
        </div>
        <div className="aspect-video bg-black rounded overflow-hidden">
          <video controls className="w-full h-full">
            <source src="/demo_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="text-slate-400 mt-4">This demo shows how to craft personalized cold emails and send via SMTP integration.</p>
      </div>
    </div>
  );
}
