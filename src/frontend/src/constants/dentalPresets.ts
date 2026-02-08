// Static mapping of 24 dental preset avatar IDs to their asset paths
// All 24 avatars are always available for selection

export interface PresetAvatarInfo {
  id: number;
  name: string;
  description: string;
  path: string;
}

// 24 dental-themed preset avatars (IDs 0-23)
export const DENTAL_PRESETS: PresetAvatarInfo[] = [
  {
    id: 0,
    name: 'Tooth',
    description: 'Classic tooth icon',
    path: '/assets/generated/dental-preset-01.dim_256x256.png',
  },
  {
    id: 1,
    name: 'Toothbrush',
    description: 'Toothbrush character',
    path: '/assets/generated/dental-preset-02.dim_256x256.png',
  },
  {
    id: 2,
    name: 'Toothpaste',
    description: 'Toothpaste tube',
    path: '/assets/generated/dental-preset-03.dim_256x256.png',
  },
  {
    id: 3,
    name: 'Dental Floss',
    description: 'Dental floss motif',
    path: '/assets/generated/dental-preset-04.dim_256x256.png',
  },
  {
    id: 4,
    name: 'Mouth Mirror',
    description: 'Dental mirror tool',
    path: '/assets/generated/dental-preset-05.dim_256x256.png',
  },
  {
    id: 5,
    name: 'Dental Explorer',
    description: 'Explorer tool',
    path: '/assets/generated/dental-preset-06.dim_256x256.png',
  },
  {
    id: 6,
    name: 'Dental Syringe',
    description: 'Dental syringe',
    path: '/assets/generated/dental-preset-07.dim_256x256.png',
  },
  {
    id: 7,
    name: 'Braces',
    description: 'Orthodontic braces',
    path: '/assets/generated/dental-preset-08.dim_256x256.png',
  },
  {
    id: 8,
    name: 'Retainer',
    description: 'Dental retainer',
    path: '/assets/generated/dental-preset-09.dim_256x256.png',
  },
  {
    id: 9,
    name: 'Crown',
    description: 'Dental crown',
    path: '/assets/generated/dental-preset-10.dim_256x256.png',
  },
  {
    id: 10,
    name: 'Implant',
    description: 'Dental implant screw',
    path: '/assets/generated/avatar-dental-01.dim_512x512.png',
  },
  {
    id: 11,
    name: 'Sparkle Molar',
    description: 'Molar with sparkle',
    path: '/assets/generated/avatar-dental-02.dim_512x512.png',
  },
  {
    id: 12,
    name: 'Heart Tooth',
    description: 'Tooth with heart',
    path: '/assets/generated/avatar-dental-03.dim_512x512.png',
  },
  {
    id: 13,
    name: 'Shield Tooth',
    description: 'Tooth with shield',
    path: '/assets/generated/avatar-mask-03.dim_512x512.png',
  },
  {
    id: 14,
    name: 'Dental Chair',
    description: 'Dental chair icon',
    path: '/assets/generated/avatar-tools-04.dim_512x512.png',
  },
  {
    id: 15,
    name: 'Dentist Mask',
    description: 'Medical mask',
    path: '/assets/generated/avatar-floss-05.dim_512x512.png',
  },
  {
    id: 16,
    name: 'X-Ray',
    description: 'Dental x-ray',
    path: '/assets/generated/avatar-cross-tooth-06.dim_512x512.png',
  },
  {
    id: 17,
    name: 'Tooth Chart',
    description: 'Dental chart',
    path: '/assets/generated/avatar-toothpaste-07.dim_512x512.png',
  },
  {
    id: 18,
    name: 'Smile',
    description: 'Happy smile icon',
    path: '/assets/generated/avatar-chair-08.dim_512x512.png',
  },
  {
    id: 19,
    name: 'Mouthwash',
    description: 'Mouthwash bottle',
    path: '/assets/generated/avatar-xray-09.dim_512x512.png',
  },
  {
    id: 20,
    name: 'Clipboard',
    description: 'Dental clipboard',
    path: '/assets/generated/avatar-syringe-10.dim_512x512.png',
  },
  {
    id: 21,
    name: 'Appointment',
    description: 'Calendar appointment',
    path: '/assets/generated/avatar-ecg-tooth-11.dim_512x512.png',
  },
  {
    id: 22,
    name: 'Fresh Tooth',
    description: 'Tooth with leaf',
    path: '/assets/generated/avatar-microscope-12.dim_512x512.png',
  },
  {
    id: 23,
    name: 'Dental Star',
    description: 'Star badge',
    path: '/assets/generated/avatar-bandage-13.dim_512x512.png',
  },
];

/**
 * Get preset avatar info by ID
 */
export function getPresetAvatarInfo(id: number): PresetAvatarInfo | undefined {
  return DENTAL_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get preset avatar path by ID (for static asset fallback)
 */
export function getPresetAvatarPath(id: number): string | undefined {
  const preset = getPresetAvatarInfo(id);
  return preset?.path;
}
