import Constants from 'expo-constants';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string | undefined;
let configured = false;

/** Returns a Google ID token, or null if the user closed the Google sheet. Throws on real failures. */
export async function getGoogleIdToken(): Promise<string | null> {
  if (!webClientId) throw new Error('Google sign-in is not set up in this build.');
  if (!configured) {
    GoogleSignin.configure({ webClientId });
    configured = true;
  }
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  return response.data.idToken ?? null;
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // not signed in with Google; nothing to do
  }
}
