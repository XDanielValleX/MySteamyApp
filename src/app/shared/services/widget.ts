import { registerPlugin } from '@capacitor/core';

const WidgetRefresher = registerPlugin<{ refresh: (options?: { favoriteId?: string }) => Promise<void> }>('WidgetRefresher');

export async function refreshWidget(favoriteId?: string | null): Promise<void> {
  try {
    await WidgetRefresher.refresh({ favoriteId: favoriteId ?? '' });
  } catch {
    // No-op on web or when the native plugin is unavailable.
  }
}
