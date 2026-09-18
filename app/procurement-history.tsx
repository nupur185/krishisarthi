import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://krishisarthi-backend-32yz.onrender.com/api';

interface ProcurementPayment {
  id: number;
  amount: number | string | null;
  status: string;
  bankReference: string | null;
  initiatedAt: string | null;
  creditedAt: string | null;
}

interface ProcurementDetails {
  id: number;
  moisturePercent: number | string | null;
  foreignMatterPercent: number | string | null;
  damagedGrainsPercent: number | string | null;
  qualityGrade: string | null;
  grossWeightQuintals: number | string | null;
  tareWeightQuintals: number | string | null;
  netWeightQuintals: number | string | null;
  acceptedQuantityQuintals: number | string | null;
  mspPerQuintal: number | string | null;
  procurementAmount: number | string | null;
  status: string;
  completedAt: string | null;
  payment: ProcurementPayment | null;
}

interface BookingDetails {
  id: number;
  bookingId: string;
  commodity: string;
  quantityQuintals: number | string;
  tokenNumber: number | null;
  tokenStatus: string;
  status: string;
  bookedAt: string;
}

interface CenterDetails {
  id: number;
  name: string;
  address: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
}

interface SlotDetails {
  slotDate: string;
  startTime: string;
  endTime: string;
}

interface ProcurementRecord {
  booking: BookingDetails;
  center: CenterDetails;
  slot: SlotDetails;
  procurement: ProcurementDetails | null;
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatNumber(
  value: number | string | null | undefined,
  decimals = 2
) {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '--';
  }

