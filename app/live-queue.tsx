
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'https://krishisarthi-backend-32yz.onrender.com/api';
const SOCKET_BASE_URL = 'https://krishisarthi-backend-32yz.onrender.com';

interface Center {
  id: number;
  name: string;
  address?: string;
  location?: string;
  activeCounters?: number;
  avgServiceMinutes?: number;
}

interface Slot {
  id: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  center: Center;
}

interface Booking {
  id?: number;
  bookingId: string;
  tokenNumber: string | null;
  tokenStatus: string;
  status: string;
  commodity: string;
  quantityQuintals: number;
  estimatedWaitMin?: number | null;
  createdAt?: string;
  slotId: number;
  slot: Slot;
}

interface BookingApiResponse {
  success?: boolean;
  data?: Booking | Booking[];
  message?: string;
}

interface QueueData {
  tokenNumber: string;
  nowServing: string | null;
  farmersAhead: number;
  queueLength: number;
  activeCounters: number;
  avgServiceMinutes: number;
  estimatedWaitMin: number;
  currentStage: string;
  centerName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  updatedAt: string;
}

interface QueueApiResponse {
  success?: boolean;
  data?: QueueData;
  message?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';

  try {
    const datePart = dateString.split('T')[0];

    if (datePart) {
      const [year, month, day] = datePart.split('-').map(Number);

      if (year && month && day) {
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    }

    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatTime = (timeString?: string) => {
  if (!timeString) return '—';

  if (timeString.includes('T')) {
    const timePart = timeString.split('T')[1];

    if (timePart) {
      const match = timePart.match(/^(\d{1,2}):(\d{2})/);

      if (match) {
        const hour = Number(match[1]);
        const minute = match[2];

        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minute} ${suffix}`;
      }
    }
  }

  const match = timeString.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return timeString;

  const hour = Number(match[1]);
  const minute = match[2];

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'SERVING':
      return 'Being Served';

    case 'READY':
      return 'Your Turn';

    case 'COMPLETED':
      return 'Completed';

    case 'WAITING':
      return 'In Queue';

    default:
      return status || 'Waiting';
  }
};

const getStatusIcon = (
  status?: string
): keyof typeof Ionicons.glyphMap => {
  switch (status) {
    case 'SERVING':
      return 'radio';

    case 'READY':
      return 'checkmark-circle';

    case 'COMPLETED':
      return 'checkmark-done-circle';

    default:
      return 'time-outline';
  }
};

type StageStatus = 'completed' | 'current' | 'pending';

const getStageStatus = (
  stage: string,
  target: string
): StageStatus => {
  const stages = [
    'TOKEN_QUEUE',
    'QUALITY_CHECK',
    'WEIGHTMENT',
    'FINALIZATION',
    'COMPLETED',
  ];

  const currentIndex = stages.indexOf(stage);
  const targetIndex = stages.indexOf(target);

  if (currentIndex === -1 || targetIndex === -1) {
    return 'pending';
  }

  if (targetIndex < currentIndex) {
    return 'completed';
  }

  if (targetIndex === currentIndex) {
    return 'current';
  }

  return 'pending';
};

interface TimelineItemProps {
  title: string;
  subtitle: string;
  status: StageStatus;
  last?: boolean;
}

function TimelineItem({
  title,
  subtitle,
  status,
  last = false,
}: TimelineItemProps) {
  const icon =
    status === 'completed'
      ? 'checkmark'
      : status === 'current'
        ? 'ellipse'
        : 'ellipse-outline';

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            status === 'completed' && styles.timelineDotCompleted,
            status === 'current' && styles.timelineDotCurrent,
            status === 'pending' && styles.timelineDotPending,
          ]}
        >
          <Ionicons
            name={icon}
            size={status === 'current' ? 8 : 14}
            color={status === 'pending' ? '#AAB5AC' : '#FFFFFF'}
          />
        </View>

        {!last && (
          <View
            style={[
              styles.timelineLine,
              status === 'completed' && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>

      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineTitle,
            status === 'pending' && styles.timelineTitlePending,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.timelineSubtitle}>
          {subtitle}
        </Text>
      </View>

      {status === 'completed' && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>
            DONE
          </Text>
        </View>
      )}

      {status === 'current' && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>
            CURRENT
          </Text>
        </View>
      )}
    </View>
  );
}

export default function LiveQueueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const socketRef = useRef<Socket | null>(null);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [queue, setQueue] = useState<QueueData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueAndBooking = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError(null);

        const token =
          await SecureStore.getItemAsync('authToken');

        if (!token) {
          router.replace('/welcome');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [bookingResponse, queueResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/bookings/my-upcoming`,
              {
                method: 'GET',
                headers,
              }
            ),

            fetch(`${API_BASE_URL}/queue/my`, {
              method: 'GET',
              headers,
            }),
          ]);

        if (
          bookingResponse.status === 401 ||
          queueResponse.status === 401
        ) {
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('farmer');

          router.replace('/welcome');
          return;
        }

        const bookingData: BookingApiResponse =
          await bookingResponse.json();

        const queueData: QueueApiResponse =
          await queueResponse.json();

        if (!bookingResponse.ok || !bookingData.success) {
          throw new Error(
            bookingData.message ||
              'Unable to fetch your booking.'
          );
        }

        const bookingResult = bookingData.data;

        let currentBooking: Booking | null = null;

        if (Array.isArray(bookingResult)) {
          currentBooking =
            bookingResult[0] || null;
        } else {
          currentBooking =
            bookingResult || null;
        }

        setBooking(currentBooking);

        console.log(
  'LIVE QUEUE BOOKING:',
  JSON.stringify(currentBooking, null, 2)
);

console.log(
  'LIVE QUEUE CENTER ID:',
  currentBooking?.slot?.center?.id
);

        if (
          queueResponse.ok &&
          queueData.success &&
          queueData.data
        ) {
          setQueue(queueData.data);
        } else {
          setQueue(null);
        }
      } catch (err) {
        console.error(
          'Live queue fetch error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load live queue.'
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }

        setRefreshing(false);
      }
    },
    [router]
  );

 
