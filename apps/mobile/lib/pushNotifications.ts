import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

const canUseRemotePush =
  Platform.OS !== 'web' &&
  !(Constants.appOwnership === 'expo' && Platform.OS === 'android');

function getNotificationsModule() {
  if (!canUseRemotePush) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }
}

const notifications = getNotificationsModule();

notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!notifications) return null;

  const { status: existing } = await notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const tokenData = await notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  try {
    await api.put('/users/push-token', { token });
  } catch {
    // auth may not be ready yet
  }

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
