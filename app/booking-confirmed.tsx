import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    centerName = 'Green Valley Center',
    date = '18 Sep 2026',
    time = '10:30 AM',
    crop = 'Wheat',
    quantity = '32',
  } = useLocalSearchParams<{
    centerName?: string;
    date?: string;
    time?: string;
    crop?: string;
    quantity?: string;
  }>();

  const bookingId = 'KS-260918-0142';
  const tokenNumber = 'A-76';

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
          onPress={() => router.replace('/')}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={23} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Booking Confirmed</Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 30 },
        ]}
      >
        {/* Success Section */}
        <View style={styles.successSection}>
          <View style={styles.successCircle}>
            <Ionicons
              name="checkmark"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.successTitle}>
            Booking Confirmed!
          </Text>

          <Text style={styles.successSubtitle}>
            Your procurement slot has been successfully booked.
          </Text>
        </View>

        {/* Token Card */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>YOUR TOKEN</Text>

          <Text style={styles.tokenNumber}>
            {tokenNumber}
          </Text>

          <View style={styles.tokenDivider} />

          <View style={styles.tokenStatusRow}>
            <View style={styles.statusDot} />

            <Text style={styles.tokenStatus}>
              Token Generated
            </Text>
          </View>
        </View>

        {/* Booking ID */}
        <View style={styles.bookingIdCard}>
          <View>
            <Text style={styles.smallLabel}>BOOKING ID</Text>
            <Text style={styles.bookingId}>{bookingId}</Text>
          </View>

          <Pressable style={styles.copyButton}>
            <Ionicons
              name="copy-outline"
              size={19}
              color="#2F7D4A"
            />
          </Pressable>
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Appointment Details
          </Text>

          <View style={styles.detailsCard}>
            <DetailRow
              icon="business-outline"
              label="Procurement Center"
              value={centerName}
            />

            <DetailRow
              icon="calendar-outline"
              label="Date"
              value={date}
            />

            <DetailRow
              icon="time-outline"
              label="Time"
              value={time}
            />

            <DetailRow
              icon="leaf-outline"
              label="Commodity"
              value={crop}
            />

            <DetailRow
              icon="scale-outline"
              label="Approx. Quantity"
              value={`${quantity} quintals`}
              last
            />
          </View>
        </View>

        {/* Arrival Reminder */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderIcon}>
            <Ionicons
              name="information-circle"
              size={22}
              color="#D99A27"
            />
          </View>

          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>
              Important
            </Text>

            <Text style={styles.reminderText}>
              Please arrive 10–15 minutes before your
              scheduled slot and keep your token ready.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/my-token',
              params: {
                centerName,
                date,
                time,
                crop,
                quantity,
                bookingId,
                tokenNumber,
              },
            })
          }
        >
          <Ionicons
            name="qr-code-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            View My Token
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryPressed,
          ]}
          onPress={() => router.replace('/')}
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

        <Text style={styles.bottomNote}>
          You can view your booking and token anytime from
          My Booking or My Token.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- Detail Row ---------------- */

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && styles.detailRowBorder,
      ]}
    >
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#2F7D4A"
        />
      </View>

      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */

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
    paddingTop: 24,
  },

  /* Success */

  successSection: {
    alignItems: 'center',
    marginBottom: 22,
  },

  successCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  successTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#18352A',
    marginBottom: 6,
  },

  successSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#68766E',
    textAlign: 'center',
    paddingHorizontal: 25,
  },

  /* Token */

  tokenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E9E2',
    marginBottom: 12,
  },

  tokenLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#6B786F',
  },

  tokenNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#2F7D4A',
    marginTop: 3,
    letterSpacing: 1,
  },

  tokenDivider: {
    height: 1,
    width: '78%',
    backgroundColor: '#E8ECE8',
    marginVertical: 12,
  },

  tokenStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F7D4A',
    marginRight: 7,
  },

  tokenStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F7D4A',
  },

  /* Booking ID */

  bookingIdCard: {
    backgroundColor: '#EDF4EE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  smallLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#728078',
    letterSpacing: 1,
    marginBottom: 3,
  },

  bookingId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18352A',
  },

  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Details */

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18352A',
    marginBottom: 11,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E1E9E2',
  },

  detailRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0ED',
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  detailTextContainer: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: '#7A847E',
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18352A',
  },

  /* Reminder */

  reminderCard: {
    backgroundColor: '#FFF8E8',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3E3B8',
  },

  reminderIcon: {
    marginRight: 10,
    paddingTop: 1,
  },

  reminderContent: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B641C',
    marginBottom: 3,
  },

  reminderText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#76633C',
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
    transform: [{ scale: 0.99 }],
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

  bottomNote: {
    textAlign: 'center',
    color: '#7B857F',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 20,
    marginTop: 16,
  },
});