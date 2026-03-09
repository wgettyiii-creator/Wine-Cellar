import { supabase } from './supabase';

export async function uploadWinePhoto(uri: string, userId: string): Promise<string> {
  const { readAsStringAsync } = await import('expo-file-system/legacy');
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const fileName = `${userId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('wine-photos')
    .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('wine-photos').getPublicUrl(data.path);
  return urlData.publicUrl;
}
