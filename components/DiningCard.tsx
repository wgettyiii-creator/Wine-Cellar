import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import { DiningWine } from '../lib/types';

interface Props {
  wine: DiningWine;
  onPress: () => void;
}

export default function DiningCard({ wine, onPress }: Props) {
  const date = new Date(wine.visited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.imageContainer}>
        {wine.photo_url ? (
          <Image source={{ uri: wine.photo_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍾</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{wine.name}</Text>
        {wine.producer && <Text style={styles.producer} numberOfLines={1}>{wine.producer}</Text>}
        {wine.restaurant_name && (
          <Text style={styles.restaurant} numberOfLines={1}>📍 {wine.restaurant_name}</Text>
        )}
        <View style={styles.bottom}>
          <Text style={styles.date}>{date}</Text>
          {wine.rating != null && (
            <Text style={styles.stars}>{'★'.repeat(wine.rating)}{'☆'.repeat(5 - wine.rating)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  imageContainer: {},
  image: { width: 90, height: 90 },
  imagePlaceholder: { width: 90, height: 90, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 32 },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  name: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  producer: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  restaurant: { color: Colors.primary, fontSize: 12, marginTop: 4 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  date: { color: Colors.textMuted, fontSize: 12 },
  stars: { color: Colors.starFilled, fontSize: 12, letterSpacing: 1 },
});
