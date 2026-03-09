// Temporary in-memory store for the base64 photo captured during a scan.
// Cleared after each upload so it doesn't linger in memory.
let _pendingBase64: string | null = null;

export function setPendingPhoto(base64: string) {
  _pendingBase64 = base64;
}

export function takePendingPhoto(): string | null {
  const val = _pendingBase64;
  _pendingBase64 = null;
  return val;
}
