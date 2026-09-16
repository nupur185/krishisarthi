import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.164.217.66:5000';

interface TokenCenter {
  id: number;
  name: string;
  address: string;
  village: string | null;
  district: string;
  state: string;
}

interface TokenSlot {
  slotDate: string;
  startTime: string;
  endTime: string;

  // Current API may return centre information in different shapes.
  center?: TokenCenter;

  // Possible flattened centre fields.
  centerId?: number;
  centerName?: string;
  centerAddress?: string;
  centerVillage?: string | null;
  centerDistrict?: string;
  centerState?: string;
}

interface TokenBooking {
  id: number;
  bookingId: string;
  commodity: string;
  quantityQuintals: number | string;
  status: string;
  tokenNumber: string | null;
  tokenStatus:
    | 'WAITING'
    | 'READY'
    | 'SERVING'
    | 'COMPLETED'
    | 'CANCELLED';
  estimatedWaitMin: number | null;

  slot: TokenSlot;

  // Possible flattened centre information from API.
  center?: TokenCenter;
  centerId?: number;
  centerName?: string;
  centerAddress?: string;
  centerVillage?: string | null;
  centerDistrict?: string;
  centerState?: string;
}

export default function MyTokenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [booking, setBooking] =
    useState<TokenBooking | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    fetchMyToken();
  }, []);

  async function fetchMyToken() {
    try {
      setLoading(true);
      setError('');

      const token =
        await SecureStore.getItemAsync('authToken');

      if (!token) {
        throw new Error(
          'Authentication token not found'
        );
      }

      const response = await fetch(
        `${API_URL}/api/bookings/my-token`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to fetch token'
        );
      }

      /*
       * ------------------------------------------------
       * Normalize the API response
       * ------------------------------------------------
       *
       * The screen expects:
       *
       * booking.slot.center
       *
       * But the current backend response may provide
       * centre information at another level.
       *
       * We normalize it here so the rest of the UI
       * can safely use booking.slot.center.
       */

      const rawBooking = result.data;

      if (!rawBooking) {
        setBooking(null);
        return;
      }

      const rawSlot = rawBooking.slot ?? {};

      const rawCenter =
        rawSlot.center ??
        rawBooking.center ??
        null;

      const normalizedCenter: TokenCenter = {
        id:
          rawCenter?.id ??
          rawSlot.centerId ??
          rawBooking.centerId ??
          0,

        name:
          rawCenter?.name ??
          rawSlot.centerName ??
          rawBooking.centerName ??
          'Procurement Centre',

        address:
          rawCenter?.address ??
          rawSlot.centerAddress ??
          rawBooking.centerAddress ??
          '',

        village:
          rawCenter?.village ??
          rawSlot.centerVillage ??
          rawBooking.centerVillage ??
          null,

        district:
          rawCenter?.district ??
          rawSlot.centerDistrict ??
          rawBooking.centerDistrict ??
          '',

        state:
          rawCenter?.state ??
          rawSlot.centerState ??
          rawBooking.centerState ??
          '',
      };

      const normalizedBooking: TokenBooking = {
        ...rawBooking,

        slot: {
          ...rawSlot,
          center: normalizedCenter,
        },
      };

      setBooking(normalizedBooking);
    } catch (fetchError) {
      console.error(
        'Fetch token error:',
        fetchError
      );

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load your token.'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString(
      'en-US',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }
    );
  }

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }
    );
  }

  function getStatusLabel(
    status: TokenBooking['tokenStatus']
  ) {
    switch (status) {
      case 'WAITING':
        return 'TOKEN BOOKED';

      case 'READY':
        return 'TOKEN READY';

      case 'SERVING':
        return 'NOW SERVING';

      case 'COMPLETED':
        return 'COMPLETED';

      case 'CANCELLED':
        return 'CANCELLED';

      default:
        return 'TOKEN BOOKED';
    }
  }

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator
          size="large"
          color="#2F7D4A"
        />

        <Text style={styles.stateText}>
          Loading your token...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#C94A4A"
        />

        <Text style={styles.stateTitle}>
          Unable to load token
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={fetchMyToken}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centeredState}>
        <Ionicons
          name="ticket-outline"
          size={48}
          color="#7A857D"
        />

        <Text style={styles.stateTitle}>
          No Active Token
        </Text>

        <Text style={styles.stateText}>
          You don't have an active procurement token.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            router.replace('/book-slot')
          }
        >
          <Text style={styles.retryButtonText}>
            Book a Slot
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          My Token
        </Text>

        <Pressable style={styles.headerButton}>
          <Ionicons
            name="ellipsis-vertical"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
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

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            {getStatusLabel(
              booking.tokenStatus
            )}
          </Text>
        </View>

        {/* Token Card */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>
            PROCUREMENT TOKEN
          </Text>

          <Text style={styles.tokenNumber}>
            {booking.tokenNumber ?? '—'}
          </Text>

          <Text style={styles.tokenInstruction}>
            Show this token at the procurement centre
          </Text>

          {/* QR Placeholder */}
          <View style={styles.qrOuter}>
            <View style={styles.qrBox}>
              <QRPattern />
            </View>
          </View>

          <Text style={styles.qrText}>
            Scan at the entry gate
          </Text>

          <View style={styles.tokenDivider} />

          {/* Date / Time */}
          <View style={styles.dateTimeRow}>

            <View style={styles.dateTimeItem}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#2F7D4A"
                />
              </View>

              <View>
                <Text style={styles.infoLabel}>
                  DATE
                </Text>

                <Text style={styles.infoValue}>
                  {formatDate(
                    booking.slot.slotDate
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.dateTimeItem}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#2F7D4A"
                />
              </View>

              <View>
                <Text style={styles.infoLabel}>
                  TIME
                </Text>

                <Text style={styles.infoValue}>
                  {formatTime(
                    booking.slot.startTime
                  )}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* Centre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Procurement Centre
          </Text>

          <View style={styles.centerCard}>

            <View style={styles.centerIcon}>
              <Ionicons
                name="business-outline"
                size={23}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.centerContent}>

              <Text style={styles.centerName}>
                {booking.slot.center?.name}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#7A857D"
                />

                <Text style={styles.locationText}>
                  {booking.slot.center?.district}
                  {booking.slot.center?.district &&
                  booking.slot.center.state
                    ? ', '
                    : ''}
                  {booking.slot.center?.state}
                </Text>
              </View>

            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9AA49D"
            />

          </View>
        </View>

        {/* Procurement Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Procurement Details
          </Text>

          <View style={styles.detailsCard}>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                COMMODITY
              </Text>

              <View style={styles.detailValueRow}>
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color="#2F7D4A"
                />

                <Text style={styles.detailValue}>
                  {booking.commodity}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                APPROX. QUANTITY
              </Text>

              <View style={styles.detailValueRow}>
                <Ionicons
                  name="scale-outline"
                  size={18}
                  color="#2F7D4A"
                />

                <Text style={styles.detailValue}>
                  {booking.quantityQuintals} quintals
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* AI Queue Insight */}
        <View style={styles.aiCard}>

          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={18}
              color="#D99A27"
            />
          </View>

          <View style={styles.aiContent}>

            <View style={styles.aiTitleRow}>
              <Text style={styles.aiTitle}>
                AI Queue Insight
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  PREDICTED
                </Text>
              </View>
            </View>

            <Text style={styles.aiText}>
              Expected waiting time is around{' '}
              <Text style={styles.aiBold}>
                {booking.estimatedWaitMin ?? '—'} minutes
              </Text>{' '}
              based on current centre activity.
            </Text>

          </View>
        </View>

        {/* Booking ID */}
        <View style={styles.bookingIdRow}>

          <Text style={styles.bookingIdLabel}>
            Booking ID
          </Text>

          <Text style={styles.bookingIdValue}>
            {booking.bookingId}
          </Text>

        </View>

        {/* Actions */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed &&
              styles.buttonPressed,
          ]}
          onPress={() => {}}
        >
          <Ionicons
            name="download-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            Download Token
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed &&
              styles.secondaryPressed,
          ]}
          onPress={() =>
            router.replace('/')
          }
        >
          <Ionicons
            name="home-outline"
            size={20}
            color="#2F7D4A"
          />

          <Text style={styles.secondaryButtonText}>
            Go to Home
          </Text>
        </Pressable>

        {/* Reminder */}
        <View style={styles.reminder}>

          <Ionicons
            name="notifications-outline"
            size={17}
            color="#6F7C73"
          />

          <Text style={styles.reminderText}>
            We’ll notify you when your token is approaching.
          </Text>

        </View>

      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------ */
