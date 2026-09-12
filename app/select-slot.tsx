import React, { useMemo, useState } from 'react';
import {
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

const dates = [
  { day: '17', month: 'SEP', label: 'Thu' },
  { day: '18', month: 'SEP', label: 'Fri' },
  { day: '19', month: 'SEP', label: 'Sat' },
  { day: '20', month: 'SEP', label: 'Sun' },
  { day: '21', month: 'SEP', label: 'Mon' },
];

const timeSlots = [
  {
    id: '1',
    time: '09:00 AM',
    available: true,
    wait: 18,
  },
  {
    id: '2',
    time: '10:30 AM',
    available: true,
    wait: 25,
    recommended: true,
  },
  {
    id: '3',
    time: '12:00 PM',
    available: true,
    wait: 31,
  },
  {
    id: '4',
    time: '02:00 PM',
    available: true,
    wait: 39,
  },
  {
    id: '5',
    time: '03:30 PM',
    available: false,
    wait: 0,
  },
];

export default function SelectSlotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const centerName =
    typeof params.centerName === 'string'
      ? params.centerName
      : 'Green Valley Center';

  const [selectedDate, setSelectedDate] = useState('18');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');

  // Procurement details
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [quantity, setQuantity] = useState('');

  const selectedSlot = useMemo(
    () =>
      timeSlots.find((slot) => slot.time === selectedTime),
    [selectedTime]
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
                Muzaffarpur, Bihar
              </Text>
            </View>
          </View>

          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              2.4 km
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


        <View style={styles.dateRow}>

          {dates.map((date) => {
            const active = selectedDate === date.day;

            return (
              <Pressable
                key={date.day}
                onPress={() => setSelectedDate(date.day)}
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


        <View style={styles.slotsContainer}>

          {timeSlots.map((slot) => {
            const active = selectedTime === slot.time;

            return (
              <Pressable
                key={slot.id}
                disabled={!slot.available}
                onPress={() => setSelectedTime(slot.time)}
                style={[
                  styles.timeSlot,
                  active && styles.timeSlotActive,
                  !slot.available && styles.timeSlotDisabled,
                ]}
              >

                <View
                  style={[
                    styles.radio,
                    active && styles.radioActive,
                  ]}
                >
                  {active && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <View style={styles.timeInfo}>

                  <Text
                    style={[
                      styles.timeText,
                      active && styles.timeTextActive,
                      !slot.available &&
                        styles.disabledText,
                    ]}
                  >
                    {slot.time}
                  </Text>

                  {slot.available ? (
                    <Text style={styles.waitText}>
                      Estimated wait: {slot.wait} min
                    </Text>
                  ) : (
                    <Text style={styles.unavailableText}>
                      Fully booked
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
              {selectedSlot?.wait
                ? `${selectedTime} currently has good availability with an estimated ${selectedSlot.wait}-minute wait.`
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
                  {selectedDate} Sep 2026
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
                  {selectedTime}
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
                centerName,
                date: selectedDate,
                time: selectedTime,
                crop: selectedCrop,
                quantity: quantity || '0',
              },
            })
          }
        >

          <Text style={styles.continueText}>
            Continue to Review
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

  buttonPressed: {
    opacity: 0.8,
  },

});