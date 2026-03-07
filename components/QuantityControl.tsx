import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';

interface Props {
  quantity: number;
  onChange: (qty: number) => void;
}

export default function QuantityControl({ quantity, onChange }: Props) {
  function decrement() {
    if (quantity <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(quantity - 1);
  }
  function increment() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(quantity + 1);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, quantity === 0 && styles.btnDisabled]} onPress={decrement} disabled={quantity === 0}>
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.count}>{quantity}</Text>
      <TouchableOpacity style={styles.btn} onPress={increment}>
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: Colors.text, fontSize: 18, fontWeight: '600', lineHeight: 22 },
  count: { color: Colors.primary, fontSize: 22, fontWeight: '700', minWidth: 30, textAlign: 'center' },
});
