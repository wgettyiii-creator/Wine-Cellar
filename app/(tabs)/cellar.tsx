import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { CellarWine } from '../../lib/types';
import WineCard from '../../components/WineCard';

const FILTERS = ['All', 'Ready', 'Peak Now', 'Not Yet'] as const;

export default function CellarScreen() {
  const router = useRouter();
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  async function fetchWines() {
    const { data, error } = await supabase
      .from('cellar_wines')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setWines(data);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { fetchWines(); }, []));

  const year = new Date().getFullYear();

  const filtered = wines.filter((w) => {
    const matchSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.producer?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (w.varietal?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (!matchSearch) return false;
    if (filter === 'All') return true;
    if (filter === 'Peak Now') return !!(w.drink_peak_from && year >= w.drink_peak_from && w.drink_peak_to && year <= w.drink_peak_to);
    if (filter === 'Ready') return !!(w.drink_from && year >= w.drink_from);
    if (filter === 'Not Yet') return !!(w.drink_from && year < w.drink_from);
    return true;
  });

  const totalBottles = wines.reduce((s, w) => s + w.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Cellar</Text>
          <Text style={styles.subtitle}>{totalBottles} bottles · {wines.length} wines</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wines, producers, varietals..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <WineCard wine={item} onPress={() => router.push(`/wine/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWines(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍾</Text>
              <Text style={styles.emptyText}>
                {search || filter !== 'All' ? 'No wines match your filter' : 'Your cellar is empty'}
              </Text>
              <Text style={styles.emptySubText}>Tap + to scan your first bottle</Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/scan', params: { mode: 'cellar' } })}>
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.background },
  list: { paddingHorizontal: 12, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: Colors.textSecondary, fontSize: 17, fontWeight: '600' },
  emptySubText: { color: Colors.textMuted, fontSize: 14, marginTop: 6 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
});
