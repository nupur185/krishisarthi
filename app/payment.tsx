import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.164.217.66:5000';

/* ---------------- Types ---------------- */

type ProcurementStatus =
  | 'NOT_STARTED'
  | 'QUALITY_CHECK'
  | 'WEIGHTMENT'
  | 'FINALIZATION'
  | 'COMPLETED'
  | 'REJECTED';

type PaymentStatus =
  | 'NOT_STARTED'
  | 'PROCESSING'
  | 'INITIATED'
  | 'CREDITED'
  | 'FAILED';

type ProcurementData = {
  bookingId: number;
  bookingReference: string;
  tokenNumber: string;
  commodity: string;
  quantityQuintals: number;
  slotDate: string;
  startTime: string;
  endTime: string;

  center: {
    id: number;
    name: string;
    address?: string | null;
    village?: string | null;
    district?: string | null;
    state?: string | null;
  };

  procurement: {
    status: ProcurementStatus;

    moisturePercent?: number | null;
    foreignMatterPercent?: number | null;
    damagedGrainsPercent?: number | null;
    qualityGrade?: string | null;

    grossWeightQuintals?: number | null;
    tareWeightQuintals?: number | null;
    netWeightQuintals?: number | null;

    acceptedQuantityQuintals?: number | null;
    mspPerQuintal?: number | null;
    procurementAmount?: number | null;

    createdAt?: string | null;
    updatedAt?: string | null;
    completedAt?: string | null;

    payment?: {
      amount: number;
      status: PaymentStatus;
      bankReference?: string | null;
      initiatedAt?: string | null;
      creditedAt?: string | null;
      createdAt?: string | null;
      updatedAt?: string | null;
    } | null;
  } | null;
};

