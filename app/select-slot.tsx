import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'http://10.164.217.66:5000';

interface Slot {
  id: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: string;
  center: {
    name: string;
    district: string;
    state: string;
    address?: string;
    village?: string | null;
    avgServiceMinutes: number;
    activeCounters: number;
  };
}

interface DisplayDate {
  key: string;
  day: string;
  month: string;
  label: string;
}

interface DisplayTimeSlot {
  id: number;
  time: string;
  available: boolean;
  wait: number;
  recommended?: boolean;
  availableCount: number;
}

function formatDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatSummaryDate(value: string) {
  if (!value) return 'Not selected';

  return parseDateKey(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}


export default function SelectSlotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const centerName =
    typeof params.centerName === 'string'
      ? params.centerName
      : 'Green Valley Center';

  const centerId =
    typeof params.centerId === 'string' ? Number(params.centerId) : NaN;

  const mode =
    typeof params.mode === 'string' ? params.mode : 'booking';

  const rescheduleBookingId =
    typeof params.bookingId === 'string' ? params.bookingId : '';

  const currentSlotId =
    typeof params.currentSlotId === 'string'
      ? Number(params.currentSlotId)
      : 0;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  // Procurement details
  const initialCrop =
    typeof params.crop === 'string' ? params.crop : 'Wheat';

  const initialQuantity =
    typeof params.quantity === 'string' ? params.quantity : '';

  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    async function fetchSlots() {
      if (!Number.isInteger(centerId) || centerId <= 0) {
        setError('Invalid procurement center.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}/api/slots/center/${centerId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch slots');
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid slot response');
        }

        setSlots(result.data);

        const firstAvailable = result.data.find(
          (slot: Slot) =>
            slot.status === 'AVAILABLE' &&
            slot.bookedCount < slot.capacity &&
            (mode !== 'reschedule' || slot.id !== currentSlotId)
        );

        if (firstAvailable) {
          setSelectedDate(formatDateKey(firstAvailable.slotDate));
          setSelectedTime(firstAvailable.id);
        }
      } catch (fetchError) {
        console.error('Fetch slots error:', fetchError);
        setError('Unable to load available slots. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [centerId, mode, currentSlotId]);

  const dates = useMemo<DisplayDate[]>(() => {
    const uniqueDates = Array.from(
      new Set(slots.map((slot) => formatDateKey(slot.slotDate)))
    );

    return uniqueDates.slice(0, 5).map((dateKey) => {
      const date = parseDateKey(dateKey);

      return {
        key: dateKey,
        day: String(date.getUTCDate()).padStart(2, '0'),
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }).toUpperCase(),
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          timeZone: 'UTC',
        }),
      };
    });
  }, [slots]);

  const timeSlots = useMemo<DisplayTimeSlot[]>(() => {
    return slots
      .filter((slot) => formatDateKey(slot.slotDate) === selectedDate)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      )
      .map((slot, _index, sameDaySlots) => {
        const available =
          slot.status === 'AVAILABLE' && slot.bookedCount < slot.capacity;

        const wait = Math.ceil(
          (slot.bookedCount * Number(slot.center.avgServiceMinutes || 0)) /
            Math.max(Number(slot.center.activeCounters || 1), 1)
        );

        const availableCount = Math.max(
          slot.capacity - slot.bookedCount,
          0
        );

        const firstAvailable = sameDaySlots.find(
          (item) =>
            item.status === 'AVAILABLE' &&
            item.bookedCount < item.capacity
        );

        return {
          id: slot.id,
          time: formatTime(slot.startTime),
          available,
          wait,
          recommended:
            available &&
            slot.id === firstAvailable?.id &&
            (mode !== 'reschedule' || slot.id !== currentSlotId),
          availableCount,
        };
      });
  }, [slots, selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;

    const currentSelection = timeSlots.find(
      (slot) => slot.id === selectedTime
    );

    if (!currentSelection) {
      const firstAvailable = timeSlots.find((slot) => slot.available);
      setSelectedTime(firstAvailable?.id ?? null);
    }
  }, [selectedDate, timeSlots, selectedTime, mode, currentSlotId]);

  const selectedSlot = useMemo(
    () => timeSlots.find((slot) => slot.id === selectedTime),
    [selectedTime, timeSlots]
  );

  return (
    <View style={styles.container}>

      {/* ================= HEADER ================= */}

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#18352A"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Select Your Slot
          </Text>

          <Text style={styles.headerSubtitle}>
            Choose a convenient date and time
          </Text>
        </View>

        <View style={styles.calendarIcon}>
          <Ionicons
            name="calendar-outline"
            size={21}
            color="#2F7D4A"
          />
        </View>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ================= CENTER ================= */}

        <View style={styles.centerCard}>

          <View style={styles.centerIcon}>
            <Ionicons
              name="business-outline"
              size={23}
              color="#2F7D4A"
            />
          </View>

          <View style={styles.centerDetails}>
            <Text style={styles.centerLabel}>
              PROCUREMENT CENTER
            </Text>

            <Text style={styles.centerName}>
              {centerName}
            </Text>

            <View style={styles.centerLocation}>
              <Ionicons
                name="location-outline"
                size={13}
                color="#7B8982"
              />

              <Text style={styles.locationText}>
                {slots[0]
                  ? `${slots[0].center.district}, ${slots[0].center.state}`
                  : 'Loading location...'}
              </Text>
            </View>
          </View>

          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              —
            </Text>
          </View>

        </View>


        {/* ================= DATE ================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Select date
            </Text>

            <Text style={styles.sectionSubtitle}>
              Choose your preferred visit date
            </Text>
          </View>
        </View>


        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#2F7D4A" />
            <Text style={styles.loadingText}>Loading available dates...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#A26C6C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : dates.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={24} color="#8A9891" />
            <Text style={styles.emptyTitle}>No dates available</Text>
            <Text style={styles.emptyText}>
              This center currently has no available procurement slots.
            </Text>
          </View>
        ) : (
          <View style={styles.dateRow}>
            {dates.map((date) => {
              const active = selectedDate === date.key;

              return (
                <Pressable
                  key={date.key}
                  onPress={() => setSelectedDate(date.key)}
                  style={[
                    styles.dateCard,
                    active && styles.dateCardActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateLabel,
                      active && styles.dateLabelActive,
                    ]}
                  >
                    {date.label}
                  </Text>

                  <Text
                    style={[
                      styles.dateNumber,
                      active && styles.dateNumberActive,
                    ]}
                  >
                    {date.day}
                  </Text>

                  <Text
                    style={[
                      styles.dateMonth,
                      active && styles.dateMonthActive,
                    ]}
                  >
                    {date.month}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}


        {/* ================= TIME ================= */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Available time slots
            </Text>

            <Text style={styles.sectionSubtitle}>
              AI-estimated waiting time is shown for each slot
            </Text>
          </View>

        </View>


        {loading ? null : timeSlots.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="time-outline" size={24} color="#8A9891" />
            <Text style={styles.emptyTitle}>No time slots available</Text>
            <Text style={styles.emptyText}>
              Please select another date or check again later.
            </Text>
          </View>
        ) : (
          <View style={styles.slotsContainer}>
            {timeSlots.map((slot) => {
              const active = selectedTime === slot.id;

              return (
                <Pressable
                  key={slot.id}
                  disabled={
                    !slot.available ||
                    (mode === 'reschedule' && slot.id === currentSlotId)
                  }
                  onPress={() => setSelectedTime(slot.id)}
                  style={[
                    styles.timeSlot,
                    active && styles.timeSlotActive,
                    (!slot.available ||
                      (mode === 'reschedule' && slot.id === currentSlotId)) &&
                      styles.timeSlotDisabled,
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      active && styles.radioActive,
                    ]}
                  >
                    {active && <View style={styles.radioInner} />}
                  </View>

                  <View style={styles.timeInfo}>
                    <Text
                      style={[
                        styles.timeText,
                        active && styles.timeTextActive,
                        (!slot.available ||
                          (mode === 'reschedule' && slot.id === currentSlotId)) &&
                          styles.disabledText,
                      ]}
                    >
                      {slot.time}
                    </Text>

                    {slot.available &&
                    !(mode === 'reschedule' && slot.id === currentSlotId) ? (
                      <Text style={styles.waitText}>
                        Estimated wait: {slot.wait} min · {slot.availableCount} left
                      </Text>
                    ) : (
                      <Text style={styles.unavailableText}>
                        {mode === 'reschedule' && slot.id === currentSlotId
                          ? 'Current booking'
                          : 'Fully booked'}
                      </Text>
                    )}
                  </View>

                  {slot.recommended && slot.available && (
                    <View style={styles.aiRecommended}>
                      <Ionicons
                        name="sparkles"
                        size={11}
                        color="#8B5A00"
                      />

                      <Text style={styles.aiRecommendedText}>
                        AI PICK
                      </Text>
                    </View>
                  )}

                  {slot.available && (
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color={
                        active
                          ? '#2F7D4A'
                          : '#A2ADA6'
                      }
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}


        {/* ================= CROP & QUANTITY ================= */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Procurement details
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tell us what you plan to bring
            </Text>
          </View>

        </View>


        <View style={styles.detailsCard}>

          {/* CROP */}

          <Text style={styles.inputLabel}>
            CROP / COMMODITY
          </Text>

          <View style={styles.cropRow}>

            {['Wheat', 'Rice', 'Maize'].map((crop) => {
              const active = selectedCrop === crop;

              return (
                <Pressable
                  key={crop}
                  onPress={() => setSelectedCrop(crop)}
                  style={[
                    styles.cropOption,
                    active && styles.cropOptionActive,
                  ]}
                >

                  <Text
                    style={[
                      styles.cropText,
                      active && styles.cropTextActive,
                    ]}
                  >
                    {crop}
                  </Text>

                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#2F7D4A"
                    />
                  )}

                </Pressable>
              );
            })}

          </View>


          {/* QUANTITY */}

          <Text
            style={[
              styles.inputLabel,
              { marginTop: 17 },
            ]}
          >
            APPROXIMATE QUANTITY
          </Text>

          <View style={styles.quantityRow}>

            <View style={styles.quantityInput}>

              <Ionicons
                name="scale-outline"
                size={18}
                color="#2F7D4A"
              />

              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                placeholderTextColor="#9AA69F"
                keyboardType="decimal-pad"
                style={styles.quantityTextInput}
              />

            </View>

            <View style={styles.unitBox}>
              <Text style={styles.unitText}>
                Quintals
              </Text>
            </View>

          </View>

          <Text style={styles.helperText}>
            Approximate quantity helps us plan procurement capacity.
          </Text>


          {/* QUICK QUANTITY */}

          <View style={styles.quantityPresets}>

            {['10', '20', '30', '50'].map((value) => (
              <Pressable
                key={value}
                onPress={() => setQuantity(value)}
                style={[
                  styles.quantityPreset,
                  quantity === value &&
                    styles.quantityPresetActive,
                ]}
              >

                <Text
                  style={[
                    styles.quantityPresetText,
                    quantity === value &&
                      styles.quantityPresetTextActive,
                  ]}
                >
                  {value} q
                </Text>

              </Pressable>
            ))}

          </View>

        </View>


        {/* ================= AI INSIGHT ================= */}

        <View style={styles.aiCard}>

          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.aiContent}>

            <View style={styles.aiTitleRow}>

              <Text style={styles.aiTitle}>
                Smart recommendation
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  AI
                </Text>
              </View>

            </View>

            <Text style={styles.aiDescription}>
              {selectedSlot
                ? `${selectedSlot.time} currently has ${selectedSlot.availableCount} slot${selectedSlot.availableCount === 1 ? '' : 's'} left with an estimated ${selectedSlot.wait}-minute wait.`
                : 'Choose an available slot to see its recommendation.'}
            </Text>

          </View>

        </View>


        {/* ================= BOOKING SUMMARY ================= */}

        <View style={styles.summaryCard}>

          <Text style={styles.summaryTitle}>
            Booking summary
          </Text>

          <View style={styles.summaryRow}>

            <View style={styles.summaryItem}>

              <Ionicons
                name="calendar-outline"
                size={17}
                color="#2F7D4A"
              />

              <View>
                <Text style={styles.summaryLabel}>
                  DATE
                </Text>

                <Text style={styles.summaryValue}>
                  {formatSummaryDate(selectedDate)}
                </Text>
              </View>

            </View>


            <View style={styles.summaryItem}>

              <Ionicons
                name="time-outline"
                size={17}
                color="#D99A27"
              />

              <View>
                <Text style={styles.summaryLabel}>
                  TIME
                </Text>

                <Text style={styles.summaryValue}>
                  {selectedSlot?.time ?? 'Not selected'}
                </Text>
              </View>

            </View>

          </View>


          {/* CROP + QUANTITY SUMMARY */}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryProcurementRow}>

            <View style={styles.summaryProcurementItem}>

              <Ionicons
                name="leaf-outline"
                size={17}
                color="#2F7D4A"
              />

              <View>
                <Text style={styles.summaryLabel}>
                  CROP
                </Text>

                <Text style={styles.summaryValue}>
                  {selectedCrop}
                </Text>
              </View>

            </View>


            <View style={styles.summaryProcurementItem}>

              <Ionicons
                name="scale-outline"
                size={17}
                color="#D99A27"
              />

              <View>
                <Text style={styles.summaryLabel}>
                  QUANTITY
                </Text>

                <Text style={styles.summaryValue}>
                  {quantity
                    ? `${quantity} quintals`
                    : 'Not entered'}
                </Text>
              </View>

            </View>

          </View>

        </View>


        {/* ================= CONTINUE ================= */}

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/confirm-booking',
              params: {
                centerId: String(centerId),
                centerName,
                date: selectedDate,
                time: selectedSlot?.time ?? '',
                slotId: selectedSlot?.id ? String(selectedSlot.id) : '',
                crop: selectedCrop,
                quantity: quantity || '0',
                mode,
                bookingId: rescheduleBookingId,
                currentSlotId: String(currentSlotId),
              },
            })
          }
        >

          <Text style={styles.continueText}>
            {mode === 'reschedule'
              ? 'Continue to Reschedule'
              : 'Continue to Review'}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#FFFFFF"
          />

        </Pressable>

      </ScrollView>

    </View>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

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

  headerText: {
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
    fontSize: 11,
    color: '#75837B',
  },

  calendarIcon: {
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


  /* CENTER */

  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE4',
  },

  centerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerDetails: {
    flex: 1,
    marginLeft: 11,
  },

  centerLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#97A39D',
  },

  centerName: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '800',
    color: '#18352A',
  },

  centerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },

  locationText: {
    fontSize: 10,
    color: '#7B8982',
  },

  distanceBadge: {
    backgroundColor: '#F0F5F0',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  distanceText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#587064',
  },


  /* SECTION */

  sectionHeader: {
    marginTop: 22,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18352A',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#7B8982',
  },


  /* DATE */

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateCard: {
    width: '18.5%',
    height: 82,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EAE4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateCardActive: {
    backgroundColor: '#2F7D4A',
    borderColor: '#2F7D4A',
  },

  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A9891',
  },

  dateLabelActive: {
    color: '#DCEBDD',
  },

  dateNumber: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '900',
    color: '#18352A',
  },

  dateNumberActive: {
    color: '#FFFFFF',
  },

  dateMonth: {
    marginTop: 1,
    fontSize: 7,
    fontWeight: '800',
    color: '#9AA69F',
  },

  dateMonthActive: {
    color: '#DCEBDD',
  },


  /* TIME SLOTS */

  slotsContainer: {
    gap: 9,
  },

  timeSlot: {
    minHeight: 67,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E4EAE4',
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeSlotActive: {
    borderColor: '#2F7D4A',
    backgroundColor: '#F3F8F3',
  },

  timeSlotDisabled: {
    opacity: 0.55,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#A5B0AA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioActive: {
    borderColor: '#2F7D4A',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F7D4A',
  },

  timeInfo: {
    flex: 1,
    marginLeft: 11,
  },

  timeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#33463B',
  },

  timeTextActive: {
    color: '#18352A',
  },

  disabledText: {
    color: '#8E9993',
  },

  waitText: {
    marginTop: 3,
    fontSize: 9,
    color: '#7A8780',
  },

  unavailableText: {
    marginTop: 3,
    fontSize: 9,
    color: '#A26C6C',
  },

  aiRecommended: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4D9',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
  },

  aiRecommendedText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#8B5A00',
  },


  /* CROP & QUANTITY */

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4EAE4',
  },

  inputLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#8D9A93',
    marginBottom: 9,
  },

  cropRow: {
    flexDirection: 'row',
    gap: 8,
  },

  cropOption: {
    flex: 1,
    minHeight: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E1E8E1',
    backgroundColor: '#FAFCF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  cropOptionActive: {
    backgroundColor: '#EDF6EE',
    borderColor: '#2F7D4A',
  },

  cropText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#607067',
  },

  cropTextActive: {
    color: '#2F7D4A',
    fontWeight: '800',
  },

  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },

  quantityInput: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8E1',
    backgroundColor: '#FAFCF9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },

  quantityTextInput: {
    flex: 1,
    height: 46,
    fontSize: 12,
    fontWeight: '800',
    color: '#18352A',
    paddingVertical: 0,
  },

  unitBox: {
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: '#F0F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  unitText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#587064',
  },

  helperText: {
    marginTop: 7,
    fontSize: 8,
    color: '#89958E',
  },

  quantityPresets: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  quantityPreset: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F4F0',
  },

  quantityPresetActive: {
    backgroundColor: '#DCEBDD',
  },

  quantityPresetText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#68776E',
  },

  quantityPresetTextActive: {
    color: '#2F7D4A',
    fontWeight: '900',
  },


  /* AI */

  aiCard: {
    marginTop: 17,
    padding: 13,
    borderRadius: 16,
    backgroundColor: '#F0F6F1',
    borderWidth: 1,
    borderColor: '#DCE8DE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiContent: {
    flex: 1,
    marginLeft: 10,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  aiTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#18352A',
  },

  aiBadge: {
    backgroundColor: '#D99A27',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },

  aiBadgeText: {
    fontSize: 6,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiDescription: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 14,
    color: '#68776E',
  },


  /* SUMMARY */

  summaryCard: {
    marginTop: 17,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4EAE4',
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18352A',
    marginBottom: 13,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 15,
  },

  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  summaryLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#9AA69F',
    letterSpacing: 0.5,
  },

  summaryValue: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: '#33463B',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#EDF0ED',
    marginVertical: 13,
  },

  summaryProcurementRow: {
    flexDirection: 'row',
    gap: 15,
  },

  summaryProcurementItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },


  /* BUTTON */

  continueButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#2F7D4A',
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  continueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  continueButtonDisabled: {
    backgroundColor: '#AAB7AE',
  },

  loadingCard: {
    minHeight: 82,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EAE4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  loadingText: {
    fontSize: 10,
    color: '#7B8982',
  },

  errorCard: {
    minHeight: 82,
    borderRadius: 15,
    backgroundColor: '#FFF7F5',
    borderWidth: 1,
    borderColor: '#F0D9D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#8F5F5F',
  },

  emptyCard: {
    minHeight: 105,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EAE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#33463B',
  },

  emptyText: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 13,
    color: '#89958E',
    textAlign: 'center',
  },

  buttonPressed: {
    opacity: 0.8,
  },

});

