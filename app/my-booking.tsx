import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://krishisarthi-backend-32yz.onrender.com';

interface Booking {
  id: number;
  bookingId: string;
  userId?: number;

  // Required for rescheduling
  slotId: number;

  commodity: string;
  quantityQuintals: number | string;

  status:
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'COMPLETED'
    | 'NO_SHOW';

  tokenNumber: string | null;
  tokenStatus: string;
  estimatedWaitMin: number | null;
  bookedAt: string;

  slot: {
    slotDate: string;
    startTime: string;
    endTime: string;

    center: {
      id: number;
      name: string;
      address: string;
      village: string | null;
      district: string;
      state: string;
    };
  };
}

export default function MyBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'past'
  >('upcoming');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  /* ============================================================
     FETCH BOOKINGS
  ============================================================ */

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
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
        `${API_URL}/api/bookings/my`,
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
            'Failed to fetch bookings'
        );
      }
console.log('MY BOOKINGS:', JSON.stringify(result.data, null, 2));
      setBookings(result.data || []);
    } catch (fetchError) {
      console.error(
        'Fetch bookings error:',
        fetchError
      );

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Unable to load your bookings.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     DATE / TIME HELPERS
  ============================================================ */

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

  function isUpcoming(booking: Booking) {
    return (
      booking.status === 'CONFIRMED' &&
      new Date(
        booking.slot.startTime
      ).getTime() >= Date.now()
    );
  }

  /* ============================================================
     FILTER BOOKINGS
  ============================================================ */

  const upcomingBookings =
    bookings.filter(isUpcoming);

  const pastBookings = bookings.filter(
    (booking) => !isUpcoming(booking)
  );

  const visibleBookings =
    activeTab === 'upcoming'
      ? upcomingBookings
      : pastBookings;

  /* ============================================================
     CANCEL BOOKING
  ============================================================ */

  function handleCancelBooking(
    booking: Booking
  ) {
    Alert.alert(
      'Cancel booking?',
      `Are you sure you want to cancel your booking at ${booking.slot.center.name}?`,
      [
        {
          text: 'Keep booking',
          style: 'cancel',
        },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () =>
            cancelBooking(booking.bookingId),
        },
      ]
    );
  }

  async function cancelBooking(
    bookingId: string
  ) {
    try {
      setCancellingId(bookingId);

      const token =
        await SecureStore.getItemAsync('authToken');

      if (!token) {
        throw new Error(
          'Authentication token not found'
        );
      }

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to cancel booking'
        );
      }

      await fetchBookings();

      Alert.alert(
        'Booking cancelled',
        'Your procurement booking has been cancelled successfully.'
      );
    } catch (cancelError) {
      console.error(
        'Cancel booking error:',
        cancelError
      );

      Alert.alert(
        'Unable to cancel',
        cancelError instanceof Error
          ? cancelError.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setCancellingId(null);
    }
  }

  /* ============================================================
     RESCHEDULE BOOKING
  ============================================================ */

  function handleRescheduleBooking(
    booking: Booking
  ) {
    router.push({
      pathname: '/select-slot',

      params: {
        // Tell select-slot that this is rescheduling
        mode: 'reschedule',

        // Existing booking
        bookingId: booking.bookingId,

        // Center
        centerId: String(
          booking.slot.center.id
        ),

        centerName:
          booking.slot.center.name,

        // Current slot
        currentSlotId: String(
          booking.slotId
        ),

        // Existing booking information
        crop: booking.commodity,

        quantity: String(
          booking.quantityQuintals
        ),
      },
    });
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <View style={styles.container}>

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + 8,
          },
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
          My Booking
        </Text>

        <View
          style={styles.headerButton}
        />
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

        {/* Intro */}
        <Text style={styles.pageTitle}>
          Your Procurement Visits
        </Text>

        <Text style={styles.pageSubtitle}>
          Manage your upcoming and previous
          bookings.
        </Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>

          <Pressable
            style={[
              styles.tab,
              activeTab === 'upcoming' &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveTab('upcoming')
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'upcoming' &&
                  styles.activeTabText,
              ]}
            >
              Upcoming
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tab,
              activeTab === 'past' &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveTab('past')
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'past' &&
                  styles.activeTabText,
              ]}
            >
              Past
            </Text>
          </Pressable>

        </View>

        {/* ======================================================
            BOOKING LIST
        ====================================================== */}

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="small"
              color="#2F7D4A"
            />

            <Text style={styles.stateText}>
              Loading your bookings...
            </Text>
          </View>

        ) : error ? (
          <View style={styles.stateCard}>

            <Ionicons
              name="alert-circle-outline"
              size={25}
              color="#A26C6C"
            />

            <Text style={styles.stateTitle}>
              Unable to load bookings
            </Text>

            <Text style={styles.stateText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={fetchBookings}
            >
              <Text
                style={styles.retryButtonText}
              >
                Try again
              </Text>
            </Pressable>

          </View>

        ) : visibleBookings.length === 0 ? (
          <View style={styles.stateCard}>

            <Ionicons
              name={
                activeTab === 'upcoming'
                  ? 'calendar-outline'
                  : 'time-outline'
              }
              size={28}
              color="#8A9891"
            />

            <Text style={styles.stateTitle}>
              {activeTab === 'upcoming'
                ? 'No upcoming bookings'
                : 'No booking history'}
            </Text>

            <Text style={styles.stateText}>
              {activeTab === 'upcoming'
                ? 'Book a procurement slot to see it here.'
                : 'Your completed and cancelled bookings will appear here.'}
            </Text>

          </View>

        ) : (
          <>

            {visibleBookings.map(
              (booking) => (
                <BookingCard
                  key={booking.id}

                  status={
                    booking.status ===
                    'CONFIRMED'
                      ? 'Confirmed'
                      : booking.status ===
                        'COMPLETED'
                      ? 'Completed'
                      : booking.status ===
                        'CANCELLED'
                      ? 'Cancelled'
                      : 'No Show'
                  }

                  statusType={
                    booking.status ===
                    'CONFIRMED'
                      ? 'confirmed'
                      : 'completed'
                  }

                  center={
                    booking.slot.center.name
                  }

                  location={`${booking.slot.center.district}, ${booking.slot.center.state}`}

                  date={formatDate(
                    booking.slot.slotDate
                  )}

                  time={formatTime(
                    booking.slot.startTime
                  )}

                  token={
                    booking.tokenNumber ??
                    '—'
                  }

                  crop={
                    booking.commodity
                  }

                  quantity={`${booking.quantityQuintals} quintals`}

                  bookingId={
                    booking.bookingId
                  }

                  completed={
                    booking.status !==
                    'CONFIRMED'
                  }

                  cancelling={
                    cancellingId ===
                    booking.bookingId
                  }

                  onCancel={() =>
                    handleCancelBooking(
                      booking
                    )
                  }

                  onReschedule={() =>
                    handleRescheduleBooking(
                      booking
                    )
                  }

                  onToken={() =>
                    router.push({
                      pathname:
                        '/my-token',

                      params: {
                        centerName:
                          booking
                            .slot
                            .center
                            .name,

                        date: formatDate(
                          booking
                            .slot
                            .slotDate
                        ),

                        time: formatTime(
                          booking
                            .slot
                            .startTime
                        ),

                        crop:
                          booking.commodity,

                        quantity:
                          String(
                            booking.quantityQuintals
                          ),

                        bookingId:
                          booking.bookingId,

                        tokenNumber:
                          booking.tokenNumber ??
                          '',
                      },
                    })
                  }
                />
              )
            )}

            {/* AI Queue Prediction */}
            {activeTab ===
              'upcoming' &&
              upcomingBookings.length >
                0 && (
                <View
                  style={styles.aiCard}
                >

                  <View
                    style={styles.aiIcon}
                  >
                    <Ionicons
                      name="sparkles"
                      size={18}
                      color="#D99A27"
                    />
                  </View>

                  <View
                    style={styles.aiContent}
                  >

                    <Text
                      style={styles.aiTitle}
                    >
                      AI Queue Prediction
                    </Text>

                    <Text
                      style={styles.aiText}
                    >
                      Your estimated waiting
                      time is{' '}
                      <Text
                        style={
                          styles.aiBold
                        }
                      >
                        {upcomingBookings[0]
                          .estimatedWaitMin ??
                          0}{' '}
                        minutes
                      </Text>
                      . We'll update this
                      as queue conditions
                      change.
                    </Text>

                  </View>
                </View>
              )}

          </>
        )}

        {/* Bottom information */}
        <View style={styles.infoCard}>

          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#6F7C73"
          />

          <Text style={styles.infoText}>
            You can reschedule or cancel an
            upcoming booking before your
            scheduled slot.
          </Text>

        </View>

      </ScrollView>
    </View>
  );
}

