import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';

export default function ProfileScreen() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState({ bottles: 0, wines: 0, dining: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) setUser({ name: u.user_metadata?.name ?? 'Wine Lover', email: u.email ?? '' });

      const [cellar, dining] = await Promise.all([
        supabase.from('cellar_wines').select('quantity'),
        supabase.from('dining_wines').select('id', { count: 'exact', head: true }),
      ]);

      const bottles = (cellar.data ?? []).reduce((s: number, r: { quantity: number }) => s + r.quantity, 0);
      setStats({ bottles, wines: cellar.data?.length ?? 0, dining: dining.count ?? 0 });
    }
    load();
  }, []);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User info */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.bottles}</Text>
          <Text style={styles.statLabel}>Bottles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.wines}</Text>
          <Text style={styles.statLabel}>Wines</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.dining}</Text>
          <Text style={styles.statLabel}>Dining</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  userCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  userEmail: { color: Colors.textMuted, fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNumber: { color: Colors.primary, fontSize: 26, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '600' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  signOutText: { color: Colors.error, fontSize: 16, fontWeight: '600' },
});
