/**
 * Helper to get the public shareable URL for WhatsApp & SMS sharing.
 * Ensures the link starts with https:// on deployed domains so WhatsApp renders it
 * as a clickable blue hyperlink with rich preview cards instead of plain text.
 */

export function getPublicBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || "https://journeyguard.vercel.app";
  }

  // Check if custom domain override is set in localStorage
  const savedDomain = localStorage.getItem("jg_custom_domain");
  if (savedDomain && savedDomain.startsWith("http")) {
    return savedDomain.replace(/\/+$/, "");
  }

  // If on deployed public site (Vercel, custom domain), use origin
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return window.location.origin;
  }

  // If on localhost, check env or fallback to Vercel production link
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

export function formatWhatsAppTrackingMessage(destinationName: string, shareUrl: string): string {
  // WhatsApp requires https:// on a separate line to format as a clickable blue hyperlink
  return encodeURIComponent(
    `👋 Hi! I'm travelling to ${destinationName || "my destination"}.\n\n` +
    `📍 Track my live GPS location & arrival:\n` +
    `${shareUrl}\n\n` +
    `🛡️ (No app install needed. Your phone will ring a loud wake-up siren when I'm close to arriving!)`
  );
}
