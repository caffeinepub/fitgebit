const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export function validatePhoto(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please select a JPEG or PNG image';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 6MB';
  }

  return null;
}
