"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle, ExternalLink, QrCode, ShieldCheck, Sparkles } from "lucide-react";

interface GuardianShareCardProps {
  shareUrl: string;
  destinationName: string;
  travellerName?: string | null;
}

export default function GuardianShareCard({
  shareUrl,
  destinationName,
  travellerName,
}: GuardianShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = () => {
    if (!shareUrl) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      // Fallback for older mobile browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.warn("Copy fallback failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi! I'm travelling to ${destinationName || "my destination"}. Track my live GPS location and arrival on JourneyGuard: ${shareUrl}`
  );

  return (
    <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 space-y-4 border-2 border-cyan-500/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Guardian Tracking Link</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Send this link to your parents or family. No login required for them.
            </p>
          </div>
        </div>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shrink-0"
        >
          <span>Preview</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* URL Display & 1-Tap Copy */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 p-2.5 flex items-center justify-between gap-2 shadow-inner">
        <input
          type="text"
          readOnly
          value={shareUrl}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="bg-transparent font-mono text-xs text-slate-200 w-full outline-none select-all truncate pl-2"
          placeholder="Generating tracking link..."
        />

        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition shrink-0 ${
            copied
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 active:scale-95"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* QR Code expansion section */}
      {showQr && (
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 text-center animate-in fade-in zoom-in-95 duration-200">
          <p className="text-xs text-slate-300 mb-3 font-semibold">Scan with parent&apos;s phone camera:</p>
          <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                shareUrl
              )}`}
              alt="Guardian Tracking Link QR Code"
              className="w-44 h-44"
            />
          </div>
        </div>
      )}

      {/* Quick Action Share Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href={`https://wa.me/?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/25 active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Send via WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="py-3 px-4 rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <QrCode className="h-4 w-4 text-cyan-400" />
          <span>{showQr ? "Hide QR Code" : "Show QR Code"}</span>
        </button>
      </div>
    </div>
  );
}
