import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

function decode(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

  const len = base64.length;
  let bufLen = Math.floor(len * 0.75);
  if (base64[len - 1] === '=') bufLen--;
  if (base64[len - 2] === '=') bufLen--;

  const arr = new Uint8Array(bufLen);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const a = lookup[base64.charCodeAt(i)];
    const b = lookup[base64.charCodeAt(i + 1)];
    const c = lookup[base64.charCodeAt(i + 2)];
    const d = lookup[base64.charCodeAt(i + 3)];
    arr[p++] = (a << 2) | (b >> 4);
    if (p < bufLen) arr[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < bufLen) arr[p++] = ((c & 3) << 6) | (d & 63);
  }
  return arr;
}

export async function uploadWinePhoto(uri: string, userId: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = decode(base64);
  const fileName = `${userId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('wine-photos')
    .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('wine-photos').getPublicUrl(data.path);
  return urlData.publicUrl;
}
