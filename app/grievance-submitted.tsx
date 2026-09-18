import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://10.164.217.66:5000/api';

type GrievanceData = {
  id: number;
  grievanceId: string;
  issueType: string;
  description: string;
  status: string;
  bookingId: number | null;
  booking?: {
    tokenNumber?: string | null;
    slot?: {
      center?: {
        name?: string | null;
      } | null;
    } | null;
  } | null;
};

export default function GrievanceSubmittedScreen() {
  const insets = useSafeAreaInsets();

  const [grievance, setGrievance] = useState<GrievanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLatestGrievance();
  }, []);

  const fetchLatestGrievance = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/grievances`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch grievance.');
      }

      if (data.grievances && data.grievances.length > 0) {
        setGrievance(data.grievances[0]);
      }
    } catch (error) {
      console.error('Fetch grievance error:', error);

      Alert.alert(
        'Unable to load grievance',
        'Your grievance was submitted, but its details could not be loaded right now.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getIssueLabel = (issueType?: string) => {
    switch (issueType) {
      case 'PAYMENT':
        return 'Payment';
      case 'QUALITY':
        return 'Quality';
      case 'WEIGHTMENT':
        return 'Weightment';
      case 'SLOT':
        return 'Slot';
      case 'STAFF':
        return 'Staff';
      case 'OTHER':
        return 'Other';
      default:
        return issueType || 'Not available';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'OPEN':
        return 'Submitted';
      case 'IN_REVIEW':
        return 'In Review';
      case 'RESOLVED':
        return 'Resolved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status || 'Submitted';
    }
  };

  const tokenNumber =
    grievance?.booking?.tokenNumber || 'Not linked';

  const centerName =
    grievance?.booking?.slot?.center?.name || 'Not linked';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={54} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Grievance Submitted</Text>

        <Text style={styles.subtitle}>
          Your grievance has been successfully{'\n'}
          recorded. Our team will review it and{'\n'}
          update you through the app.
        </Text>

        {/* Grievance ID Card */}
        <View style={styles.grievanceCard}>
          <Text style={styles.cardLabel}>GRIEVANCE ID</Text>

          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#277A4B"
              style={styles.loader}
            />
          ) : (
            <Text style={styles.grievanceId}>
              {grievance?.grievanceId || 'Not available'}
            </Text>
          )}

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {getStatusLabel(grievance?.status)}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Issue */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color="#277A4B"
              />
            </View>

            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Issue</Text>
              <Text style={styles.detailValue}>
                {isLoading
                  ? 'Loading...'
                  : getIssueLabel(grievance?.issueType)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Token */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons
                name="ticket-outline"
                size={25}
                color="#277A4B"
              />
            </View>

            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Token</Text>
              <Text style={styles.detailValue}>
                {isLoading ? 'Loading...' : tokenNumber}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Center */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Ionicons
                name="business-outline"
                size={25}
                color="#277A4B"
              />
            </View>

            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Center</Text>
              <Text style={styles.detailValue}>
                {isLoading ? 'Loading...' : centerName}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.8}
            onPress={() => router.push('/')}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="document-text-outline"
              size={21}
              color="#277A4B"
            />
            <Text style={styles.detailsButtonText}>
              View Grievance Details
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },

  scrollView: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
  },

  successIcon: {
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: '#2E8B57',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#173B2A',
    textAlign: 'center',
    marginBottom: 22,
  },

  subtitle: {
    fontSize: 20,
    lineHeight: 30,
    color: '#68746D',
    textAlign: 'center',
    marginBottom: 34,
  },

  grievanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 22,
  },

  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A948E',
    marginBottom: 16,
  },

  grievanceId: {
    fontSize: 28,
    fontWeight: '800',
    color: '#173B2A',
    textAlign: 'center',
    marginBottom: 22,
  },

  loader: {
    height: 42,
    marginBottom: 14,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4EC',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 13,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2E8B57',
    marginRight: 8,
  },

  statusText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#277A4B',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginBottom: 28,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 112,
  },

  detailIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 22,
  },

  detailTextContainer: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 17,
    color: '#89928C',
    marginBottom: 7,
  },

  detailValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#173B2A',
  },

  divider: {
    height: 1,
    backgroundColor: '#E4E8E5',
  },

  buttonsContainer: {
    width: '100%',
    marginTop: 2,
  },

  homeButton: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: '#2E8B57',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 10,
  },

  detailsButton: {
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2E8B57',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  detailsButtonText: {
    color: '#277A4B',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});