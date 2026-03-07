import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { uploadWinePhoto } from '../lib/storage';
import { Colors } from '../constants/Colors';
import { WineAnalysis } from '../lib/types';
import StarRating from '../components/StarRating';

export default function AddDiningScreen() {
  const router = useRouter();
  const { photoUri, wineData } = useLocalSearchParams<{ photoUri: string; wineData: string }>();
  const analysis: WineAnalysis = JSON.parse(wineData ?? '{}');

  const [form, setForm] = useState({
    name: analysis.name ?? '',
    producer: analysis.producer ?? '',
    vintage: analysis.vintage?.toString() ?? '',
    region: analysis.region ?? '',
    country: analysis.country ?? '',
    varietal: analysis.varietal ?? '',
    price: '',
    rating: 0,
    tasting_notes: '',
    restaurant_name: '',
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('Getting location...');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationLabel('Location not available'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      // Reverse geocode for display
      const places = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (places[0]) {
        const p = places[0];
        setLocationLabel([p.name, p.city, p.region].filter(Boolean).join(', '));
      } else {
        setLocationLabel(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    })();
  }, []);

  function set(key: keyof typeof form, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) { Alert.alert('Required', 'Wine name is required'); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photo_url: string | null = null;
      if (photoUri) photo_url = await uploadWinePhoto(photoUri, user.id);

      const { error } = await supabase.from('dining_wines').insert({
        user_id: user.id,
        photo_url,
        name: form.name.trim(),
        producer: form.producer.trim() || null,
        vintage: form.vintage ? parseInt(form.vintage) : null,
        region: form.region.trim() || null,
        country: form.country.trim() || null,
        varietal: form.varietal.trim() || null,
        price: form.price ? parseFloat(form.price) : null,
        rating: form.rating || null,
        tasting_notes: form.tasting_notes.trim() || null,
        restaurant_name: form.restaurant_name.trim() || null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      });

      if (error) throw error;
      router.replace('/(tabs)/dining');
    } catch (err) {
      setSaving(false);
      Alert.alert('Save Failed', String(err));
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Dining Wine</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? <ActivityIndicator size="small" color={Colors.background} /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />}

          {/* Location banner */}
          <View style={styles.locationBanner}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>

          <Text style={styles.sectionLabel}>RESTAURANT</Text>
          <Field label="Restaurant Name" value={form.restaurant_name} onChangeText={(v) => set('restaurant_name', v)} placeholder="e.g. Le Bernardin" />

          <Text style={styles.sectionLabel}>WINE DETAILS</Text>
          <Field label="Wine Name *" value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Opus One" />
          <Field label="Producer" value={form.producer} onChangeText={(v) => set('producer', v)} placeholder="e.g. Opus One Winery" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Vintage" value={form.vintage} onChangeText={(v) => set('vintage', v)} placeholder="2019" keyboardType="numeric" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Menu Price ($)" value={form.price} onChangeText={(v) => set('price', v)} keyboardType="decimal-pad" placeholder="0.00" />
            </View>
          </View>
          <Field label="Varietal" value={form.varietal} onChangeText={(v) => set('varietal', v)} placeholder="e.g. Cabernet Sauvignon Blend" />
          <Field label="Region" value={form.region} onChangeText={(v) => set('region', v)} placeholder="e.g. Napa Valley" />
          <Field label="Country" value={form.country} onChangeText={(v) => set('country', v)} placeholder="e.g. USA" />

          <Text style={styles.sectionLabel}>YOUR RATING</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={form.rating} onRate={(r) => set('rating', r)} size={36} />
          </View>

          <Field label="Tasting Notes" value={form.tasting_notes} onChangeText={(v) => set('tasting_notes', v)} placeholder="Your impressions..." multiline />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, multiline }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 4 },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, minWidth: 60, alignItems: 'center' },
  saveBtnText: { color: Colors.background, fontWeight: '700', fontSize: 15 },
  content: { padding: 16, paddingBottom: 40 },
  photo: { width: '100%', height: 200, borderRadius: 14, marginBottom: 16 },
  locationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, gap: 8, marginBottom: 4, borderWidth: 1, borderColor: Colors.border },
  locationText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row' },
  field: { marginBottom: 12 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 5 },
  fieldInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: Colors.text, fontSize: 15 },
  fieldMultiline: { height: 90, textAlignVertical: 'top' },
  ratingRow: { paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12 },
});
