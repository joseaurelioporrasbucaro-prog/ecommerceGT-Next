/**
 * Genera un avatar SVG con iniciales sobre un fondo de color derivado del nombre.
 * Se usa como fallback cuando el usuario no tiene foto de perfil.
 *
 * El color es consistente: el mismo nombre siempre produce el mismo fondo.
 * Las iniciales son la primera letra del primer nombre + la primera del último
 * (o solo la primera si es un solo nombre).
 *
 * Devuelve un data URL SVG listo para usarse como `src` de <img> o <Image>.
 */

// Paleta de marca Kiosqui (handoff #3/#4): solo familias navy / lavanda /
// verde / ink — la referencia usa gradiente navy con iniciales cream;
// mantenemos variedad por usuario pero dentro de la marca.
const PALETTE = [
  '#283a5c', // navy-700
  '#344a72', // navy-600
  '#1e2d4a', // navy-800
  '#6d62cf', // lav-700
  '#8a7fe3', // lav-600
  '#6f9433', // green-700
  '#84ad3f', // green-600
  '#43474f', // ink-700
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  const safe = name || '?';
  return PALETTE[hashString(safe) % PALETTE.length];
}

/**
 * Genera un avatar SVG con iniciales como data URL.
 * @param name nombre completo del usuario
 * @param size lado del cuadrado en px (será 100% renderizado por el contenedor)
 */
export function generateInitialsAvatar(name: string, size: number = 64): string {
  const initials = getInitials(name);
  const bg = getColorFromName(name);
  const fontSize = Math.round(size * 0.42);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg}" stop-opacity="1"/><stop offset="100%" stop-color="${bg}" stop-opacity="0.75"/></linearGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#g)"/><text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#f8f4ee" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;

  // utf8 encoding sin base64 — más liviano y funciona en data URLs.
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Helper: devuelve el src final a usar para un avatar.
 * - Si hay imagen backend válida → la usa.
 * - Si no → genera iniciales como fallback.
 */
export function resolveAvatarSrc(
  rawImage: string | null | undefined,
  name: string | null | undefined,
  size: number = 64,
  backendResolver?: (url: string) => string,
): string {
  if (rawImage) {
    return backendResolver ? backendResolver(rawImage) : rawImage;
  }
  return generateInitialsAvatar(name ?? '?', size);
}
