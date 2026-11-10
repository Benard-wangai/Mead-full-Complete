import { supabase } from '../utils/supabaseClient';

function guessContentType(uri: string, fallback = 'application/octet-stream'): string {
  const lower = uri.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  return fallback;
}

function extensionFor(uri: string, contentType: string): string {
  const fromUri = uri.split('?')[0].split('.').pop();
  if (fromUri && fromUri.length <= 5) return fromUri;
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webm')) return 'webm';
  if (contentType.includes('mp4')) return 'mp4';
  if (contentType.includes('jpeg')) return 'jpg';
  return 'bin';
}

export async function uploadLocalUri(
  bucket: string,
  uri: string,
  folder: string,
  contentType?: string
): Promise<string> {
  const type = contentType || guessContentType(uri);
  const ext = extensionFor(uri, type);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Could not read the selected file.');
  }
  const blob = await response.blob();

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
