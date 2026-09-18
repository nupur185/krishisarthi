import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://krishisarthi-backend-32yz.onrender.com/api';

type GrievanceStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

type GrievanceIssueType =
  | 'PAYMENT'
  | 'QUALITY'
  | 'WEIGHTMENT'
  | 'SLOT'
  | 'STAFF'
  | 'OTHER';

type Grievance = {
  id: number;
  grievanceId: string;
  userId: number;
  bookingId: number | null;
  issueType: GrievanceIssueType;
  description: string;
  photoUrl: string | null;
  status: GrievanceStatus;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id?: number;
    bookingId?: string;
    tokenNumber?: string | null;
    commodity?: string;
    quantityQuintals?: string | number;
    status?: string;
    slot?: {
      slotDate?: string;
      center?: {
        name?: string;
      } | null;
    } | null;
  } | null;
};

type GrievancesResponse = {
  success?: boolean;
  grievances?: Grievance[];
  message?: string;
};

const issueLabels: Record<
  GrievanceIssueType,
  string
> = {
  PAYMENT: 'Payment',
  QUALITY: 'Quality',
  WEIGHTMENT: 'Weightment',
  SLOT: 'Slot',
  STAFF: 'Staff',
  OTHER: 'Other',
};

const statusLabels: Record<
  GrievanceStatus,
  string
> = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

const issueIcons: Record<
  GrievanceIssueType,
  keyof typeof Ionicons.glyphMap
> = {
  PAYMENT: 'wallet-outline',
  QUALITY: 'analytics-outline',
  WEIGHTMENT: 'scale-outline',
  SLOT: 'calendar-outline',
  STAFF: 'people-outline',
  OTHER: 'ellipsis-horizontal-circle-outline',
};

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusStyle = (
  status: GrievanceStatus
) => {
  switch (status) {
    case 'RESOLVED':
      return {
        backgroundColor: '#EAF5EE',
        color: '#2D7A4A',
      };

    case 'IN_REVIEW':
      return {
        backgroundColor: '#EEF3F7',
        color: '#526E82',
      };

    case 'REJECTED':
      return {
        backgroundColor: '#F8EEEE',
        color: '#A35D5D',
      };

    case 'OPEN':
    default:
      return {
        backgroundColor: '#F4F1E8',
        color: '#8A7140',
      };
  }
};