/* ============================================================
   BOOKING CARD
============================================================ */

function BookingCard({
  status,
  statusType,
  center,
  location,
  date,
  time,
  token,
  crop,
  quantity,
  bookingId,

  completed = false,
  cancelling = false,

  onCancel,
  onReschedule,
  onToken,
}: {
  status: string;
  statusType: 'confirmed' | 'completed';

  center: string;
  location: string;
  date: string;
  time: string;
  token: string;
  crop: string;
  quantity: string;
  bookingId: string;

  completed?: boolean;
  cancelling?: boolean;

  onCancel?: () => void;
  onReschedule?: () => void;
  onToken?: () => void;
}) {
  return (
    <View style={styles.bookingCard}>

      {/* Top row */}
      <View style={styles.cardTopRow}>

        <View style={styles.centerIcon}>
          <Ionicons
            name="business-outline"
            size={22}
            color="#2F7D4A"
          />
        </View>

        <View
          style={styles.centerContent}
        >
          <Text
            style={styles.centerName}
          >
            {center}
          </Text>

          <View
            style={styles.locationRow}
          >
            <Ionicons
              name="location-outline"
              size={13}
              color="#7B857E"
            />

            <Text
              style={styles.locationText}
            >
              {location}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            statusType ===
            'completed'
              ? styles.completedBadge
              : styles.confirmedBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              statusType ===
              'completed'
                ? styles.completedText
                : styles.confirmedText,
            ]}
          >
            {status}
          </Text>
        </View>

      </View>

      {/* Date / Time */}
      <View
        style={styles.appointmentBox}
      >

        <View
          style={styles.appointmentItem}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#2F7D4A"
          />

          <View>
            <Text
              style={
                styles.appointmentLabel
              }
            >
              DATE
            </Text>

            <Text
              style={
                styles.appointmentValue
              }
            >
              {date}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.appointmentDivider
          }
        />

        <View
          style={styles.appointmentItem}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color="#2F7D4A"
          />

          <View>
            <Text
              style={
                styles.appointmentLabel
              }
            >
              TIME
            </Text>

            <Text
              style={
                styles.appointmentValue
              }
            >
              {time}
            </Text>
          </View>
        </View>

      </View>

      {/* Token */}
      <View
        style={styles.tokenRow}
      >

        <View>
          <Text
            style={styles.tokenLabel}
          >
            TOKEN
          </Text>

          <Text
            style={styles.tokenValue}
          >
            {token}
          </Text>
        </View>

        <View>
          <Text
            style={styles.tokenLabel}
          >
            COMMODITY
          </Text>

          <Text
            style={
              styles.commodityValue
            }
          >
            {crop}
          </Text>
        </View>

        <View>
          <Text
            style={styles.tokenLabel}
          >
            QUANTITY
          </Text>

          <Text
            style={
              styles.commodityValue
            }
          >
            {quantity}
          </Text>
        </View>

      </View>

      {/* Booking ID */}
      <View
        style={styles.bookingIdRow}
      >

        <Text
          style={
            styles.bookingIdLabel
          }
        >
          Booking ID
        </Text>

        <Text
          style={
            styles.bookingIdValue
          }
        >
          {bookingId}
        </Text>

      </View>

      {/* Actions */}
      {!completed ? (

        <View
          style={styles.actionRow}
        >

          {/* Reschedule */}
          <Pressable
            style={
              styles.outlineButton
            }
            onPress={
              onReschedule
            }
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color="#2F7D4A"
            />

            <Text
              style={
                styles.outlineButtonText
              }
            >
              Reschedule
            </Text>
          </Pressable>

          {/* Cancel */}
          <Pressable
            style={
              styles.outlineButton
            }
            onPress={onCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator
                size="small"
                color="#A15D4A"
              />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={17}
                  color="#A15D4A"
                />

                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </>
            )}
          </Pressable>

          {/* Token */}
          <Pressable
            style={
              styles.tokenButton
            }
            onPress={onToken}
          >
            <Ionicons
              name="qr-code-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.tokenButtonText
              }
            >
              Token
            </Text>
          </Pressable>

        </View>

      ) : (

        <Pressable
          style={
            styles.historyButton
          }
        >
          <Text
            style={
              styles.historyButtonText
            }
          >
            View Payment Status
          </Text>

          <Ionicons
            name="chevron-forward"
            size={17}
            color="#2F7D4A"
          />
        </Pressable>

      )}

    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },

  /* Header */

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

  /* Scroll */

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  /* Intro */

  pageTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#18352A',
    marginBottom: 5,
  },

  pageSubtitle: {
    fontSize: 13,
    color: '#748078',
    lineHeight: 19,
    marginBottom: 19,
  },

  /* Tabs */

  tabContainer: {
    height: 48,
    backgroundColor: '#E9EFEA',
    borderRadius: 13,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 18,
  },

  tab: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: '#FFFFFF',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78837B',
  },

  activeTabText: {
    color: '#2F7D4A',
    fontWeight: '800',
  },

  /* Booking */

  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E1E9E2',
    marginBottom: 15,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  centerIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
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
    color: '#7B857E',
    marginLeft: 3,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  confirmedBadge: {
    backgroundColor: '#E8F4EA',
  },

  completedBadge: {
    backgroundColor: '#EDF0ED',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  confirmedText: {
    color: '#2F7D4A',
  },

  completedText: {
    color: '#68736C',
  },

  /* Appointment */

  appointmentBox: {
    backgroundColor: '#F5F8F4',
    borderRadius: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  appointmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  appointmentDivider: {
    height: 32,
    width: 1,
    backgroundColor: '#DDE5DE',
  },

  appointmentLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#89938C',
    letterSpacing: 0.7,
    marginBottom: 2,
  },

  appointmentValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18352A',
  },

  /* Token */

  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 14,
  },

  tokenLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#89938C',
    letterSpacing: 0.7,
    marginBottom: 3,
  },

  tokenValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2F7D4A',
  },

  commodityValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18352A',
  },

  /* Booking ID */

  bookingIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
    paddingTop: 11,
    marginBottom: 12,
  },

  bookingIdLabel: {
    fontSize: 10,
    color: '#818B84',
  },

  bookingIdValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#536159',
  },

  /* Actions */

  actionRow: {
    flexDirection: 'row',
    gap: 7,
  },

  outlineButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8D8CC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  outlineButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2F7D4A',
  },

  cancelButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A15D4A',
  },

  tokenButton: {
    flex: 0.75,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  tokenButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  historyButton: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  historyButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2F7D4A',
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

  aiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#72551D',
    marginBottom: 4,
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

  /* State */

  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE4',
    marginBottom: 17,
  },

  stateTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#18352A',
    textAlign: 'center',
  },

  stateText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: '#78837B',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#EDF5EF',
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2F7D4A',
  },

  /* Info */

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 5,
  },

  infoText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: '#78837B',
    marginLeft: 7,
    textAlign: 'center',
  },
});