/* ---------------- Helpers ---------------- */

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function formatMoney(value: unknown): string {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '—';
  }

  return `₹${numberValue.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

function formatQuantityQuintals(value: unknown): string {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '—';
  }

  return `${numberValue.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })} qtl`;
}

function formatDateTime(
  value?: string | null
): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnly(
  value?: string | null
): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ---------------- Payment Helpers ---------------- */

function getPaymentStatusLabel(
  status?: PaymentStatus
): string {
  switch (status) {
    case 'PROCESSING':
      return 'Processing';

    case 'INITIATED':
      return 'Payment Initiated';

    case 'CREDITED':
      return 'Credited';

    case 'FAILED':
      return 'Payment Failed';

    case 'NOT_STARTED':
    default:
      return 'Not Started';
  }
}

function getPaymentStatusColor(
  status?: PaymentStatus
): string {
  switch (status) {
    case 'CREDITED':
      return '#2F7D4A';

    case 'FAILED':
      return '#B84A3A';

    case 'INITIATED':
      return '#D99A27';

    case 'PROCESSING':
      return '#4C7A5A';

    default:
      return '#7C8A82';
  }
}

function getPaymentStatusIcon(
  status?: PaymentStatus
): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case 'CREDITED':
      return 'checkmark';

    case 'FAILED':
      return 'close';

    case 'INITIATED':
      return 'arrow-forward';

    case 'PROCESSING':
      return 'time-outline';

    default:
      return 'ellipse-outline';
  }
}

/* ---------------- Procurement Helpers ---------------- */

function getProcurementStatusLabel(
  status?: ProcurementStatus
): string {
  switch (status) {
    case 'QUALITY_CHECK':
      return 'Quality Check';

    case 'WEIGHTMENT':
      return 'Weightment';

    case 'FINALIZATION':
      return 'Finalization';

    case 'COMPLETED':
      return 'Procurement Completed';

    case 'REJECTED':
      return 'Rejected';

    case 'NOT_STARTED':
    default:
      return 'Not Started';
  }
}

/* ---------------- Main Screen ---------------- */

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [procurement, setProcurement] =
    useState<ProcurementData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Fetch Procurement ---------------- */

  const fetchProcurement = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const token =
          await SecureStore.getItemAsync('authToken');

        if (!token) {
          throw new Error(
            'Authentication session not found. Please login again.'
          );
        }

        const response = await fetch(
          `${API_URL}/api/procurement/my`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              'Unable to fetch procurement status.'
          );
        }

        const records = Array.isArray(data.data)
          ? data.data
          : [];

        /*
         * The API returns the farmer's procurement records.
         * We display the most recent record first.
         */
        if (records.length === 0) {
          setProcurement(null);
          return;
        }

        const latestRecord = records[0];

        setProcurement({
          bookingId: latestRecord.bookingId,
          bookingReference:
            latestRecord.bookingReference,
          tokenNumber: latestRecord.tokenNumber,
          commodity: latestRecord.commodity,
          quantityQuintals:
            toNumber(
              latestRecord.quantityQuintals
            ) ?? 0,

          slotDate: latestRecord.slotDate,
          startTime: latestRecord.startTime,
          endTime: latestRecord.endTime,

          center: {
            id: latestRecord.center?.id,
            name:
              latestRecord.center?.name ||
              'Procurement Center',
            address:
              latestRecord.center?.address,
            village:
              latestRecord.center?.village,
            district:
              latestRecord.center?.district,
            state:
              latestRecord.center?.state,
          },

          procurement: latestRecord.procurement
            ? {
                status:
                  latestRecord.procurement.status,

                moisturePercent:
                  toNumber(
                    latestRecord.procurement
                      .moisturePercent
                  ),

                foreignMatterPercent:
                  toNumber(
                    latestRecord.procurement
                      .foreignMatterPercent
                  ),

                damagedGrainsPercent:
                  toNumber(
                    latestRecord.procurement
                      .damagedGrainsPercent
                  ),

                qualityGrade:
                  latestRecord.procurement
                    .qualityGrade,

                grossWeightQuintals:
                  toNumber(
                    latestRecord.procurement
                      .grossWeightQuintals
                  ),

                tareWeightQuintals:
                  toNumber(
                    latestRecord.procurement
                      .tareWeightQuintals
                  ),

                netWeightQuintals:
                  toNumber(
                    latestRecord.procurement
                      .netWeightQuintals
                  ),

                acceptedQuantityQuintals:
                  toNumber(
                    latestRecord.procurement
                      .acceptedQuantityQuintals
                  ),

                mspPerQuintal:
                  toNumber(
                    latestRecord.procurement
                      .mspPerQuintal
                  ),

                procurementAmount:
                  toNumber(
                    latestRecord.procurement
                      .procurementAmount
                  ),

                createdAt:
                  latestRecord.procurement
                    .createdAt,

                updatedAt:
                  latestRecord.procurement
                    .updatedAt,

                completedAt:
                  latestRecord.procurement
                    .completedAt,

                payment:
                  latestRecord.procurement.payment
                    ? {
                        amount:
                          toNumber(
                            latestRecord
                              .procurement
                              .payment.amount
                          ) ?? 0,

                        status:
                          latestRecord.procurement
                            .payment.status,

                        bankReference:
                          latestRecord.procurement
                            .payment.bankReference,

                        initiatedAt:
                          latestRecord.procurement
                            .payment.initiatedAt,

                        creditedAt:
                          latestRecord.procurement
                            .payment.creditedAt,

                        createdAt:
                          latestRecord.procurement
                            .payment.createdAt,

                        updatedAt:
                          latestRecord.procurement
                            .payment.updatedAt,
                      }
                    : null,
              }
            : null,
        });
      } catch (err) {
        console.error(
          'Payment screen procurement error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load procurement status.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProcurement();
  }, [fetchProcurement]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProcurement(false);
  };

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>
              Payment & Updates
            </Text>

            <Text style={styles.headerSubtitle}>
              Procurement payment status
            </Text>
          </View>
        </View>

        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color="#2F7D4A"
          />

          <Text style={styles.stateText}>
            Loading procurement status...
          </Text>
        </View>
      </View>
    );
  }

  /* ---------------- Error ---------------- */

  if (error) {
    return (
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>
              Payment & Updates
            </Text>

            <Text style={styles.headerSubtitle}>
              Procurement payment status
            </Text>
          </View>
        </View>

        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color="#B84A3A"
            />
          </View>

          <Text style={styles.stateTitle}>
            Unable to load status
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => fetchProcurement()}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  /* ---------------- Empty ---------------- */

  if (!procurement) {
    return (
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>
              Payment & Updates
            </Text>

            <Text style={styles.headerSubtitle}>
              Procurement payment status
            </Text>
          </View>
        </View>

        <View style={styles.centerState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="receipt-outline"
              size={34}
              color="#2F7D4A"
            />
          </View>

          <Text style={styles.stateTitle}>
            No procurement record yet
          </Text>

          <Text style={styles.stateText}>
            Your procurement and payment details will
            appear here after your produce is processed.
          </Text>
        </View>
      </View>
    );
  }

  /* ---------------- Data ---------------- */

  const procurementRecord =
    procurement.procurement;

  const payment =
    procurementRecord?.payment;

  const paymentStatus =
    payment?.status ?? 'NOT_STARTED';

  const paymentStatusLabel =
    getPaymentStatusLabel(paymentStatus);

  const paymentColor =
    getPaymentStatusColor(paymentStatus);

  const paymentIcon =
    getPaymentStatusIcon(paymentStatus);

  const netQuantity =
    procurementRecord?.netWeightQuintals ??
    procurementRecord?.acceptedQuantityQuintals ??
    procurement.quantityQuintals;

  const msp =
    procurementRecord?.mspPerQuintal;

  const amount =
    payment?.amount ??
    procurementRecord?.procurementAmount;

  const centerLocation = [
    procurement.center.village,
    procurement.center.district,
    procurement.center.state,
  ]
    .filter(Boolean)
    .join(', ');

  const procurementCompleted =
    procurementRecord?.status === 'COMPLETED';

  const paymentProcessing =
    paymentStatus === 'PROCESSING' ||
    paymentStatus === 'INITIATED' ||
    paymentStatus === 'CREDITED';

  const paymentInitiated =
    paymentStatus === 'INITIATED' ||
    paymentStatus === 'CREDITED';

  const paymentCredited =
    paymentStatus === 'CREDITED';

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
          <Text style={styles.headerTitle}>
            Payment & Updates
          </Text>

          <Text style={styles.headerSubtitle}>
            Procurement payment status
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2F7D4A"
          />
        }
      >
        {/* Payment Status Card */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentTopRow}>
            <View>
              <Text style={styles.paymentLabel}>
                PAYMENT STATUS
              </Text>

              <Text style={styles.paymentStatus}>
                {paymentStatusLabel}
              </Text>
            </View>

            <View
              style={[
                styles.successIcon,
                {
                  backgroundColor: paymentColor,
                },
              ]}
            >
              <Ionicons
                name={paymentIcon}
                size={26}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.amount}>
            {formatMoney(amount)}
          </Text>

          <Text style={styles.creditText}>
            {paymentCredited
              ? 'Amount credited to your registered bank account'
              : paymentStatus === 'FAILED'
              ? 'Payment could not be credited. Please contact the procurement centre.'
              : paymentStatus === 'INITIATED'
              ? 'Payment has been initiated to your registered bank account'
              : paymentStatus === 'PROCESSING'
              ? 'Your payment is being processed'
              : 'Payment will be processed after procurement is completed'}
          </Text>

          {payment?.bankReference ? (
            <View style={styles.referenceBox}>
              <Text style={styles.referenceLabel}>
                Bank Reference
              </Text>

              <Text style={styles.referenceValue}>
                {payment.bankReference}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Procurement Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Procurement Summary
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="leaf-outline"
                  size={20}
                  color="#2F7D4A"
                />
              </View>

              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>
                  Commodity
                </Text>

                <Text style={styles.summaryValue}>
                  {procurement.commodity}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="scale-outline"
                  size={20}
                  color="#2F7D4A"
                />
              </View>

              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>
                  Net Quantity
                </Text>

                <Text style={styles.summaryValue}>
                  {formatQuantityQuintals(netQuantity)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color="#2F7D4A"
                />
              </View>

              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>
                  MSP Rate
                </Text>

                <Text style={styles.summaryValue}>
                  {msp !== null && msp !== undefined
                    ? `${formatMoney(msp)} / qtl`
                    : '—'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#2F7D4A"
                />
              </View>

              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>
                  Procurement Center
                </Text>

                <Text style={styles.summaryValue}>
                  {procurement.center.name}
                </Text>

                <Text style={styles.summarySubtext}>
                  {centerLocation ||
                    procurement.center.address ||
                    'Location unavailable'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="ticket-outline"
                  size={20}
                  color="#2F7D4A"
                />
              </View>

              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>
                  Booking Reference
                </Text>

                <Text style={styles.summaryValue}>
                  {procurement.bookingReference}
                </Text>

                <Text style={styles.summarySubtext}>
                  Token {procurement.tokenNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Procurement Status */}
        {procurementRecord ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Procurement Status
            </Text>

            <View style={styles.procurementStatusCard}>
              <View style={styles.procurementStatusIcon}>
                <Ionicons
                  name={
                    procurementCompleted
                      ? 'checkmark-circle'
                      : 'time-outline'
                  }
                  size={27}
                  color={
                    procurementCompleted
                      ? '#2F7D4A'
                      : '#D99A27'
                  }
                />
              </View>

              <View style={styles.procurementStatusText}>
                <Text style={styles.procurementStatusTitle}>
                  {getProcurementStatusLabel(
                    procurementRecord.status
                  )}
                </Text>

                <Text style={styles.procurementStatusSubtitle}>
                  {procurementCompleted
                    ? 'Your produce has completed the procurement process.'
                    : 'Your produce is currently being processed at the procurement centre.'}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Payment Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment Timeline
          </Text>

          <View style={styles.timelineCard}>
            {/* Step 1 */}
            <TimelineItem
              icon={
                procurementCompleted
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              title="Procurement Completed"
              subtitle={
                procurementRecord?.completedAt
                  ? formatDateTime(
                      procurementRecord.completedAt
                    )
                  : procurementCompleted
                  ? 'Completed'
                  : 'Pending'
              }
              completed={procurementCompleted}
            />

            <View style={styles.timelineLine} />

            {/* Step 2 */}
            <TimelineItem
              icon={
                paymentProcessing
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              title="Payment Processing"
              subtitle={
                paymentProcessing
                  ? payment?.createdAt
                    ? formatDateTime(
                        payment.createdAt
                      )
                    : 'Payment processing'
                  : 'Pending'
              }
              completed={paymentProcessing}
            />

            <View style={styles.timelineLine} />

            {/* Step 3 */}
            <TimelineItem
              icon={
                paymentInitiated
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              title="Payment Initiated"
              subtitle={
                paymentInitiated
                  ? payment?.initiatedAt
                    ? formatDateTime(
                        payment.initiatedAt
                      )
                    : 'Payment initiated'
                  : 'Pending'
              }
              completed={paymentInitiated}
            />

            <View style={styles.timelineLine} />

            {/* Step 4 */}
            <TimelineItem
              icon={
                paymentCredited
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              title="Credited to Bank"
              subtitle={
                paymentCredited
                  ? payment?.creditedAt
                    ? formatDateTime(
                        payment.creditedAt
                      )
                    : 'Amount credited'
                  : 'Pending'
              }
              completed={paymentCredited}
            />
          </View>
        </View>

        {/* Procurement Details */}
        {procurementRecord ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Procurement Details
            </Text>

            <View style={styles.summaryCard}>
              {procurementRecord.qualityGrade ? (
                <>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color="#2F7D4A"
                      />
                    </View>

                    <View style={styles.summaryText}>
                      <Text style={styles.summaryLabel}>
                        Quality Grade
                      </Text>

                      <Text style={styles.summaryValue}>
                        Grade{' '}
                        {procurementRecord.qualityGrade}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </>
              ) : null}

              {procurementRecord.grossWeightQuintals !==
                null &&
              procurementRecord.grossWeightQuintals !==
                undefined ? (
                <>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <Ionicons
                        name="barbell-outline"
                        size={20}
                        color="#2F7D4A"
                      />
                    </View>

                    <View style={styles.summaryText}>
                      <Text style={styles.summaryLabel}>
                        Gross Weight
                      </Text>

                      <Text style={styles.summaryValue}>
                        {formatQuantityQuintals(
                          procurementRecord.grossWeightQuintals
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </>
              ) : null}

              {procurementRecord.tareWeightQuintals !==
                null &&
              procurementRecord.tareWeightQuintals !==
                undefined ? (
                <>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color="#2F7D4A"
                      />
                    </View>

                    <View style={styles.summaryText}>
                      <Text style={styles.summaryLabel}>
                        Tare Weight
                      </Text>

                      <Text style={styles.summaryValue}>
                        {formatQuantityQuintals(
                          procurementRecord.tareWeightQuintals
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </>
              ) : null}

              {procurementRecord.netWeightQuintals !==
                null &&
              procurementRecord.netWeightQuintals !==
                undefined ? (
                <>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <Ionicons
                        name="scale-outline"
                        size={20}
                        color="#2F7D4A"
                      />
                    </View>

                    <View style={styles.summaryText}>
                      <Text style={styles.summaryLabel}>
                        Final Net Weight
                      </Text>

                      <Text style={styles.summaryValue}>
                        {formatQuantityQuintals(
                          procurementRecord.netWeightQuintals
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </>
              ) : null}

              {procurementRecord.acceptedQuantityQuintals !==
                null &&
              procurementRecord.acceptedQuantityQuintals !==
                undefined ? (
                <>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#2F7D4A"
                      />
                    </View>

                    <View style={styles.summaryText}>
                      <Text style={styles.summaryLabel}>
                        Accepted Quantity
                      </Text>

                      <Text style={styles.summaryValue}>
                        {formatQuantityQuintals(
                          procurementRecord.acceptedQuantityQuintals
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </>
              ) : null}

              <View style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color="#2F7D4A"
                  />
                </View>

                <View style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>
                    Procurement Amount
                  </Text>

                  <Text style={styles.summaryValue}>
                    {formatMoney(
                      procurementRecord.procurementAmount
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Documents
          </Text>

          <View style={styles.documentsCard}>
            <DocumentRow
              icon="document-text-outline"
              title="Quality Report"
              subtitle="View procurement quality details"
            />

            <View style={styles.divider} />

            <DocumentRow
              icon="receipt-outline"
              title="Weight Slip"
              subtitle="View final weightment record"
            />

            <View style={styles.divider} />

            <DocumentRow
              icon="download-outline"
              title="Payment Receipt"
              subtitle="Download payment receipt"
            />
          </View>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackIcon}>
            <Ionicons
              name="star-outline"
              size={23}
              color="#D99A27"
            />
          </View>

          <View style={styles.feedbackTextContainer}>
            <Text style={styles.feedbackTitle}>
              How was your experience?
            </Text>

            <Text style={styles.feedbackSubtitle}>
              Your feedback helps improve procurement
              services.
            </Text>
          </View>

          <Pressable style={styles.feedbackButton}>
            <Text style={styles.feedbackButtonText}>
              Rate
            </Text>
          </Pressable>
        </View>

        {/* Grievance */}
        <Pressable
          style={styles.grievanceCard}
          onPress={() => router.push('/grievance')}
        >
          <View style={styles.grievanceIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#B84A3A"
            />
          </View>

          <View style={styles.grievanceText}>
            <Text style={styles.grievanceTitle}>
              Facing an issue?
            </Text>

            <Text style={styles.grievanceSubtitle}>
              Raise a grievance about payment, quality
              or weightment.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#7C8A82"
          />
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ---------------- Timeline Item ---------------- */

type TimelineItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  completed?: boolean;
};

function TimelineItem({
  icon,
  title,
  subtitle,
  completed,
}: TimelineItemProps) {
  return (
    <View style={styles.timelineItem}>
      <View
        style={[
          styles.timelineIcon,
          completed && styles.timelineIconCompleted,
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={completed ? '#2F7D4A' : '#9AA59E'}
        />
      </View>

      <View style={styles.timelineText}>
        <Text style={styles.timelineTitle}>
          {title}
        </Text>

        <Text style={styles.timelineSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Document Row ---------------- */

type DocumentRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

function DocumentRow({
  icon,
  title,
  subtitle,
}: DocumentRowProps) {
  return (
    <Pressable style={styles.documentRow}>
      <View style={styles.documentIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2F7D4A"
        />
      </View>

      <View style={styles.documentText}>
        <Text style={styles.documentTitle}>
          {title}
        </Text>

        <Text style={styles.documentSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#7C8A82"
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

  /* States */

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  stateTitle: {
    color: '#18352A',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 15,
    textAlign: 'center',
  },

  stateText: {
    color: '#7C8A82',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },

  errorIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FCEDEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryButton: {
    backgroundColor: '#2F7D4A',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
    marginTop: 18,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Payment */

  paymentCard: {
    backgroundColor: '#123B2A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  paymentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentLabel: {
    color: '#AFC7BA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  paymentStatus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },

  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  amount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 20,
  },

  creditText: {
    color: '#C8D9CF',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  referenceBox: {
    backgroundColor: '#1B5137',
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },

  referenceLabel: {
    color: '#AFC7BA',
    fontSize: 11,
  },

  referenceValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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

  /* Summary */

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  summaryText: {
    flex: 1,
  },

  summaryLabel: {
    color: '#7C8A82',
    fontSize: 11,
  },

  summaryValue: {
    color: '#18352A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },

  summarySubtext: {
    color: '#7C8A82',
    fontSize: 11,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0EC',
  },

  /* Procurement Status */

  procurementStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  procurementStatusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  procurementStatusText: {
    flex: 1,
    marginLeft: 12,
  },

  procurementStatusTitle: {
    color: '#18352A',
    fontSize: 14,
    fontWeight: '700',
  },

  procurementStatusSubtitle: {
    color: '#7C8A82',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  /* Timeline */

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timelineIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineIconCompleted: {
    backgroundColor: '#EAF4EC',
    borderRadius: 19,
  },

  timelineText: {
    flex: 1,
    marginLeft: 10,
  },

  timelineTitle: {
    color: '#18352A',
    fontSize: 14,
    fontWeight: '700',
  },

  timelineSubtitle: {
    color: '#7C8A82',
    fontSize: 11,
    marginTop: 3,
  },

  timelineLine: {
    width: 2,
    height: 22,
    backgroundColor: '#CFE1D4',
    marginLeft: 18,
  },

  /* Documents */

  documentsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  documentText: {
    flex: 1,
  },

  documentTitle: {
    color: '#18352A',
    fontSize: 14,
    fontWeight: '700',
  },

  documentSubtitle: {
    color: '#7C8A82',
    fontSize: 11,
    marginTop: 3,
  },

  /* Feedback */

  feedbackCard: {
    backgroundColor: '#FFF9EA',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  feedbackIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF1CA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  feedbackTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  feedbackTitle: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
  },

  feedbackSubtitle: {
    color: '#7C8A82',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  feedbackButton: {
    backgroundColor: '#D99A27',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
  },

  feedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Grievance */

  grievanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  grievanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FCEDEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  grievanceText: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  grievanceTitle: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
  },

  grievanceSubtitle: {
    color: '#7C8A82',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  bottomSpace: {
    height: 30,
  },
});