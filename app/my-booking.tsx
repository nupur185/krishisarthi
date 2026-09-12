import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(
    'upcoming'
  );

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

        <Text style={styles.headerTitle}>My Booking</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        {/* Intro */}
        <Text style={styles.pageTitle}>
          Your Procurement Visits
        </Text>

        <Text style={styles.pageSubtitle}>
          Manage your upcoming and previous bookings.
        </Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'upcoming' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('upcoming')}
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
              activeTab === 'past' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('past')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'past' && styles.activeTabText,
              ]}
            >
              Past
            </Text>
          </Pressable>
        </View>

        {/* Upcoming */}
        {activeTab === 'upcoming' ? (
          <>
            <BookingCard
              status="Confirmed"
              statusType="confirmed"
              center="Green Valley Center"
              location="Muzaffarpur, Bihar"
              date="18 Sep 2026"
              time="10:30 AM"
              token="A-76"
              crop="Wheat"
              quantity="32 quintals"
              bookingId="KS-260918-0142"
              onToken={() =>
                router.push({
                  pathname: '/my-token',
                  params: {
                    centerName: 'Green Valley Center',
                    date: '18 Sep 2026',
                    time: '10:30 AM',
                    crop: 'Wheat',
                    quantity: '32',
                    bookingId: 'KS-260918-0142',
                    tokenNumber: 'A-76',
                  },
                })
              }
            />

            <View style={styles.aiCard}>
              <View style={styles.aiIcon}>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color="#D99A27"
                />
              </View>

              <View style={styles.aiContent}>
                <Text style={styles.aiTitle}>
                  AI Queue Prediction
                </Text>

                <Text style={styles.aiText}>
                  Current estimated waiting time at your
                  centre is{' '}
                  <Text style={styles.aiBold}>
                    25 minutes
                  </Text>
                  . We'll update this as the queue changes.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <BookingCard
              status="Completed"
              statusType="completed"
              center="Kisan Seva Kendra"
              location="Muzaffarpur, Bihar"
              date="02 Sep 2026"
              time="11:00 AM"
              token="A-41"
              crop="Rice"
              quantity="25 quintals"
              bookingId="KS-260902-0098"
              completed
            />

            <BookingCard
              status="Completed"
              statusType="completed"
              center="APMC Procurement Center"
              location="Muzaffarpur, Bihar"
              date="20 Aug 2026"
              time="09:30 AM"
              token="B-18"
              crop="Wheat"
              quantity="30 quintals"
              bookingId="KS-260820-0061"
              completed
            />
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
            You can reschedule or cancel an upcoming booking
            before your scheduled slot.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------ */
/* Booking Card                                     */
/* ------------------------------------------------ */

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

        <View style={styles.centerContent}>
          <Text style={styles.centerName}>
            {center}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color="#7B857E"
            />

            <Text style={styles.locationText}>
              {location}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            statusType === 'completed'
              ? styles.completedBadge
              : styles.confirmedBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              statusType === 'completed'
                ? styles.completedText
                : styles.confirmedText,
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      {/* Date / Time */}
      <View style={styles.appointmentBox}>
        <View style={styles.appointmentItem}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#2F7D4A"
          />

          <View>
            <Text style={styles.appointmentLabel}>
              DATE
            </Text>

            <Text style={styles.appointmentValue}>
              {date}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDivider} />

        <View style={styles.appointmentItem}>
          <Ionicons
            name="time-outline"
            size={18}
            color="#2F7D4A"
          />

          <View>
            <Text style={styles.appointmentLabel}>
              TIME
            </Text>

            <Text style={styles.appointmentValue}>
              {time}
            </Text>
          </View>
        </View>
      </View>

      {/* Token */}
      <View style={styles.tokenRow}>
        <View>
          <Text style={styles.tokenLabel}>
            TOKEN
          </Text>

          <Text style={styles.tokenValue}>
            {token}
          </Text>
        </View>

        <View>
          <Text style={styles.tokenLabel}>
            COMMODITY
          </Text>

          <Text style={styles.commodityValue}>
            {crop}
          </Text>
        </View>

        <View>
          <Text style={styles.tokenLabel}>
            QUANTITY
          </Text>

          <Text style={styles.commodityValue}>
            {quantity}
          </Text>
        </View>
      </View>

      {/* Booking ID */}
      <View style={styles.bookingIdRow}>
        <Text style={styles.bookingIdLabel}>
          Booking ID
        </Text>

        <Text style={styles.bookingIdValue}>
          {bookingId}
        </Text>
      </View>

      {/* Actions */}
      {!completed ? (
        <View style={styles.actionRow}>
          <Pressable style={styles.outlineButton}>
            <Ionicons
              name="calendar-outline"
              size={17}
              color="#2F7D4A"
            />

            <Text style={styles.outlineButtonText}>
              Reschedule
            </Text>
          </Pressable>

          <Pressable style={styles.outlineButton}>
            <Ionicons
              name="close-circle-outline"
              size={17}
              color="#A15D4A"
            />

            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={styles.tokenButton}
            onPress={onToken}
          >
            <Ionicons
              name="qr-code-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text style={styles.tokenButtonText}>
              Token
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.historyButton}>
          <Text style={styles.historyButtonText}>
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
    paddingTop: 22,
  },

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