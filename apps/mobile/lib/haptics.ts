import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { devLogAction } from '@/lib/devLog';

export function hapticLight(action?: string) {
  if (action) devLogAction(action);
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticSuccess() {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hapticSelection() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}
