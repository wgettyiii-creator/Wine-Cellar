import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { DiningWine } from '../../lib/types';
import DiningCard from '../../components/DiningCard';

export default function DiningScreen() {
  const router = useRouter();
  const [wines, setWines] = useState<DiningWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchWines() {
    const { data, error } = await supabase
      .from('dining_wines')
      .select('*')
      .order('visited_at', { ascending: false });
    if (!error && data) setWines(data);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { fetchWines(); }, []));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dining Out</Text>
        <Text style={styles.subtitle}>{wines.length} wines tried</Text>
      </View>

      <FlatList
        data={wines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <DiningCard wine={item} onPress={() => router.push(`/dining-detail/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWines(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No dining records yet</Text>
              <Text style={styles.emptySubText}>Tap + when you're out to log a wine</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/scan', params: { mode: 'dining' } })}>
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.textSecondary, fontSize: 17, fontWeight: '600' },
  emptySubText: { color: Colors.textMuted, fontSize: 14, marginTop: 6 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
});
