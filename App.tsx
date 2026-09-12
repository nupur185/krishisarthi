import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';

import {Ionicons} from '@expo/vector-icons';

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}

function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 105 + insets.bottom,
        }}
      >
        {/* HEADER */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 18,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.logo}>KrishiSarthi</Text>

              <Text style={styles.tagline}>
                From Farm to Fair market, without the Wait
              </Text>
            </View>

            <Pressable style={styles.settingsButton}>
              <Ionicons
                name="settings-outline"
                size={25}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        {/* FARMER PROFILE */}
        <View style={styles.profileCard}>
          <View>
            <Text style={styles.hello}>Hello,</Text>

            <Text style={styles.farmerName}>
              Ramesh Kumar
            </Text>

            <Text style={styles.farmerId}>
              Farmer ID · F013456
            </Text>
          </View>

          <View style={styles.verifiedBadge}>
            <Ionicons
              name="checkmark"
              size={25}
              color="#25804F"
            />
          </View>
        </View>

        {/* NEXT SLOT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>
            Next Slot Booking
          </Text>

          <Pressable>
            <Text style={styles.viewText}>View</Text>
          </Pressable>
        </View>

        <View style={styles.slotCard}>
          <View style={styles.slotTop}>
            <View style={styles.centerInfo}>
              <Text style={styles.centerName}>
                Green Valley Center
              </Text>

              <Text style={styles.location}>
                Muzaffarpur, Bihar
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                Confirmed
              </Text>
            </View>
          </View>

          <View style={styles.slotDivider} />

          <View style={styles.slotDetails}>
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>
                DATE
              </Text>

              <Text style={styles.detailValue}>
                18 Sep 2026
              </Text>
            </View>

            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>
                TIME
              </Text>

              <Text style={styles.detailValue}>
                10:00 AM
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionGrid}>
          <ActionCard
            title="Book Slot"
            icon="calendar-outline"
          />

          <ActionCard
            title="My Booking"
            icon="document-text-outline"
          />

          <ActionCard
            title="My Token"
            icon="qr-code-outline"
          />

          <ActionCard
            title="Track Payment"
            icon="wallet-outline"
          />
        </View>

        {/* LATEST UPDATES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>
            Latest Updates
          </Text>

          <Pressable>
            <Text style={styles.viewText}>
              See all
            </Text>
          </Pressable>
        </View>

        <UpdateCard
          icon="checkmark-circle"
          title="Slot booking confirmed"
          description="Your procurement slot at Green Valley Center is confirmed."
          time="Today, 9:20 AM"
        />

        <UpdateCard
          icon="information-circle"
          title="Live queue is available"
          description="Check your token position and estimated waiting time."
          time="Today, 8:45 AM"
        />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: insets.bottom,
            height: 68 + insets.bottom,
          },
        ]}
      >
        <NavItem
          icon="home"
          label="Home"
          active
        />

        <NavItem
          icon="list-outline"
          label="Live Queue"
        />

        <NavItem
          icon="help-circle-outline"
          label="Grievance"
        />

        <NavItem
          icon="person-outline"
          label="Profile"
        />
      </View>
    </View>
  );
}

/* QUICK ACTION CARD */

function ActionCard({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={25}
          color="#26764D"
        />
      </View>

      <Text style={styles.actionTitle}>
        {title}
      </Text>
    </Pressable>
  );
}

/* UPDATE CARD */

function UpdateCard({
  icon,
  title,
  description,
  time,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.updateCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.updateIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#26764D"
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
    </Pressable>
  );
}

/* BOTTOM NAV ITEM */

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
}) {
  return (
    <Pressable style={styles.navItem}>
      <Ionicons
        name={icon}
        size={23}
        color={active ? '#26764D' : '#8A9790'}
      />

      <Text
        style={[
          styles.navLabel,
          active && styles.activeNavLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },

  /* HEADER */

  header: {
    backgroundColor: '#164A35',
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  tagline: {
    color: '#D7EBDD',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* PROFILE */

  profileCard: {
    marginHorizontal: 18,
    marginTop: -18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  hello: {
    color: '#718078',
    fontSize: 13,
    marginBottom: 2,
  },

  farmerName: {
    color: '#17382A',
    fontSize: 21,
    fontWeight: '800',
  },

  farmerId: {
    color: '#718078',
    fontSize: 12,
    marginTop: 5,
  },

  verifiedBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DDF2E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SECTION HEADERS */

  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionHeaderTitle: {
    color: '#17382A',
    fontSize: 18,
    fontWeight: '800',
  },

  sectionTitle: {
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 11,
    color: '#17382A',
    fontSize: 18,
    fontWeight: '800',
  },

  viewText: {
    color: '#2B8053',
    fontSize: 14,
    fontWeight: '700',
  },

  /* SLOT */

  slotCard: {
    marginHorizontal: 18,
    backgroundColor: '#E6F4E9',
    borderRadius: 20,
    padding: 19,
  },

  slotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  centerInfo: {
    flex: 1,
    paddingRight: 10,
  },

  centerName: {
    color: '#17382A',
    fontSize: 18,
    fontWeight: '800',
  },

  location: {
    color: '#60766A',
    fontSize: 13,
    marginTop: 5,
  },

  statusBadge: {
    backgroundColor: '#CFEBD8',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: '#277447',
    fontSize: 12,
    fontWeight: '800',
  },

  slotDivider: {
    height: 1,
    backgroundColor: '#CFE4D4',
    marginTop: 18,
    marginBottom: 16,
  },

  slotDetails: {
    flexDirection: 'row',
    gap: 55,
  },

  detailBlock: {
    minWidth: 110,
  },

  detailLabel: {
    color: '#718078',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  detailValue: {
    color: '#17382A',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },

  /* QUICK ACTIONS */

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  actionCard: {
    width: '48%',
    minHeight: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 18,
    marginBottom: 12,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E2F2E7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionTitle: {
    color: '#17382A',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 18,
  },

  /* UPDATES */

  updateCard: {
    marginHorizontal: 18,
    marginBottom: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2F2E7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  updateContent: {
    flex: 1,
    marginLeft: 12,
  },

  updateTitle: {
    color: '#17382A',
    fontSize: 15,
    fontWeight: '800',
  },

  updateDescription: {
    color: '#718078',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  updateTime: {
    color: '#9AA59F',
    fontSize: 10,
    marginTop: 6,
  },

  /* BOTTOM NAVIGATION */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E4EAE5',

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navLabel: {
    fontSize: 11,
    color: '#8A9790',
    marginTop: 4,
  },

  activeNavLabel: {
    color: '#26764D',
    fontWeight: '800',
  },

  /* PRESS EFFECT */

  pressed: {
    opacity: 0.75,
  },
});