import React from 'react';
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

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Farmer account
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RK</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Ramesh Kumar</Text>

              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#2F7D4A"
                />

                <Text style={styles.verifiedText}>
                  Verified
                </Text>
              </View>
            </View>

            <Text style={styles.farmerId}>
              Farmer ID: F013456
            </Text>

            <Text style={styles.location}>
              Muzaffarpur, Bihar
            </Text>
          </View>
        </View>

        {/* Verification Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Verification Status
          </Text>

          <View style={styles.verificationCard}>
            <VerificationRow
              icon="person-outline"
              title="Identity"
              subtitle="Identity details verified"
            />

            <View style={styles.divider} />

            <VerificationRow
              icon="leaf-outline"
              title="Land Details"
              subtitle="Farm information verified"
            />

            <View style={styles.divider} />

            <VerificationRow
              icon="business-outline"
              title="Bank Details"
              subtitle="Payment account verified"
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="person-outline"
              title="Personal Information"
              subtitle="Name, mobile and address"
            />

            <View style={styles.divider} />

            <ProfileMenuItem
              icon="leaf-outline"
              title="Farm Details"
              subtitle="Land and crop information"
            />

            <View style={styles.divider} />

            <ProfileMenuItem
              icon="receipt-outline"
              title="Procurement History"
              subtitle="Past procurement records"
            />

            <View style={styles.divider} />

            <ProfileMenuItem
              icon="wallet-outline"
              title="Payment Information"
              subtitle="Payment and bank details"
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Help & Support
          </Text>

          <View style={styles.menuCard}>
            <ProfileMenuItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Frequently asked questions"
            />

            <View style={styles.divider} />

            <ProfileMenuItem
              icon="chatbubble-ellipses-outline"
              title="My Grievances"
              subtitle="Track your submitted grievances"
              onPress={() => router.push('/grievance')}
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutPressed,
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#B84A3A"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>

        <Text style={styles.version}>
          KrishiSarthi • Farmer App
        </Text>

        <Text style={styles.versionNumber}>
          Version 1.0.0
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ---------------- Verification Row ---------------- */

type VerificationRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

function VerificationRow({
  icon,
  title,
  subtitle,
}: VerificationRowProps) {
  return (
    <View style={styles.verificationRow}>
      <View style={styles.verificationIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#2F7D4A"
        />
      </View>

      <View style={styles.verificationText}>
        <Text style={styles.verificationTitle}>
          {title}
        </Text>

        <Text style={styles.verificationSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.verifiedCheck}>
        <Ionicons
          name="checkmark"
          size={14}
          color="#FFFFFF"
        />
      </View>
    </View>
  );
}

/* ---------------- Profile Menu Item ---------------- */

type ProfileMenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function ProfileMenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: ProfileMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#2F7D4A"
        />
      </View>

      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#8A958E"
      />
    </Pressable>
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
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B5137',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#C8D9CF',
    fontSize: 12,
    marginTop: 3,
  },

  scrollContent: {
    padding: 18,
  },

  /* Profile */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#2F7D4A',
    fontSize: 21,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  name: {
    color: '#18352A',
    fontSize: 18,
    fontWeight: '800',
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },

  verifiedText: {
    color: '#2F7D4A',
    fontSize: 9,
    fontWeight: '700',
  },

  farmerId: {
    color: '#52645A',
    fontSize: 12,
    marginTop: 7,
  },

  location: {
    color: '#8A958E',
    fontSize: 11,
    marginTop: 3,
  },

  /* Sections */

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    color: '#18352A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  /* Verification */

  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  verificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verificationText: {
    flex: 1,
    marginLeft: 12,
  },

  verificationTitle: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
  },

  verificationSubtitle: {
    color: '#7C8A82',
    fontSize: 10,
    marginTop: 3,
  },

  verifiedCheck: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Menu */

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  menuItemPressed: {
    opacity: 0.7,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
  },

  menuSubtitle: {
    color: '#7C8A82',
    fontSize: 10,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0EC',
  },

  /* Logout */

  logoutButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FCEDEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },

  logoutPressed: {
    opacity: 0.7,
  },

  logoutText: {
    color: '#B84A3A',
    fontSize: 14,
    fontWeight: '700',
  },

  version: {
    color: '#7C8A82',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 22,
  },

  versionNumber: {
    color: '#A0AAA4',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 3,
  },

  bottomSpace: {
    height: 25,
  },
});