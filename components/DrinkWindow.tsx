import { View, Text, StyleSheet } from 'react-native';
import { Colors, getDrinkStatus } from '../constants/Colors';

interface Props {
  drinkFrom: number | null;
  drinkPeakFrom: number | null;
  drinkPeakTo: number | null;
  drinkTo: number | null;
}

export default function DrinkWindow({ drinkFrom, drinkPeakFrom, drinkPeakTo, drinkTo }: Props) {
  if (!drinkFrom && !drinkTo) return null;

  const currentYear = new Date().getFullYear();
  const status = getDrinkStatus(drinkFrom, drinkPeakFrom, drinkPeakTo, drinkTo);

  const from = drinkFrom ?? currentYear;
  const to = drinkTo ?? currentYear + 10;
  const span = to - from || 1;
  const peakFrom = drinkPeakFrom ?? from;
  const peakTo = drinkPeakTo ?? to;

  const readyPct = ((peakFrom - from) / span) * 100;
  const peakPct = ((peakTo - peakFrom) / span) * 100;
  const pastPeakPct = ((to - peakTo) / span) * 100;
  const nowPct = Math.min(100, Math.max(0, ((currentYear - from) / span) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.yearLabel}>{from}</Text>
        <View style={[styles.statusBadge, { borderColor: status.color }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.yearLabel}>{to}</Text>
      </View>

      {/* Bar */}
      <View style={styles.bar}>
        {/* Ready zone */}
        <View style={[styles.segment, { width: `${readyPct}%`, backgroundColor: Colors.primary + '60' }]} />
        {/* Peak zone */}
        <View style={[styles.segment, { width: `${peakPct}%`, backgroundColor: Colors.success }]} />
        {/* Past peak */}
        <View style={[styles.segment, { width: `${pastPeakPct}%`, backgroundColor: Colors.warning + '80' }]} />
        {/* Current year marker */}
        <View style={[styles.nowMarker, { left: `${nowPct}%` }]} />
      </View>

      <View style={styles.legendRow}>
        {drinkPeakFrom && drinkPeakTo && (
          <Text style={styles.legendText}>Peak: {drinkPeakFrom}–{drinkPeakTo}</Text>
        )}
        <Text style={[styles.legendText, { marginLeft: 'auto' as any }]}>Now: {currentYear}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  yearLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  statusBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  bar: { height: 12, borderRadius: 6, flexDirection: 'row', backgroundColor: Colors.border, overflow: 'hidden', position: 'relative' },
  segment: { height: '100%' },
  nowMarker: { position: 'absolute', width: 3, height: '100%', backgroundColor: Colors.text, borderRadius: 2 },
  legendRow: { flexDirection: 'row', marginTop: 6 },
  legendText: { color: Colors.textMuted, fontSize: 11 },
});
