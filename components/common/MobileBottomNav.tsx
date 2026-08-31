"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShieldCheck, Volume2, PlusCircle } from "lucide-react";
import { playAlertSound } from "@/lib/notifications";
import { triggerHaptic } from "@/lib/haptics";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const handleTestSiren = () => {
    triggerHaptic("alarm");
    playAlertSound("loud_siren");
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "New Trip", href: "/journey/create", icon: PlusCircle, highlight: true },
    { label: "Track", href: "/track", icon: ShieldCheck },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 pt-2 pb-safe shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => triggerHaptic("tap")}
                className="flex flex-col items-center -mt-5 transition-transform active:scale-95"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/40 ring-4 ring-[#030712]">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-extrabold text-cyan-300 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerHaptic("tap")}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                isActive ? "text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className={`text-[10px] font-bold ${isActive ? "text-white" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* 1-Tap Siren Test button */}
        <button
          type="button"
          onClick={handleTestSiren}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-amber-400 hover:text-amber-300 transition active:scale-95"
          title="Test Alert Siren"
        >
          <Volume2 className="h-5 w-5" />
          <span className="text-[10px] font-bold">Siren</span>
        </button>
      </div>
    </nav>
  );
}
