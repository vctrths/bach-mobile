import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;

  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.owner;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (e) {
    console.log('Error getting push token', e);
    return null;
  }
}

export const usePushNotifications = (userId?: string) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Save token to Supabase profile
        supabase
          .from('profiles')
          .update({ expo_push_token: token } as any)
          .eq('id', userId)
          .then(({ error }) => {
            if (error) console.error('Error saving push token:', error);
          });
      }
    });
    
    if (Platform.OS === 'web') return;
    
    // Handle notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // You could handle custom UI here if needed
    });

    // Handle notification clicks
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      console.log('Notification clicked with data:', data);
      
      if (data?.type === 'message' && data?.relatedId) {
        router.push(`/messages/${data.relatedId}` as any);
      } else {
        // Fallback for all other notification types (requests, system, etc.)
        router.push('/notifications' as any);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);

  return { expoPushToken };
};
