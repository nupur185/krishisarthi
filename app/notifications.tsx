import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'https://krishisarthi-backend-32yz.onrender.com';

type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'TOKEN_GENERATED'
  | 'QUEUE_UPDATE'
  | 'PROCUREMENT_UPDATE'
  | 'PAYMENT_UPDATE'
  | 'SLOT_UPDATE'
  | 'SYSTEM';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  bookingId: number | null;
  paymentId: number | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: number;
    bookingId: string;
    tokenNumber: string | null;
    commodity: string;
  } | null;
  payment?: {
    id: number;
    amount: string;
    status: string;
    bankReference: string | null;
  } | null;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch notifications'
        );
      }

      setNotifications(data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load notifications'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to mark notification as read'
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        'Error marking notification as read:',
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to mark all notifications as read'
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(
        'Error marking all notifications as read:',
        err
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const getNotificationIcon = (
    type: NotificationType
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'calendar-outline';

      case 'TOKEN_GENERATED':
        return 'qr-code-outline';

      case 'QUEUE_UPDATE':
        return 'pulse-outline';

      case 'PROCUREMENT_UPDATE':
        return 'leaf-outline';

      case 'PAYMENT_UPDATE':
        return 'wallet-outline';

      case 'SLOT_UPDATE':
        return 'calendar-outline';

      case 'SYSTEM':
      default:
        return 'information-circle-outline';
    }
  };

  const getIconBackground = (
    type: NotificationType
  ) => {
    switch (type) {
      case 'PAYMENT_UPDATE':
        return '#FFF5DF';

      case 'SLOT_UPDATE':
        return '#EAF4EC';

      case 'TOKEN_GENERATED':
        return '#EAF4EC';

      case 'QUEUE_UPDATE':
        return '#EAF4EC';

      case 'PROCUREMENT_UPDATE':
        return '#EAF4EC';

      case 'BOOKING_CONFIRMED':
        return '#EAF4EC';

      case 'SYSTEM':
      default:
        return '#F0F3F0';
    }
  };

  const getIconColor = (
    type: NotificationType
  ) => {
    switch (type) {
      case 'PAYMENT_UPDATE':
        return '#D99A27';

      default:
        return '#2F7D4A';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
      return 'Yesterday';
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const renderNotification = ({
    item,
  }: {
    item: Notification;
  }) => {
    return (
      <Pressable
        onPress={() => {
          if (!item.isRead) {
            markAsRead(item.id);
          }
        }}
        style={({ pressed }) => [
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.notificationIcon,
            {
              backgroundColor:
                getIconBackground(item.type),
            },
          ]}
        >
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color={getIconColor(item.type)}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                !item.isRead &&
                  styles.notificationTitleUnread,
              ]}
            >
              {item.title}
            </Text>

            {!item.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <Text style={styles.notificationMessage}>
            {item.message}
          </Text>

          <Text style={styles.notificationTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="notifications-off-outline"
          size={35}
          color="#2F7D4A"
        />
      </View>

      <Text style={styles.emptyTitle}>
        No notifications yet
      </Text>

      <Text style={styles.emptyMessage}>
        Important updates about your booking,
        queue, procurement and payment will
        appear here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#123B2A"
        />

        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 10,
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

          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#2F7D4A"
          />

          <Text style={styles.loadingText}>
            Loading notifications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#123B2A"
      />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedDark,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          {unreadCount > 0 && (
            <View style={styles.headerCountBadge}>
              <Text style={styles.headerCountText}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <Pressable
            onPress={markAllAsRead}
            disabled={markingAll}
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && styles.pressedDark,
            ]}
          >
            {markingAll ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.markAllText}>
                Read all
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {/* CONTENT */}
      {error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={30}
              color="#D99A27"
            />
          </View>

          <Text style={styles.errorTitle}>
            Couldn't load notifications
          </Text>

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <Pressable
            onPress={fetchNotifications}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderNotification}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 &&
              styles.emptyListContent,
            {
              paddingBottom:
                insets.bottom + 25,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2F7D4A"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F3',
  },

  header: {
    minHeight: 70,
    backgroundColor: '#123B2A',
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B5137',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 7,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  headerCountBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F4B942',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  headerCountText: {
    color: '#123B2A',
    fontSize: 9,
    fontWeight: '900',
  },

  markAllButton: {
    minWidth: 58,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1B5137',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },

  markAllText: {
    color: '#DCEBDD',
    fontSize: 9,
    fontWeight: '800',
  },

  headerRight: {
    width: 40,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 17,
    gap: 9,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDE8',
  },

  unreadCard: {
    borderColor: '#DCE8DE',
    backgroundColor: '#FBFDFB',
  },

  notificationIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationContent: {
    flex: 1,
    marginLeft: 11,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    color: '#33463B',
    fontSize: 11,
    fontWeight: '700',
  },

  notificationTitleUnread: {
    color: '#18352A',
    fontWeight: '800',
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2F7D4A',
    marginLeft: 7,
  },

  notificationMessage: {
    color: '#75837B',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  notificationTime: {
    color: '#A0AAA4',
    fontSize: 7.5,
    marginTop: 5,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#75837B',
    fontSize: 10,
    marginTop: 9,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 45,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: '#18352A',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyMessage: {
    color: '#75837B',
    fontSize: 9.5,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 6,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF5DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorTitle: {
    color: '#18352A',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorMessage: {
    color: '#75837B',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 6,
  },

  retryButton: {
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EAF4EC',
  },

  retryText: {
    color: '#2F7D4A',
    fontSize: 9,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.65,
  },

  pressedDark: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});