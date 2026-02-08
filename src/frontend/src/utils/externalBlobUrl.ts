import { ExternalBlob } from '../backend';

export async function getExternalBlobUrl(blob: ExternalBlob): Promise<string> {
  try {
    // Prefer direct URL for streaming and caching
    const directUrl = blob.getDirectURL();
    if (directUrl) {
      return directUrl;
    }

    // Fallback: create object URL from bytes
    const bytes = await blob.getBytes();
    const blobObj = new Blob([bytes], { type: 'image/jpeg' });
    return URL.createObjectURL(blobObj);
  } catch (error) {
    console.error('Failed to get blob URL:', error);
    throw error;
  }
}