  return numberValue.toFixed(decimals);
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) {
    return '--';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusLabel(status: string | null | undefined) {
  if (!status) {
    return 'Unknown';
  }

  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(status: string | null | undefined) {
  const normalized = status?.toUpperCase();

  if (
    normalized === 'COMPLETED' ||
    normalized === 'PAID' ||
    normalized === 'CREDITED' ||
    normalized === 'SUCCESS'
  ) {
    return styles.statusSuccess;
  }

  if (
    normalized === 'PENDING' ||
    normalized === 'PROCESSING' ||
    normalized === 'INITIATED'
  ) {
    return styles.statusPending;
  }

  if (
    normalized === 'FAILED' ||
    normalized === 'REJECTED' ||
    normalized === 'CANCELLED'
  ) {
    return styles.statusFailed;
  }

  return styles.statusNeutral;
}

export default function ProcurementHistoryScreen() {
  const [records, setRecords] = useState<ProcurementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchProcurementHistory = useCallback(async () => {
    try {
      setError('');

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/procurement/my`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'Failed to load procurement history'
        );
      }

      const fetchedRecords = Array.isArray(data?.data)
        ? data.data
        : [];

      setRecords(fetchedRecords);
    } catch (err) {
      console.error(
        'Procurement history error:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load procurement history'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProcurementHistory();
  }, [fetchProcurementHistory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProcurementHistory();
  };

  const renderProcurementCard = (
    record: ProcurementRecord,
    index: number
  ) => {
    const booking = record.booking;
    const procurement = record.procurement;
    const payment = procurement?.payment;

    return (
      <View
        key={`${booking.id}-${index}`}
        style={styles.card}
      >
        {/* Booking Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.commodity}>
              {booking.commodity}
            </Text>

            <Text style={styles.bookingId}>
              Booking ID: {booking.bookingId}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              getStatusStyle(
                procurement?.status || booking.status
              ),
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusLabel(
                procurement?.status || booking.status
              )}
            </Text>
          </View>
        </View>

        {/* Basic Booking Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Booking Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>
              {formatNumber(booking.quantityQuintals)} qtl
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Token</Text>
            <Text style={styles.value}>
              {booking.tokenNumber ?? '--'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Slot Date</Text>
            <Text style={styles.value}>
              {formatDate(record.slot.slotDate)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>
              {record.slot.startTime} - {record.slot.endTime}
            </Text>
          </View>
        </View>

        {/* Procurement Details */}
        {procurement ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Procurement Details
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>Quality Grade</Text>
              <Text style={styles.value}>
                {procurement.qualityGrade || '--'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Moisture</Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.moisturePercent
                )}{' '}
                %
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Foreign Matter
              </Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.foreignMatterPercent
                )}{' '}
                %
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Damaged Grains
              </Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.damagedGrainsPercent
                )}{' '}
                %
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Gross Weight
              </Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.grossWeightQuintals
                )}{' '}
                qtl
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Tare Weight
              </Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.tareWeightQuintals
                )}{' '}
                qtl
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Net Weight
              </Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.netWeightQuintals
                )}{' '}
                qtl
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Accepted Quantity
              </Text>
              <Text style={styles.value}>
                {formatNumber(
                  procurement.acceptedQuantityQuintals
                )}{' '}
                qtl
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                MSP / Quintal
              </Text>
              <Text style={styles.value}>
                ₹{formatNumber(procurement.mspPerQuintal)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Procurement Amount
              </Text>

              <Text style={styles.totalValue}>
                ₹
                {formatNumber(
                  procurement.procurementAmount
                )}
              </Text>
            </View>

            {procurement.completedAt ? (
              <View style={styles.row}>
                <Text style={styles.label}>
                  Completed On
                </Text>

                <Text style={styles.value}>
                  {formatDate(
                    procurement.completedAt
                  )}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingTitle}>
              Procurement Pending
            </Text>

            <Text style={styles.pendingText}>
              Quality and weightment details will
              appear here after procurement is
              completed.
            </Text>
          </View>
        )}

        {/* Payment Details */}
        {payment ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Payment Details
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>
                Payment Status
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  getStatusStyle(payment.status),
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(payment.status)}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Amount
              </Text>

              <Text style={styles.value}>
                ₹{formatNumber(payment.amount)}
              </Text>
            </View>

            {payment.bankReference ? (
              <View style={styles.row}>
                <Text style={styles.label}>
                  Bank Reference
                </Text>

                <Text style={styles.value}>
                  {payment.bankReference}
                </Text>
              </View>
            ) : null}

            {payment.creditedAt ? (
              <View style={styles.row}>
                <Text style={styles.label}>
                  Credited On
                </Text>

                <Text style={styles.value}>
                  {formatDate(payment.creditedAt)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : procurement ? (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingTitle}>
              Payment Pending
            </Text>

            <Text style={styles.pendingText}>
              Payment information will appear once
              the payment process is initiated.
            </Text>
          </View>
        ) : null}

        {/* Center */}
        <View style={styles.centerBox}>
          <Text style={styles.centerTitle}>
            Procurement Center
          </Text>

          <Text style={styles.centerName}>
            {record.center.name}
          </Text>

          {record.center.address ? (
            <Text style={styles.centerAddress}>
              {record.center.address}
            </Text>
          ) : null}

          {record.center.village ||
          record.center.district ? (
            <Text style={styles.centerAddress}>
              {[
                record.center.village,
                record.center.district,
                record.center.state,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading procurement history...
        </Text>
      </View>
    );
  }

  if (error && records.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Unable to load history
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Text
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            fetchProcurementHistory();
          }}
        >
          Try Again
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={styles.backButton}
          onPress={() => router.back()}
        >
          ‹
        </Text>

        <Text style={styles.headerTitle}>
          Procurement History
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.pageTitle}>
            Your Procurement Records
          </Text>

          <Text style={styles.pageSubtitle}>
            View your booking, procurement, quality,
            weightment and payment information.
          </Text>
        </View>

        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              📋
            </Text>

            <Text style={styles.emptyTitle}>
              No procurement records
            </Text>

            <Text style={styles.emptyText}>
              Your procurement history will appear
              here after you make a booking.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.recordCountBox}>
              <Text style={styles.recordCount}>
                {records.length}{' '}
                {records.length === 1
                  ? 'Record'
                  : 'Records'}
              </Text>
            </View>

            {records.map(renderProcurementCard)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F5',
  },

  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E9E3',
  },

  backButton: {
    fontSize: 34,
    width: 40,
    color: '#26352A',
    lineHeight: 38,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#26352A',
  },

  headerSpacer: {
    width: 40,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  intro: {
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#26352A',
    marginBottom: 6,
  },

  pageSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#69736C',
  },

  recordCountBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F2E7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 12,
  },

  recordCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#35613A',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E9E2',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  commodity: {
    fontSize: 20,
    fontWeight: '800',
    color: '#26352A',
    marginBottom: 4,
    textTransform: 'capitalize',
  },

  bookingId: {
    fontSize: 12,
    color: '#7A827C',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusSuccess: {
    backgroundColor: '#E3F2E4',
  },

  statusPending: {
    backgroundColor: '#FFF1D6',
  },

  statusFailed: {
    backgroundColor: '#FBE3E1',
  },

  statusNeutral: {
    backgroundColor: '#E9ECE9',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#354039',
  },

  section: {
    borderTopWidth: 1,
    borderTopColor: '#ECEFEA',
    paddingTop: 14,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34443A',
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },

  label: {
    flex: 1,
    fontSize: 13,
    color: '#747D76',
    paddingRight: 10,
  },

  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: '#2F3832',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7EAE5',
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#26352A',
  },

  totalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#35613A',
  },

  pendingBox: {
    backgroundColor: '#FFF9ED',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  pendingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#765A1D',
    marginBottom: 4,
  },

  pendingText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A7548',
  },

  centerBox: {
    backgroundColor: '#F5F8F3',
    borderRadius: 13,
    padding: 12,
    marginTop: 14,
  },

  centerTitle: {
    fontSize: 11,
    color: '#788078',
    marginBottom: 3,
  },

  centerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334238',
  },

  centerAddress: {
    fontSize: 12,
    color: '#687269',
    marginTop: 3,
    lineHeight: 17,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F5',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#69736C',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F7F8F5',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#26352A',
    marginBottom: 8,
  },

  errorText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#69736C',
    marginBottom: 20,
  },

  retryButton: {
    fontSize: 15,
    fontWeight: '800',
    color: '#35613A',
    padding: 10,
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E9E2',
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#26352A',
    marginBottom: 7,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#737C75',
  },
});