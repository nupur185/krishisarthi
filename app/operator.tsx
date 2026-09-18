import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const API_URL = 'https://krishisarthi-backend-32yz.onrender.com';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type QueueStage =
  | 'TOKEN_QUEUE'
  | 'QUALITY_CHECK'
  | 'WEIGHTMENT'
  | 'FINALIZATION'
  | 'COMPLETED';

type TokenStatus =
  | 'WAITING'
  | 'SERVING'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'CANCELLED';

type QualityGrade = 'A' | 'B' | 'C' | 'REJECTED';

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

interface QueueBooking {
  // Internal database ID
  id: number;

  // Public booking reference
  bookingId: string;

  tokenNumber: string;
  tokenStatus: TokenStatus;
  status: string;
  commodity: string;
  quantityQuintals: number;
  slotId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  farmerName: string;
  farmerId: string;
}

interface QueueState {
  currentTokenNumber: string | null;
  currentStage: QueueStage;
  activeCounters: number;
  totalServedToday: number;
  totalProcuredToday: number;
  updatedAt: string;
}

interface Center {
  id: number;
  name: string;
  address: string;
  village: string;
  district: string;
  state: string;
  status: string;
  activeCounters: number;
  avgServiceMinutes: number;
}

interface QueueBookingApi {
  id?: number | string | null;
  bookingId?: string | number | null;
  tokenNumber?: string | null;
  tokenStatus?: TokenStatus | string | null;
  status?: string | null;
  commodity?: string | null;
  quantityQuintals?: number | string | null;
  slotId?: number | string | null;
  slotDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  farmerName?: string | null;
  farmerId?: string | null;
}

interface QueueResponse {
  success: boolean;
  data: {
    center: Center;
    queueState: QueueState | null;
    queue: QueueBookingApi[];
  };
}

interface ProcurementRecord {
  id: number;
  bookingId: number;

  moisturePercent: number | null;
  foreignMatterPercent: number | null;
  damagedGrainsPercent: number | null;
  qualityGrade: QualityGrade | null;

  grossWeightQuintals: number | null;
  tareWeightQuintals: number | null;
  netWeightQuintals: number | null;

  acceptedQuantityQuintals: number | null;
  mspPerQuintal: number | null;
  procurementAmount: number | null;

  status: ProcurementStatus;

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface ProcurementResponse {
  success: boolean;
  data: {
    booking: {
      id: number;
      bookingId: string;
      commodity: string;
      quantityQuintals: number;
      tokenNumber: string;
      tokenStatus: TokenStatus;
      status: string;
    };

    farmer: {
      farmerId: string;
      fullName: string;
      mobile: string;
    };

    center: {
      id: number;
      name: string;
    };

    slot: {
      slotDate: string;
      startTime: string;
      endTime: string;
    };

    procurement: ProcurementRecord | null;
  };
}

interface PaymentRecord {
  id: number;
  procurementId: number;
  amount: number | string;
  status: PaymentStatus;
  bankReference: string | null;
  initiatedAt: string | null;
  creditedAt: string | null;
  createdAt: string;
  updatedAt: string;
  procurement: {
    id: number;
    bookingId: number;
    status: ProcurementStatus;
    procurementAmount: number | string | null;
    booking: {
      id: number;
      bookingId: string;
      commodity: string;
      quantityQuintals: number | string;
      tokenNumber: string | null;
      user: {
        farmerId: string;
        fullName: string;
        mobile: string;
      };
      slot: {
        slotDate: string;
        startTime: string;
        endTime: string;
        center: {
          id: number;
          name: string;
        };
      };
    };
  };
}

interface PaymentResponse {
  success: boolean;
  data: PaymentRecord[];
}

type GrievanceIssueType =
  | 'PAYMENT'
  | 'QUALITY'
  | 'WEIGHTMENT'
  | 'SLOT'
  | 'STAFF'
  | 'OTHER';

type GrievanceStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

interface AdminGrievance {
  id: number;
  grievanceId: string;
  userId: number;
  bookingId: number | null;
  issueType: GrievanceIssueType;
  description: string;
  photoUrl: string | null;
  status: GrievanceStatus;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    farmerId: string;
    fullName: string;
    mobile: string;
    district: string | null;
    state: string | null;
  };
  booking: {
    id: number;
    bookingId: string;
    commodity: string;
    quantityQuintals: number | string;
    tokenNumber: string | null;
    status: string;
    tokenStatus: string;
    slot: {
      slotDate: string;
      startTime: string;
      endTime: string;
      center: {
        id: number;
        name: string;
      };
    };
  } | null;
}

interface AdminGrievanceListResponse {
  success: boolean;
  grievances?: AdminGrievance[];
}