useEffect(() => {
  let mounted = true;
  let socket: Socket | null = null;

  const centerId = booking?.slot?.center?.id;

  console.log(
    'Queue Socket effect started. Center ID:',
    centerId
  );

  /*
   * We cannot join a queue room until the booking
   * contains the procurement center ID.
   */
  if (!centerId) {
    console.log(
      'Queue Socket: no center ID yet, waiting for booking data.'
    );

    return;
  }

  const setupSocket = async () => {
    try {
      const token =
        await SecureStore.getItemAsync('authToken');

      if (!token) {
        console.warn(
          'Queue Socket: authentication token not found.'
        );

        return;
      }

      if (!mounted) {
        return;
      }

      console.log(
        'Queue Socket: creating connection...',
        SOCKET_BASE_URL
      );

      socket = io(SOCKET_BASE_URL, {
        auth: {
          token,
        },

        /*
         * WebSocket is preferred for the mobile app.
         */
        transports: ['websocket'],

        autoConnect: true,

        /*
         * Useful while debugging connection problems.
         */
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      /*
       * Store the socket reference only while
       * this screen/effect is still active.
       */
      if (mounted) {
        socketRef.current = socket;
      }

      /*
       * -------------------------------------------------
       * CONNECTED
       * -------------------------------------------------
       */
      socket.on('connect', () => {
        if (!mounted) {
          return;
        }

        console.log(
          'Socket connected:',
          socket?.id
        );

        console.log(
          'Joining queue center:',
          centerId
        );

        /*
         * IMPORTANT:
         *
         * Backend expects the center ID directly:
         *
         * queue:join-center -> number
         *
         * NOT:
         * { centerId }
         */
        socket?.emit(
          'queue:join-center',
          centerId
        );
      });

      /*
       * -------------------------------------------------
       * QUEUE ROOM JOINED
       * -------------------------------------------------
       */
      socket.on(
        'queue:joined',
        (data: { centerId?: number }) => {
          if (!mounted) {
            return;
          }

          console.log(
            'Queue room joined successfully:',
            data
          );
        }
      );

      /*
       * -------------------------------------------------
       * REAL-TIME QUEUE UPDATE
       * -------------------------------------------------
       *
       * The backend does NOT send the entire queue.
       *
       * It sends:
       * {
       *   centerId: 2
       * }
       *
       * Then we fetch the latest queue through REST.
       */
      socket.on(
        'queue:update',
        (data: { centerId?: number }) => {
          if (!mounted) {
            return;
          }

          console.log(
            'Real-time queue update received:',
            data
          );

          /*
           * Ignore updates belonging to another center.
           */
          if (
            data?.centerId &&
            data.centerId !== centerId
          ) {
            return;
          }

          console.log(
            'Refreshing queue after real-time update...'
          );

          fetchQueueAndBooking(false);
        }
      );

      /*
       * -------------------------------------------------
       * QUEUE ERROR
       * -------------------------------------------------
       */
      socket.on(
        'queue:error',
        (message: string) => {
          if (!mounted) {
            return;
          }

          console.warn(
            'Queue socket error:',
            message
          );
        }
      );

      /*
       * -------------------------------------------------
       * CONNECTION ERROR
       * -------------------------------------------------
       */
      socket.on(
        'connect_error',
        (err) => {
          if (!mounted) {
            return;
          }

          console.warn(
            'Socket connection error:',
            err.message
          );
        }
      );

      /*
       * -------------------------------------------------
       * RECONNECTING
       * -------------------------------------------------
       */
      socket.io.on(
        'reconnect_attempt',
        (attempt) => {
          if (!mounted) {
            return;
          }

          console.log(
            'Socket reconnect attempt:',
            attempt
          );
        }
      );

      /*
       * -------------------------------------------------
       * RECONNECTED
       * -------------------------------------------------
       */
      socket.io.on(
        'reconnect',
        (attempt) => {
          if (!mounted) {
            return;
          }

          console.log(
            'Socket reconnected after attempt:',
            attempt
          );

          /*
           * After reconnecting, join the room again.
           */
          socket?.emit(
            'queue:join-center',
            centerId
          );
        }
      );

      /*
       * -------------------------------------------------
       * DISCONNECTED
       * -------------------------------------------------
       */
      socket.on(
        'disconnect',
        (reason) => {
          console.log(
            'Socket disconnected:',
            reason
          );
        }
      );
    } catch (err) {
      if (!mounted) {
        return;
      }

      console.warn(
        'Socket setup error:',
        err
      );
    }
  };

  setupSocket();

  /*
   * ---------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------
   */
  return () => {
    mounted = false;

    console.log(
      'Cleaning up queue Socket.IO connection.'
    );

    if (socket) {
      console.log(
        'Leaving queue center:',
        centerId
      );

      socket.emit(
        'queue:leave-center',
        centerId
      );

      socket.removeAllListeners();
      socket.disconnect();
    }

    if (socketRef.current === socket) {
      socketRef.current = null;
    }
  };
}, [
  fetchQueueAndBooking,
  booking?.slot?.center?.id,
]);
  /*
   * Initial queue fetch only.
   *
   * We no longer poll every 5 seconds.
   * Socket.IO now triggers the refresh whenever
   * the operator changes the queue.
   */
  useEffect(() => {
    fetchQueueAndBooking();
  }, [fetchQueueAndBooking]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQueueAndBooking(false);
  }, [fetchQueueAndBooking]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Loading live queue...
        </Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View
        style={[
          styles.emptyScreen,
          {
            paddingTop: insets.top + 20,
          },
        ]}
      >
        <View style={styles.emptyIcon}>
          <Ionicons
            name="ticket-outline"
            size={38}
            color="#2E7D32"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Active Booking
        </Text>

        <Text style={styles.emptyDescription}>
          You don't have an upcoming confirmed booking.
          Book a procurement slot to see your live queue
          status here.
        </Text>

        <Pressable
          style={styles.bookButton}
          onPress={() => router.push('/book-slot')}
        >
          <Text style={styles.bookButtonText}>
            Book a Slot
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const center = booking.slot?.center;

  /*
   * IMPORTANT:
   *
   * The farmer's own token status has priority.
   *
   * If the booking is completed, we should not display
   * the center's reset TOKEN_QUEUE stage.
   */
  const isCompleted =
    booking.tokenStatus === 'COMPLETED' ||
    booking.status === 'COMPLETED';

  const isServing =
    booking.tokenStatus === 'SERVING';

  const isWaiting =
    booking.tokenStatus === 'WAITING' ||
    booking.tokenStatus === 'READY';

  /*
   * The center's current stage should only be applied
   * when the currently served token is actually OUR token.
   */
  const isOurTokenCurrentlyServing =
    !!queue?.nowServing &&
    !!booking.tokenNumber &&
    queue.nowServing === booking.tokenNumber;

  let currentStage = 'TOKEN_QUEUE';

  if (isCompleted) {
    currentStage = 'COMPLETED';
  } else if (isOurTokenCurrentlyServing) {
    currentStage =
      queue?.currentStage || 'TOKEN_QUEUE';
  } else if (isServing) {
    currentStage =
      queue?.currentStage || 'TOKEN_QUEUE';
  } else if (isWaiting) {
    currentStage = 'TOKEN_QUEUE';
  }

  const estimatedWait =
    isCompleted
      ? 0
      : typeof queue?.estimatedWaitMin === 'number'
        ? queue.estimatedWaitMin
        : typeof booking.estimatedWaitMin === 'number'
          ? booking.estimatedWaitMin
          : null;

  const farmersAhead =
    isCompleted
      ? 0
      : queue?.farmersAhead ?? 0;

  const queueLength =
    queue?.queueLength ?? 0;

  const activeCounters =
    queue?.activeCounters ??
    center?.activeCounters ??
    0;

  const avgServiceMinutes =
    queue?.avgServiceMinutes ??
    center?.avgServiceMinutes ??
    0;

  const queueProgressWidth =
    isCompleted
      ? ('100%' as `${number}%`)
      : queue && queue.queueLength > 0
        ? (`${Math.min(
            100,
            Math.max(
              10,
              ((queue.queueLength -
                queue.farmersAhead) /
                queue.queueLength) *
                100
            )
          )}%` as `${number}%`)
        : ('10%' as `${number}%`);

  const tokenStatus = isCompleted
    ? 'Completed'
    : getStatusLabel(booking.tokenStatus);

  const tokenIcon = isCompleted
    ? 'checkmark-done-circle'
    : getStatusIcon(booking.tokenStatus);

  const aiMessage =
    isCompleted
      ? 'Your procurement has been completed.'
      : isOurTokenCurrentlyServing
        ? 'Your token is currently being processed.'
        : estimatedWait === 0
          ? 'You are next in line.'
          : estimatedWait !== null
            ? `Your estimated turn is in about ${estimatedWait} minutes.`
            : 'Waiting for live queue data.';

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#183B1D"
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Live Queue
          </Text>

          <Text
            style={styles.headerSubtitle}
            numberOfLines={1}
          >
            {queue?.centerName ||
              center?.name ||
              'Procurement Center'}
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            LIVE
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 90,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2E7D32"
          />
        }
      >
        {/* ERROR */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#B3261E"
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* TOKEN CARD */}
        <View style={styles.tokenCard}>
          <View style={styles.tokenCardTop}>
            <View>
              <Text style={styles.sectionEyebrow}>
                YOUR TOKEN
              </Text>

              <Text style={styles.tokenNumber}>
                {booking.tokenNumber || '—'}
              </Text>
            </View>

            <View style={styles.statusPill}>
              <Ionicons
                name={tokenIcon}
                size={14}
                color="#2E7D32"
              />

              <Text style={styles.statusPillText}>
                {tokenStatus}
              </Text>
            </View>
          </View>

          <View style={styles.tokenDivider} />

          <View style={styles.bookingInfoRow}>
            <View style={styles.bookingInfoItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#5C6B61"
              />

              <View>
                <Text style={styles.infoLabel}>
                  DATE
                </Text>

                <Text style={styles.infoValue}>
                  {formatDate(
                    queue?.slotDate ||
                      booking.slot?.slotDate
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.bookingInfoItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#5C6B61"
              />

              <View>
                <Text style={styles.infoLabel}>
                  TIME
                </Text>

                <Text style={styles.infoValue}>
                  {formatTime(
                    queue?.startTime ||
                      booking.slot?.startTime
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bookingInfoRow}>
            <View style={styles.bookingInfoItem}>
              <Ionicons
                name="leaf-outline"
                size={16}
                color="#5C6B61"
              />

              <View>
                <Text style={styles.infoLabel}>
                  COMMODITY
                </Text>

                <Text style={styles.infoValue}>
                  {booking.commodity || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.bookingInfoItem}>
              <Ionicons
                name="scale-outline"
                size={16}
                color="#5C6B61"
              />

              <View>
                <Text style={styles.infoLabel}>
                  QUANTITY
                </Text>

                <Text style={styles.infoValue}>
                  {booking.quantityQuintals ?? '—'}{' '}
                  Quintals
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* QUEUE ESTIMATE */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.aiHeaderText}>
              <Text style={styles.aiTitle}>
                Queue Estimate
              </Text>

              <Text style={styles.aiSubtitle}>
                Current estimated waiting time
              </Text>
            </View>

            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>
                LIVE
              </Text>
            </View>
          </View>

          <View style={styles.aiEtaRow}>
            <View>
              <Text style={styles.aiEtaNumber}>
                {estimatedWait !== null
                  ? estimatedWait
                  : '—'}
              </Text>

              <Text style={styles.aiEtaUnit}>
                minutes
              </Text>
            </View>

            <View style={styles.aiEtaMessage}>
              <Ionicons
                name={
                  isCompleted
                    ? 'checkmark-circle-outline'
                    : 'trending-down-outline'
                }
                size={18}
                color="#2E7D32"
              />

              <Text style={styles.aiEtaText}>
                {aiMessage}
              </Text>
            </View>
          </View>

          <Text style={styles.aiFooter}>
            Estimate uses current queue position,
            active counters and average service time.
            ML prediction can be connected here later.
          </Text>
        </View>

        {/* QUEUE PROGRESS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Queue Progress
              </Text>

              <Text style={styles.cardSubtitle}>
                Your position at the procurement center
              </Text>
            </View>

            <Ionicons
              name="people-outline"
              size={21}
              color="#2E7D32"
            />
          </View>

          <View style={styles.queueProgressBox}>
            <View style={styles.queueTokenRow}>
              <View style={styles.queueTokenItem}>
                <Text style={styles.queueTokenLabel}>
                  NOW SERVING
                </Text>

                <Text style={styles.queueTokenValue}>
                  {isCompleted
                    ? '—'
                    : queue?.nowServing || '—'}
                </Text>
              </View>

              <Ionicons
                name="arrow-forward"
                size={22}
                color="#9AA89D"
              />

              <View style={styles.queueTokenItem}>
                <Text style={styles.queueTokenLabel}>
                  YOUR TOKEN
                </Text>

                <Text style={styles.queueTokenValue}>
                  {booking.tokenNumber || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.queueProgressTrack}>
              <View
                style={[
                  styles.queueProgressFill,
                  {
                    width: queueProgressWidth,
                  },
                ]}
              />
            </View>

            <View style={styles.queueAheadRow}>
              <Text style={styles.queueAheadText}>
                {isCompleted
                  ? 'Procurement completed'
                  : `${farmersAhead} farmers ahead`}
              </Text>

              <Text style={styles.queueAheadText}>
                {isCompleted
                  ? 'Done'
                  : `${queueLength} in queue`}
              </Text>
            </View>
          </View>
        </View>

        {/* PROCUREMENT PROGRESS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Procurement Progress
              </Text>

              <Text style={styles.cardSubtitle}>
                Current processing stage
              </Text>
            </View>

            <Ionicons
              name="git-branch-outline"
              size={21}
              color="#2E7D32"
            />
          </View>

          <View style={styles.timeline}>
            <TimelineItem
              title="Token Queue"
              subtitle="Waiting for your turn"
              status={getStageStatus(
                currentStage,
                'TOKEN_QUEUE'
              )}
            />

            <TimelineItem
              title="Quality Check"
              subtitle="Produce quality verification"
              status={getStageStatus(
                currentStage,
                'QUALITY_CHECK'
              )}
            />

            <TimelineItem
              title="Weightment"
              subtitle="Official produce weight"
              status={getStageStatus(
                currentStage,
                'WEIGHTMENT'
              )}
            />

            <TimelineItem
              title="Finalization"
              subtitle="Procurement record finalization"
              status={getStageStatus(
                currentStage,
                'FINALIZATION'
              )}
              last
            />
          </View>

          {isCompleted && (
            <View style={styles.completedMessage}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color="#2E7D32"
              />

              <Text style={styles.completedMessageText}>
                Your procurement has been completed
                successfully.
              </Text>
            </View>
          )}
        </View>

        {/* LIVE CENTER STATUS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Live Center Status
              </Text>

              <Text style={styles.cardSubtitle}>
                Current procurement center activity
              </Text>
            </View>

            <View style={styles.liveSmallBadge}>
              <View style={styles.liveSmallDot} />

              <Text style={styles.liveSmallText}>
                LIVE
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.statValue}>
                {queue
                  ? String(queueLength)
                  : '—'}
              </Text>

              <Text style={styles.statLabel}>
                FARMERS IN QUEUE
              </Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Ionicons
                  name="speedometer-outline"
                  size={18}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.statValue}>
                {activeCounters || '—'}
              </Text>

              <Text style={styles.statLabel}>
                ACTIVE COUNTERS
              </Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Ionicons
                  name="timer-outline"
                  size={18}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.statValue}>
                {avgServiceMinutes
                  ? `${avgServiceMinutes}m`
                  : '—'}
              </Text>

              <Text style={styles.statLabel}>
                AVG PROCESSING
              </Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color="#2E7D32"
                />
              </View>

              <Text style={styles.statValue}>
                —
              </Text>

              <Text style={styles.statLabel}>
                TODAY'S PROCUREMENT
              </Text>
            </View>
          </View>

          <View style={styles.centerNotice}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#2E7D32"
            />

            <Text style={styles.centerNoticeText}>
              Queue status updates automatically in
              real time when the procurement center
              changes the queue.
            </Text>
          </View>
        </View>

        {/* YOUR PROCUREMENT */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Your Procurement
              </Text>

              <Text style={styles.cardSubtitle}>
                Booking details
              </Text>
            </View>

            <Ionicons
              name="document-text-outline"
              size={21}
              color="#2E7D32"
            />
          </View>

          <View style={styles.procurementRow}>
            <Text style={styles.procurementLabel}>
              Booking ID
            </Text>

            <Text style={styles.procurementValue}>
              {booking.bookingId || '—'}
            </Text>
          </View>

          <View style={styles.procurementRow}>
            <Text style={styles.procurementLabel}>
              Token
            </Text>

            <Text style={styles.procurementValue}>
              {booking.tokenNumber || '—'}
            </Text>
          </View>

          <View style={styles.procurementRow}>
            <Text style={styles.procurementLabel}>
              Commodity
            </Text>

            <Text style={styles.procurementValue}>
              {booking.commodity || '—'}
            </Text>
          </View>

          <View style={styles.procurementRow}>
            <Text style={styles.procurementLabel}>
              Quantity
            </Text>

            <Text style={styles.procurementValue}>
              {booking.quantityQuintals ?? '—'} Quintals
            </Text>
          </View>

          <View style={styles.procurementRow}>
            <Text style={styles.procurementLabel}>
              Center
            </Text>

            <Text
              style={styles.procurementValue}
              numberOfLines={2}
            >
              {queue?.centerName ||
                center?.name ||
                '—'}
            </Text>
          </View>
        </View>

        {/* STAY UPDATED */}
        <View style={styles.updateCard}>
          <View style={styles.updateIcon}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#2E7D32"
            />
          </View>

          <View style={styles.updateTextContainer}>
            <Text style={styles.updateTitle}>
              Stay updated
            </Text>

            <Text style={styles.updateText}>
              Your queue position and procurement
              progress update automatically in real time.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: Math.max(
              insets.bottom,
              10
            ),
          },
        ]}
      >
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace('/home')}
        >
          <Ionicons
            name="home-outline"
            size={21}
            color="#8A968D"
          />

          <Text style={styles.navLabel}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.navItem,
            styles.navItemActive,
          ]}
        >
          <View style={styles.activeNavIcon}>
            <Ionicons
              name="pulse"
              size={20}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={[
              styles.navLabel,
              styles.navLabelActive,
            ]}
          >
            Live Queue
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/my-token')}
        >
          <Ionicons
            name="qr-code-outline"
            size={21}
            color="#8A968D"
          />

          <Text style={styles.navLabel}>
            Token
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/grievance')}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={21}
            color="#8A968D"
          />

          <Text style={styles.navLabel}>
            Grievance
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Ionicons
            name="person-outline"
            size={21}
            color="#8A968D"
          />

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },

  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAF7',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#647067',
    fontWeight: '600',
  },

  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#F7FAF7',
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8F3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#183B1D',
  },

  emptyDescription: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 13,
    color: '#69756D',
  },

  bookButton: {
    marginTop: 24,
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  backButton: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  backButtonText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF7',
  },

  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EBE5',
  },

  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#183B1D',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#718078',
    fontWeight: '600',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 5,
  },

  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#9B2922',
    fontWeight: '600',
  },

  tokenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E7ECE7',
    marginBottom: 12,
  },

  tokenCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  sectionEyebrow: {
    fontSize: 9,
    color: '#829087',
    fontWeight: '800',
    letterSpacing: 1,
  },

  tokenNumber: {
    marginTop: 3,
    fontSize: 32,
    lineHeight: 38,
    color: '#183B1D',
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5EA',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusPillText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
  },

  tokenDivider: {
    height: 1,
    backgroundColor: '#EDF1ED',
    marginVertical: 14,
  },

  bookingInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  bookingInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 8,
    color: '#98A39B',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  infoValue: {
    marginTop: 2,
    fontSize: 12,
    color: '#263C2A',
    fontWeight: '700',
  },

  aiCard: {
    backgroundColor: '#EDF7EE',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCECDC',
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  aiHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  aiTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#183B1D',
  },

  aiSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#6E7D72',
    fontWeight: '600',
  },

  aiBadge: {
    backgroundColor: '#D8EAD9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  aiBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#2E7D32',
    letterSpacing: 0.7,
  },

  aiEtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  aiEtaNumber: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    color: '#183B1D',
  },

  aiEtaUnit: {
    fontSize: 10,
    color: '#718078',
    fontWeight: '700',
    marginTop: 1,
  },

  aiEtaMessage: {
    flex: 1,
    marginLeft: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiEtaText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 17,
    color: '#526158',
    fontWeight: '600',
  },

  aiFooter: {
    marginTop: 13,
    fontSize: 9,
    lineHeight: 14,
    color: '#78867C',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7ECE7',
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 15,
    color: '#183B1D',
    fontWeight: '900',
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#7B877F',
    fontWeight: '600',
  },

  queueProgressBox: {
    backgroundColor: '#F7F9F7',
    borderRadius: 14,
    padding: 14,
  },

  queueTokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  queueTokenItem: {
    flex: 1,
  },

  queueTokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A968D',
    letterSpacing: 0.7,
  },

  queueTokenValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '900',
    color: '#183B1D',
  },

  queueProgressTrack: {
    height: 6,
    backgroundColor: '#E1E8E1',
    borderRadius: 6,
    marginTop: 16,
    overflow: 'hidden',
  },

  queueProgressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 6,
  },

  queueAheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  queueAheadText: {
    fontSize: 10,
    color: '#748077',
    fontWeight: '600',
  },

  timeline: {
    paddingTop: 2,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 67,
  },

  timelineLeft: {
    width: 30,
    alignItems: 'center',
  },

  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  timelineDotCompleted: {
    backgroundColor: '#2E7D32',
  },

  timelineDotCurrent: {
    backgroundColor: '#2E7D32',
    borderWidth: 5,
    borderColor: '#DCECDC',
  },

  timelineDotPending: {
    backgroundColor: '#F1F4F1',
    borderWidth: 1,
    borderColor: '#D9E0D9',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E1E7E1',
    marginTop: -1,
  },

  timelineLineCompleted: {
    backgroundColor: '#A8CDAA',
  },

  timelineContent: {
    flex: 1,
    marginLeft: 9,
    paddingBottom: 15,
  },

  timelineTitle: {
    fontSize: 12,
    color: '#263C2A',
    fontWeight: '800',
  },

  timelineTitlePending: {
    color: '#8A958C',
  },

  timelineSubtitle: {
    marginTop: 3,
    fontSize: 9,
    color: '#7C877F',
    lineHeight: 14,
  },

  completedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF5EA',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  completedBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#2E7D32',
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5D9',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  currentBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#9A7113',
  },

  completedMessage: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5EA',
    borderRadius: 12,
    padding: 11,
  },

  completedMessageText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10,
    lineHeight: 15,
    color: '#2E7D32',
    fontWeight: '700',
  },

  liveSmallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5EA',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  liveSmallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 5,
  },

  liveSmallText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#2E7D32',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },

  statBox: {
    width: '50%',
    padding: 4,
  },

  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  statValue: {
    fontSize: 19,
    color: '#183B1D',
    fontWeight: '900',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 8,
    color: '#87928A',
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  centerNotice: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F2F7F2',
    borderRadius: 11,
    padding: 10,
  },

  centerNoticeText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 9,
    lineHeight: 14,
    color: '#6E7C72',
    fontWeight: '600',
  },

  procurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EF',
  },

  procurementLabel: {
    fontSize: 10,
    color: '#7C887F',
    fontWeight: '600',
  },

  procurementValue: {
    maxWidth: '58%',
    textAlign: 'right',
    fontSize: 11,
    color: '#263C2A',
    fontWeight: '800',
  },

  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F1',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },

  updateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E2F0E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  updateTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  updateTitle: {
    fontSize: 12,
    color: '#183B1D',
    fontWeight: '900',
  },

  updateText: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    color: '#718078',
    fontWeight: '600',
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 68,
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7ECE7',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },

  navItemActive: {
    position: 'relative',
  },

  activeNavIcon: {
    width: 34,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  navLabel: {
    marginTop: 4,
    fontSize: 8,
    color: '#8A968D',
    fontWeight: '700',
  },

  navLabelActive: {
    color: '#2E7D32',
    fontWeight: '900',
  },
});

