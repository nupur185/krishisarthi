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

export default function LiveQueueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Queue</Text>
          <Text style={styles.headerSubtitle}>
            Green Valley Center
          </Text>
        </View>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Token Card */}
        <View style={styles.tokenCard}>
          <View style={styles.tokenTopRow}>
            <View>
              <Text style={styles.smallLabel}>YOUR TOKEN</Text>
              <Text style={styles.tokenNumber}>A-76</Text>
            </View>

            <View style={styles.tokenStatus}>
              <Ionicons
                name="radio-outline"
                size={15}
                color="#2F7D4A"
              />
              <Text style={styles.tokenStatusText}>In Queue</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.queueRow}>
            <View style={styles.queueItem}>
              <Text style={styles.queueLabel}>NOW SERVING</Text>
              <Text style={styles.queueValue}>A-70</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.queueItem}>
              <Text style={styles.queueLabel}>AHEAD OF YOU</Text>
              <Text style={styles.queueValue}>5</Text>
            </View>
          </View>
        </View>

        {/* AI Prediction */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={20}
              color="#D99A27"
            />
          </View>

          <View style={styles.aiContent}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.aiTitle}>AI Queue Prediction</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>

            <Text style={styles.aiMainText}>
              Your turn is expected in approximately
              <Text style={styles.aiTime}> 18 minutes</Text>.
            </Text>

            <Text style={styles.aiSubText}>
              Based on current queue movement, active counters
              and average processing time.
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Queue Progress</Text>
          <Text style={styles.updatedText}>Updated just now</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLeft}>A-70</Text>
            <Text style={styles.progressRight}>A-76</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
            <View style={styles.progressMarker}>
              <View style={styles.markerDot} />
            </View>
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              Now serving
            </Text>
            <Text style={styles.progressText}>
              Your token
            </Text>
          </View>
        </View>

        {/* Current Stage */}
        <Text style={styles.sectionTitle}>Procurement Progress</Text>

        <View style={styles.stageCard}>
          <StageItem
            icon="checkmark-circle"
            title="Token Queue"
            subtitle="Waiting for your turn"
            status="completed"
          />

          <View style={styles.stageLine} />

          <StageItem
            icon="water-outline"
            title="Quality Check"
            subtitle="Next step at Counter 3"
            status="current"
          />

          <View style={styles.stageLine} />

          <StageItem
            icon="scale-outline"
            title="Weightment"
            subtitle="After quality approval"
            status="pending"
          />

          <View style={styles.stageLine} />

          <StageItem
            icon="document-text-outline"
            title="Finalization"
            subtitle="Receipt & procurement completion"
            status="pending"
          />
        </View>

        {/* Live Center Data */}
        <Text style={styles.sectionTitle}>Live Center Status</Text>

        <View style={styles.statsGrid}>
          <StatCard
            icon="people-outline"
            value="12"
            label="Farmers in queue"
          />

          <StatCard
            icon="people-circle-outline"
            value="3"
            label="Active counters"
          />

          <StatCard
            icon="time-outline"
            value="18 min"
            label="Avg. processing"
          />

          <StatCard
            icon="leaf-outline"
            value="56.32 q"
            label="Procured today"
          />
        </View>

        {/* Current Farmer Details */}
        <Text style={styles.sectionTitle}>Your Procurement</Text>

        <View style={styles.procurementCard}>
          <View style={styles.procurementRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="leaf-outline"
                size={19}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Commodity</Text>
              <Text style={styles.detailValue}>Wheat</Text>
            </View>
          </View>

          <View style={styles.procurementRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="bar-chart-outline"
                size={19}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>
                Approximate Quantity
              </Text>
              <Text style={styles.detailValue}>32 Quintals</Text>
            </View>
          </View>

          <View style={styles.procurementRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="location-outline"
                size={19}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>
                Procurement Center
              </Text>
              <Text style={styles.detailValue}>
                Green Valley Center
              </Text>
            </View>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color="#D99A27"
          />

          <Text style={styles.noticeText}>
            You will receive a notification when your token is
            approaching. Please stay within the center premises.
          </Text>
        </View>

        {/* Bottom space */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <NavItem
          icon="home-outline"
          label="Home"
          onPress={() => router.push('/')}
        />

        <NavItem
          icon="pulse"
          label="Live Queue"
          active
          onPress={() => {}}
        />

        <Pressable
          style={styles.centerTokenButton}
          onPress={() => router.push('/my-token')}
        >
          <View style={styles.tokenButtonCircle}>
            <Ionicons
              name="qr-code-outline"
              size={23}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.centerTokenLabel}>Token</Text>
        </Pressable>

        <NavItem
          icon="chatbubble-ellipses-outline"
          label="Grievance"
          onPress={() => {}}
        />

        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

/* ---------------- Stage Item ---------------- */

type StageItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'pending';
};

function StageItem({
  icon,
  title,
  subtitle,
  status,
}: StageItemProps) {
  const iconBackground =
    status === 'completed'
      ? '#EAF4EC'
      : status === 'current'
      ? '#FFF5DF'
      : '#F0F2EF';

  const iconColor =
    status === 'completed'
      ? '#2F7D4A'
      : status === 'current'
      ? '#D99A27'
      : '#9AA69F';

  return (
    <View style={styles.stageItem}>
      <View
        style={[
          styles.stageIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.stageContent}>
        <Text
          style={[
            styles.stageTitle,
            status === 'current' && styles.currentStageTitle,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.stageSubtitle}>{subtitle}</Text>
      </View>

      {status === 'completed' && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#2F7D4A"
        />
      )}

      {status === 'current' && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>NEXT</Text>
        </View>
      )}
    </View>
  );
}

/* ---------------- Stat Card ---------------- */

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

function StatCard({
  icon,
  value,
  label,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#2F7D4A"
        />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ---------------- Navigation Item ---------------- */

type NavItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
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
      style={styles.navItem}
    >
      <Ionicons
        name={icon}
        size={21}
        color={active ? '#2F7D4A' : '#8A958E'}
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
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B5137',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSubtitle: {
    color: '#B9D2C1',
    fontSize: 12,
    marginTop: 2,
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2F7D4A',
    marginRight: 5,
  },

  liveText: {
    color: '#2F7D4A',
    fontSize: 10,
    fontWeight: '800',
  },

  scrollContent: {
    padding: 16,
  },

  tokenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6EBE5',
  },

  tokenTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  smallLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A958E',
    letterSpacing: 1,
  },

  tokenNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#18352A',
    marginTop: 2,
  },

  tokenStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 15,
  },

  tokenStatusText: {
    color: '#2F7D4A',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#E9EDE9',
    marginVertical: 14,
  },

  queueRow: {
    flexDirection: 'row',
  },

  queueItem: {
    flex: 1,
  },

  queueLabel: {
    color: '#8A958E',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  queueValue: {
    color: '#18352A',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },

  verticalDivider: {
    width: 1,
    backgroundColor: '#E3E8E3',
    marginHorizontal: 20,
  },

  aiCard: {
    backgroundColor: '#FFF9EA',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F2E4C1',
    marginBottom: 20,
  },

  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0C9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  aiContent: {
    flex: 1,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiTitle: {
    color: '#6E531A',
    fontSize: 13,
    fontWeight: '800',
  },

  aiBadge: {
    backgroundColor: '#D99A27',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 7,
  },

  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },

  aiMainText: {
    color: '#5E543B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  aiTime: {
    color: '#9A6A12',
    fontWeight: '800',
  },

  aiSubText: {
    color: '#8B8061',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  sectionTitle: {
    color: '#18352A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 9,
  },

  updatedText: {
    color: '#8A958E',
    fontSize: 10,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6EBE5',
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLeft: {
    color: '#2F7D4A',
    fontSize: 13,
    fontWeight: '800',
  },

  progressRight: {
    color: '#D99A27',
    fontSize: 13,
    fontWeight: '800',
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#E8ECE8',
    borderRadius: 5,
    marginTop: 12,
    position: 'relative',
  },

  progressFill: {
    width: '68%',
    height: 8,
    backgroundColor: '#2F7D4A',
    borderRadius: 5,
  },

  progressMarker: {
    position: 'absolute',
    left: '65%',
    top: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF5DF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D99A27',
  },

  markerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D99A27',
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  progressText: {
    color: '#8A958E',
    fontSize: 10,
  },

  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6EBE5',
  },

  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },

  stageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stageContent: {
    flex: 1,
    marginLeft: 11,
  },

  stageTitle: {
    color: '#526057',
    fontSize: 13,
    fontWeight: '700',
  },

  currentStageTitle: {
    color: '#18352A',
    fontWeight: '800',
  },

  stageSubtitle: {
    color: '#8A958E',
    fontSize: 10,
    marginTop: 3,
  },

  stageLine: {
    width: 1,
    height: 13,
    backgroundColor: '#DCE3DD',
    marginLeft: 20,
  },

  currentBadge: {
    backgroundColor: '#FFF5DF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  currentBadgeText: {
    color: '#B37A14',
    fontSize: 8,
    fontWeight: '800',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EBE5',
  },

  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  statValue: {
    color: '#18352A',
    fontSize: 17,
    fontWeight: '800',
  },

  statLabel: {
    color: '#8A958E',
    fontSize: 9,
    marginTop: 3,
  },

  procurementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6EBE5',
  },

  procurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailText: {
    marginLeft: 11,
    flex: 1,
  },

  detailLabel: {
    color: '#8A958E',
    fontSize: 9,
  },

  detailValue: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9EA',
    borderRadius: 15,
    padding: 13,
    alignItems: 'flex-start',
  },

  noticeText: {
    flex: 1,
    color: '#6E6041',
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 9,
  },

  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E9E4',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 9,
  },

  navItem: {
    width: 62,
    alignItems: 'center',
  },

  navLabel: {
    color: '#8A958E',
    fontSize: 9,
    marginTop: 4,
  },

  activeNavLabel: {
    color: '#2F7D4A',
    fontWeight: '700',
  },

  centerTokenButton: {
    width: 62,
    alignItems: 'center',
    marginTop: -25,
  },

  tokenButtonCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2F7D4A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F6F8F3',
  },

  centerTokenLabel: {
    color: '#2F7D4A',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },
});