import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors, getDrinkStatus } from '../constants/Colors';
import { CellarWine } from '../lib/types';

interface Props {
  wine: CellarWine;
  onPress: () => void;
}

export default function WineCard({ wine, onPress }: Props) {
  const status = getDrinkStatus(wine.drink_from, wine.drink_peak_from, wine.drink_peak_to, wine.drink_to);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.imageContainer}>
        {wine.photo_url ? (
          <Image source={{ uri: wine.photo_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍷</Text>
          </View>
        )}
        {/* Quantity badge */}
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>{wine.quantity}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{wine.name}</Text>
        {wine.producer && <Text style={styles.producer} numberOfLines={1}>{wine.producer}</Text>}
        <View style={styles.bottom}>
          {wine.vintage && <Text style={styles.vintage}>{wine.vintage}</Text>}
          <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
        </View>
        {wine.rating != null && (
          <Text style={styles.stars}>{'★'.repeat(wine.rating)}{'☆'.repeat(5 - wine.rating)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: '48.5%', backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 140 },
  imagePlaceholder: { width: '100%', height: 140, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 40 },
  quantityBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.primary, borderRadius: 10, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  quantityText: { color: Colors.background, fontSize: 11, fontWeight: '700' },
  info: { padding: 10 },
  name: { color: Colors.text, fontSize: 13, fontWeight: '700', marginBottom: 2, lineHeight: 18 },
  producer: { color: Colors.textMuted, fontSize: 11, marginBottom: 6 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vintage: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  status: { fontSize: 11, fontWeight: '700' },
  stars: { color: Colors.starFilled, fontSize: 11, marginTop: 4, letterSpacing: 1 },
});
