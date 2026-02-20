/**
 * Returns a contrast-safe version of a pack/brand hex color for the current theme.
 * On light themes, pack colors (e.g. #e9fb61) are often too light to see on white;
 * this returns a darkened version. On dark themes, the original color is returned.
 */
export function getContrastSafePackColor(hex: string, isLightTheme: boolean): string {
  if (!isLightTheme) return hex;

  const parsed = parseHex(hex);
  if (!parsed) return hex;

  // Darken for visibility on light backgrounds: reduce luminance while keeping hue
  const [r, g, b] = parsed;
  const factor = 0.5; // darker enough to read on white
  const r2 = Math.round(Math.min(255, r * factor));
  const g2 = Math.round(Math.min(255, g * factor));
  const b2 = Math.round(Math.min(255, b * factor));
  return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
}

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$|^#?([0-9a-fA-F]{3})$/);
  if (!m) return null;
  if (m[1]) {
    return [
      parseInt(m[1].slice(0, 2), 16),
      parseInt(m[1].slice(2, 4), 16),
      parseInt(m[1].slice(4, 6), 16),
    ];
  }
  const s = m[2]!;
  return [
    parseInt(s[0]! + s[0]!, 16),
    parseInt(s[1]! + s[1]!, 16),
    parseInt(s[2]! + s[2]!, 16),
  ];
}
