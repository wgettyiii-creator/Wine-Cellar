import { supabase } from './supabase';
import { takePendingPhoto } from './photoStore';

export async function uploadWinePhoto(userId: string): Promise<string | null> {
  const base64 = takePendingPhoto();
  if (!base64) return null;

  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const fileName = `${userId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from('wine-photos')
    .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('wine-photos').getPublicUrl(data.path);
  return urlData.publicUrl;
}
