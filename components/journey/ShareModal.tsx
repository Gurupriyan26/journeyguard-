"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle, X, ShieldCheck, QrCode } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  destinationName: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  destinationName,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `I'm travelling to ${destinationName || "my destination"}. Follow my live journey on JourneyGuard: ${shareUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Share with Guardian</h3>
            <p className="text-xs text-slate-400">
              Private link to track your progress & arrival
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 mb-5 flex items-center gap-2 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>No login or app install needed for your guardian.</span>
        </div>

        {/* URL Box */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Private Tracking URL
          </label>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 flex items-center justify-between gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent font-mono text-xs text-slate-200 w-full outline-none select-all truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition shrink-0 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-blue-500 hover:bg-blue-400 text-white shadow-sm shadow-blue-500/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code toggle section */}
        {showQr && (
          <div className="mb-4 p-4 rounded-xl border border-slate-800 bg-slate-950 text-center">
            <p className="text-xs text-slate-400 mb-2">Scan from guardian&apos;s phone:</p>
            <div className="inline-block p-2 bg-white rounded-xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="Tracking Link QR Code"
                className="w-40 h-40"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Send via WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <QrCode className="h-4 w-4" />
            <span>{showQr ? "Hide QR" : "Show QR"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
