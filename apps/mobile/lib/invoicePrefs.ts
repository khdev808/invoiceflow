import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_CLIENT_KEY = 'invoiceflow_last_client_id';

export async function getLastClientId(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_CLIENT_KEY);
}

export async function saveLastClientId(clientId: string) {
  await AsyncStorage.setItem(LAST_CLIENT_KEY, clientId);
}
