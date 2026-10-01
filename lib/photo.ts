// Profile photos are stored as private Vercel Blob files (same store as the
// NRC/selfie documents), so the raw blob URL can't be shown in an <img>.
// Every avatar instead points at /api/photos/<userId>, which streams the
// file to logged-in users only. The ?v= part changes when the photo changes,
// so browsers don't keep showing an old cached photo.

export function photoSrc(user: { id: string; photoUrl?: string | null }): string | undefined {
  if (!user.photoUrl) return undefined;
  const version = user.photoUrl.split("/").pop()?.slice(-12) ?? "1";
  return `/api/photos/${user.id}?v=${encodeURIComponent(version)}`;
}

// Only accept URLs that point at our own Vercel Blob store.
export function isBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
