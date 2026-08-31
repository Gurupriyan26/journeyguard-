"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle, X, ShieldCheck, QrCode } from "lucide-react";
import { formatWhatsAppTrackingMessage } from "@/lib/domain";
import { triggerHaptic } from "@/lib/haptics";

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
    triggerHaptic("tap");
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = formatWhatsAppTrackingMessage(destinationName, shareUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl relative space-y-4">
        <button
          onClick={() => {
            triggerHaptic("tap");
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Share with Family</h3>
            <p className="text-xs text-slate-300">
              Private link to track your live GPS & arrival
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2 text-xs text-emerald-300 font-bold">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>No login or app download required for parents.</span>
        </div>

        {/* URL Box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Private Tracking URL
          </label>
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-2.5 flex items-center justify-between gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="bg-transparent font-mono text-xs text-cyan-300 w-full outline-none select-all truncate pl-1 font-bold"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition shrink-0 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
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
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 text-center animate-in fade-in zoom-in-95 duration-200">
            <p className="text-xs text-slate-300 mb-2 font-bold">Scan from parent&apos;s phone:</p>
            <div className="inline-block p-2.5 bg-white rounded-2xl shadow-xl">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic("tap")}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Send on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("tap");
              setShowQr(!showQr);
            }}
            className="py-3.5 px-4 rounded-2xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
          >
            <QrCode className="h-4 w-4 text-cyan-400" />
            <span>{showQr ? "Hide QR" : "Show QR"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
