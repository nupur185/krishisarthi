import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, {useEffect, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'http://10.164.217.66:5000';

interface UpcomingBooking {
  id: number;
  bookingId: string;
  commodity: string;
  quantityQuintals: string;
  status: string;
  tokenNumber: string | null;
  tokenStatus: string;
  estimatedWaitMin: number | null;
  slot: {
    slotDate: string;
    startTime: string;
    endTime: string;
    center: {
      name: string;
      district: string;
      state: string;
    };
  };
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [farmer, setFarmer] = useState<any>(null);
  const [booking, setBooking] = useState<UpcomingBooking | null>(null);

  useEffect(() => {
    async function fetchFarmer() {
      try {
        const token = await SecureStore.getItemAsync('authToken');

        if (!token) {
          console.log('No authentication token found');
          return;
        }

        const response = await fetch(`${API_URL}/api/farmers/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.log('Failed to fetch farmer:', data.message);
          return;
        }

        setFarmer(data.data);
      } catch (error) {
        console.error('Error fetching farmer:', error);
      }
    }

    fetchFarmer();
  }, []);

  useEffect(() => {
  async function fetchUpcomingBooking() {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        console.log('No authentication token found');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/bookings/my-upcoming`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(
          'Failed to fetch upcoming booking:',
          data.message
        );
        return;
      }

      setBooking(data.data);
    } catch (error) {
      console.error(
        'Error fetching upcoming booking:',
        error
      );
    }
  }

  fetchUpcomingBooking();
}, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#123B2A"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 6,
            },
          ]}
        >

          {/* Top Utility Row */}

          <View style={styles.utilityRow}>

            <View style={styles.utilityBrand}>
              <Ionicons
                name="leaf-outline"
                size={13}
                color="#DCEBDD"
              />

              <Text style={styles.utilityText}>
                KRISHI SEVA • BIHAR
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.languageButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.languageText}>
                English
              </Text>

              <Ionicons
                name="chevron-down"
                size={12}
                color="#DCEBDD"
              />
            </Pressable>

          </View>


          {/* Main Brand Row */}

          <View style={styles.brandRow}>

            <View style={styles.brandContainer}>

              <View style={styles.logoContainer}>
                <Ionicons
                  name="leaf"
                  size={25}
                  color="#123B2A"
                />
              </View>

              <View style={styles.brandTextContainer}>

                <Text style={styles.brandName}>
                  KrishiSarthi
                </Text>

                <Text style={styles.brandSubtitle}>
                  From Farm to Fair Market
                </Text>

              </View>

            </View>


            {/* Header Actions */}

            <View style={styles.headerActions}>

              <Pressable
                style={({ pressed }) => [
                  styles.headerAction,
                  pressed && styles.pressedDark,
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <View style={styles.notificationDot} />
              </Pressable>


              <Pressable
                style={({ pressed }) => [
                  styles.profileCircle,
                  pressed && styles.pressedDark,
                ]}
              >
                <Text style={styles.profileLetter}>
                 {farmer?.fullName?.charAt(0)?.toUpperCase() || 'F'} 
                </Text>
              </Pressable>

            </View>

          </View>


          {/* Thin Divider */}

          <View style={styles.headerDivider} />


          {/* Farmer Identity */}

          <View style={styles.identitySection}>

            <Text style={styles.namaste}>
              NAMASTE
            </Text>

            <View style={styles.nameRow}>

              <Text style={styles.farmerName}>
                 {farmer?.fullName || 'Farmer'}
              </Text>

              <View style={styles.verifiedBadge}>

                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={
                    farmer?.verificationStatus === 'VERIFIED'
    ? '#F4B942'
    : '#D99A27'
                  }
                />

                <Text style={styles.verifiedText}>
  {farmer?.verificationStatus === 'VERIFIED'
    ? 'Verified'
    : 'Verification pending'}
 </Text>

              </View>

            </View>

            <Text style={styles.farmerId}>
              Farmer ID • {farmer?.farmerId || '—'}
            </Text>

          </View>


          {/* Small Decorative Agricultural Accent */}

          <View style={styles.headerDecorationOne} />
          <View style={styles.headerDecorationTwo} />

        </View>


        {/* =====================================================
            NEXT VISIT
        ===================================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Your next visit
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your confirmed procurement appointment
            </Text>
          </View>

          <View style={styles.upcomingBadge}>

            <View style={styles.upcomingDot} />

            <Text style={styles.upcomingText}>
              UPCOMING
            </Text>

          </View>

        </View>


        {/* Next Slot Card */}

        <View style={styles.slotCard}>

          <View style={styles.slotTop}>

            <View style={styles.slotIcon}>

              <Ionicons
                name="calendar-outline"
                size={23}
                color="#2F7D4A"
              />

            </View>

            <View style={styles.slotCenterInfo}>

              <Text style={styles.centerName}>
                {booking?.slot.center.name || 'No upcoming booking'}
              </Text>

              <View style={styles.locationRow}>

                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#75837B"
                />

                <Text style={styles.locationText}>
                  Muzaffarpur, Bihar
                </Text>

              </View>

            </View>

            <Pressable
              style={({ pressed }) => [
                styles.moreButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color="#75837B"
              />
            </Pressable>

          </View>


          {/* Appointment Information */}

          <View style={styles.appointmentInfo}>

            <View style={styles.appointmentItem}>

              <Text style={styles.appointmentLabel}>
                DATE
              </Text>

              <Text style={styles.appointmentValue}>
                {booking
  ? new Date(booking.slot.slotDate).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  : '—'}
              </Text>

            </View>


            <View style={styles.verticalDivider} />


            <View style={styles.appointmentItem}>

              <Text style={styles.appointmentLabel}>
                TIME
              </Text>

              <Text style={styles.appointmentValue}>
                {booking
  ? new Date(booking.slot.startTime).toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    )
  : '—'}
              </Text>

            </View>


            <View style={styles.verticalDivider} />


            <View style={styles.appointmentItem}>

              <Text style={styles.appointmentLabel}>
                TOKEN
              </Text>

              <Text style={styles.appointmentValue}>
                {booking?.tokenNumber || '—'}
              </Text>

            </View>

          </View>


          {/* Status Row */}

          <View style={styles.confirmedRow}>

            <View style={styles.confirmedLeft}>

              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#2F7D4A"
              />

              <Text style={styles.confirmedText}>
                Slot confirmed
              </Text>

            </View>

            <Pressable
              style={({ pressed }) => [
                styles.tokenButton,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/my-token')}
            >

              <Text style={styles.tokenButtonText}>
                View token
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color="#2F7D4A"
              />

            </Pressable>

          </View>

        </View>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Quick actions
            </Text>

            <Text style={styles.sectionSubtitle}>
              Manage your procurement visit
            </Text>
          </View>

        </View>


        <View style={styles.actionGrid}>

          {/* BOOK SLOT */}

          <ActionCard
            icon="calendar-outline"
            title="Book Slot"
            subtitle="Choose a center"
            accent="green"
            onPress={() => router.push('/book-slot')}
          />

          {/* MY BOOKING */}

          <ActionCard
            icon="document-text-outline"
            title="My Booking"
            subtitle="View your slots"
            accent="gold"
            onPress={() => router.push('/my-booking')}
          />

          {/* MY TOKEN */}

          <ActionCard
            icon="qr-code-outline"
            title="My Token"
            subtitle="Show at center"
            accent="green"
            onPress={() => router.push('/my-token')}
          />

          {/* TRACK PAYMENT */}

          <ActionCard
            icon="wallet-outline"
            title="Track Payment"
            subtitle="Check payment"
            accent="gold"
             onPress={() => router.push('/payment')}
          />

        </View>


        {/* =====================================================
            AI QUEUE INSIGHT
        ===================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.aiCard,
            pressed && styles.actionPressed,
          ]}
          onPress={() => router.push('/live-queue')}
        >

          <View style={styles.aiLeft}>

            <View style={styles.aiIcon}>

              <Ionicons
                name="sparkles"
                size={19}
                color="#FFFFFF"
              />

            </View>

            <View style={styles.aiContent}>

              <View style={styles.aiTitleRow}>

                <Text style={styles.aiTitle}>
                  Smart queue insight
                </Text>

                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>
                    AI
                  </Text>
                </View>

              </View>

              <Text style={styles.aiDescription}>
               Current estimated waiting time at{' '}
{booking?.slot.center.name || 'your selected center'} is{' '}
{booking?.estimatedWaitMin ?? '—'} minutes.
              </Text>

            </View>

          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#75837B"
          />

        </Pressable>


        {/* =====================================================
            LATEST UPDATES
        ===================================================== */}

        <View style={styles.sectionHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              Latest updates
            </Text>

            <Text style={styles.sectionSubtitle}>
              Important information for you
            </Text>

          </View>

          <Pressable>

            <Text style={styles.seeAll}>
              See all
            </Text>

          </Pressable>

        </View>


        <View style={styles.updatesContainer}>

          <UpdateCard
            icon="megaphone-outline"
            title="Procurement schedule updated"
            description="New slots are available for wheat procurement."
            time="2 hours ago"
            type="green"
          />

          <UpdateCard
            icon="information-circle-outline"
            title="Bring your required documents"
            description="Keep your Farmer ID and bank details ready."
            time="Yesterday"
            type="gold"
          />

          <UpdateCard
            icon="cash-outline"
            title="Payment processing normally"
            description="Your recent procurement payment is being processed."
            time="2 days ago"
            type="green"
          />

        </View>

      </ScrollView>


      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <View
        style={[
          styles.bottomNavigation,
          {
            paddingBottom: Math.max(insets.bottom, 9),
          },
        ]}
      >

        <NavItem
          icon="home"
          label="Home"
          active
          onPress={() => router.push('/home')}
        />

        <NavItem
          icon="pulse-outline"
          label="Live Queue"
          onPress={() => router.push('/live-queue')}
        />


        {/* Center Token Button */}

        <View style={styles.centerNavContainer}>

          <Pressable
            style={({ pressed }) => [
              styles.centerTokenButton,
              pressed && styles.centerButtonPressed,
            ]}
            onPress={() => router.push('/my-token')}
          >

            <Ionicons
              name="qr-code"
              size={23}
              color="#FFFFFF"
            />

          </Pressable>

          <Text style={styles.centerTokenLabel}>
            Token
          </Text>

        </View>


        <NavItem
          icon="chatbubble-ellipses-outline"
          label="Grievance"
          onPress={() => router.push('/grievance')}
        />

        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() => router.push('/profile')}
        />

      </View>

    </View>
  );
}


/* ============================================================
   ACTION CARD
============================================================ */

type ActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accent: 'green' | 'gold';
  onPress?: () => void;
};

function ActionCard({
  icon,
  title,
  subtitle,
  accent,
  onPress,
}: ActionCardProps) {

  const iconBackground =
    accent === 'green'
      ? '#EAF4EC'
      : '#FFF5DF';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.actionPressed,
      ]}
    >

      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={22}
          color="#2F7D4A"
        />

      </View>

      <Text style={styles.actionTitle}>
        {title}
      </Text>

      <Text style={styles.actionSubtitle}>
        {subtitle}
      </Text>

      <View style={styles.actionArrow}>

        <Ionicons
          name="arrow-forward"
          size={14}
          color="#9AA69F"
        />

      </View>

    </Pressable>
  );
}


