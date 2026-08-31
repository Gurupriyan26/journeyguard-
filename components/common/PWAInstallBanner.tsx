"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Smartphone, Check } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Check if previously dismissed in this session
    if (sessionStorage.getItem("jg_pwa_dismissed") === "true") {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    if (isAppleDevice) {
      // Delay showing banner slightly for smooth page entry
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic("tap");
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    triggerHaptic("tap");
    setShowBanner(false);
    sessionStorage.setItem("jg_pwa_dismissed", "true");
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Smart Mobile App Install Banner */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-40 animate-slide-up">
        <div className="rounded-2xl border-2 border-cyan-500/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Install Mobile App</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {isIOS ? "iOS" : "Android"}
                </span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                Install on your phone for zero-lag background GPS tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-md shadow-blue-500/30 active:scale-95"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <PlusSquare className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-black text-white">Install on iPhone / iPad</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apple requires saving web apps via Safari:
            </p>

            <div className="space-y-2.5 text-left p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px] shrink-0">
                  1
                </span>
                <span>Tap the <strong className="text-white">Share button</strong> (square with arrow ⎋) at the bottom of Safari.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[11px] shrink-0">
                  2
                </span>
                <span>Scroll down and tap <strong className="text-cyan-300">Add to Home Screen ➕</strong>.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0">
                  3
                </span>
                <span>Open JourneyGuard from your home screen anytime!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
