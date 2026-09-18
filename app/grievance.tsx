import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://10.164.217.66:5000/api';

const issueTypes = [
  {
    label: 'Payment',
    icon: 'wallet-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    label: 'Quality',
    icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    label: 'Weightment',
    icon: 'scale-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    label: 'Slot',
    icon: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    label: 'Staff',
    icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    label: 'Other',
    icon: 'ellipsis-horizontal-circle-outline' as keyof typeof Ionicons.glyphMap,
  },
];

const issueTypeMap: Record<string, string> = {
  Payment: 'PAYMENT',
  Quality: 'QUALITY',
  Weightment: 'WEIGHTMENT',
  Slot: 'SLOT',
  Staff: 'STAFF',
  Other: 'OTHER',
};

type Booking = {
  id: number;
  bookingId: string;
  commodity: string;
  quantityQuintals: string | number;
  status: string;
  tokenNumber?: string | null;
  tokenStatus?: string | null;
  estimatedWaitMin?: number | null;
  slot?: {
    slotDate?: string;
    startTime?: string;
    endTime?: string;
    center?: {
      id?: number;
      name?: string;
      district?: string;
      state?: string;
    } | null;
  } | null;
};

export default function GrievanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedIssue, setSelectedIssue] = useState('Payment');
  const [description, setDescription] = useState('');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [bookingModalVisible, setBookingModalVisible] =
    useState(false);

  const [loadingBookings, setLoadingBookings] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const token =
        await SecureStore.getItemAsync('authToken');

      if (!token) {
        router.replace('/welcome');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/bookings/my`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('farmer');

        router.replace('/welcome');
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Unable to load your bookings.'
        );
      }

      const bookingData = Array.isArray(result.data)
        ? result.data
        : [];

      setBookings(bookingData);
    } catch (error) {
      console.error(
        'Fetch grievance bookings error:',
        error
      );

      Alert.alert(
        'Unable to load bookings',
        error instanceof Error
          ? error.message
          : 'Please try again later.'
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatBookingDate = (
    date?: string
  ) => {
    if (!date) {
      return 'Date unavailable';
    }

    const parsedDate = new Date(
      `${date.slice(0, 10)}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const formatBookingTime = (
    time?: string
  ) => {
    if (!time) {
      return 'Time unavailable';
    }

    const parsedTime = new Date(time);

    if (Number.isNaN(parsedTime.getTime())) {
      return 'Time unavailable';
    }

    return parsedTime.toLocaleTimeString(
      'en-IN',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }
    );
  };

  const getBookingStatusLabel = (
    booking: Booking
  ) => {
    if (booking.tokenStatus === 'COMPLETED') {
      return 'Completed';
    }

    if (booking.status === 'COMPLETED') {
      return 'Completed';
    }

    if (booking.tokenStatus === 'SERVING') {
      return 'In procurement';
    }

    if (booking.tokenStatus === 'READY') {
      return 'Ready';
    }

    if (booking.tokenStatus === 'WAITING') {
      return 'Waiting';
    }

    if (booking.status === 'CONFIRMED') {
      return 'Confirmed';
    }

    return booking.status || 'Booking';
  };

  const handleSelectBooking = (
    booking: Booking
  ) => {
    setSelectedBooking(booking);
    setBookingModalVisible(false);
  };

  const handleNoSpecificBooking = () => {
    setSelectedBooking(null);
    setBookingModalVisible(false);
  };

  const handleSubmit = async () => {
    const trimmedDescription =
      description.trim();

    if (!trimmedDescription) {
      Alert.alert(
        'Description required',
        'Please describe the issue before submitting.'
      );
      return;
    }

    if (trimmedDescription.length < 10) {
      Alert.alert(
        'Description too short',
        'Please provide at least 10 characters describing your issue.'
      );
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const token =
        await SecureStore.getItemAsync(
          'authToken'
        );

      if (!token) {
        Alert.alert(
          'Session expired',
          'Please login again.'
        );

        router.replace('/welcome');
        return;
      }

      const payload: {
        issueType: string;
        description: string;
        bookingId?: number;
      } = {
        issueType:
          issueTypeMap[selectedIssue],
        description: trimmedDescription,
      };

      if (selectedBooking) {
        payload.bookingId =
          selectedBooking.id;
      }

      const response = await fetch(
        `${API_BASE_URL}/grievances`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        await SecureStore.deleteItemAsync(
          'authToken'
        );
        await SecureStore.deleteItemAsync(
          'farmer'
        );

        Alert.alert(
          'Session expired',
          'Please login again.'
        );

        router.replace('/welcome');
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            'Failed to submit grievance.'
        );
      }

      console.log(
        'Grievance submitted:',
        result
      );

      router.push(
        '/grievance-submitted'
      );
    } catch (error) {
      console.error(
        'Submit grievance error:',
        error
      );

      Alert.alert(
        'Submission failed',
        error instanceof Error
          ? error.message
          : 'Unable to submit grievance. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
          disabled={isSubmitting}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Grievance
          </Text>

          <Text style={styles.headerSubtitle}>
            We are here to help
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color="#2D7A4A"
            />
          </View>

          <View style={styles.introText}>
            <Text style={styles.introTitle}>
              Raise a Grievance
            </Text>

            <Text style={styles.introSubtitle}>
              Tell us about the issue you faced
              during procurement. Our team will
              review it.
            </Text>
          </View>
        </View>

        {/* My Grievances */}
        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/my-grievances')}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.myGrievancesCard,
              pressed &&
                !isSubmitting &&
                styles.myGrievancesCardPressed,
              isSubmitting &&
                styles.disabledControl,
            ]}
          >
            <View style={styles.myGrievancesIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#2D7A4A"
              />
            </View>

            <View style={styles.myGrievancesText}>
              <Text style={styles.myGrievancesTitle}>
                My Grievances
              </Text>

              <Text style={styles.myGrievancesSubtitle}>
                View your submitted grievances and their status
              </Text>
            </View>

            <View style={styles.myGrievancesArrow}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#2D7A4A"
              />
            </View>
          </Pressable>
        </View>

        {/* Issue Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What is the issue about?
          </Text>

          <View style={styles.issueGrid}>
            {issueTypes.map((issue) => {
              const selected =
                selectedIssue === issue.label;

              return (
                <Pressable
                  key={issue.label}
                  onPress={() =>
                    setSelectedIssue(
                      issue.label
                    )
                  }
                  disabled={isSubmitting}
                  style={[
                    styles.issueCard,
                    selected &&
                      styles.issueCardSelected,
                    isSubmitting &&
                      styles.disabledControl,
                  ]}
                >
                  <View
                    style={[
                      styles.issueIcon,
                      selected &&
                        styles.issueIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={issue.icon}
                      size={20}
                      color={
                        selected
                          ? '#FFFFFF'
                          : '#2D7A4A'
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.issueLabel,
                      selected &&
                        styles.issueLabelSelected,
                    ]}
                  >
                    {issue.label}
                  </Text>

                  {selected && (
                    <View
                      style={styles.selectedCheck}
                    >
                      <Ionicons
                        name="checkmark"
                        size={11}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Procurement Reference */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              Procurement Reference
            </Text>

            <Text style={styles.optional}>
              Optional
            </Text>
          </View>

          <Pressable
            style={[
              styles.referenceSelector,
              isSubmitting &&
                styles.disabledControl,
            ]}
            onPress={() =>
              setBookingModalVisible(true)
            }
            disabled={
              isSubmitting ||
              loadingBookings
            }
          >
            <View style={styles.selectorIcon}>
              <Ionicons
                name="ticket-outline"
                size={20}
                color="#2D7A4A"
              />
            </View>

            <View
              style={styles.selectorText}
            >
              <Text
                style={styles.selectorLabel}
              >
                Related Booking
              </Text>

              <Text
                style={styles.selectorValue}
                numberOfLines={1}
              >
                {loadingBookings
                  ? 'Loading your bookings...'
                  : selectedBooking
                    ? `${
                        selectedBooking.tokenNumber ||
                        selectedBooking.bookingId
                      } • ${
                        selectedBooking.commodity
                      }`
                    : 'Select a booking'}
              </Text>
            </View>

            <View style={styles.chevronContainer}>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#65766B"
              />
            </View>
          </Pressable>

          {/* Selected Booking */}
          {selectedBooking && (
            <View
              style={styles.selectedBookingCard}
            >
              <View
                style={styles.selectedBookingHeader}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      styles.selectedBookingId
                    }
                  >
                    {selectedBooking.bookingId}
                  </Text>

                  <Text
                    style={
                      styles.selectedBookingTitle
                    }
                  >
                    {selectedBooking.commodity}
                    {'  '}
                    <Text
                      style={
                        styles.selectedBookingQuantity
                      }
                    >
                      • {selectedBooking.quantityQuintals}{' '}
                      Quintals
                    </Text>
                  </Text>
                </View>

                <View
                  style={
                    styles.referenceStatus
                  }
                >
                  <Text
                    style={
                      styles.referenceStatusText
                    }
                  >
                    {getBookingStatusLabel(
                      selectedBooking
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={styles.bookingDetailsGrid}
              >
                <View
                  style={styles.bookingDetail}
                >
                  <Text
                    style={
                      styles.bookingDetailLabel
                    }
                  >
                    TOKEN
                  </Text>

                  <Text
                    style={
                      styles.bookingDetailValue
                    }
                  >
                    {selectedBooking.tokenNumber ||
                      '—'}
                  </Text>
                </View>

                <View
                  style={styles.bookingDetail}
                >
                  <Text
                    style={
                      styles.bookingDetailLabel
                    }
                  >
                    DATE
                  </Text>

                  <Text
                    style={
                      styles.bookingDetailValue
                    }
                  >
                    {formatBookingDate(
                      selectedBooking.slot
                        ?.slotDate
                    )}
                  </Text>
                </View>

                <View
                  style={styles.bookingDetail}
                >
                  <Text
                    style={
                      styles.bookingDetailLabel
                    }
                  >
                    CENTER
                  </Text>

                  <Text
                    style={
                      styles.bookingDetailValue
                    }
                    numberOfLines={2}
                  >
                    {selectedBooking.slot
                      ?.center?.name || '—'}
                  </Text>
                </View>

                <View
                  style={styles.bookingDetail}
                >
                  <Text
                    style={
                      styles.bookingDetailLabel
                    }
                  >
                    TIME
                  </Text>

                  <Text
                    style={
                      styles.bookingDetailValue
                    }
                  >
                    {formatBookingTime(
                      selectedBooking.slot
                        ?.startTime
                    )}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={
                  handleNoSpecificBooking
                }
                disabled={isSubmitting}
                style={
                  styles.removeBookingButton
                }
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#7C8981"
                />

                <Text
                  style={
                    styles.removeBookingText
                  }
                >
                  Remove reference
                </Text>
              </Pressable>
            </View>
          )}

          {!loadingBookings &&
            bookings.length === 0 && (
              <View
                style={styles.noBookingsCard}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#7C8981"
                />

                <Text
                  style={
                    styles.noBookingsText
                  }
                >
                  No bookings found. You can still
                  submit a general grievance.
                </Text>
              </View>
            )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              Describe the issue
            </Text>

            <Text style={styles.required}>
              Required
            </Text>
          </View>

          <View style={styles.inputCard}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly explain what happened..."
              placeholderTextColor="#A0AAA4"
              multiline
              textAlignVertical="top"
              style={styles.textInput}
              maxLength={500}
              editable={!isSubmitting}
            />

            <View
              style={styles.inputFooter}
            >
              <Text style={styles.inputHint}>
                Please provide enough detail to
                help us investigate.
              </Text>

              <Text
                style={styles.characterCount}
              >
                {description.length}/500
              </Text>
            </View>
          </View>
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              Supporting photo
            </Text>

            <Text style={styles.optional}>
              Optional
            </Text>
          </View>

          <Pressable
            style={[
              styles.photoCard,
              isSubmitting &&
                styles.disabledControl,
            ]}
            disabled={isSubmitting}
            onPress={() =>
              Alert.alert(
                'Photo upload',
                'Photo upload will be connected in the next grievance step.'
              )
            }
          >
            <View style={styles.photoIcon}>
              <Ionicons
                name="camera-outline"
                size={21}
                color="#2D7A4A"
              />
            </View>

            <View style={styles.photoText}>
              <Text style={styles.photoTitle}>
                Add a photo
              </Text>

              <Text
                style={styles.photoSubtitle}
              >
                A photo can help explain your issue
              </Text>
            </View>

            <Ionicons
              name="add-outline"
              size={22}
              color="#2D7A4A"
            />
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            pressed &&
              !isSubmitting &&
              styles.submitButtonPressed,
            isSubmitting &&
              styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color="#FFFFFF"
            />
          )}

          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? 'Submitting...'
              : 'Submit Grievance'}
          </Text>
        </Pressable>

        {/* Privacy */}
        <View style={styles.bottomNote}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color="#89958E"
          />

          <Text style={styles.bottomNoteText}>
            Your grievance is securely recorded and
            linked to your procurement information.
          </Text>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setBookingModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                paddingBottom:
                  insets.bottom + 18,
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  Select Booking
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Choose the procurement record related
                  to your grievance.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setBookingModalVisible(false)
                }
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#52635A"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.bookingList}
            >
              {/* No booking */}
              <Pressable
                style={[
                  styles.bookingOption,
                  !selectedBooking &&
                    styles.bookingOptionSelected,
                ]}
                onPress={
                  handleNoSpecificBooking
                }
              >
                <View
                  style={styles.bookingOptionIcon}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={20}
                    color="#2D7A4A"
                  />
                </View>

                <View
                  style={
                    styles.bookingOptionText
                  }
                >
                  <Text
                    style={
                      styles.bookingOptionTitle
                    }
                  >
                    No specific booking
                  </Text>

                  <Text
                    style={
                      styles.bookingOptionSubtitle
                    }
                  >
                    Submit a general grievance
                  </Text>
                </View>

                {!selectedBooking && (
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color="#2D7A4A"
                  />
                )}
              </Pressable>

              {loadingBookings ? (
                <View
                  style={
                    styles.modalLoading
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#2D7A4A"
                  />

                  <Text
                    style={
                      styles.modalLoadingText
                    }
                  >
                    Loading your bookings...
                  </Text>
                </View>
              ) : bookings.length === 0 ? (
                <View
                  style={
                    styles.modalEmpty
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={30}
                    color="#8A958E"
                  />

                  <Text
                    style={
                      styles.modalEmptyTitle
                    }
                  >
                    No bookings available
                  </Text>

                  <Text
                    style={
                      styles.modalEmptyText
                    }
                  >
                    There are no bookings available
                    for your account right now.
                  </Text>
                </View>
              ) : (
                bookings.map((booking) => {
                  const selected =
                    selectedBooking?.id ===
                    booking.id;

                  return (
                    <Pressable
                      key={booking.id}
                      style={[
                        styles.bookingOption,
                        selected &&
                          styles.bookingOptionSelected,
                      ]}
                      onPress={() =>
                        handleSelectBooking(
                          booking
                        )
                      }
                    >
                      <View
                        style={
                          styles.bookingOptionIcon
                        }
                      >
                        <Ionicons
                          name="ticket-outline"
                          size={20}
                          color="#2D7A4A"
                        />
                      </View>

                      <View
                        style={
                          styles.bookingOptionText
                        }
                      >
                        <View
                          style={
                            styles.bookingOptionTitleRow
                          }
                        >
                          <Text
                            style={
                              styles.bookingOptionTitle
                            }
                          >
                            {booking.tokenNumber ||
                              booking.bookingId}
                          </Text>

                          <View
                            style={
                              styles.optionStatus
                            }
                          >
                            <Text
                              style={
                                styles.optionStatusText
                              }
                            >
                              {getBookingStatusLabel(
                                booking
                              )}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={
                            styles.bookingOptionSubtitle
                          }
                        >
                          {booking.commodity}
                          {' • '}
                          {booking.quantityQuintals}{' '}
                          Quintals
                        </Text>

                        <Text
                          style={
                            styles.bookingOptionMeta
                          }
                        >
                          {booking.slot?.center
                            ?.name ||
                            'Center unavailable'}
                          {' • '}
                          {formatBookingDate(
                            booking.slot?.slotDate
                          )}
                        </Text>

                        <Text
                          style={
                            styles.bookingOptionMeta
                          }
                        >
                          {booking.bookingId}
                        </Text>
                      </View>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color="#2D7A4A"
                        />
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F6',
  },

  /* Header */

  header: {
    backgroundColor: '#123B2A',
    paddingHorizontal: 20,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1B5138',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    marginLeft: 13,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: '#BFD2C7',
    fontSize: 11,
    marginTop: 2,
  },

  /* Main */

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  /* Intro */

  introCard: {
    backgroundColor: '#EAF4ED',
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#DCEADF',
  },

  myGrievancesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE7DF',
  },

  myGrievancesCardPressed: {
    opacity: 0.82,
  },

  myGrievancesIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  myGrievancesText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  myGrievancesTitle: {
    color: '#18382A',
    fontSize: 12,
    fontWeight: '800',
  },

  myGrievancesSubtitle: {
    color: '#8A958E',
    fontSize: 9,
    marginTop: 3,
  },

  myGrievancesArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introText: {
    flex: 1,
    marginLeft: 14,
  },

  introTitle: {
    color: '#173A2B',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  introSubtitle: {
    color: '#697970',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  /* Sections */

  section: {
    marginBottom: 24,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    color: '#173A2B',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.25,
  },

  optional: {
    color: '#8A958E',
    fontSize: 10,
    marginLeft: 7,
  },

  required: {
    color: '#A06C5D',
    fontSize: 10,
    marginLeft: 7,
  },

  /* Issue Cards */

  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  issueCard: {
    width: '31.7%',
    minHeight: 93,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EBE7',
    position: 'relative',
  },

  issueCardSelected: {
    backgroundColor: '#F0F7F2',
    borderColor: '#2D7A4A',
  },

  issueIcon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  issueIconSelected: {
    backgroundColor: '#2D7A4A',
  },

  issueLabel: {
    color: '#596961',
    fontSize: 11,
    fontWeight: '700',
  },

  issueLabelSelected: {
    color: '#2D7A4A',
    fontWeight: '800',
  },

  selectedCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#2D7A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Reference */

  referenceSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    minHeight: 78,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  selectorIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectorText: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  selectorLabel: {
    color: '#89958E',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  selectorValue: {
    color: '#18382A',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },

  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Selected Booking */

  selectedBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDE7DF',
  },

  selectedBookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  selectedBookingId: {
    color: '#2D7A4A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  selectedBookingTitle: {
    color: '#18382A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },

  selectedBookingQuantity: {
    color: '#78867E',
    fontSize: 11,
    fontWeight: '600',
  },

  referenceStatus: {
    backgroundColor: '#EDF6F0',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    marginLeft: 8,
  },

  referenceStatusText: {
    color: '#2D7A4A',
    fontSize: 9,
    fontWeight: '800',
  },

  bookingDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
    marginTop: 15,
    paddingTop: 14,
    rowGap: 15,
  },

  bookingDetail: {
    width: '50%',
    paddingRight: 8,
  },

  bookingDetailLabel: {
    color: '#9AA49E',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  bookingDetailValue: {
    color: '#294538',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  removeBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
  },

  removeBookingText: {
    color: '#7C8981',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 5,
  },

  noBookingsCard: {
    marginTop: 10,
    backgroundColor: '#F0F3F0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  noBookingsText: {
    flex: 1,
    color: '#7D8982',
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 8,
  },

  /* Description */

  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 15,
    minHeight: 155,
    borderWidth: 1,
    borderColor: '#E5EAE6',
  },

  textInput: {
    color: '#18382A',
    fontSize: 13,
    lineHeight: 20,
    minHeight: 105,
  },

  inputFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  inputHint: {
    flex: 1,
    color: '#9AA49E',
    fontSize: 9,
    lineHeight: 13,
    marginRight: 10,
  },

  characterCount: {
    color: '#9AA49E',
    fontSize: 9,
  },

  /* Photo */

  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE5',
  },

  photoIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoText: {
    flex: 1,
    marginLeft: 12,
  },

  photoTitle: {
    color: '#18382A',
    fontSize: 12,
    fontWeight: '800',
  },

  photoSubtitle: {
    color: '#8A958E',
    fontSize: 9,
    marginTop: 3,
  },

  /* Submit */

  submitButton: {
    backgroundColor: '#2D7A4A',
    height: 55,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 1,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  submitButtonPressed: {
    opacity: 0.82,
  },

  submitButtonDisabled: {
    opacity: 0.62,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* Bottom Note */

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 5,
  },

  bottomNoteText: {
    flex: 1,
    color: '#89958E',
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 7,
  },

  /* Modal */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 32, 22, 0.38)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#F7F9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 9,
    maxHeight: '86%',
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D9D3',
    alignSelf: 'center',
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 17,
  },

  modalTitle: {
    color: '#18382A',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  modalSubtitle: {
    color: '#7B8981',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
    maxWidth: 285,
  },

  modalClose: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: '#EAF0EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  bookingList: {
    marginBottom: 4,
  },

  bookingOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E6EBE7',
  },

  bookingOptionSelected: {
    backgroundColor: '#F0F7F2',
    borderColor: '#BBD4C2',
  },

  bookingOptionIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  bookingOptionText: {
    flex: 1,
    marginRight: 7,
  },

  bookingOptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  bookingOptionTitle: {
    color: '#18382A',
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },

  bookingOptionSubtitle: {
    color: '#52645A',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },

  bookingOptionMeta: {
    color: '#8B968F',
    fontSize: 8.5,
    marginTop: 4,
  },

  optionStatus: {
    backgroundColor: '#EDF5EF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  optionStatusText: {
    color: '#2D7A4A',
    fontSize: 7.5,
    fontWeight: '800',
  },

  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
  },

  modalLoadingText: {
    color: '#7C8981',
    fontSize: 10,
    marginTop: 9,
  },

  modalEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 30,
  },

  modalEmptyTitle: {
    color: '#52645A',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },

  modalEmptyText: {
    color: '#8A958E',
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 5,
  },

  disabledControl: {
    opacity: 0.6,
  },
});