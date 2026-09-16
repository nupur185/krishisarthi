import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

type Farmer = {
  farmerId: string;
  fullName: string;
  role: 'FARMER' | 'ADMIN';
};

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);

  const [redirectPath, setRedirectPath] = useState<
    '/home' | '/operator' | '/welcome'
  >('/welcome');

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get stored authentication token
        const token =
          await SecureStore.getItemAsync(
            'authToken'
          );

        // Get stored user information
        const farmerData =
          await SecureStore.getItemAsync(
            'farmer'
          );

        // No login information
        if (!token) {
          setRedirectPath('/welcome');
          return;
        }

        // Token exists and user information exists
        if (farmerData) {
          const farmer: Farmer =
            JSON.parse(farmerData);

          // ADMIN → Operator Dashboard
          if (farmer.role === 'ADMIN') {
            setRedirectPath('/operator');
          }

          // FARMER → Farmer Home
          else {
            setRedirectPath('/home');
          }
        }

        // Token exists but user information is missing
        else {
          setRedirectPath('/welcome');
        }
      } catch (error) {
        console.error(
          'Auth check failed:',
          error
        );

        setRedirectPath('/welcome');
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  // Show loading screen while checking authentication
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

  // Redirect according to user's role
  return (
    <Redirect href={redirectPath} />
  );
}