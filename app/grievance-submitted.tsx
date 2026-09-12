import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GrievanceSubmittedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark"
            size={48}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.title}>
          Grievance Submitted
        </Text>

        <Text style={styles.subtitle}>
          Your grievance has been successfully recorded.
          Our team will review it and update you through
          the app.
        </Text>

        {/* Grievance ID */}
        <View style={styles.idCard}>
          <Text style={styles.idLabel}>
            GRIEVANCE ID
          </Text>

          <Text style={styles.idValue}>
            GRV-260918-0047
          </Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Submitted
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <DetailRow
            icon="alert-circle-outline"
            label="Issue"
            value="Payment"
          />

          <View style={styles.divider} />

          <DetailRow
            icon="ticket-outline"
            label="Token"
            value="A-76"
          />

          <View style={styles.divider} />

          <DetailRow
            icon="business-outline"
            label="Center"
            value="Green Valley Center"
          />
        </View>

        {/* Buttons */}
        <Pressable
          onPress={() => router.push('/')}
          style={styles.homeButton}
        >
          <Ionicons
            name="home-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.homeButtonText}>
            Go to Home
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            View Grievance Details
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type DetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function DetailRow({
  icon,
  label,
  value,
}: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#2F7D4A"
        />
      </View>

      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },

  title: {
    color: '#18352A',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },

  subtitle: {
    color: '#6E7D74',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 330,
  },

  idCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginTop: 28,
  },

  idLabel: {
    color: '#8A958E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  idValue: {
    color: '#18352A',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 7,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2F7D4A',
    marginRight: 6,
  },

  statusText: {
    color: '#2F7D4A',
    fontSize: 10,
    fontWeight: '700',
  },

  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    marginTop: 14,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailText: {
    marginLeft: 11,
    flex: 1,
  },

  detailLabel: {
    color: '#8A958E',
    fontSize: 10,
  },

  detailValue: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0EC',
  },

  homeButton: {
    width: '100%',
    height: 52,
    borderRadius: 15,
    backgroundColor: '#2F7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    paddingVertical: 16,
  },

  secondaryButtonText: {
    color: '#2F7D4A',
    fontSize: 13,
    fontWeight: '700',
  },
});