/* Simple QR-style visual pattern                  */
/* ------------------------------------------------ */

function QRPattern() {
  const pattern = [
    '1111111001011111111',
    '1000001011011000001',
    '1011101000011011101',
    '1011101011011011101',
    '1011101001111011101',
    '1000001010101000001',
    '1111111010101111111',
    '0000000011010000000',
    '1101011110011011011',
    '0011100101110100110',
    '1110011110101111001',
    '0101110001010010111',
    '1011001111011100100',
    '0000001010111001101',
    '1111111001101010101',
    '1000001010011110010',
    '1011101011110011011',
    '1011101001011100110',
    '1011101011010111001',
    '1000001000111001010',
    '1111111011010111101',
  ];

  return (
    <View style={styles.qrPattern}>
      {pattern.map(
        (row, rowIndex) => (
          <View
            key={rowIndex}
            style={styles.qrRow}
          >
            {row
              .split('')
              .map(
                (
                  cell,
                  cellIndex
                ) => (
                  <View
                    key={cellIndex}
                    style={[
                      styles.qrCell,
                      cell === '1' &&
                        styles.qrCellFilled,
                    ]}
                  />
                )
              )}
          </View>
        )
      )}
    </View>
  );
}

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },

  header: {
    backgroundColor: '#123B2A',
    paddingHorizontal: 18,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  /* Status */

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F7D4A',
    marginRight: 7,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2F7D4A',
    letterSpacing: 1.2,
  },

  /* Token */

  tokenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E9E2',
    marginBottom: 24,
  },

  tokenLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#748078',
    letterSpacing: 1.4,
  },

  tokenNumber: {
    fontSize: 43,
    fontWeight: '900',
    color: '#2F7D4A',
    letterSpacing: 1,
    marginTop: 2,
  },

  tokenInstruction: {
    fontSize: 12,
    color: '#748078',
    marginTop: 2,
    marginBottom: 18,
  },

  qrOuter: {
    width: 190,
    height: 190,
    borderRadius: 15,
    backgroundColor: '#F7F9F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5EAE5',
  },

  qrBox: {
    width: 166,
    height: 166,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrPattern: {
    width: 150,
    height: 150,
  },

  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },

  qrCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  qrCellFilled: {
    backgroundColor: '#18352A',
  },

  qrText: {
    fontSize: 11,
    color: '#7A857D',
    marginTop: 10,
  },

  tokenDivider: {
    width: '82%',
    height: 1,
    backgroundColor: '#E7EBE7',
    marginVertical: 18,
  },

  dateTimeRow: {
    width: '82%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  verticalDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E3E8E3',
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#87918A',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18352A',
  },

  /* Sections */

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18352A',
    marginBottom: 10,
  },

  /* Centre */

  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E9E2',
  },

  centerIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  centerContent: {
    flex: 1,
  },

  centerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18352A',
    marginBottom: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    fontSize: 11,
    color: '#7A857D',
    marginLeft: 3,
  },

  /* Details */

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E1E9E2',
    flexDirection: 'row',
  },

  detailItem: {
    flex: 1,
    paddingVertical: 14,
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#87918A',
    letterSpacing: 0.7,
    marginBottom: 7,
  },

  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18352A',
    marginLeft: 7,
  },

  /* AI */

  aiCard: {
    backgroundColor: '#FFF9EA',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1E2B8',
    marginBottom: 17,
  },

  aiIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#FFF1C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  aiContent: {
    flex: 1,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  aiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#72551D',
    marginRight: 7,
  },

  aiBadge: {
    backgroundColor: '#F8E7B8',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  aiBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#80621E',
  },

  aiText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#786943',
  },

  aiBold: {
    fontWeight: '800',
    color: '#604916',
  },

  /* Booking ID */

  bookingIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 3,
  },

  bookingIdLabel: {
    fontSize: 12,
    color: '#7A857D',
  },

  bookingIdValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18352A',
  },

  /* Buttons */

  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#2F7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 11,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  secondaryButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2F7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  secondaryButtonText: {
    color: '#2F7D4A',
    fontSize: 15,
    fontWeight: '800',
  },

  secondaryPressed: {
    backgroundColor: '#EDF5EF',
  },

  /* Reminder */

  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
    paddingHorizontal: 15,
  },

  reminderText: {
    fontSize: 10,
    color: '#78837B',
    marginLeft: 6,
    textAlign: 'center',
  },

  /* States */

  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F7FAF7',
  },

  stateTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#26332A',
    textAlign: 'center',
  },

  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#7A857D',
    textAlign: 'center',
    lineHeight: 21,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2F7D4A',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});