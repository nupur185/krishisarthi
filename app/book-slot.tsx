import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Center = {
  id: string;
  name: string;
  location: string;
  distance: string;
  waitTime: number;
  slots: number;
  recommended?: boolean;
};


const API_URL = 'https://krishisarthi-backend-32yz.onrender.com';

export default function BookSlotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'nearby' | 'all'>('nearby');
  const [search, setSearch] = useState('');

  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchCenters() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/centers`);

        if (!response.ok) {
          throw new Error('Failed to fetch procurement centers');
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || 'Invalid centers response');
        }

        const centersWithSlots = await Promise.all(
          result.data.map(async (center: any) => {
            let slotsLeft = 0;

            try {
              const slotsResponse = await fetch(
                `${API_URL}/api/slots/center/${center.id}`
              );

              if (slotsResponse.ok) {
                const slotsResult = await slotsResponse.json();

                if (slotsResult.success && Array.isArray(slotsResult.data)) {
                  slotsLeft = slotsResult.data.reduce(
                    (total: number, slot: any) =>
                      total + Math.max(
                        Number(slot.capacity) - Number(slot.bookedCount),
                        0
                      ),
                    0
                  );
                }
              }
            } catch (slotError) {
              console.error(
                `Failed to fetch slots for center ${center.id}:`,
                slotError
              );
            }

            return {
              id: String(center.id),
              name: center.name,
              location: `${center.district}, ${center.state}`,
              distance: '—',
              waitTime: Number(center.avgServiceMinutes) || 0,
              slots: slotsLeft,
              recommended: false,
            };
          })
        );

        if (!isMounted) return;

        // Temporary recommendation rule until the ML service is connected:
        // prefer the center with the lowest estimated service time,
        // then the highest available slot capacity.
        const recommendedIndex = centersWithSlots.reduce(
          (bestIndex: number, center: Center, index: number, all: Center[]) => {
            if (bestIndex === -1) return index;

            const best = all[bestIndex];

            if (center.waitTime < best.waitTime) return index;
            if (
              center.waitTime === best.waitTime &&
              center.slots > best.slots
            ) {
              return index;
            }

            return bestIndex;
          },
          -1
        );

        if (recommendedIndex >= 0) {
          centersWithSlots[recommendedIndex].recommended = true;
        }

        setCenters(centersWithSlots);
      } catch (err) {
        console.error('Fetch centers error:', err);

        if (isMounted) {
          setError('Unable to load procurement centers');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCenters();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCenters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return centers;

    return centers.filter(
      (center) =>
        center.name.toLowerCase().includes(query) ||
        center.location.toLowerCase().includes(query)
    );
  }, [search, centers]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="refresh-outline" size={32} color="#2F7D4A" />
        <Text style={styles.loadingText}>
          Loading procurement centers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons
          name="alert-circle-outline"
          size={40}
          color="#C62828"
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#18352A" />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Book a Slot</Text>
          <Text style={styles.headerSubtitle}>
            Choose a procurement center
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={22} color="#2F7D4A" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location */}
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color="#2F7D4A" />
          </View>

          <View>
            <Text style={styles.locationLabel}>YOUR LOCATION</Text>
            <Text style={styles.locationText}>Muzaffarpur, Bihar</Text>
          </View>

          <Pressable style={styles.changeButton}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'nearby' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('nearby')}
          >
            <Ionicons
              name="navigate-outline"
              size={17}
              color={activeTab === 'nearby' ? '#FFFFFF' : '#587064'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'nearby' && styles.activeTabText,
              ]}
            >
              Nearby Centers
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tab,
              activeTab === 'all' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Ionicons
              name="grid-outline"
              size={17}
              color={activeTab === 'all' ? '#FFFFFF' : '#587064'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              All Centers
            </Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#7A8B83" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search procurement center"
            placeholderTextColor="#9AA7A1"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color="#8A9991"
              />
            </Pressable>
          )}
        </View>

        {/* Section heading */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Available Centers</Text>
            <Text style={styles.sectionSubtitle}>
              Select a center based on distance and waiting time
            </Text>
          </View>

          <View style={styles.centerCount}>
            <Text style={styles.centerCountText}>
              {filteredCenters.length}
            </Text>
          </View>
        </View>

        {/* Center Cards */}
        {filteredCenters.map((center) => (
          <View key={center.id} style={styles.centerCard}>
            {/* Recommended label */}
            {center.recommended && (
              <View style={styles.recommendedBadge}>
                <Ionicons name="sparkles" size={13} color="#8B5A00" />
                <Text style={styles.recommendedText}>AI BEST OPTION</Text>
              </View>
            )}

            <View style={styles.centerTopRow}>
              <View style={styles.centerIcon}>
                <Ionicons name="business-outline" size={24} color="#2F7D4A" />
              </View>

              <View style={styles.centerInfo}>
                <Text style={styles.centerName}>{center.name}</Text>

                <View style={styles.locationSmallRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#7A8B83"
                  />
                  <Text style={styles.centerLocation}>
                    {center.location}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color="#2F7D4A"
                />

                <View>
                  <Text style={styles.statLabel}>DISTANCE</Text>
                  <Text style={styles.statValue}>{center.distance}</Text>
                </View>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.statItem}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color="#D99A27"
                />

                <View>
                  <Text style={styles.statLabel}>EST. WAIT</Text>
                  <Text style={styles.statValue}>
                    {center.waitTime} min
                  </Text>
                </View>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.statItem}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color="#2F7D4A"
                />

                <View>
                  <Text style={styles.statLabel}>SLOTS</Text>
                  <Text style={styles.statValue}>
                    {center.slots} left
                  </Text>
                </View>
              </View>
            </View>

            {/* AI Insight */}
            {center.recommended && (
              <View style={styles.aiInsight}>
                <View style={styles.aiIcon}>
                  <Ionicons
                    name="bulb-outline"
                    size={16}
                    color="#A96F00"
                  />
                </View>

                <Text style={styles.aiText}>
                  Lower waiting time and good slot availability
                </Text>
              </View>
            )}

            {/* Button */}
            <Pressable
              style={({ pressed }) => [
                styles.proceedButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
  router.push({
    pathname: '/select-slot',
    params: {
      centerId: center.id,
      centerName: center.name,
    },
  })
}
            >
              <Text style={styles.proceedText}>Proceed to Book</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        ))}

        {/* No results */}
        {filteredCenters.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={40}
              color="#9AA7A1"
            />

            <Text style={styles.emptyTitle}>
              No centers found
            </Text>

            <Text style={styles.emptyText}>
              Try searching with a different center name or location.
            </Text>
          </View>
        )}

        {/* Bottom note */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#2F7D4A"
          />

          <Text style={styles.infoText}>
            Waiting times are estimated using current queue and
            historical center data.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#587064',
  },

  errorText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
    textAlign: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECE7',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0F4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18352A',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#718078',
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 35,
  },

  locationRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7ECE7',
  },

  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  locationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A9891',
    letterSpacing: 0.8,
  },

  locationText: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: '#18352A',
  },

  changeButton: {
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F7D4A',
  },

  tabsContainer: {
    marginTop: 17,
    backgroundColor: '#E9EEE9',
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
  },

  tab: {
    flex: 1,
    minHeight: 43,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  activeTab: {
    backgroundColor: '#2F7D4A',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#587064',
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  searchBox: {
    marginTop: 15,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E1E8E1',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: '#18352A',
  },

  sectionHeader: {
    marginTop: 23,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18352A',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#7B8982',
  },

  centerCount: {
    marginLeft: 'auto',
    minWidth: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2F7D4A',
  },

  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E3E9E3',
  },

  recommendedBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF4D9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },

  recommendedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8B5A00',
    letterSpacing: 0.6,
  },

  centerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  centerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  centerInfo: {
    flex: 1,
  },

  centerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18352A',
  },

  locationSmallRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  centerLocation: {
    fontSize: 11,
    color: '#7B8982',
  },

  statsRow: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  statLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#97A39D',
    letterSpacing: 0.4,
  },

  statValue: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '800',
    color: '#18352A',
  },

  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E8EDE8',
    marginHorizontal: 5,
  },

  aiInsight: {
    marginTop: 13,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF8E8',
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FFE9AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  aiText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    color: '#765414',
  },

  proceedButton: {
    marginTop: 13,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#2F7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  proceedText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 35,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#18352A',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#7B8982',
  },

  infoBox: {
    marginTop: 5,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 10,
    lineHeight: 15,
    color: '#41604F',
  },
});