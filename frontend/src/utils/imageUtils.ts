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
  
  // Handing for local vs cloud paths
  if (u && !u.startsWith('http')) {
    // Only prepend /uploads/ if it's clearly a local filename and not a cloud marker
    if (!u.includes('/uploads/') && !u.startsWith('cloudinary')) {
      const filename = u.split('/').pop();
      if (filename) {
        u = `/uploads/vehicles/${filename}`;
      }
    } else if (u.startsWith('uploads/') || u.startsWith('public/')) {
        u = '/' + u.replace('public/', '');
    }
  }
  
  return u;
};
