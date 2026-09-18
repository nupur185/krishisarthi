import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://10.164.217.66:5000/api';

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
      startTime?: string;
      endTime?: string;
      center?: {
        name?: string;
        district?: string;
        state?: string;
      } | null;
    } | null;
  } | null;
};

type GrievanceResponse = {
  success?: boolean;
  grievance?: Grievance;
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

const statusLabels: Record<
  GrievanceStatus,
  string
> = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
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

const formatDateTime = (
  dateString?: string
) => {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
        icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      };

    case 'IN_REVIEW':
      return {
        backgroundColor: '#EEF3F7',
        color: '#526E82',
        icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
      };

    case 'REJECTED':
      return {
        backgroundColor: '#F8EEEE',
        color: '#A35D5D',
        icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
      };

    case 'OPEN':
    default:
      return {
        backgroundColor: '#F4F1E8',
        color: '#8A7140',
        icon: 'radio-button-on-outline' as keyof typeof Ionicons.glyphMap,
      };
  }
};

export default function GrievanceDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    grievanceId?: string;
  }>();

  const grievanceId =
    typeof params.grievanceId === 'string'
      ? params.grievanceId
      : '';

  const [grievance, setGrievance] =
    useState<Grievance | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchGrievance = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        if (!grievanceId) {
          throw new Error(
            'Grievance ID is missing.'
          );
        }

        const token =
          await SecureStore.getItemAsync(
            'authToken'
          );

        if (!token) {
          router.replace('/welcome');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/grievances/${encodeURIComponent(
            grievanceId
          )}`,
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

        const result: GrievanceResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.grievance
        ) {
          throw new Error(
            result.message ||
              'Grievance could not be found.'
          );
        }

        setGrievance(
          result.grievance
        );
      } catch (err) {
        console.error(
          'Fetch grievance details error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load grievance.'
        );
      } finally {
        setLoading(false);
      }
    },
    [grievanceId, router]
  );

  useEffect(() => {
    fetchGrievance();
  }, [fetchGrievance]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#2D7A4A"
        />

        <Text style={styles.loadingText}>
          Loading grievance...
        </Text>
      </View>
    );
  }

  if (!grievance) {
    return (
      <View
        style={[
          styles.errorScreen,
          {
            paddingTop:
              insets.top + 30,
          },
        ]}
      >
        <View style={styles.errorIcon}>
          <Ionicons
            name="document-outline"
            size={31}
            color="#8A958E"
          />
        </View>

        <Text style={styles.errorTitle}>
          Grievance unavailable
        </Text>

        <Text style={styles.errorDescription}>
          {error ||
            'We could not load this grievance.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={fetchGrievance}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>

        <Pressable
          style={styles.backTextButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const statusStyle =
    getStatusStyle(
      grievance.status
    );

  const booking =
    grievance.booking;

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
            Grievance Details
          </Text>

          <Text style={styles.headerSubtitle}>
            Track your issue
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
      >
        {/* Main Status Card */}
        <View style={styles.statusCard}>
          <View
            style={styles.statusCardTop}
          >
            <View
              style={styles.issueIconLarge}
            >
              <Ionicons
                name={
                  issueIcons[
                    grievance.issueType
                  ]
                }
                size={23}
                color="#2D7A4A"
              />
            </View>

            <View
              style={styles.statusCardText}
            >
              <Text
                style={styles.issueLabel}
              >
                {
                  issueLabels[
                    grievance.issueType
                  ]
                }
              </Text>

              <Text
                style={styles.grievanceId}
              >
                {grievance.grievanceId}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusLargeBadge,
              {
                backgroundColor:
                  statusStyle.backgroundColor,
              },
            ]}
          >
            <Ionicons
              name={statusStyle.icon}
              size={16}
              color={statusStyle.color}
            />

            <Text
              style={[
                styles.statusLargeText,
                {
                  color:
                    statusStyle.color,
                },
              ]}
            >
              {
                statusLabels[
                  grievance.status
                ]
              }
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Status
          </Text>

          <View style={styles.timelineCard}>
            <TimelineItem
              icon="document-text-outline"
              title="Grievance submitted"
              subtitle={formatDateTime(
                grievance.createdAt
              )}
              active
              last={
                grievance.status ===
                'OPEN'
              }
            />

            {(grievance.status ===
              'IN_REVIEW' ||
              grievance.status ===
                'RESOLVED' ||
              grievance.status ===
                'REJECTED') && (
              <TimelineItem
                icon="search-outline"
                title="Under review"
                subtitle="Your grievance is being reviewed by the procurement team."
                active
                last={
                  grievance.status ===
                  'IN_REVIEW'
                }
              />
            )}

            {grievance.status ===
              'RESOLVED' && (
              <TimelineItem
                icon="checkmark-circle-outline"
                title="Resolved"
                subtitle={
                  grievance.resolvedAt
                    ? `Resolved ${formatDateTime(
                        grievance.resolvedAt
                      )}`
                    : 'Your grievance has been resolved.'
                }
                active
                last
              />
            )}

            {grievance.status ===
              'REJECTED' && (
              <TimelineItem
                icon="close-circle-outline"
                title="Closed"
                subtitle="The grievance was closed by the procurement team."
                active
                last
              />
            )}
          </View>
        </View>

        {/* Your Complaint */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your grievance
          </Text>

          <View style={styles.descriptionCard}>
            <Text
              style={styles.descriptionText}
            >
              {grievance.description}
            </Text>

            <View
              style={styles.submittedRow}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color="#929D96"
              />

              <Text
                style={styles.submittedText}
              >
                Submitted{' '}
                {formatDate(
                  grievance.createdAt
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Procurement Reference */}
        {booking && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Procurement reference
            </Text>

            <View
              style={styles.referenceCard}
            >
              <InfoRow
                icon="ticket-outline"
                label="Token"
                value={
                  booking.tokenNumber ||
                  '—'
                }
              />

              <InfoRow
                icon="document-text-outline"
                label="Booking ID"
                value={
                  booking.bookingId ||
                  '—'
                }
              />

              <InfoRow
                icon="leaf-outline"
                label="Commodity"
                value={
                  booking.commodity ||
                  '—'
                }
              />

              <InfoRow
                icon="scale-outline"
                label="Quantity"
                value={
                  booking.quantityQuintals !==
                  undefined
                    ? `${booking.quantityQuintals} Quintals`
                    : '—'
                }
              />

              <InfoRow
                icon="business-outline"
                label="Center"
                value={
                  booking.slot
                    ?.center?.name ||
                  '—'
                }
                last
              />
            </View>
          </View>
        )}

        {/* Resolution */}
        {grievance.status ===
          'RESOLVED' &&
          grievance.resolutionNote && (
            <View style={styles.section}>
              <Text
                style={styles.sectionTitle}
              >
                Resolution
              </Text>

              <View
                style={styles.resolutionCard}
              >
                <View
                  style={styles.resolutionIcon}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#2D7A4A"
                  />
                </View>

                <View
                  style={
                    styles.resolutionTextContainer
                  }
                >
                  <Text
                    style={
                      styles.resolutionTitle
                    }
                  >
                    Resolution note
                  </Text>

                  <Text
                    style={
                      styles.resolutionText
                    }
                  >
                    {
                      grievance.resolutionNote
                    }
                  </Text>
                </View>
              </View>
            </View>
          )}

        {/* Photo */}
        {grievance.photoUrl && (
          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
            >
              Supporting evidence
            </Text>

            <View
              style={styles.photoAvailableCard}
            >
              <Ionicons
                name="image-outline"
                size={21}
                color="#2D7A4A"
              />

              <Text
                style={styles.photoAvailableText}
              >
                Supporting photo attached
              </Text>
            </View>
          </View>
        )}

        {/* Bottom */}
        <View style={styles.bottomNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color="#8A958E"
          />

          <Text
            style={styles.bottomNoteText}
          >
            This grievance is securely linked to
            your farmer account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function TimelineItem({
  icon,
  title,
  subtitle,
  active,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineIcon,
            active &&
              styles.timelineIconActive,
          ]}
        >
          <Ionicons
            name={icon}
            size={15}
            color={
              active
                ? '#FFFFFF'
                : '#A5AEA8'
            }
          />
        </View>

        {!last && (
          <View
            style={[
              styles.timelineLine,
              active &&
                styles.timelineLineActive,
            ]}
          />
        )}
      </View>

      <View
        style={styles.timelineContent}
      >
        <Text
          style={styles.timelineTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.timelineSubtitle}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last &&
          styles.infoRowBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={16}
          color="#2D7A4A"
        />
      </View>

      <View style={styles.infoText}>
        <Text
          style={styles.infoLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.infoValue}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
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
    color: '#748078',
    fontSize: 11,
    marginTop: 11,
    fontWeight: '600',
  },

  errorScreen: {
    flex: 1,
    backgroundColor: '#F7F9F6',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E9EFEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    color: '#18382A',
    fontSize: 19,
    fontWeight: '800',
  },

  errorDescription: {
    color: '#7B8981',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 7,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: '#2D7A4A',
    height: 45,
    paddingHorizontal: 25,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  backTextButton: {
    marginTop: 13,
    padding: 10,
  },

  backText: {
    color: '#2D7A4A',
    fontSize: 10,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
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

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E3E9E4',
    marginBottom: 22,
  },

  statusCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  issueIconLarge: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EDF5EF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusCardText: {
    flex: 1,
    marginLeft: 13,
  },

  issueLabel: {
    color: '#18382A',
    fontSize: 17,
    fontWeight: '800',
  },

  grievanceId: {
    color: '#89958E',
    fontSize: 9,
    marginTop: 4,
  },

  statusLargeBadge: {
    marginTop: 15,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusLargeText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 5,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    color: '#18382A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 58,
  },

  timelineLeft: {
    width: 32,
    alignItems: 'center',
  },

  timelineIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E9EEEA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timelineIconActive: {
    backgroundColor: '#2D7A4A',
  },

  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#E1E6E2',
    marginVertical: 3,
  },

  timelineLineActive: {
    backgroundColor: '#AFCDB9',
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 14,
  },

  timelineTitle: {
    color: '#294538',
    fontSize: 11,
    fontWeight: '800',
  },

  timelineSubtitle: {
    color: '#8A958E',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  descriptionText: {
    color: '#52645A',
    fontSize: 11,
    lineHeight: 18,
  },

  submittedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
  },

  submittedText: {
    color: '#929D96',
    fontSize: 8.5,
    marginLeft: 6,
  },

  referenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0ED',
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    flex: 1,
    marginLeft: 11,
  },

  infoLabel: {
    color: '#929D96',
    fontSize: 8,
    fontWeight: '700',
  },

  infoValue: {
    color: '#294538',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },

  resolutionCard: {
    backgroundColor: '#EDF6F0',
    borderRadius: 19,
    padding: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DCEADF',
  },

  resolutionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resolutionTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  resolutionTitle: {
    color: '#2D7A4A',
    fontSize: 10,
    fontWeight: '800',
  },

  resolutionText: {
    color: '#53675B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  photoAvailableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  photoAvailableText: {
    color: '#52645A',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 9,
  },

  bottomNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  bottomNoteText: {
    color: '#8A958E',
    fontSize: 8.5,
    marginLeft: 6,
  },
});