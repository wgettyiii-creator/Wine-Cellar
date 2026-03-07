import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { analyzeWineLabel } from '../lib/claude';
import { Colors } from '../constants/Colors';

export default function ScanScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode: 'cellar' | 'dining' }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="camera-outline" size={56} color={Colors.textMuted} />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permText}>Wine Cellar needs your camera to scan wine labels.</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, base64: false });
      if (!photo) throw new Error('No photo captured');

      const analysis = await analyzeWineLabel(photo.uri);

      const dest = mode === 'dining' ? '/add-dining' : '/add-wine';
      router.replace({
        pathname: dest,
        params: { photoUri: photo.uri, wineData: JSON.stringify(analysis) },
      });
    } catch (err) {
      setAnalyzing(false);
      Alert.alert('Scan Failed', 'Could not analyze the label. Try again with better lighting.', [
        { text: 'Try Again' },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>
            {mode === 'dining' ? 'Scan Wine — Dining Out' : 'Scan Wine Label'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Viewfinder frame */}
        <View style={styles.frameContainer}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.frameHint}>Center the wine label</Text>
        </View>

        {/* Capture button */}
        <View style={styles.bottomBar}>
          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.analyzingText}>Analyzing label...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const CORNER = 24;
const BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  frameContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 280, height: 360, position: 'relative' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.primary },
  cornerTL: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },
  frameHint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 16, textAlign: 'center' },
  bottomBar: { paddingBottom: 60, alignItems: 'center', justifyContent: 'center', height: 140 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: Colors.text, alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.text },
  analyzingContainer: { alignItems: 'center', gap: 12 },
  analyzingText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  permContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  permTitle: { color: Colors.text, fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  permText: { color: Colors.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 32 },
  permButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 },
  permButtonText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
  cancelButton: { padding: 12 },
  cancelText: { color: Colors.textMuted, fontSize: 15 },
});
