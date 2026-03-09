import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { uploadWinePhoto } from '../lib/storage';
import { Colors } from '../constants/Colors';
import { WineAnalysis } from '../lib/types';
import StarRating from '../components/StarRating';
import DrinkWindow from '../components/DrinkWindow';

export default function AddWineScreen() {
  const router = useRouter();
  const { photoUri, wineData } = useLocalSearchParams<{ photoUri: string; wineData: string }>();
  let analysis: WineAnalysis = {} as WineAnalysis;
  try { analysis = JSON.parse(wineData ?? '{}'); } catch { /* stale/corrupt params */ }

  const [form, setForm] = useState({
    name: analysis.name ?? '',
    producer: analysis.producer ?? '',
    vintage: analysis.vintage?.toString() ?? '',
    region: analysis.region ?? '',
    country: analysis.country ?? '',
    varietal: analysis.varietal ?? '',
    quantity: '1',
    price_paid: '',
    rating: 0,
    tasting_notes: '',
    drink_from: analysis.drink_from?.toString() ?? '',
    drink_peak_from: analysis.drink_peak_from?.toString() ?? '',
    drink_peak_to: analysis.drink_peak_to?.toString() ?? '',
    drink_to: analysis.drink_to?.toString() ?? '',
  });
  const [saving, setSaving] = useState(false);

  function set(key: keyof typeof form, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveNew(user: { id: string }) {
    const photo_url = await uploadWinePhoto(user.id);

    const { error } = await supabase.from('cellar_wines').insert({
      user_id: user.id,
      photo_url,
      name: form.name.trim(),
      producer: form.producer.trim() || null,
      vintage: form.vintage ? parseInt(form.vintage) : null,
      region: form.region.trim() || null,
      country: form.country.trim() || null,
      varietal: form.varietal.trim() || null,
      quantity: parseInt(form.quantity) || 1,
      price_paid: form.price_paid ? parseFloat(form.price_paid) : null,
      rating: form.rating || null,
      tasting_notes: form.tasting_notes.trim() || null,
      drink_from: form.drink_from ? parseInt(form.drink_from) : null,
      drink_peak_from: form.drink_peak_from ? parseInt(form.drink_peak_from) : null,
      drink_peak_to: form.drink_peak_to ? parseInt(form.drink_peak_to) : null,
      drink_to: form.drink_to ? parseInt(form.drink_to) : null,
    });
    if (error) throw error;
  }

  async function handleSave() {
    if (!form.name.trim()) { Alert.alert('Required', 'Wine name is required'); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all user wines and fuzzy-match client-side so edits/scan variations still match
      const { data: allWines } = await supabase
        .from('cellar_wines')
        .select('id, name, vintage, producer, quantity')
        .eq('user_id', user.id);

      const enteredName = form.name.trim().toLowerCase();
      const enteredVintage = form.vintage ? parseInt(form.vintage) : null;
      const matches = (allWines ?? []).filter((w) => {
        const wName = w.name.toLowerCase();
        const nameMatch = wName === enteredName || wName.includes(enteredName) || enteredName.includes(wName);
        const vintageMatch = !enteredVintage || !w.vintage || enteredVintage === w.vintage;
        return nameMatch && vintageMatch;
      });

      if (matches.length > 0) {
        const existing = matches[0];
        const addQty = parseInt(form.quantity) || 1;
        const label = existing.vintage ? `${existing.name} (${existing.vintage})` : existing.name;
        setSaving(false);
        Alert.alert(
          'Wine Already in Cellar',
          `"${label}" is already in your cellar with ${existing.quantity} bottle${existing.quantity !== 1 ? 's' : ''}. Add ${addQty} more to that entry, or create a separate entry?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add to Existing',
              onPress: async () => {
                setSaving(true);
                const { error } = await supabase
                  .from('cellar_wines')
                  .update({ quantity: existing.quantity + addQty })
                  .eq('id', existing.id);
                if (error) { setSaving(false); Alert.alert('Failed', String(error)); return; }
                router.replace('/(tabs)/cellar');
              },
            },
            {
              text: 'New Entry',
              onPress: async () => {
                setSaving(true);
                try {
                  await saveNew(user);
                  router.replace('/(tabs)/cellar');
                } catch (err) {
                  setSaving(false);
                  Alert.alert('Save Failed', String(err));
                }
              },
            },
          ]
        );
        return;
      }

      await saveNew(user);
      router.replace('/(tabs)/cellar');
    } catch (err) {
      setSaving(false);
      Alert.alert('Save Failed', String(err));
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to Cellar</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? <ActivityIndicator size="small" color={Colors.background} /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo */}
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
          )}

          <Text style={styles.sectionLabel}>WINE DETAILS</Text>
          <Field label="Wine Name *" value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Château Margaux" />
          <Field label="Producer / Winery" value={form.producer} onChangeText={(v) => set('producer', v)} placeholder="e.g. Château Margaux" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Vintage" value={form.vintage} onChangeText={(v) => set('vintage', v)} placeholder="2018" keyboardType="numeric" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Quantity" value={form.quantity} onChangeText={(v) => set('quantity', v)} keyboardType="numeric" placeholder="1" />
            </View>
          </View>
          <Field label="Varietal" value={form.varietal} onChangeText={(v) => set('varietal', v)} placeholder="e.g. Cabernet Sauvignon" />
          <Field label="Region" value={form.region} onChangeText={(v) => set('region', v)} placeholder="e.g. Bordeaux" />
          <Field label="Country" value={form.country} onChangeText={(v) => set('country', v)} placeholder="e.g. France" />
          <Field label="Price Paid ($)" value={form.price_paid} onChangeText={(v) => set('price_paid', v)} keyboardType="decimal-pad" placeholder="0.00" />

          <Text style={styles.sectionLabel}>YOUR RATING</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={form.rating} onRate={(r) => set('rating', r)} size={36} />
          </View>

          <Field label="Tasting Notes" value={form.tasting_notes} onChangeText={(v) => set('tasting_notes', v)} placeholder="Your impressions..." multiline />

          <Text style={styles.sectionLabel}>DRINKING WINDOW</Text>
          <Text style={styles.windowHint}>Estimated by AI — adjust as needed</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Ready From" value={form.drink_from} onChangeText={(v) => set('drink_from', v)} keyboardType="numeric" placeholder="2024" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Drink By" value={form.drink_to} onChangeText={(v) => set('drink_to', v)} keyboardType="numeric" placeholder="2035" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Peak From" value={form.drink_peak_from} onChangeText={(v) => set('drink_peak_from', v)} keyboardType="numeric" placeholder="2027" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Peak To" value={form.drink_peak_to} onChangeText={(v) => set('drink_peak_to', v)} keyboardType="numeric" placeholder="2032" />
            </View>
          </View>

          <DrinkWindow
            drinkFrom={form.drink_from ? parseInt(form.drink_from) : null}
            drinkPeakFrom={form.drink_peak_from ? parseInt(form.drink_peak_from) : null}
            drinkPeakTo={form.drink_peak_to ? parseInt(form.drink_peak_to) : null}
            drinkTo={form.drink_to ? parseInt(form.drink_to) : null}
          />
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
  photo: { width: '100%', height: 200, borderRadius: 14, marginBottom: 20 },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row' },
  field: { marginBottom: 12 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 5 },
  fieldInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: Colors.text, fontSize: 15 },
  fieldMultiline: { height: 90, textAlignVertical: 'top' },
  ratingRow: { paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12 },
  windowHint: { color: Colors.textMuted, fontSize: 12, marginBottom: 10, marginTop: -6 },
});