interface AdminGrievanceResponse {
  success: boolean;
  grievance?: AdminGrievance;
  message?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const stageLabels: Record<QueueStage, string> = {
  TOKEN_QUEUE: 'Token Queue',
  QUALITY_CHECK: 'Quality Check',
  WEIGHTMENT: 'Weightment',
  FINALIZATION: 'Finalization',
  COMPLETED: 'Completed',
};

const statusLabels: Record<TokenStatus, string> = {
  WAITING: 'Waiting',
  SERVING: 'Serving',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  CANCELLED: 'Cancelled',
};

const procurementStatusLabels: Record<
  ProcurementStatus,
  string
> = {
  NOT_STARTED: 'Not Started',
  QUALITY_CHECK: 'Quality Check',
  WEIGHTMENT: 'Weightment',
  FINALIZATION: 'Finalization',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

const grievanceIssueLabels: Record<GrievanceIssueType, string> = {
  PAYMENT: 'Payment',
  QUALITY: 'Quality',
  WEIGHTMENT: 'Weightment',
  SLOT: 'Slot',
  STAFF: 'Staff',
  OTHER: 'Other',
};

const grievanceStatusLabels: Record<GrievanceStatus, string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

function formatDateTime(value: string | null) {
  if (!value) return '--';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTime(time: string) {
  if (!time) return '--';

  const date = new Date(time);

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function toNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

/**
 * Normalizes the queue response so procurement APIs always receive the
 * internal numeric Booking.id.
 *
 * Newer backend responses expose both `id` (internal DB id) and
 * `bookingId` (public reference). Older queue responses used `bookingId`
 * for the numeric database id. Supporting both shapes here prevents the
 * operator screen from ever sending a public reference such as
 * BK-20260918-148938 to an endpoint that expects `/booking/:bookingId`
 * to be numeric.
 */
function normalizeQueueBooking(
  item: QueueBookingApi
): QueueBooking | null {
  const directId = Number(item.id);
  const legacyId = Number(item.bookingId);

  const internalId =
    Number.isInteger(directId) && directId > 0
      ? directId
      : Number.isInteger(legacyId) && legacyId > 0
        ? legacyId
        : null;

  if (internalId === null) {
    return null;
  }

  const tokenNumber = item.tokenNumber;
  const tokenStatus = item.tokenStatus;

  if (!tokenNumber || !tokenStatus) {
    return null;
  }

  const normalizedTokenStatus = tokenStatus as TokenStatus;

  const publicBookingId =
    typeof item.bookingId === 'string' &&
    item.bookingId.trim()
      ? item.bookingId
      : `BOOKING-${internalId}`;

  return {
    id: internalId,
    bookingId: publicBookingId,
    tokenNumber,
    tokenStatus: normalizedTokenStatus,
    status: item.status ?? '',
    commodity: item.commodity ?? '',
    quantityQuintals: Number(item.quantityQuintals ?? 0),
    slotId: Number(item.slotId ?? 0),
    slotDate: item.slotDate ?? '',
    startTime: item.startTime ?? '',
    endTime: item.endTime ?? '',
    farmerName: item.farmerName ?? '',
    farmerId: item.farmerId ?? '',
  };
}

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

export default function OperatorScreen() {
  const [token, setToken] = useState<string | null>(null);

  const [center, setCenter] = useState<Center | null>(null);
  const [queueState, setQueueState] =
    useState<QueueState | null>(null);
  const [queue, setQueue] = useState<QueueBooking[]>([]);

  const [procurement, setProcurement] =
    useState<ProcurementRecord | null>(null);

  const [payments, setPayments] =
    useState<PaymentRecord[]>([]);

  const [grievances, setGrievances] =
    useState<AdminGrievance[]>([]);
  const [grievanceFilter, setGrievanceFilter] =
    useState<'ALL' | GrievanceStatus>('ALL');
  const [selectedGrievanceId, setSelectedGrievanceId] =
    useState<string | null>(null);
  const [selectedGrievance, setSelectedGrievance] =
    useState<AdminGrievance | null>(null);
  const [grievanceLoading, setGrievanceLoading] =
    useState(false);
  const [grievanceDetailLoading, setGrievanceDetailLoading] =
    useState(false);
  const [grievanceActionLoading, setGrievanceActionLoading] =
    useState(false);
  const [resolutionNote, setResolutionNote] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [procurementLoading, setProcurementLoading] =
    useState(false);
  const [paymentLoading, setPaymentLoading] =
    useState(false);
  const [paymentActionLoading, setPaymentActionLoading] =
    useState<number | null>(null);

  // ───────────────────────────────────────────
  // Procurement form state
  // ───────────────────────────────────────────

  const [moisture, setMoisture] = useState('');
  const [foreignMatter, setForeignMatter] = useState('');
  const [damagedGrains, setDamagedGrains] = useState('');
  const [qualityGrade, setQualityGrade] =
    useState<QualityGrade | null>(null);

  const [grossWeight, setGrossWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');

  const [acceptedQuantity, setAcceptedQuantity] =
    useState('');
  const [msp, setMsp] = useState('');

  // Green Valley Center is currently center ID 2.
  // We will make center selection dynamic later.
  const CENTER_ID = 1;

  // ───────────────────────────────────────────
  // Current booking
  // ───────────────────────────────────────────

  const currentBooking = queue.find(
    (item) =>
      item.tokenNumber ===
      queueState?.currentTokenNumber
  );

  const waitingCount = queue.filter(
    (item) => item.tokenStatus === 'WAITING'
  ).length;

  // ───────────────────────────────────────────
  // Reset procurement form
  // ───────────────────────────────────────────

  const resetProcurementForm = () => {
    setProcurement(null);

    setMoisture('');
    setForeignMatter('');
    setDamagedGrains('');
    setQualityGrade(null);

    setGrossWeight('');
    setTareWeight('');

    setAcceptedQuantity('');
    setMsp('');
  };

  // ───────────────────────────────────────────
  // Load authentication token
  // ───────────────────────────────────────────

  const loadToken = async () => {
    const storedToken =
      await SecureStore.getItemAsync('authToken');

    if (!storedToken) {
      Alert.alert(
        'Authentication required',
        'Please login as an operator.'
      );

      router.replace('/welcome');

      return null;
    }

    setToken(storedToken);

    return storedToken;
  };

  // ───────────────────────────────────────────
  // Fetch Queue
  // ───────────────────────────────────────────

  const fetchQueue = useCallback(async () => {
    try {
      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/queue/center/${CENTER_ID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data: QueueResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.success === false
            ? 'Unable to load queue.'
            : 'Queue request failed.'
        );
      }

      const normalizedQueue = data.data.queue
        .map(normalizeQueueBooking)
        .filter(
          (item): item is QueueBooking =>
            item !== null
        );

      if (normalizedQueue.length !== data.data.queue.length) {
        throw new Error(
          'Queue data is missing a valid internal booking ID.'
        );
      }

      setCenter(data.data.center);
      setQueueState(data.data.queueState);
      setQueue(normalizedQueue);

      if (!data.data.queueState?.currentTokenNumber) {
        resetProcurementForm();
      }
    } catch (error) {
      console.error('Operator queue error:', error);

      Alert.alert(
        'Unable to load queue',
        error instanceof Error
          ? error.message
          : 'Something went wrong while loading the queue.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // ───────────────────────────────────────────
  // Fetch procurement record
  // ───────────────────────────────────────────

  const fetchProcurement = useCallback(
    async (bookingId: number) => {
      try {
        setProcurementLoading(true);

        const authToken =
          token ??
          (await SecureStore.getItemAsync('authToken'));

        if (!authToken) {
          router.replace('/welcome');
          return;
        }

        const response = await fetch(
          `${API_URL}/api/procurement/booking/${bookingId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data: ProcurementResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.success === false
              ? 'Unable to load procurement record.'
              : 'Procurement request failed.'
          );
        }

        const record = data.data.procurement;

        setProcurement(record);

        if (record) {
          setMoisture(
            record.moisturePercent !== null
              ? String(record.moisturePercent)
              : ''
          );

          setForeignMatter(
            record.foreignMatterPercent !== null
              ? String(record.foreignMatterPercent)
              : ''
          );

          setDamagedGrains(
            record.damagedGrainsPercent !== null
              ? String(record.damagedGrainsPercent)
              : ''
          );

          setQualityGrade(record.qualityGrade);

          setGrossWeight(
            record.grossWeightQuintals !== null
              ? String(record.grossWeightQuintals)
              : ''
          );

          setTareWeight(
            record.tareWeightQuintals !== null
              ? String(record.tareWeightQuintals)
              : ''
          );

          setAcceptedQuantity(
            record.acceptedQuantityQuintals !== null
              ? String(
                  record.acceptedQuantityQuintals
                )
              : ''
          );

          setMsp(
            record.mspPerQuintal !== null
              ? String(record.mspPerQuintal)
              : ''
          );
        }
      } catch (error) {
        console.error(
          'Procurement fetch error:',
          error
        );

        Alert.alert(
          'Unable to load procurement',
          error instanceof Error
            ? error.message
            : 'Unable to load procurement data.'
        );
      } finally {
        setProcurementLoading(false);
      }
    },
    [token]
  );

  // ───────────────────────────────────────────
  // Fetch Payments
  // ───────────────────────────────────────────

  const fetchPayments = useCallback(async () => {
    try {
      setPaymentLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/payment`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data: PaymentResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.success === false
            ? 'Unable to load payment records.'
            : 'Payment request failed.'
        );
      }

      setPayments(data.data ?? []);
    } catch (error) {
      console.error('Payment fetch error:', error);

      Alert.alert(
        'Unable to load payments',
        error instanceof Error
          ? error.message
          : 'Unable to load payment records.'
      );
    } finally {
      setPaymentLoading(false);
    }
  }, [token]);

  // ───────────────────────────────────────────
  // Fetch Admin Grievances
  // ───────────────────────────────────────────

  const fetchGrievances = useCallback(async () => {
    try {
      setGrievanceLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/grievances`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data: AdminGrievanceListResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.success === false
            ? 'Unable to load grievances.'
            : 'Grievance request failed.'
        );
      }

      setGrievances(data.grievances ?? []);

      if (selectedGrievanceId) {
        const updated = (data.grievances ?? []).find(
          (item) => item.grievanceId === selectedGrievanceId
        );
        if (updated) {
          setSelectedGrievance(updated);
          setResolutionNote(updated.resolutionNote ?? '');
        }
      }
    } catch (error) {
      console.error('Grievance fetch error:', error);

      Alert.alert(
        'Unable to load grievances',
        error instanceof Error
          ? error.message
          : 'Unable to load grievance records.'
      );
    } finally {
      setGrievanceLoading(false);
    }
  }, [token, selectedGrievanceId]);

  // ───────────────────────────────────────────
  // Load Grievance Details
  // ───────────────────────────────────────────

  const openGrievanceDetails = async (grievanceId: string) => {
    try {
      setSelectedGrievanceId(grievanceId);
      setGrievanceDetailLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/grievances/${encodeURIComponent(grievanceId)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data: AdminGrievanceResponse =
        await response.json();

      if (!response.ok || !data.success || !data.grievance) {
        throw new Error(
          data.message || 'Unable to load grievance details.'
        );
      }

      setSelectedGrievance(data.grievance);
      setResolutionNote(data.grievance.resolutionNote ?? '');
    } catch (error) {
      console.error('Grievance detail error:', error);

      setSelectedGrievanceId(null);
      setSelectedGrievance(null);

      Alert.alert(
        'Unable to load grievance',
        error instanceof Error
          ? error.message
          : 'Unable to load grievance details.'
      );
    } finally {
      setGrievanceDetailLoading(false);
    }
  };

  const closeGrievanceDetails = () => {
    setSelectedGrievanceId(null);
    setSelectedGrievance(null);
    setResolutionNote('');
  };

  // ───────────────────────────────────────────
  // Update Grievance Status
  // ───────────────────────────────────────────

  const handleGrievanceStatusUpdate = async (
    status: GrievanceStatus
  ) => {
    if (!selectedGrievance) return;

    const note = resolutionNote.trim();

    if ((status === 'RESOLVED' || status === 'REJECTED') && !note) {
      Alert.alert(
        'Resolution note required',
        'Please enter a resolution note before resolving or rejecting this grievance.'
      );
      return;
    }

    try {
      setGrievanceActionLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/grievances/${encodeURIComponent(
          selectedGrievance.grievanceId
        )}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            resolutionNote: note || undefined,
          }),
        }
      );

      const data: AdminGrievanceResponse =
        await response.json();

      if (!response.ok || !data.success || !data.grievance) {
        throw new Error(
          data.message || 'Unable to update grievance status.'
        );
      }

      const updatedGrievance = data.grievance;

      setSelectedGrievance(updatedGrievance);
      setResolutionNote(updatedGrievance.resolutionNote ?? '');
      setGrievances((current) =>
        current.map((item) =>
          item.grievanceId === updatedGrievance.grievanceId
            ? updatedGrievance
            : item
        )
      );

      Alert.alert(
        'Grievance updated',
        `Status changed to ${grievanceStatusLabels[status]}.`
      );
    } catch (error) {
      console.error('Grievance update error:', error);

      Alert.alert(
        'Grievance update failed',
        error instanceof Error
          ? error.message
          : 'Unable to update grievance.'
      );
    } finally {
      setGrievanceActionLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // Payment action
  // ───────────────────────────────────────────

  const handlePaymentAction = async (
    paymentId: number,
    action: 'initiate' | 'credit' | 'fail'
  ) => {
    try {
      setPaymentActionLoading(paymentId);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/payment/${paymentId}/${action}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Unable to update payment.'
        );
      }

      const messages = {
        initiate: 'Payment has been initiated.',
        credit: 'Payment has been marked as credited.',
        fail: 'Payment has been marked as failed.',
      };

      Alert.alert('Payment updated', messages[action]);

      await fetchPayments();
    } catch (error) {
      console.error('Payment action error:', error);

      Alert.alert(
        'Payment update failed',
        error instanceof Error
          ? error.message
          : 'Unable to update payment.'
      );
    } finally {
      setPaymentActionLoading(null);
    }
  };

  // ───────────────────────────────────────────
  // Initial load
  // ───────────────────────────────────────────

  useEffect(() => {
    const initialize = async () => {
      const storedToken = await loadToken();

      if (storedToken) {
        await Promise.all([
          fetchQueue(),
          fetchPayments(),
          fetchGrievances(),
        ]);
      }
    };

    initialize();
  }, []);

  // ───────────────────────────────────────────
  // Load procurement when current token changes
  // ───────────────────────────────────────────

  useEffect(() => {
    if (currentBooking?.id) {
      fetchProcurement(currentBooking.id);
    }
  }, [
    currentBooking?.id,
    fetchProcurement,
  ]);

  // ───────────────────────────────────────────
  // Pull to refresh
  // ───────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchQueue();
    await fetchPayments();
    await fetchGrievances();

    if (currentBooking?.id) {
      await fetchProcurement(currentBooking.id);
    }
  };

  // ───────────────────────────────────────────
  // Queue API action
  // ───────────────────────────────────────────

  const performAction = async (
    endpoint: string,
    method: 'POST' | 'PATCH',
    body?: object,
    successMessage?: string
  ) => {
    try {
      setActionLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          ...(body
            ? {
                body: JSON.stringify(body),
              }
            : {}),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Operator action failed.'
        );
      }

      if (successMessage) {
        Alert.alert('Success', successMessage);
      }

      await fetchQueue();
    } catch (error) {
      console.error(
        'Operator action error:',
        error
      );

      Alert.alert(
        'Action failed',
        error instanceof Error
          ? error.message
          : 'Unable to complete the action.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // Call Next Token
  // ───────────────────────────────────────────

  const handleCallNext = () => {
    if (!center) return;

    const nextBooking = queue.find(
      (item) => item.tokenStatus === 'WAITING'
    );

    if (!nextBooking) {
      Alert.alert(
        'No waiting tokens',
        'There are currently no waiting farmers.'
      );

      return;
    }

    performAction(
      `/api/queue/center/${center.id}/call-next`,
      'POST',
      {
        slotId: nextBooking.slotId,
      },
      `${nextBooking.tokenNumber} has been called.`
    );
  };

  // ───────────────────────────────────────────
  // Change Queue Stage
  // ───────────────────────────────────────────

  const handleStageChange = (
    stage: QueueStage
  ) => {
    if (!center || !currentBooking) return;

    performAction(
      `/api/queue/center/${center.id}/stage`,
      'PATCH',
      {
        stage,
      },
      `${stageLabels[stage]} started.`
    );
  };

  // ───────────────────────────────────────────
  // Save Quality
  // ───────────────────────────────────────────

  const getCurrentBookingId = () => {
    if (!currentBooking) return null;

    const id = Number(currentBooking.id);

    if (!Number.isInteger(id) || id <= 0) {
      Alert.alert(
        'Booking data error',
        'The current token does not contain a valid internal booking ID. Refresh the queue and try again.'
      );
      return null;
    }

    return id;
  };

  const handleSaveQuality = async () => {
    const bookingId = getCurrentBookingId();
    if (bookingId === null) return;

    const moistureValue = toNumber(moisture);
    const foreignMatterValue =
      toNumber(foreignMatter);
    const damagedGrainsValue =
      toNumber(damagedGrains);

    if (
      moisture === '' ||
      foreignMatter === '' ||
      damagedGrains === ''
    ) {
      Alert.alert(
        'Missing information',
        'Please enter all quality parameters.'
      );
      return;
    }

    if (!qualityGrade) {
      Alert.alert(
        'Quality grade required',
        'Please select a quality grade.'
      );
      return;
    }

    if (
      moistureValue < 0 ||
      moistureValue > 100 ||
      foreignMatterValue < 0 ||
      foreignMatterValue > 100 ||
      damagedGrainsValue < 0 ||
      damagedGrainsValue > 100
    ) {
      Alert.alert(
        'Invalid values',
        'Quality percentages must be between 0 and 100.'
      );
      return;
    }

    try {
      setActionLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      // Use the internal numeric database booking ID.
      // bookingId is the public booking reference and must not be used here.
      const response = await fetch(
        `${API_URL}/api/procurement/booking/${bookingId}/quality`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moisturePercent: moistureValue,
            foreignMatterPercent:
              foreignMatterValue,
            damagedGrainsPercent:
              damagedGrainsValue,
            qualityGrade,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to save quality data.'
        );
      }

      Alert.alert(
        'Quality saved',
        'Quality check data has been recorded.'
      );

      await fetchProcurement(
        bookingId
      );

      await fetchQueue();
    } catch (error) {
      console.error(
        'Save quality error:',
        error
      );

      Alert.alert(
        'Quality check failed',
        error instanceof Error
          ? error.message
          : 'Unable to save quality data.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // Save Weightment
  // ───────────────────────────────────────────

  const handleSaveWeight = async () => {
    const bookingId = getCurrentBookingId();
    if (bookingId === null) return;

    const gross = toNumber(grossWeight);
    const tare = toNumber(tareWeight);

    if (
      grossWeight === '' ||
      tareWeight === ''
    ) {
      Alert.alert(
        'Missing information',
        'Please enter gross and tare weight.'
      );
      return;
    }

    if (gross <= 0) {
      Alert.alert(
        'Invalid gross weight',
        'Gross weight must be greater than 0.'
      );
      return;
    }

    if (tare < 0 || tare >= gross) {
      Alert.alert(
        'Invalid tare weight',
        'Tare weight must be less than gross weight.'
      );
      return;
    }

    try {
      setActionLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      // Use the internal numeric database booking ID.
      const response = await fetch(
        `${API_URL}/api/procurement/booking/${bookingId}/weight`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grossWeightQuintals: gross,
            tareWeightQuintals: tare,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to save weightment data.'
        );
      }

      Alert.alert(
        'Weightment saved',
        'Gross, tare and net weight have been recorded.'
      );

      await fetchProcurement(
        bookingId
      );

      await fetchQueue();
    } catch (error) {
      console.error(
        'Save weight error:',
        error
      );

      Alert.alert(
        'Weightment failed',
        error instanceof Error
          ? error.message
          : 'Unable to save weightment data.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // Finalize Procurement
  // ───────────────────────────────────────────

  const handleFinalize = async () => {
    const bookingId = getCurrentBookingId();
    if (bookingId === null) return;

    const accepted = toNumber(
      acceptedQuantity
    );

    const mspValue = toNumber(msp);

    const net =
      toNumber(grossWeight) -
      toNumber(tareWeight);

    if (
      acceptedQuantity === '' ||
      msp === ''
    ) {
      Alert.alert(
        'Missing information',
        'Please enter accepted quantity and MSP.'
      );
      return;
    }

    if (accepted <= 0) {
      Alert.alert(
        'Invalid quantity',
        'Accepted quantity must be greater than 0.'
      );
      return;
    }

    if (mspValue <= 0) {
      Alert.alert(
        'Invalid MSP',
        'MSP must be greater than 0.'
      );
      return;
    }

    if (net <= 0) {
      Alert.alert(
        'Weightment required',
        'Please complete weightment before finalization.'
      );
      return;
    }

    if (accepted > net) {
      Alert.alert(
        'Invalid quantity',
        'Accepted quantity cannot exceed net weight.'
      );
      return;
    }

    try {
      setActionLoading(true);

      const authToken =
        token ??
        (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        router.replace('/welcome');
        return;
      }

      // Use the internal numeric database booking ID.
      const response = await fetch(
        `${API_URL}/api/procurement/booking/${bookingId}/finalize`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            acceptedQuantityQuintals:
              accepted,
            mspPerQuintal: mspValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to finalize procurement.'
        );
      }

      Alert.alert(
        'Procurement finalized',
        'Accepted quantity, MSP and procurement amount have been calculated.'
      );

      await fetchProcurement(
        bookingId
      );

      await fetchQueue();
    } catch (error) {
      console.error(
        'Finalize procurement error:',
        error
      );

      Alert.alert(
        'Finalization failed',
        error instanceof Error
          ? error.message
          : 'Unable to finalize procurement.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ───────────────────────────────────────────
  // Complete Procurement
  // ───────────────────────────────────────────

  const handleCompleteProcurement = () => {
    if (!center || !currentBooking) return;

    const bookingId = getCurrentBookingId();
    if (bookingId === null) return;

    Alert.alert(
      'Complete Procurement',
      `Complete procurement for ${currentBooking.tokenNumber}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setActionLoading(true);

              const authToken =
                token ??
                (await SecureStore.getItemAsync(
                  'authToken'
                ));

              if (!authToken) {
                router.replace('/welcome');
                return;
              }

              // IMPORTANT:
              // Use numeric database booking ID.
              const response = await fetch(
                `${API_URL}/api/procurement/booking/${bookingId}/complete`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              const data =
                await response.json();

              if (!response.ok || !data.success) {
                throw new Error(
                  data.message ||
                    'Unable to complete procurement.'
                );
              }

              Alert.alert(
                'Procurement completed',
                `${currentBooking.tokenNumber} has been completed successfully.`
              );

              resetProcurementForm();

              await fetchQueue();
              await fetchPayments();
            } catch (error) {
              console.error(
                'Complete procurement error:',
                error
              );

              Alert.alert(
                'Completion failed',
                error instanceof Error
                  ? error.message
                  : 'Unable to complete procurement.'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // ───────────────────────────────────────────
  // Logout
  // ───────────────────────────────────────────

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync(
      'authToken'
    );

    await SecureStore.deleteItemAsync(
      'farmer'
    );

    router.replace('/welcome');
  };

  // ───────────────────────────────────────────
  // Calculated values
  // ───────────────────────────────────────────

  const calculatedNetWeight =
    toNumber(grossWeight) -
    toNumber(tareWeight);

  const calculatedAmount =
    toNumber(acceptedQuantity) *
    toNumber(msp);

  // ───────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />

          <Text style={styles.loadingText}>
            Loading operator dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ───────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              KrishiSarthi
            </Text>

            <Text style={styles.subtitle}>
              Operator Dashboard
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Card */}

        <View style={styles.centerCard}>
          <View style={styles.centerHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.centerLabel}>
                PROCUREMENT CENTER
              </Text>

              <Text style={styles.centerName}>
                {center?.name ??
                  'Green Valley Center'}
              </Text>

              <Text style={styles.centerLocation}>
                {center?.village},{' '}
                {center?.district},{' '}
                {center?.state}
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                LIVE
              </Text>
            </View>
          </View>

          <View style={styles.centerStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {queueState?.activeCounters ??
                  center?.activeCounters ??
                  0}
              </Text>

              <Text style={styles.statLabel}>
                Active Counters
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {waitingCount}
              </Text>

              <Text style={styles.statLabel}>
                Waiting
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {queueState?.totalServedToday ??
                  0}
              </Text>

              <Text style={styles.statLabel}>
                Served Today
              </Text>
            </View>
          </View>
        </View>

        {/* Current Procurement */}

        <Text style={styles.sectionTitle}>
          Current Procurement
        </Text>

        <View style={styles.currentCard}>
          {queueState?.currentTokenNumber ? (
            <>
              {/* Current Farmer */}

              <View style={styles.currentTop}>
                <View>
                  <Text style={styles.currentLabel}>
                    NOW SERVING
                  </Text>

                  <Text style={styles.currentToken}>
                    {
                      queueState.currentTokenNumber
                    }
                  </Text>
                </View>

                <View style={styles.servingBadge}>
                  <Text style={styles.servingText}>
                    SERVING
                  </Text>
                </View>
              </View>

              {currentBooking && (
                <View style={styles.farmerInfo}>
                  <Text style={styles.farmerName}>
                    {currentBooking.farmerName}
                  </Text>

                  <Text style={styles.farmerId}>
                    Farmer ID:{' '}
                    {currentBooking.farmerId}
                  </Text>

                  <View
                    style={styles.bookingDetails}
                  >
                    <View>
                      <Text
                        style={styles.detailLabel}
                      >
                        Commodity
                      </Text>

                      <Text
                        style={styles.detailValue}
                      >
                        {currentBooking.commodity}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={styles.detailLabel}
                      >
                        Quantity
                      </Text>

                      <Text
                        style={styles.detailValue}
                      >
                        {
                          currentBooking.quantityQuintals
                        }{' '}
                        qtl
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={styles.detailLabel}
                      >
                        Slot
                      </Text>

                      <Text
                        style={styles.detailValue}
                      >
                        {formatTime(
                          currentBooking.startTime
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Procurement Status */}

              <View style={styles.procurementStatus}>
                <Text
                  style={
                    styles.procurementStatusLabel
                  }
                >
                  PROCUREMENT STATUS
                </Text>

                <Text
                  style={
                    styles.procurementStatusValue
                  }
                >
                  {procurementLoading
                    ? 'Loading...'
                    : procurement
                      ? procurementStatusLabels[
                          procurement.status
                        ]
                      : 'Not Started'}
                </Text>
              </View>

              {/* Stage */}

              <Text style={styles.stageTitle}>
                Current Stage
              </Text>

              <View style={styles.stageCurrent}>
                <Text
                  style={styles.stageCurrentText}
                >
                  {stageLabels[
                    queueState.currentStage
                  ]}
                </Text>
              </View>

              {/* ─────────────────────────── */}
              {/* Quality Check */}
              {/* ─────────────────────────── */}

              <View style={styles.workflowSection}>
                <View
                  style={styles.workflowHeader}
                >
                  <Text
                    style={styles.workflowNumber}
                  >
                    1
                  </Text>

                  <View>
                    <Text
                      style={styles.workflowTitle}
                    >
                      Quality Check
                    </Text>

                    <Text
                      style={styles.workflowSubtitle}
                    >
                      Record produce quality
                    </Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>
                  Moisture (%)
                </Text>

                <TextInput
                  value={moisture}
                  onChangeText={setMoisture}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 12.5"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>
                  Foreign Matter (%)
                </Text>

                <TextInput
                  value={foreignMatter}
                  onChangeText={setForeignMatter}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 1.0"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>
                  Damaged Grains (%)
                </Text>

                <TextInput
                  value={damagedGrains}
                  onChangeText={setDamagedGrains}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 2.0"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>
                  Quality Grade
                </Text>

                <View style={styles.gradeRow}>
                  {(
                    [
                      'A',
                      'B',
                      'C',
                      'REJECTED',
                    ] as const
                  ).map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.gradeButton,
                        qualityGrade === grade &&
                          styles.gradeButtonActive,
                      ]}
                      disabled={actionLoading}
                      onPress={() =>
                        setQualityGrade(grade)
                      }
                    >
                      <Text
                        style={[
                          styles.gradeText,
                          qualityGrade ===
                            grade &&
                            styles.gradeTextActive,
                        ]}
                      >
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  disabled={actionLoading}
                  onPress={handleSaveQuality}
                >
                  {actionLoading ? (
                    <ActivityIndicator
                      color="#2E7D32"
                    />
                  ) : (
                    <Text
                      style={
                        styles.secondaryButtonText
                      }
                    >
                      Save Quality Check
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* ─────────────────────────── */}
              {/* Weightment */}
              {/* ─────────────────────────── */}

              <View style={styles.workflowSection}>
                <View
                  style={styles.workflowHeader}
                >
                  <Text
                    style={styles.workflowNumber}
                  >
                    2
                  </Text>

                  <View>
                    <Text
                      style={styles.workflowTitle}
                    >
                      Weightment
                    </Text>

                    <Text
                      style={styles.workflowSubtitle}
                    >
                      Record actual weights
                    </Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>
                  Gross Weight (quintals)
                </Text>

                <TextInput
                  value={grossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 50.00"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>
                  Tare Weight (quintals)
                </Text>

                <TextInput
                  value={tareWeight}
                  onChangeText={setTareWeight}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 5.00"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <View style={styles.calculationCard}>
                  <Text
                    style={styles.calculationLabel}
                  >
                    NET WEIGHT
                  </Text>

                  <Text
                    style={styles.calculationValue}
                  >
                    {calculatedNetWeight > 0
                      ? calculatedNetWeight.toFixed(
                          2
                        )
                      : '0.00'}{' '}
                    qtl
                  </Text>

                  <Text
                    style={styles.calculationHint}
                  >
                    Gross weight − Tare weight
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  disabled={actionLoading}
                  onPress={handleSaveWeight}
                >
                  {actionLoading ? (
                    <ActivityIndicator
                      color="#2E7D32"
                    />
                  ) : (
                    <Text
                      style={
                        styles.secondaryButtonText
                      }
                    >
                      Save Weightment
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* ─────────────────────────── */}
              {/* Finalization */}
              {/* ─────────────────────────── */}

              <View style={styles.workflowSection}>
                <View
                  style={styles.workflowHeader}
                >
                  <Text
                    style={styles.workflowNumber}
                  >
                    3
                  </Text>

                  <View>
                    <Text
                      style={styles.workflowTitle}
                    >
                      Finalization
                    </Text>

                    <Text
                      style={styles.workflowSubtitle}
                    >
                      Confirm quantity and MSP
                    </Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>
                  Accepted Quantity (quintals)
                </Text>

                <TextInput
                  value={acceptedQuantity}
                  onChangeText={
                    setAcceptedQuantity
                  }
                  keyboardType="decimal-pad"
                  placeholder="e.g. 45.00"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>
                  MSP per Quintal (₹)
                </Text>

                <TextInput
                  value={msp}
                  onChangeText={setMsp}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 2300"
                  placeholderTextColor="#9AA39C"
                  style={styles.input}
                />

                <View style={styles.amountCard}>
                  <View>
                    <Text
                      style={styles.amountLabel}
                    >
                      PROCUREMENT AMOUNT
                    </Text>

                    <Text
                      style={styles.amountValue}
                    >
                      ₹
                      {calculatedAmount > 0
                        ? calculatedAmount.toFixed(
                            2
                          )
                        : '0.00'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  disabled={actionLoading}
                  onPress={handleFinalize}
                >
                  {actionLoading ? (
                    <ActivityIndicator
                      color="#2E7D32"
                    />
                  ) : (
                    <Text
                      style={
                        styles.secondaryButtonText
                      }
                    >
                      Finalize Procurement
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* ─────────────────────────── */}
              {/* Stage Controls */}
              {/* ─────────────────────────── */}

              <Text style={styles.stageTitle}>
                Queue Stage
              </Text>

              <View style={styles.stageButtons}>
                <TouchableOpacity
                  style={[
                    styles.stageButton,
                    queueState.currentStage ===
                      'QUALITY_CHECK' &&
                      styles.stageButtonActive,
                  ]}
                  disabled={actionLoading}
                  onPress={() =>
                    handleStageChange(
                      'QUALITY_CHECK'
                    )
                  }
                >
                  <Text
                    style={[
                      styles.stageButtonText,
                      queueState.currentStage ===
                        'QUALITY_CHECK' &&
                        styles.stageButtonTextActive,
                    ]}
                  >
                    Quality Check
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stageButton,
                    queueState.currentStage ===
                      'WEIGHTMENT' &&
                      styles.stageButtonActive,
                  ]}
                  disabled={actionLoading}
                  onPress={() =>
                    handleStageChange(
                      'WEIGHTMENT'
                    )
                  }
                >
                  <Text
                    style={[
                      styles.stageButtonText,
                      queueState.currentStage ===
                        'WEIGHTMENT' &&
                        styles.stageButtonTextActive,
                    ]}
                  >
                    Weightment
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stageButton,
                    queueState.currentStage ===
                      'FINALIZATION' &&
                      styles.stageButtonActive,
                  ]}
                  disabled={actionLoading}
                  onPress={() =>
                    handleStageChange(
                      'FINALIZATION'
                    )
                  }
                >
                  <Text
                    style={[
                      styles.stageButtonText,
                      queueState.currentStage ===
                        'FINALIZATION' &&
                        styles.stageButtonTextActive,
                    ]}
                  >
                    Finalization
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Complete Procurement */}

              <TouchableOpacity
                style={[
                  styles.completeButton,
                  procurement?.status !==
                    'FINALIZATION' &&
                    styles.completeButtonDisabled,
                ]}
                disabled={
                  actionLoading ||
                  procurement?.status !==
                    'FINALIZATION'
                }
                onPress={
                  handleCompleteProcurement
                }
              >
                {actionLoading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.completeButtonText
                    }
                  >
                    Complete Procurement
                  </Text>
                )}
              </TouchableOpacity>

              {procurement?.status !==
                'FINALIZATION' && (
                <Text
                  style={styles.completeHint}
                >
                  Complete finalization before
                  completing procurement.
                </Text>
              )}
            </>
          ) : (
            <>
              <View style={styles.noCurrent}>
                <ActivityIndicator
                  size="small"
                  color="#2E7D32"
                />

                <Text
                  style={styles.noCurrentTitle}
                >
                  No farmer is currently being
                  served
                </Text>

                <Text
                  style={styles.noCurrentText}
                >
                  Call the next token to begin
                  procurement.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callNextButton}
                disabled={
                  actionLoading ||
                  waitingCount === 0
                }
                onPress={handleCallNext}
              >
                {actionLoading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={styles.callNextText}
                  >
                    {waitingCount === 0
                      ? 'No Waiting Tokens'
                      : 'Call Next Token'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Payment Management */}

        <Text style={styles.sectionTitle}>
          Payment Management
        </Text>

        <View style={styles.paymentSectionCard}>
          {paymentLoading ? (
            <View style={styles.paymentLoading}>
              <ActivityIndicator
                size="small"
                color="#2E7D32"
              />

              <Text style={styles.paymentLoadingText}>
                Loading payment records...
              </Text>
            </View>
          ) : payments.length === 0 ? (
            <View style={styles.paymentEmpty}>
              <Text style={styles.emptyTitle}>
                No payment records yet
              </Text>

              <Text style={styles.emptyText}>
                A payment record will appear after procurement is completed.
              </Text>
            </View>
          ) : (
            payments.map((payment) => {
              const amount = Number(payment.amount ?? 0);
              const booking = payment.procurement.booking;

              return (
                <View
                  key={payment.id}
                  style={styles.paymentCard}
                >
                  <View style={styles.paymentHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentFarmer}>
                        {booking.user.fullName}
                      </Text>

                      <Text style={styles.paymentFarmerId}>
                        {booking.user.farmerId} • {booking.bookingId}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.paymentStatusBadge,
                        payment.status === 'PROCESSING' &&
                          styles.paymentStatusProcessing,
                        payment.status === 'INITIATED' &&
                          styles.paymentStatusInitiated,
                        payment.status === 'CREDITED' &&
                          styles.paymentStatusCredited,
                        payment.status === 'FAILED' &&
                          styles.paymentStatusFailed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentStatusText,
                          payment.status === 'PROCESSING' &&
                            styles.paymentStatusTextProcessing,
                          payment.status === 'INITIATED' &&
                            styles.paymentStatusTextInitiated,
                          payment.status === 'CREDITED' &&
                            styles.paymentStatusTextCredited,
                          payment.status === 'FAILED' &&
                            styles.paymentStatusTextFailed,
                        ]}
                      >
                        {payment.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.paymentDetails}>
                    <View>
                      <Text style={styles.paymentDetailLabel}>
                        Commodity
                      </Text>
                      <Text style={styles.paymentDetailValue}>
                        {booking.commodity}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.paymentDetailLabel}>
                        Quantity
                      </Text>
                      <Text style={styles.paymentDetailValue}>
                        {booking.quantityQuintals} qtl
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.paymentDetailLabel}>
                        Amount
                      </Text>
                      <Text style={styles.paymentAmount}>
                        ₹{amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {payment.bankReference && (
                    <View style={styles.bankReferenceCard}>
                      <Text style={styles.bankReferenceLabel}>
                        BANK REFERENCE
                      </Text>
                      <Text style={styles.bankReferenceValue}>
                        {payment.bankReference}
                      </Text>
                    </View>
                  )}

                  {payment.status === 'PROCESSING' && (
                    <View style={styles.paymentActions}>
                      <TouchableOpacity
                        style={styles.paymentPrimaryButton}
                        disabled={paymentActionLoading === payment.id}
                        onPress={() =>
                          handlePaymentAction(payment.id, 'initiate')
                        }
                      >
                        {paymentActionLoading === payment.id ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.paymentPrimaryButtonText}>
                            Initiate Payment
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.paymentFailButton}
                        disabled={paymentActionLoading === payment.id}
                        onPress={() =>
                          handlePaymentAction(payment.id, 'fail')
                        }
                      >
                        <Text style={styles.paymentFailButtonText}>
                          Mark Failed
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {payment.status === 'INITIATED' && (
                    <View style={styles.paymentActions}>
                      <TouchableOpacity
                        style={styles.paymentPrimaryButton}
                        disabled={paymentActionLoading === payment.id}
                        onPress={() =>
                          handlePaymentAction(payment.id, 'credit')
                        }
                      >
                        {paymentActionLoading === payment.id ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.paymentPrimaryButtonText}>
                            Mark as Credited
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.paymentFailButton}
                        disabled={paymentActionLoading === payment.id}
                        onPress={() =>
                          handlePaymentAction(payment.id, 'fail')
                        }
                      >
                        <Text style={styles.paymentFailButtonText}>
                          Mark Failed
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {payment.status === 'CREDITED' && (
                    <Text style={styles.paymentCompletedText}>
                      Payment credited successfully.
                    </Text>
                  )}

                  {payment.status === 'FAILED' && (
                    <Text style={styles.paymentFailedText}>
                      Payment requires attention before another attempt.
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Grievance Management */}

        <Text style={styles.sectionTitle}>
          Grievance Management
        </Text>

        <View style={styles.grievanceSectionCard}>
          {grievanceLoading ? (
            <View style={styles.grievanceLoading}>
              <ActivityIndicator
                size="small"
                color="#2E7D32"
              />
              <Text style={styles.grievanceLoadingText}>
                Loading grievances...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.grievanceFilterRow}>
                {(['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'] as const).map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.grievanceFilterButton,
                        grievanceFilter === status &&
                          styles.grievanceFilterButtonActive,
                      ]}
                      onPress={() => setGrievanceFilter(status)}
                    >
                      <Text
                        style={[
                          styles.grievanceFilterText,
                          grievanceFilter === status &&
                            styles.grievanceFilterTextActive,
                        ]}
                      >
                        {status === 'ALL'
                          ? 'All'
                          : grievanceStatusLabels[status]}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {(() => {
                const filteredGrievances =
                  grievanceFilter === 'ALL'
                    ? grievances
                    : grievances.filter(
                        (item) => item.status === grievanceFilter
                      );

                if (filteredGrievances.length === 0) {
                  return (
                    <View style={styles.grievanceEmpty}>
                      <Text style={styles.emptyTitle}>
                        No grievances found
                      </Text>
                      <Text style={styles.emptyText}>
                        {grievanceFilter === 'ALL'
                          ? 'Submitted farmer grievances will appear here.'
                          : `There are no ${grievanceStatusLabels[grievanceFilter].toLowerCase()} grievances.`}
                      </Text>
                    </View>
                  );
                }

                return filteredGrievances.map((grievance) => (
                  <TouchableOpacity
                    key={grievance.grievanceId}
                    activeOpacity={0.85}
                    style={[
                      styles.grievanceCard,
                      selectedGrievanceId === grievance.grievanceId &&
                        styles.grievanceCardActive,
                    ]}
                    onPress={() =>
                      openGrievanceDetails(grievance.grievanceId)
                    }
                  >
                    <View style={styles.grievanceCardTop}>
                      <View style={styles.grievanceIssueBox}>
                        <Text style={styles.grievanceIssueText}>
                          {grievanceIssueLabels[grievance.issueType]}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.grievanceStatusBadge,
                          grievance.status === 'OPEN' &&
                            styles.grievanceStatusOpen,
                          grievance.status === 'IN_REVIEW' &&
                            styles.grievanceStatusReview,
                          grievance.status === 'RESOLVED' &&
                            styles.grievanceStatusResolved,
                          grievance.status === 'REJECTED' &&
                            styles.grievanceStatusRejected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.grievanceStatusText,
                            grievance.status === 'OPEN' &&
                              styles.grievanceStatusTextOpen,
                            grievance.status === 'IN_REVIEW' &&
                              styles.grievanceStatusTextReview,
                            grievance.status === 'RESOLVED' &&
                              styles.grievanceStatusTextResolved,
                            grievance.status === 'REJECTED' &&
                              styles.grievanceStatusTextRejected,
                          ]}
                        >
                          {grievanceStatusLabels[grievance.status]}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.grievanceIdText}>
                      {grievance.grievanceId}
                    </Text>

                    <Text style={styles.grievanceFarmerName}>
                      {grievance.user.fullName}
                    </Text>

                    <Text style={styles.grievanceFarmerMeta}>
                      {grievance.user.farmerId} • {grievance.user.mobile}
                    </Text>

                    <Text
                      style={styles.grievanceDescriptionPreview}
                      numberOfLines={2}
                    >
                      {grievance.description}
                    </Text>

                    <Text style={styles.grievanceDateText}>
                      Submitted {formatDateTime(grievance.createdAt)}
                    </Text>
                  </TouchableOpacity>
                ));
              })()}

              {selectedGrievanceId && (
                <View style={styles.grievanceDetailCard}>
                  {grievanceDetailLoading || !selectedGrievance ? (
                    <View style={styles.grievanceLoading}>
                      <ActivityIndicator
                        size="small"
                        color="#2E7D32"
                      />
                      <Text style={styles.grievanceLoadingText}>
                        Loading grievance details...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.grievanceDetailHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.grievanceDetailTitle}>
                            Grievance Details
                          </Text>
                          <Text style={styles.grievanceDetailId}>
                            {selectedGrievance.grievanceId}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.grievanceCloseButton}
                          onPress={closeGrievanceDetails}
                          disabled={grievanceActionLoading}
                        >
                          <Text style={styles.grievanceCloseText}>
                            Close
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.grievanceDetailRow}>
                        <View style={styles.grievanceDetailColumn}>
                          <Text style={styles.grievanceDetailLabel}>
                            Farmer
                          </Text>
                          <Text style={styles.grievanceDetailValue}>
                            {selectedGrievance.user.fullName}
                          </Text>
                        </View>

                        <View style={styles.grievanceDetailColumn}>
                          <Text style={styles.grievanceDetailLabel}>
                            Farmer ID
                          </Text>
                          <Text style={styles.grievanceDetailValue}>
                            {selectedGrievance.user.farmerId}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.grievanceDetailRow}>
                        <View style={styles.grievanceDetailColumn}>
                          <Text style={styles.grievanceDetailLabel}>
                            Issue Type
                          </Text>
                          <Text style={styles.grievanceDetailValue}>
                            {grievanceIssueLabels[selectedGrievance.issueType]}
                          </Text>
                        </View>

                        <View style={styles.grievanceDetailColumn}>
                          <Text style={styles.grievanceDetailLabel}>
                            Mobile
                          </Text>
                          <Text style={styles.grievanceDetailValue}>
                            {selectedGrievance.user.mobile}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.grievanceDescriptionBox}>
                        <Text style={styles.grievanceDetailLabel}>
                          Description
                        </Text>
                        <Text style={styles.grievanceDescriptionText}>
                          {selectedGrievance.description}
                        </Text>
                      </View>

                      {selectedGrievance.booking && (
                        <View style={styles.grievanceBookingBox}>
                          <Text style={styles.grievanceDetailLabel}>
                            Related Booking
                          </Text>
                          <Text style={styles.grievanceBookingId}>
                            {selectedGrievance.booking.bookingId}
                          </Text>
                          <Text style={styles.grievanceBookingMeta}>
                            {selectedGrievance.booking.commodity} •{' '}
                            {selectedGrievance.booking.quantityQuintals} qtl •{' '}
                            Token {selectedGrievance.booking.tokenNumber ?? '--'}
                          </Text>
                          <Text style={styles.grievanceBookingMeta}>
                            {selectedGrievance.booking.slot.center.name} •{' '}
                            {formatTime(selectedGrievance.booking.slot.startTime)}
                          </Text>
                        </View>
                      )}

                      <Text style={styles.grievanceDetailLabel}>
                        Resolution Note
                      </Text>

                      <TextInput
                        value={resolutionNote}
                        onChangeText={setResolutionNote}
                        multiline
                        textAlignVertical="top"
                        placeholder="Enter review or resolution note"
                        placeholderTextColor="#9AA39C"
                        style={styles.grievanceResolutionInput}
                        editable={!grievanceActionLoading}
                      />

                      <Text style={styles.grievanceDetailLabel}>
                        Update Status
                      </Text>

                      <View style={styles.grievanceActionRow}>
                        {(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'] as const).map(
                          (status) => (
                            <TouchableOpacity
                              key={status}
                              style={[
                                styles.grievanceActionButton,
                                selectedGrievance.status === status &&
                                  styles.grievanceActionButtonActive,
                              ]}
                              disabled={grievanceActionLoading}
                              onPress={() =>
                                handleGrievanceStatusUpdate(status)
                              }
                            >
                              {grievanceActionLoading &&
                              selectedGrievance.status === status ? (
                                <ActivityIndicator color="#2E7D32" />
                              ) : (
                                <Text
                                  style={[
                                    styles.grievanceActionButtonText,
                                    selectedGrievance.status === status &&
                                      styles.grievanceActionButtonTextActive,
                                  ]}
                                >
                                  {grievanceStatusLabels[status]}
                                </Text>
                              )}
                            </TouchableOpacity>
                          )
                        )}
                      </View>

                      {selectedGrievance.resolvedAt && (
                        <Text style={styles.grievanceResolvedText}>
                          Resolved {formatDateTime(selectedGrievance.resolvedAt)}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* Today's Queue */}

        <View style={styles.queueHeader}>
          <Text style={styles.sectionTitle}>
            Today's Queue
          </Text>

          <Text style={styles.queueCount}>
            {queue.length} tokens
          </Text>
        </View>

        {queue.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No bookings in queue
            </Text>

            <Text style={styles.emptyText}>
              Today's confirmed bookings will
              appear here.
            </Text>
          </View>
        ) : (
          queue.map((item) => (
            <View
              key={item.id}
              style={[
                styles.queueCard,
                item.tokenStatus === 'SERVING' &&
                  styles.queueCardServing,
                item.tokenStatus === 'COMPLETED' &&
                  styles.queueCardCompleted,
              ]}
            >
              <View style={styles.tokenBox}>
                <Text
                  style={styles.tokenNumber}
                >
                  {item.tokenNumber}
                </Text>
              </View>

              <View style={styles.queueMain}>
                <Text style={styles.queueFarmer}>
                  {item.farmerName}
                </Text>

                <Text
                  style={styles.queueFarmerId}
                >
                  {item.farmerId}
                </Text>

                <View
                  style={styles.queueDetails}
                >
                  <Text
                    style={styles.queueDetail}
                  >
                    {item.commodity}
                  </Text>

                  <Text
                    style={styles.queueSeparator}
                  >
                    •
                  </Text>

                  <Text
                    style={styles.queueDetail}
                  >
                    {item.quantityQuintals} qtl
                  </Text>

                  <Text
                    style={styles.queueSeparator}
                  >
                    •
                  </Text>

                  <Text
                    style={styles.queueDetail}
                  >
                    {formatTime(
                      item.startTime
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.tokenStatus ===
                    'SERVING' &&
                    styles.statusServing,
                  item.tokenStatus ===
                    'COMPLETED' &&
                    styles.statusCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.tokenStatus ===
                      'SERVING' &&
                      styles.statusTextServing,
                    item.tokenStatus ===
                      'COMPLETED' &&
                      styles.statusTextCompleted,
                  ]}
                >
                  {statusLabels[
                    item.tokenStatus
                  ]}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footerText}>
          Pull down to refresh queue status
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#667067',
  },

  header: {
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18351D',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: '#667067',
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EAF2EA',
  },

  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },

  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E9E1',
  },

  centerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  centerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#78907B',
  },

  centerName: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: '800',
    color: '#18351D',
  },

  centerLocation: {
    marginTop: 4,
    fontSize: 13,
    color: '#667067',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6EA',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 5,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },

  centerStats: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18351D',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 11,
    color: '#778078',
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8E2',
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#18351D',
  },

  currentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E9E1',
  },

  currentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  currentLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#78907B',
  },

  currentToken: {
    marginTop: 4,
    fontSize: 38,
    fontWeight: '900',
    color: '#2E7D32',
  },

  servingBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EAF6EA',
  },

  servingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },

  farmerInfo: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#F7FAF7',
    borderRadius: 12,
  },

  farmerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18351D',
  },

  farmerId: {
    marginTop: 3,
    fontSize: 12,
    color: '#778078',
  },

  bookingDetails: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailLabel: {
    fontSize: 10,
    color: '#889189',
  },

  detailValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '700',
    color: '#304234',
  },

  procurementStatus: {
    marginTop: 16,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#F1F6F1',
    borderWidth: 1,
    borderColor: '#E0E9E1',
  },

  procurementStatusLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#78907B',
  },

  procurementStatusValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: '#2E7D32',
  },

  stageTitle: {
    marginTop: 18,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '700',
    color: '#667067',
  },

  stageCurrent: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EAF2EA',
  },

  stageCurrentText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#2E7D32',
  },

  workflowSection: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
  },

  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  workflowNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 30,
    fontSize: 13,
    fontWeight: '900',
    marginRight: 10,
  },

  workflowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18351D',
  },

  workflowSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#778078',
  },

  inputLabel: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#526057',
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D7E1D8',
    borderRadius: 10,
    paddingHorizontal: 13,
    backgroundColor: '#FFFFFF',
    color: '#304234',
    fontSize: 14,
  },

  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2,
  },

  gradeButton: {
    minWidth: 54,
    paddingHorizontal: 11,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E1D8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gradeButtonActive: {
    backgroundColor: '#EAF2EA',
    borderColor: '#2E7D32',
  },

  gradeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#667067',
  },

  gradeTextActive: {
    color: '#2E7D32',
  },

  secondaryButton: {
    minHeight: 48,
    marginTop: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '800',
  },

  calculationCard: {
    marginTop: 13,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#EAF6EA',
  },

  calculationLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#6B806D',
  },

  calculationValue: {
    marginTop: 3,
    fontSize: 23,
    fontWeight: '900',
    color: '#2E7D32',
  },

  calculationHint: {
    marginTop: 2,
    fontSize: 10,
    color: '#778078',
  },

  amountCard: {
    marginTop: 13,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#18351D',
  },

  amountLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#C9D8CB',
  },

  amountValue: {
    marginTop: 4,
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  stageButtons: {
    marginTop: 10,
    gap: 8,
  },

  stageButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E1D8',
    backgroundColor: '#FFFFFF',
  },

  stageButtonActive: {
    backgroundColor: '#EAF2EA',
    borderColor: '#2E7D32',
  },

  stageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526057',
  },

  stageButtonTextActive: {
    color: '#2E7D32',
  },

  completeButton: {
    height: 52,
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  completeButtonDisabled: {
    backgroundColor: '#AEB9AF',
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  completeHint: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 10,
    color: '#8A918B',
  },

  noCurrent: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  noCurrentTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#304234',
    textAlign: 'center',
  },

  noCurrentText: {
    marginTop: 5,
    fontSize: 13,
    color: '#778078',
    textAlign: 'center',
  },

  callNextButton: {
    height: 54,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  callNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  paymentSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E9E1',
  },

  paymentLoading: {
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#778078',
  },

  paymentEmpty: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  paymentCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F7FAF7',
    borderWidth: 1,
    borderColor: '#E2E9E2',
    marginBottom: 10,
  },

  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  paymentFarmer: {
    fontSize: 15,
    fontWeight: '800',
    color: '#304234',
  },

  paymentFarmerId: {
    marginTop: 3,
    fontSize: 10,
    color: '#889189',
  },

  paymentStatusBadge: {
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#EEF1EE',
  },

  paymentStatusProcessing: {
    backgroundColor: '#FFF6DF',
  },

  paymentStatusInitiated: {
    backgroundColor: '#EAF2EA',
  },

  paymentStatusCredited: {
    backgroundColor: '#EAF6EA',
  },

  paymentStatusFailed: {
    backgroundColor: '#FDECEC',
  },

  paymentStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#687169',
  },

  paymentStatusTextProcessing: {
    color: '#8A6B1D',
  },

  paymentStatusTextInitiated: {
    color: '#2E7D32',
  },

  paymentStatusTextCredited: {
    color: '#2E7D32',
  },

  paymentStatusTextFailed: {
    color: '#B3261E',
  },

  paymentDetails: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E9E2',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  paymentDetailLabel: {
    fontSize: 9,
    color: '#889189',
  },

  paymentDetailValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#304234',
  },

  paymentAmount: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '900',
    color: '#2E7D32',
  },

  bankReferenceCard: {
    marginTop: 11,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#EAF2EA',
  },

  bankReferenceLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#78907B',
  },

  bankReferenceValue: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: '#304234',
  },

  paymentActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },

  paymentPrimaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  paymentFailButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3B7B3',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentFailButtonText: {
    color: '#B3261E',
    fontSize: 11,
    fontWeight: '800',
  },

  paymentCompletedText: {
    marginTop: 11,
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },

  paymentFailedText: {
    marginTop: 11,
    fontSize: 11,
    fontWeight: '700',
    color: '#B3261E',
  },

  grievanceSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E9E1',
  },

  grievanceLoading: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  grievanceLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#778078',
  },

  grievanceFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },

  grievanceFilterButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E1D8',
    backgroundColor: '#FFFFFF',
  },

  grievanceFilterButtonActive: {
    backgroundColor: '#EAF2EA',
    borderColor: '#2E7D32',
  },

  grievanceFilterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#667067',
  },

  grievanceFilterTextActive: {
    color: '#2E7D32',
  },

  grievanceEmpty: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  grievanceCard: {
    marginTop: 9,
    padding: 12,
    borderRadius: 13,
    backgroundColor: '#F7FAF7',
    borderWidth: 1,
    borderColor: '#E2E9E2',
  },

  grievanceCardActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#F2F8F2',
  },

  grievanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  grievanceIssueBox: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#EAF2EA',
  },

  grievanceIssueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2E7D32',
  },

  grievanceStatusBadge: {
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  grievanceStatusOpen: {
    backgroundColor: '#FFF6DF',
  },

  grievanceStatusReview: {
    backgroundColor: '#EAF2EA',
  },

  grievanceStatusResolved: {
    backgroundColor: '#EAF6EA',
  },

  grievanceStatusRejected: {
    backgroundColor: '#FDECEC',
  },

  grievanceStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  grievanceStatusTextOpen: {
    color: '#8A6B1D',
  },

  grievanceStatusTextReview: {
    color: '#2E7D32',
  },

  grievanceStatusTextResolved: {
    color: '#2E7D32',
  },

  grievanceStatusTextRejected: {
    color: '#B3261E',
  },

  grievanceIdText: {
    marginTop: 8,
    fontSize: 9,
    color: '#889189',
  },

  grievanceFarmerName: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '800',
    color: '#304234',
  },

  grievanceFarmerMeta: {
    marginTop: 2,
    fontSize: 10,
    color: '#778078',
  },

  grievanceDescriptionPreview: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#526057',
  },

  grievanceDateText: {
    marginTop: 8,
    fontSize: 9,
    color: '#929A93',
  },

  grievanceDetailCard: {
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFE0D0',
  },

  grievanceDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  grievanceDetailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18351D',
  },

  grievanceDetailId: {
    marginTop: 3,
    fontSize: 10,
    color: '#889189',
  },

  grievanceCloseButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#EEF1EE',
  },

  grievanceCloseText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#667067',
  },

  grievanceDetailRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 11,
  },

  grievanceDetailColumn: {
    flex: 1,
  },

  grievanceDetailLabel: {
    marginTop: 8,
    marginBottom: 5,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#7A857C',
  },

  grievanceDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#304234',
  },

  grievanceDescriptionBox: {
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#F7FAF7',
    borderWidth: 1,
    borderColor: '#E2E9E2',
  },

  grievanceDescriptionText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#526057',
  },

  grievanceBookingBox: {
    marginTop: 10,
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#EAF2EA',
  },

  grievanceBookingId: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '800',
    color: '#304234',
  },

  grievanceBookingMeta: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: '#667067',
  },

  grievanceResolutionInput: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#D7E1D8',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#304234',
    fontSize: 12,
    lineHeight: 17,
  },

  grievanceActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2,
  },

  grievanceActionButton: {
    minWidth: 74,
    minHeight: 40,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E1D8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  grievanceActionButtonActive: {
    backgroundColor: '#EAF2EA',
    borderColor: '#2E7D32',
  },

  grievanceActionButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#667067',
  },

  grievanceActionButtonTextActive: {
    color: '#2E7D32',
  },

  grievanceResolvedText: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },

  queueHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  queueCount: {
    marginTop: 24,
    fontSize: 12,
    color: '#778078',
  },

  queueCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E9E2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  queueCardServing: {
    borderColor: '#2E7D32',
  },

  queueCardCompleted: {
    opacity: 0.65,
  },

  tokenBox: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#EAF2EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  tokenNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2E7D32',
  },

  queueMain: {
    flex: 1,
    marginLeft: 12,
  },

  queueFarmer: {
    fontSize: 14,
    fontWeight: '800',
    color: '#304234',
  },

  queueFarmerId: {
    marginTop: 2,
    fontSize: 11,
    color: '#889189',
  },

  queueDetails: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  queueDetail: {
    fontSize: 10,
    color: '#667067',
  },

  queueSeparator: {
    marginHorizontal: 5,
    color: '#A4AEA5',
  },

  statusBadge: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFF6DF',
  },

  statusServing: {
    backgroundColor: '#EAF6EA',
  },

  statusCompleted: {
    backgroundColor: '#EEF1EE',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A6B1D',
  },

  statusTextServing: {
    color: '#2E7D32',
  },

  statusTextCompleted: {
    color: '#687169',
  },

  emptyCard: {
    padding: 24,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E9E2',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#304234',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: '#778078',
    textAlign: 'center',
  },

  footerText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 11,
    color: '#929A93',
  },
});