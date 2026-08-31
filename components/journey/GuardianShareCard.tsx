"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, MessageCircle, ExternalLink, QrCode, Globe, Laptop, Sparkles, HelpCircle } from "lucide-react";
import { formatWhatsAppTrackingMessage, getPublicBaseUrl } from "@/lib/domain";
import { triggerHaptic } from "@/lib/haptics";

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
  const [useVercelDomain, setUseVercelDomain] = useState(false);
  const [customVercelDomain, setCustomVercelDomain] = useState("https://journeyguard.vercel.app");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      setIsLocalhost(isLocal);
      if (isLocal) {
        setUseVercelDomain(true); // Default to public Vercel domain when testing locally so WhatsApp links work!
      }
    }
  }, []);

  // Compute active share link: If useVercelDomain is true, swap origin with Vercel https domain
  const rawTokenPath = shareUrl.includes("/track/") ? `/track/${shareUrl.split("/track/")[1]}` : shareUrl;
  const activeShareUrl = isLocalhost && useVercelDomain
    ? `${customVercelDomain.replace(/\/+$/, "")}${rawTokenPath}`
    : shareUrl;

  const handleCopy = () => {
    if (!activeShareUrl) return;
    triggerHaptic("tap");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activeShareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = activeShareUrl;
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

  const whatsappMessage = formatWhatsAppTrackingMessage(destinationName, activeShareUrl);

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
              Send this link to your parents on WhatsApp. Clickable on all phones.
            </p>
          </div>
        </div>

        <a
          href={activeShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic("tap")}
          className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shrink-0"
        >
          <span>Preview</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Localhost vs Public Vercel Switcher Pill (shown when running on localhost) */}
      {isLocalhost && (
        <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span>Link Format (For WhatsApp):</span>
            </span>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setUseVercelDomain(true)}
                className={`px-2 py-1 rounded-lg font-bold transition ${
                  useVercelDomain
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌐 Public HTTPS (Vercel)
              </button>
              <button
                type="button"
                onClick={() => setUseVercelDomain(false)}
                className={`px-2 py-1 rounded-lg font-bold transition ${
                  !useVercelDomain
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                💻 Localhost
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 leading-tight">
            {useVercelDomain
              ? "✅ Uses https:// so WhatsApp formats the message as a clickable blue link with live preview."
              : "⚠️ 'http://localhost' will only work on this computer and appears as plain text in WhatsApp."}
          </p>
        </div>
      )}

      {/* URL Display & 1-Tap Copy */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 p-2.5 flex items-center justify-between gap-2 shadow-inner">
        <input
          type="text"
          readOnly
          value={activeShareUrl}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="bg-transparent font-mono text-xs text-cyan-300 w-full outline-none select-all truncate pl-2 font-bold"
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
                activeShareUrl
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
          onClick={() => triggerHaptic("tap")}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Send via WhatsApp (Clickable Link)</span>
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
          <span>{showQr ? "Hide QR Code" : "Show QR Code"}</span>
        </button>
      </div>
    </div>
  );
}
