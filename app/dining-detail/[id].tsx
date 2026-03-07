import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { DiningWine } from '../../lib/types';
import StarRating from '../../components/StarRating';

export default function DiningDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [wine, setWine] = useState<DiningWine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('dining_wines').select('*').eq('id', id).single()
      .then(({ data }) => { setWine(data); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    Alert.alert('Delete Entry', `Remove this dining entry?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('dining_wines').delete().eq('id', id);
        router.back();
      }},
    ]);
  }

  if (loading) return <View style={styles.loader}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!wine) return <View style={styles.loader}><Text style={{ color: Colors.text }}>Not found</Text></View>;

  const visitDate = new Date(wine.visited_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
        {wine.photo_url && <Image source={{ uri: wine.photo_url }} style={styles.photo} contentFit="cover" />}

        <View style={styles.mainInfo}>
          <Text style={styles.wineName}>{wine.name}</Text>
          {wine.producer && <Text style={styles.producer}>{wine.producer}</Text>}
          <View style={styles.metaRow}>
            {wine.vintage && <Text style={styles.metaChip}>{wine.vintage}</Text>}
            {wine.varietal && <Text style={styles.metaChip}>{wine.varietal}</Text>}
            {wine.region && <Text style={styles.metaChip}>{wine.region}</Text>}
          </View>
        </View>

        <View style={styles.card}>
          {wine.restaurant_name && (
            <View style={styles.infoRow}>
              <Ionicons name="restaurant" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>{wine.restaurant_name}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{visitDate}</Text>
          </View>
          {wine.latitude != null && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={Colors.textMuted} />
              <Text style={styles.infoText}>{wine.latitude.toFixed(4)}, {wine.longitude?.toFixed(4)}</Text>
            </View>
          )}
          {wine.price != null && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag" size={16} color={Colors.textMuted} />
              <Text style={styles.infoText}>${wine.price.toFixed(2)} (menu price)</Text>
            </View>
          )}
        </View>

        {wine.rating != null && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>MY RATING</Text>
            <StarRating rating={wine.rating} size={28} />
          </View>
        )}

        {wine.tasting_notes && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TASTING NOTES</Text>
            <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
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
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoText: { color: Colors.text, fontSize: 15, flex: 1 },
  cardLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  tastingNotes: { color: Colors.text, fontSize: 15, lineHeight: 22 },
});
