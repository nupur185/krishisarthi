import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://10.164.217.66:5000/api';

type CommodityPrice = {
  id: number;
  commodity: string;
  marketName: string;
  district: string;
  state: string;
  pricePerQuintal: string;
  unit: string;
  source: string | null;
  updatedAt: string;
  createdAt: string;
};

export default function CommodityPricesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCommodity, setSelectedCommodity] =
    useState('All');
  const [error, setError] = useState('');

  const commodities = ['All', 'Maize', 'Rice', 'Wheat'];

  // =========================================================
  // FETCH COMMODITY PRICES
  // =========================================================

  const fetchPrices = async () => {
    try {
      setError('');

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        setError(
          'Please login again to view commodity prices.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/commodity-prices`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            'Unable to fetch commodity prices'
        );
      }

      setPrices(result.data || []);
    } catch (err) {
      console.error(
        'Commodity prices error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load commodity prices'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchPrices();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrices();
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      const matchesCommodity =
        selectedCommodity === 'All' ||
        item.commodity.toLowerCase() ===
          selectedCommodity.toLowerCase();

      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        item.commodity
          .toLowerCase()
          .includes(searchText) ||
        item.marketName
          .toLowerCase()
          .includes(searchText) ||
        item.district
          .toLowerCase()
          .includes(searchText);

      return (
        matchesCommodity &&
        matchesSearch
      );
    });
  }, [
    prices,
    search,
    selectedCommodity,
  ]);

  // =========================================================
  // FORMAT UPDATED TIME
  // =========================================================

  const formatUpdatedTime = (
    dateString: string
  ) => {
    const date = new Date(dateString);

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // PRICE CARD
  // =========================================================

  const renderPriceCard = ({
    item,
  }: {
    item: CommodityPrice;
  }) => {
    return (
      <View style={styles.priceCard}>

        {/* =================================================
            TOP SECTION
        ================================================= */}

        <View style={styles.cardTop}>

          {/* Commodity icon */}

          <View style={styles.commodityIcon}>
            <Ionicons
              name="leaf-outline"
              size={22}
              color="#2E7D32"
            />
          </View>

          {/* Commodity + market */}

          <View style={styles.commodityInfo}>

            <Text
              style={styles.commodityName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              maxFontSizeMultiplier={1.15}
            >
              {item.commodity}
            </Text>

            <Text
              style={styles.marketName}
              numberOfLines={2}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.15}
            >
              {item.marketName}
            </Text>

          </View>

          {/* Price */}

          <View style={styles.priceContainer}>

            <Text
              style={styles.price}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              maxFontSizeMultiplier={1.15}
            >
              ₹
              {Number(
                item.pricePerQuintal
              ).toLocaleString('en-IN')}
            </Text>

            <Text
              style={styles.unit}
              numberOfLines={1}
              maxFontSizeMultiplier={1.1}
            >
              / {item.unit}
            </Text>

          </View>

        </View>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <View style={styles.divider} />

        {/* =================================================
            LOCATION
        ================================================= */}

        <View style={styles.infoRow}>

          <Ionicons
            name="location-outline"
            size={16}
            color="#777"
          />

          <Text
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={1.15}
          >
            {item.district}, {item.state}
          </Text>

        </View>

        {/* =================================================
            UPDATED TIME
        ================================================= */}

        <View style={styles.infoRow}>

          <Ionicons
            name="time-outline"
            size={15}
            color="#999"
          />

          <Text
            style={styles.updatedText}
            numberOfLines={1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={1.1}
          >
            Updated{' '}
            {formatUpdatedTime(
              item.updatedAt
            )}
          </Text>

        </View>

        {/* =================================================
            SOURCE
        ================================================= */}

        {item.source && (
          <Text
            style={styles.sourceText}
            numberOfLines={1}
            ellipsizeMode="tail"
            maxFontSizeMultiplier={1.1}
          >
            Source: {item.source}
          </Text>
        )}

      </View>
    );
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Loading market prices...
        </Text>
      </View>
    );
  }

  // =========================================================
  // MAIN SCREEN
  // =========================================================

  return (
    <View style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >

        {/* Back button */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#222"
          />
        </TouchableOpacity>

        {/* Header text */}

        <View style={styles.headerContent}>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            maxFontSizeMultiplier={1.15}
          >
            Commodity Prices
          </Text>

          <Text
            style={styles.headerSubtitle}
            numberOfLines={2}
            maxFontSizeMultiplier={1.1}
          >
            Check available mandi price information
          </Text>

        </View>

        {/* Refresh button */}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.75}
        >
          <Ionicons
            name="refresh-outline"
            size={21}
            color="#2E7D32"
          />
        </TouchableOpacity>

      </View>

      {/* =====================================================
          DEMO DATA NOTICE
      ===================================================== */}

      <View style={styles.notice}>

        <Ionicons
          name="information-circle-outline"
          size={19}
          color="#8A6D3B"
        />

        <Text
          style={styles.noticeText}
          maxFontSizeMultiplier={1.1}
        >
          Prices shown are development/demo market data.
        </Text>

      </View>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search-outline"
          size={20}
          color="#777"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search commodity or mandi"
          placeholderTextColor="#999"
          style={styles.searchInput}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}

      </View>

      {/* =====================================================
          COMMODITY FILTERS
      ===================================================== */}

      <FlatList
        data={commodities}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={
          styles.filterList
        }
        renderItem={({ item }) => {
          const active =
            selectedCommodity === item;

          return (
            <TouchableOpacity
              style={[
                styles.filterButton,
                active &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setSelectedCommodity(item)
              }
              activeOpacity={0.75}
            >

              <Text
                style={[
                  styles.filterText,
                  active &&
                    styles.filterTextActive,
                ]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.1}
              >
                {item}
              </Text>

            </TouchableOpacity>
          );
        }}
      />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error ? (

        <View style={styles.errorContainer}>

          <Ionicons
            name="alert-circle-outline"
            size={28}
            color="#C62828"
          />

          <Text
            style={styles.errorText}
            maxFontSizeMultiplier={1.1}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPrices}
            activeOpacity={0.8}
          >
            <Text
              style={styles.retryText}
              maxFontSizeMultiplier={1.1}
            >
              Retry
            </Text>
          </TouchableOpacity>

        </View>

      ) : (

        /* ===================================================
           PRICE LIST
        =================================================== */

        <FlatList
          data={filteredPrices}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderPriceCard}
          contentContainerStyle={
            styles.priceList
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E7D32']}
            />
          }

          ListHeaderComponent={
            <Text
              style={styles.resultCount}
              maxFontSizeMultiplier={1.1}
            >
              {filteredPrices.length}{' '}
              {filteredPrices.length === 1
                ? 'price'
                : 'prices'}{' '}
              available
            </Text>
          }

          ListEmptyComponent={
            <View
              style={styles.emptyContainer}
            >

              <View
                style={styles.emptyIcon}
              >
                <Ionicons
                  name="search-outline"
                  size={30}
                  color="#999"
                />
              </View>

              <Text
                style={styles.emptyTitle}
                maxFontSizeMultiplier={1.1}
              >
                No prices found
              </Text>

              <Text
                style={styles.emptyText}
                maxFontSizeMultiplier={1.1}
              >
                Try another commodity, mandi
                or district.
              </Text>

            </View>
          }

        />

      )}

    </View>
  );
}

