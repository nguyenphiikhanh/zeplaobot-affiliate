/**
 * Dynamically update the browser tab favicon and touch icons
 */
export const updateSiteFavicon = (faviconUrl?: string) => {
  if (!faviconUrl || !faviconUrl.trim()) return;

  const trimmedUrl = faviconUrl.trim();

  // Find and remove all existing favicon/icon links to force browser tab redraw
  const existingLinks = document.querySelectorAll<HTMLLinkElement>(
    "link[rel*='icon'], link[rel='apple-touch-icon']"
  );
  existingLinks.forEach((link) => {
    link.parentNode?.removeChild(link);
  });

  // Create new primary favicon link
  const link = document.createElement("link");
  link.rel = "icon";

  if (trimmedUrl.startsWith("data:image/svg+xml")) {
    link.type = "image/svg+xml";
  } else if (trimmedUrl.startsWith("data:image/x-icon")) {
    link.type = "image/x-icon";
  } else if (trimmedUrl.startsWith("data:image/jpeg") || trimmedUrl.startsWith("data:image/jpg")) {
    link.type = "image/jpeg";
  } else {
    link.type = "image/png";
  }

  link.href = trimmedUrl;
  document.head.appendChild(link);

  // Also create apple-touch-icon for iOS devices
  const appleLink = document.createElement("link");
  appleLink.rel = "apple-touch-icon";
  appleLink.href = trimmedUrl;
  document.head.appendChild(appleLink);
};
