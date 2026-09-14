import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync('authToken');

        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F7FAF7',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/welcome" />;
}