// ===========================================================
// STYLES
// ===========================================================

const styles = StyleSheet.create({

  // =========================================================
  // CONTAINER
  // =========================================================

  container: {
    flex: 1,
    backgroundColor: '#F7F8F5',
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    minHeight: 82,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#1B1B1B',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#777',
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  // =========================================================
  // NOTICE
  // =========================================================

  notice: {
    marginHorizontal: 20,
    marginBottom: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF7E6',
    flexDirection: 'row',
    alignItems: 'center',
  },

  noticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 17,
    color: '#6F5A2C',
  },

  // =========================================================
  // SEARCH
  // =========================================================

  searchContainer: {
    marginHorizontal: 20,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    marginRight: 7,
    fontSize: 14,
    color: '#222',
    paddingVertical: 0,
  },

  // =========================================================
  // FILTERS
  // =========================================================

  filterList: {
    paddingHorizontal: 20,
    paddingVertical: 13,
  },

  filterButton: {
    minWidth: 76,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  // =========================================================
  // PRICE LIST
  // =========================================================

  priceList: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  resultCount: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },

  // =========================================================
  // PRICE CARD
  // =========================================================

  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  cardTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  commodityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF4EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  commodityInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },

  commodityName: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: '#222',
  },

  marketName: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#777',
  },

  priceContainer: {
    width: 105,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  price: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'right',
  },

  unit: {
    marginTop: 2,
    fontSize: 11,
    color: '#888',
  },

  // =========================================================
  // DIVIDER
  // =========================================================

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },

  // =========================================================
  // INFORMATION ROWS
  // =========================================================

  infoRow: {
    width: '100%',
    minHeight: 22,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },

  updatedText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
    fontSize: 11,
    color: '#999',
  },

  sourceText: {
    marginTop: 2,
    fontSize: 10,
    color: '#999',
  },

  // =========================================================
  // LOADING
  // =========================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
    fontSize: 14,
  },

  // =========================================================
  // ERROR
  // =========================================================

  errorContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: '#FFF0F0',
    borderRadius: 14,
    alignItems: 'center',
  },

  errorText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#B71C1C',
    fontSize: 13,
    lineHeight: 18,
  },

  retryButton: {
    marginTop: 12,
    backgroundColor: '#C62828',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // =========================================================
  // EMPTY STATE
  // =========================================================

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 65,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '600',
    color: '#444',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#888',
  },
});