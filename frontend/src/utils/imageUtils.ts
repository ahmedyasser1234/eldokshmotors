/**
 * Normalizes image URLs to ensure they load correctly.
 * - Trims whitespace.
 * - Removes erroneous trailing slashes (e.g., .jpeg/ -> .jpeg).
 * - Ensures local paths have a leading slash (e.g., uploads/... -> /uploads/...).
 * - Leaves external 'http' URLs untouched.
 */
export const normalizeImageUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== 'string') return '';
  
  let u = url.trim();
  
  // Remove erroneous trailing slashes
  while (u.endsWith('/')) {
    u = u.slice(0, -1);
  }
  
  // Handing for local uploads (should start with /uploads/vehicles/...)
  if (u && !u.startsWith('http')) {
    // If it's a naked filename or missing /uploads/ prefix
    if (!u.includes('/uploads/')) {
      const filename = u.split('/').pop(); // Get just the last part
      if (filename) {
        u = `/uploads/vehicles/${filename}`;
      }
    } else if (!u.startsWith('/')) {
      u = '/' + u;
    }
  }
  
  return u;
};
