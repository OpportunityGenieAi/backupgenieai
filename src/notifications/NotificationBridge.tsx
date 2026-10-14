import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { registerForPush } from './push';

/** Renders nothing. Registers the push token after login and opens a scholarship when its notification is tapped. */
export default function NotificationBridge() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const loggedIn = !!user;
  const lastHandled = useRef<string | null>(null);
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (loggedIn) registerForPush();
  }, [loggedIn]);

  useEffect(() => {
    if (!response) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (lastHandled.current === id) return;
    lastHandled.current = id;

    const data: any = response.notification.request.content.data;
    if (data?.type === 'scholarship' && data.scholarshipId) {
      // short delay so the navigator is ready when the app was opened from a closed state
      setTimeout(() => navigation.navigate('ScholarshipDetail', { id: data.scholarshipId }), 400);
    }
  }, [response, navigation]);

  return null;
}
