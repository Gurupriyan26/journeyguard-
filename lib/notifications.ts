/**
 * Notification & High-Decibel Alert Engine for JourneyGuard.
 * Uses Web Audio API synthesis for reliable, ultra-loud alarm sirens without asset downloads,
 * plus HTML5 Notification API for system-level notifications.
 */

import { triggerHaptic } from "@/lib/haptics";

export type AlarmSoundType = "loud_siren" | "alarm_clock" | "fanfare" | "gentle_chime";

let persistentAlarmInterval: any = null;
let activeAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!activeAudioContext) {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      activeAudioContext = new AudioContextClass();
    }
  }
  if (activeAudioContext && activeAudioContext.state === "suspended") {
    activeAudioContext.resume().catch(() => {});
  }
  return activeAudioContext;
}

/**
 * Unlock AudioContext on first user interaction so browsers allow max-volume playback
 */
export function unlockAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

/**
 * Play a single pulse of a selected alert sound
 */
export function playAlertSound(soundType: AlarmSoundType = "loud_siren") {
  triggerHaptic(soundType === "loud_siren" || soundType === "alarm_clock" ? "alarm" : "warning");

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    switch (soundType) {
      case "loud_siren": {
        // Piercing Emergency Two-Tone Alarm Siren (High Gain, Sawtooth wave)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "square";

        // Frequency sweep siren effect (880Hz to 1760Hz)
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(1400, now + 0.35);
        osc1.frequency.linearRampToValueAtTime(880, now + 0.7);
        osc1.frequency.linearRampToValueAtTime(1400, now + 1.05);
        osc1.frequency.linearRampToValueAtTime(880, now + 1.4);

        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.linearRampToValueAtTime(700, now + 0.35);
        osc2.frequency.linearRampToValueAtTime(440, now + 0.7);
        osc2.frequency.linearRampToValueAtTime(700, now + 1.05);
        osc2.frequency.linearRampToValueAtTime(440, now + 1.4);

        // Maximum audible volume
        gain.gain.setValueAtTime(0.85, now);
        gain.gain.linearRampToValueAtTime(0.85, now + 1.35);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.55);
        osc2.stop(now + 1.55);
        break;
      }

      case "alarm_clock": {
        // Sharp digital alarm clock double-beep (BEEP-BEEP ... BEEP-BEEP)
        const beeps = [0, 0.15, 0.4, 0.55];
        beeps.forEach((startOffset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "square";
          osc.frequency.setValueAtTime(2048, now + startOffset); // High pitch 2kHz

          gain.gain.setValueAtTime(0.7, now + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + startOffset + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + startOffset);
          osc.stop(now + startOffset + 0.12);
        });
        break;
      }

      case "fanfare": {
        // Bugle Horn Wake-Up Fanfare
        const notes = [
          { f: 587.33, t: 0, d: 0.2 },
          { f: 783.99, t: 0.22, d: 0.2 },
          { f: 987.77, t: 0.44, d: 0.25 },
          { f: 1174.66, t: 0.72, d: 0.5 },
        ];

        notes.forEach(({ f, t, d }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + t);

          gain.gain.setValueAtTime(0.75, now + t);
          gain.gain.exponentialRampToValueAtTime(0.01, now + t + d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + t);
          osc.stop(now + t + d + 0.05);
        });
        break;
      }

      case "gentle_chime":
      default: {
        // 4-tone gentle ascending chime
        const chimeNotes = [523.25, 659.25, 783.99, 1046.5];
        chimeNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.18);

          gain.gain.setValueAtTime(0.4, now + idx * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 0.45);
        });
        break;
      }
    }
  } catch (err) {
    console.warn("Could not play synthesized alarm:", err);
  }
}

/**
 * Backwards compatible helper
 */
export function playAlertChime() {
  playAlertSound("loud_siren");
}

/**
 * Start a continuous persistent wake-up alarm loop (repeats every 1.8s until stopped)
 */
export function startPersistentAlarm(soundType: AlarmSoundType = "loud_siren") {
  stopPersistentAlarm();
  playAlertSound(soundType);
  persistentAlarmInterval = setInterval(() => {
    playAlertSound(soundType);
  }, 1800);
}

/**
 * Stop the persistent wake-up alarm loop
 */
export function stopPersistentAlarm() {
  if (persistentAlarmInterval) {
    clearInterval(persistentAlarmInterval);
    persistentAlarmInterval = null;
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  unlockAudioContext();

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Trigger system notification + audio alarm
 */
export function showSystemNotification(
  title: string,
  body: string,
  soundType: AlarmSoundType = "loud_siren"
) {
  if (typeof window === "undefined") return;

  playAlertSound(soundType);

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        requireInteraction: true,
      });
    } catch {}
  }
}
