import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors, getDrinkStatus } from '../../constants/Colors';
import { CellarWine } from '../../lib/types';
import StarRating from '../../components/StarRating';
import DrinkWindow from '../../components/DrinkWindow';
import QuantityControl from '../../components/QuantityControl';

export default function WineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [wine, setWine] = useState<CellarWine | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchWine() {
    const { data } = await supabase.from('cellar_wines').select('*').eq('id', id).single();
    setWine(data);
    setLoading(false);
  }

  useEffect(() => { fetchWine(); }, [id]);

  async function handleQuantityChange(newQty: number) {
    if (newQty < 0) return;
    setWine((w) => w ? { ...w, quantity: newQty } : w);
    await supabase.from('cellar_wines').update({ quantity: newQty }).eq('id', id);
  }

  async function handleDelete() {
    Alert.alert('Delete Wine', `Remove "${wine?.name}" from your cellar?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('cellar_wines').delete().eq('id', id);
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  if (!wine) {
    return <View style={styles.loader}><Text style={{ color: Colors.text }}>Wine not found</Text></View>;
  }

  const drinkStatus = getDrinkStatus(wine.drink_from, wine.drink_peak_from, wine.drink_peak_to, wine.drink_to);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {wine.photo_url && (
          <Image source={{ uri: wine.photo_url }} style={styles.photo} contentFit="cover" />
        )}

        {/* Main info */}
        <View style={styles.mainInfo}>
          <Text style={styles.wineName}>{wine.name}</Text>
          {wine.producer && <Text style={styles.producer}>{wine.producer}</Text>}
          <View style={styles.metaRow}>
            {wine.vintage && <Text style={styles.metaChip}>{wine.vintage}</Text>}
            {wine.varietal && <Text style={styles.metaChip}>{wine.varietal}</Text>}
            {wine.region && <Text style={styles.metaChip}>{wine.region}</Text>}
            {wine.country && <Text style={styles.metaChip}>{wine.country}</Text>}
          </View>
        </View>

        {/* Quantity & price row */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardItem}>
              <Text style={styles.cardLabel}>In Cellar</Text>
              <QuantityControl quantity={wine.quantity} onChange={handleQuantityChange} />
            </View>
            {wine.price_paid != null && (
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Price Paid</Text>
                <Text style={styles.cardValue}>${wine.price_paid.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.cardItem}>
              <Text style={styles.cardLabel}>Status</Text>
              <Text style={[styles.statusBadge, { color: drinkStatus.color }]}>{drinkStatus.label}</Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        {wine.rating != null && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>MY RATING</Text>
            <StarRating rating={wine.rating} size={28} />
          </View>
        )}

        {/* Tasting notes */}
        {wine.tasting_notes && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>TASTING NOTES</Text>
            <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
          </View>
        )}

        {/* Drinking window */}
        {(wine.drink_from || wine.drink_to) && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>DRINKING WINDOW</Text>
            <DrinkWindow
              drinkFrom={wine.drink_from}
              drinkPeakFrom={wine.drink_peak_from}
              drinkPeakTo={wine.drink_peak_to}
              drinkTo={wine.drink_to}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  content: { paddingBottom: 40 },
  photo: { width: '100%', height: 260 },
  mainInfo: { padding: 20 },
  wineName: { color: Colors.text, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  producer: { color: Colors.textSecondary, fontSize: 16, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: { backgroundColor: Colors.surface, color: Colors.textSecondary, fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  cardItem: { alignItems: 'center' },
  cardLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  cardValue: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  statusBadge: { fontSize: 15, fontWeight: '700' },
  cardSectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  tastingNotes: { color: Colors.text, fontSize: 15, lineHeight: 22 },
});