export default function MyGrievancesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [grievances, setGrievances] =
    useState<Grievance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchGrievances = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const token =
          await SecureStore.getItemAsync(
            'authToken'
          );

        if (!token) {
          router.replace('/welcome');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/grievances`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          await SecureStore.deleteItemAsync(
            'authToken'
          );

          await SecureStore.deleteItemAsync(
            'farmer'
          );

          router.replace('/welcome');
          return;
        }

        const result: GrievancesResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              'Unable to load grievances.'
          );
        }

        setGrievances(
          Array.isArray(result.grievances)
            ? result.grievances
            : []
        );
      } catch (err) {
        console.error(
          'Fetch grievances error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load grievances.'
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }

        setRefreshing(false);
      }
    },
    [router]
  );

  useFocusEffect(
    useCallback(() => {
      fetchGrievances();
    }, [fetchGrievances])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGrievances(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#2D7A4A"
        />

        <Text style={styles.loadingText}>
          Loading your grievances...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            My Grievances
          </Text>

          <Text style={styles.headerSubtitle}>
            Track your submitted issues
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2D7A4A"
          />
        }
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#2D7A4A"
            />
          </View>

          <View style={styles.introText}>
            <Text style={styles.introTitle}>
              Your grievance history
            </Text>

            <Text style={styles.introDescription}>
              View the status and details of every
              grievance you have submitted.
            </Text>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#A35D5D"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={() =>
                fetchGrievances()
              }
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* Count */}
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryTitle}>
              Submitted grievances
            </Text>

            <Text style={styles.summarySubtitle}>
              {grievances.length === 1
                ? '1 grievance recorded'
                : `${grievances.length} grievances recorded`}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {grievances.length}
            </Text>
          </View>
        </View>

        {/* Empty */}
        {grievances.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="document-outline"
                size={30}
                color="#789085"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No grievances yet
            </Text>

            <Text style={styles.emptyDescription}>
              Any grievance you submit will appear
              here so you can track its progress.
            </Text>

            <Pressable
              style={styles.raiseButton}
              onPress={() =>
                router.push('/grievance')
              }
            >
              <Text style={styles.raiseButtonText}>
                Raise a Grievance
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {grievances.map((grievance) => {
              const statusStyle =
                getStatusStyle(
                  grievance.status
                );

              const booking =
                grievance.booking;

              const token =
                booking?.tokenNumber;

              return (
                <Pressable
                  key={grievance.id}
                  style={({ pressed }) => [
                    styles.grievanceCard,
                    pressed &&
                      styles.cardPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/grievance-details',
                      params: {
                        grievanceId:
                          grievance.grievanceId,
                      },
                    })
                  }
                >
                  {/* Card Header */}
                  <View
                    style={
                      styles.cardHeader
                    }
                  >
                    <View
                      style={
                        styles.issueIcon
                      }
                    >
                      <Ionicons
                        name={
                          issueIcons[
                            grievance
                              .issueType
                          ]
                        }
                        size={19}
                        color="#2D7A4A"
                      />
                    </View>

                    <View
                      style={
                        styles.cardHeaderText
                      }
                    >
                      <Text
                        style={
                          styles.issueTitle
                        }
                      >
                        {
                          issueLabels[
                            grievance
                              .issueType
                          ]
                        }
                      </Text>

                      <Text
                        style={
                          styles.grievanceId
                        }
                      >
                        {grievance.grievanceId}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusStyle.backgroundColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusStyle.color,
                          },
                        ]}
                      >
                        {
                          statusLabels[
                            grievance
                              .status
                          ]
                        }
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text
                    style={
                      styles.description
                    }
                    numberOfLines={2}
                  >
                    {grievance.description}
                  </Text>

                  {/* Reference */}
                  {booking && (
                    <View
                      style={
                        styles.referenceRow
                      }
                    >
                      <View
                        style={
                          styles.referenceItem
                        }
                      >
                        <Ionicons
                          name="ticket-outline"
                          size={14}
                          color="#7B8981"
                        />

                        <Text
                          style={
                            styles.referenceText
                          }
                        >
                          {token ||
                            booking.bookingId ||
                            'Booking linked'}
                        </Text>
                      </View>

                      {booking.commodity && (
                        <View
                          style={
                            styles.referenceItem
                          }
                        >
                          <Ionicons
                            name="leaf-outline"
                            size={14}
                            color="#7B8981"
                          />

                          <Text
                            style={
                              styles.referenceText
                            }
                          >
                            {booking.commodity}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Footer */}
                  <View
                    style={
                      styles.cardFooter
                    }
                  >
                    <Text
                      style={
                        styles.dateText
                      }
                    >
                      Submitted{' '}
                      {formatDate(
                        grievance.createdAt
                      )}
                    </Text>

                    <View
                      style={
                        styles.viewDetails
                      }
                    >
                      <Text
                        style={
                          styles.viewDetailsText
                        }
                      >
                        View details
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color="#2D7A4A"
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Bottom Information */}
        {grievances.length > 0 && (
          <View
            style={styles.bottomInfo}
          >
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#8A958E"
            />

            <Text
              style={styles.bottomInfoText}
            >
              Pull down to refresh the latest
              grievance status.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F6',
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F7F9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 11,
    color: '#748078',
    fontSize: 11,
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#123B2A',
    paddingHorizontal: 18,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1B5138',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerText: {
    marginLeft: 13,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: '#BFD2C7',
    fontSize: 11,
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  introCard: {
    backgroundColor: '#EAF4ED',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEADF',
    marginBottom: 22,
  },

  introIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  introText: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    color: '#18382A',
    fontSize: 15,
    fontWeight: '800',
  },

  introDescription: {
    color: '#748078',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  errorCard: {
    backgroundColor: '#F8EEEE',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    color: '#8F5B5B',
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 8,
    marginRight: 8,
  },

  retryText: {
    color: '#A35D5D',
    fontSize: 10,
    fontWeight: '800',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryTitle: {
    color: '#18382A',
    fontSize: 15,
    fontWeight: '800',
  },

  summarySubtitle: {
    color: '#89958E',
    fontSize: 9,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 35,
    height: 35,
    paddingHorizontal: 9,
    borderRadius: 18,
    backgroundColor: '#EAF4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: '#2D7A4A',
    fontSize: 13,
    fontWeight: '800',
  },

  list: {
    gap: 11,
  },

  grievanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  cardPressed: {
    opacity: 0.84,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  issueIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  issueTitle: {
    color: '#18382A',
    fontSize: 13,
    fontWeight: '800',
  },

  grievanceId: {
    color: '#8A958E',
    fontSize: 8.5,
    marginTop: 4,
  },

  statusBadge: {
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 7,
  },

  statusText: {
    fontSize: 8,
    fontWeight: '800',
  },

  description: {
    color: '#53645B',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 13,
  },

  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
  },

  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  referenceText: {
    color: '#78857E',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 5,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
  },

  dateText: {
    color: '#98A39C',
    fontSize: 8.5,
  },

  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewDetailsText: {
    color: '#2D7A4A',
    fontSize: 9,
    fontWeight: '800',
    marginRight: 3,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EDF4EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#18382A',
    fontSize: 17,
    fontWeight: '800',
  },

  emptyDescription: {
    color: '#7B8981',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 7,
  },

  raiseButton: {
    backgroundColor: '#2D7A4A',
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  raiseButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  bottomInfoText: {
    color: '#8A958E',
    fontSize: 8.5,
    marginLeft: 6,
  },
});