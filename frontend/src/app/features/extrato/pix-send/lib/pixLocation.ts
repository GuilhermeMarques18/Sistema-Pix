import type { PixLocationPayload } from '@/app/shared/types/api.types';

export type PixLocationCapture =
  | { status: 'captured'; location: PixLocationPayload }
  | { status: 'denied' | 'unavailable'; location: null };

export function capturePixLocation(): Promise<PixLocationCapture> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ status: 'unavailable', location: null });
  }

  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({
          status: 'captured',
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracyMeters: Number.isFinite(coords.accuracy) ? coords.accuracy : null,
            source: 'BROWSER',
          },
        }),
        (error) => resolve({
          status: error.code === 1 ? 'denied' : 'unavailable',
          location: null,
        }),
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 7_000 },
      );
    } catch {
      resolve({ status: 'unavailable', location: null });
    }
  });
}
