import { useEffect } from 'react';
import { Download, X } from 'lucide-react';

const btn =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10';

export default function QrDialog({ link, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const base = `/api/urls/${encodeURIComponent(link.shortCode)}/qr`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR code"
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">QR code</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl bg-white p-3">
          <img src={`${base}?format=svg`} alt={`QR code for ${link.shortUrl}`} className="mx-auto aspect-square w-full max-w-64" />
        </div>
        <p className="mt-3 truncate text-center text-sm text-slate-400">{link.shortUrl}</p>

        <div className="mt-4 flex justify-center gap-2">
          <a href={`${base}?format=png&download=1`} className={btn}>
            <Download className="h-4 w-4" /> PNG
          </a>
          <a href={`${base}?format=svg`} download={`${link.shortCode}-qr.svg`} className={btn}>
            <Download className="h-4 w-4" /> SVG
          </a>
        </div>
      </div>
    </div>
  );
}