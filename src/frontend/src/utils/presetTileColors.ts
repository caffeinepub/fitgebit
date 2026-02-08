/**
 * Deterministic color utility for preset avatar tiles
 * Returns stable, high-contrast accent colors based on preset ID
 */

interface TileColors {
  borderColor: string;
  backgroundColor: string;
  hoverBorderColor: string;
  hoverBackgroundColor: string;
}

// Vibrant, varied color palette with good contrast
const COLOR_PALETTE = [
  // Pink
  { border: 'oklch(0.65 0.20 350)', bg: 'oklch(0.65 0.20 350 / 0.1)', hoverBorder: 'oklch(0.60 0.22 350)', hoverBg: 'oklch(0.65 0.20 350 / 0.15)' },
  // Blue
  { border: 'oklch(0.60 0.18 240)', bg: 'oklch(0.60 0.18 240 / 0.1)', hoverBorder: 'oklch(0.55 0.20 240)', hoverBg: 'oklch(0.60 0.18 240 / 0.15)' },
  // Yellow
  { border: 'oklch(0.75 0.15 90)', bg: 'oklch(0.75 0.15 90 / 0.1)', hoverBorder: 'oklch(0.70 0.17 90)', hoverBg: 'oklch(0.75 0.15 90 / 0.15)' },
  // Brown
  { border: 'oklch(0.55 0.10 50)', bg: 'oklch(0.55 0.10 50 / 0.1)', hoverBorder: 'oklch(0.50 0.12 50)', hoverBg: 'oklch(0.55 0.10 50 / 0.15)' },
  // Purple
  { border: 'oklch(0.60 0.20 300)', bg: 'oklch(0.60 0.20 300 / 0.1)', hoverBorder: 'oklch(0.55 0.22 300)', hoverBg: 'oklch(0.60 0.20 300 / 0.15)' },
  // Green
  { border: 'oklch(0.65 0.15 150)', bg: 'oklch(0.65 0.15 150 / 0.1)', hoverBorder: 'oklch(0.60 0.17 150)', hoverBg: 'oklch(0.65 0.15 150 / 0.15)' },
  // Orange
  { border: 'oklch(0.70 0.18 60)', bg: 'oklch(0.70 0.18 60 / 0.1)', hoverBorder: 'oklch(0.65 0.20 60)', hoverBg: 'oklch(0.70 0.18 60 / 0.15)' },
  // Teal
  { border: 'oklch(0.60 0.15 180)', bg: 'oklch(0.60 0.15 180 / 0.1)', hoverBorder: 'oklch(0.55 0.17 180)', hoverBg: 'oklch(0.60 0.15 180 / 0.15)' },
  // Red
  { border: 'oklch(0.60 0.20 20)', bg: 'oklch(0.60 0.20 20 / 0.1)', hoverBorder: 'oklch(0.55 0.22 20)', hoverBg: 'oklch(0.60 0.20 20 / 0.15)' },
  // Lime
  { border: 'oklch(0.70 0.18 120)', bg: 'oklch(0.70 0.18 120 / 0.1)', hoverBorder: 'oklch(0.65 0.20 120)', hoverBg: 'oklch(0.70 0.18 120 / 0.15)' },
  // Indigo
  { border: 'oklch(0.55 0.18 270)', bg: 'oklch(0.55 0.18 270 / 0.1)', hoverBorder: 'oklch(0.50 0.20 270)', hoverBg: 'oklch(0.55 0.18 270 / 0.15)' },
  // Coral
  { border: 'oklch(0.68 0.17 40)', bg: 'oklch(0.68 0.17 40 / 0.1)', hoverBorder: 'oklch(0.63 0.19 40)', hoverBg: 'oklch(0.68 0.17 40 / 0.15)' },
];

/**
 * Get deterministic tile colors for a preset ID
 * Colors remain stable across re-renders
 */
export function getPresetTileColors(presetId: number): TileColors {
  const colorIndex = presetId % COLOR_PALETTE.length;
  const palette = COLOR_PALETTE[colorIndex];
  
  return {
    borderColor: palette.border,
    backgroundColor: palette.bg,
    hoverBorderColor: palette.hoverBorder,
    hoverBackgroundColor: palette.hoverBg,
  };
}