/* ============================================================
   UPDATE CARD
============================================================ */

type UpdateCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
  type: 'green' | 'gold';
};

function UpdateCard({
  icon,
  title,
  description,
  time,
  type,
}: UpdateCardProps) {

  const iconBackground =
    type === 'green'
      ? '#EAF4EC'
      : '#FFF5DF';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.updateCard,
        pressed && styles.actionPressed,
      ]}
    >

      <View
        style={[
          styles.updateIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={19}
          color="#2F7D4A"
        />

      </View>

      <View style={styles.updateContent}>

        <Text style={styles.updateTitle}>
          {title}
        </Text>

        <Text style={styles.updateDescription}>
          {description}
        </Text>

        <Text style={styles.updateTime}>
          {time}
        </Text>

      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#A0AAA4"
      />

    </Pressable>
  );
}


/* ============================================================
   NAV ITEM
============================================================ */

type NavItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function NavItem({
  icon,
  label,
  active,
  onPress,
}: NavItemProps) {

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.pressed,
      ]}
    >

      <Ionicons
        name={icon}
        size={21}
        color={
          active
            ? '#2F7D4A'
            : '#98A39D'
        }
      />

      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>

    </Pressable>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  /* ================= GENERAL ================= */

  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },

  scrollContent: {
    paddingBottom: 30,
  },


  /* ================= HEADER ================= */

  header: {
    backgroundColor: '#123B2A',
    paddingBottom: 30,
    paddingHorizontal: 19,
    overflow: 'hidden',
  },

  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  utilityBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  utilityText: {
    color: '#DCEBDD',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },

  languageText: {
    color: '#DCEBDD',
    fontSize: 9,
    fontWeight: '600',
  },


  /* ================= BRAND ================= */

  brandRow: {
    marginTop: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F3F7F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandTextContainer: {
    marginLeft: 11,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  brandSubtitle: {
    color: '#C5DCCB',
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },


  /* ================= HEADER ACTIONS ================= */

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1B5137',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4B942',
  },

  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F4B942',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileLetter: {
    color: '#123B2A',
    fontSize: 14,
    fontWeight: '900',
  },


  /* ================= HEADER IDENTITY ================= */

  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 19,
  },

  identitySection: {
    marginTop: 18,
  },

  namaste: {
    color: '#AFCDB7',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 3,
  },

  farmerName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#1B5137',
  },

  verifiedText: {
    color: '#E7F0E9',
    fontSize: 8,
    fontWeight: '700',
  },

  farmerId: {
    color: '#BFD8C6',
    fontSize: 10,
    marginTop: 4,
  },


  /* ================= HEADER DECORATION ================= */

  headerDecorationOne: {
    position: 'absolute',
    right: -38,
    bottom: -52,
    width: 135,
    height: 135,
    borderRadius: 68,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  headerDecorationTwo: {
    position: 'absolute',
    right: 28,
    bottom: -75,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(244,185,66,0.10)',
  },


  /* ================= SECTION ================= */

  sectionHeader: {
    paddingHorizontal: 19,
    marginTop: 23,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#18352A',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: '#75837B',
    fontSize: 9,
    marginTop: 3,
  },

  seeAll: {
    color: '#2F7D4A',
    fontSize: 10,
    fontWeight: '800',
  },


  /* ================= UPCOMING ================= */

  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  upcomingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2F7D4A',
  },

  upcomingText: {
    color: '#2F7D4A',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },


  /* ================= SLOT CARD ================= */

  slotCard: {
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E7ECE7',
    elevation: 2,
    shadowColor: '#123B2A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  slotTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  slotIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  slotCenterInfo: {
    flex: 1,
    marginLeft: 11,
  },

  centerName: {
    color: '#18352A',
    fontSize: 14,
    fontWeight: '800',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },

  locationText: {
    color: '#75837B',
    fontSize: 9,
  },

  moreButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },


  /* ================= APPOINTMENT ================= */

  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDF1ED',
  },

  appointmentItem: {
    flex: 1,
    alignItems: 'center',
  },

  appointmentLabel: {
    color: '#9AA69F',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  appointmentValue: {
    color: '#33463B',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
  },

  verticalDivider: {
    width: 1,
    height: 25,
    backgroundColor: '#E3E8E3',
  },


  /* ================= CONFIRMED ================= */

  confirmedRow: {
    marginTop: 12,
    backgroundColor: '#F7FAF7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  confirmedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  confirmedText: {
    color: '#2F7D4A',
    fontSize: 9,
    fontWeight: '800',
  },

  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  tokenButtonText: {
    color: '#2F7D4A',
    fontSize: 9,
    fontWeight: '800',
  },


  /* ================= ACTION GRID ================= */

  actionGrid: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  actionCard: {
    width: '48.3%',
    height: 108,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EDE8',
    position: 'relative',
  },

  actionIcon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTitle: {
    color: '#18352A',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
  },

  actionSubtitle: {
    color: '#7C8982',
    fontSize: 8,
    marginTop: 2,
  },

  actionArrow: {
    position: 'absolute',
    right: 10,
    top: 12,
  },


  /* ================= AI CARD ================= */

  aiCard: {
    marginHorizontal: 18,
    marginTop: 18,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#F0F6F1',
    borderWidth: 1,
    borderColor: '#DCE8DE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  aiLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },

  aiIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 7,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  aiTitle: {
    color: '#18352A',
    fontSize: 11,
    fontWeight: '800',
  },

  aiBadge: {
    backgroundColor: '#D99A27',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '900',
  },

  aiDescription: {
    color: '#68776E',
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 4,
  },


  /* ================= UPDATES ================= */

  updatesContainer: {
    paddingHorizontal: 18,
    gap: 9,
  },

  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDE8',
  },

  updateIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  updateContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 7,
  },

  updateTitle: {
    color: '#33463B',
    fontSize: 10,
    fontWeight: '800',
  },

  updateDescription: {
    color: '#7A8780',
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 2,
  },

  updateTime: {
    color: '#A0AAA4',
    fontSize: 7.5,
    marginTop: 4,
  },


  /* ================= BOTTOM NAV ================= */

  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 69,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 7,
    elevation: 15,
    shadowColor: '#123B2A',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },

  navItem: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  navLabel: {
    color: '#98A39D',
    fontSize: 7.5,
    fontWeight: '600',
  },

  navLabelActive: {
    color: '#2F7D4A',
    fontWeight: '800',
  },


  /* ================= CENTER TOKEN ================= */

  centerNavContainer: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
  },

  centerTokenButton: {
    width: 53,
    height: 53,
    borderRadius: 27,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F6F8F3',
    elevation: 5,
    shadowColor: '#123B2A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  centerTokenLabel: {
    color: '#2F7D4A',
    fontSize: 7.5,
    fontWeight: '800',
    marginTop: 2,
  },


  /* ================= PRESS STATES ================= */

  pressed: {
    opacity: 0.65,
  },

  pressedDark: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  actionPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  centerButtonPressed: {
    transform: [
      {
        scale: 0.93,
      },
    ],
  },

});