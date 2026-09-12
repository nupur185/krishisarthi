import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const centerName =
    typeof params.centerName === 'string'
      ? params.centerName
      : 'Green Valley Center';

  const date =
    typeof params.date === 'string'
      ? params.date
      : '18';

  const time =
    typeof params.time === 'string'
      ? params.time
      : '10:30 AM';

  const crop =
    typeof params.crop === 'string'
      ? params.crop
      : 'Wheat';

  const quantity =
    typeof params.quantity === 'string'
      ? params.quantity
      : '30';

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
            Review Booking
          </Text>

          <Text style={styles.headerSubtitle}>
            Check your details before confirming
          </Text>
        </View>

        <View style={styles.reviewIcon}>
          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color="#2F7D4A"
          />
        </View>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ================= CONFIRMATION MESSAGE ================= */}

        <View style={styles.introCard}>

          <View style={styles.introIcon}>
            <Ionicons
              name="calendar"
              size={23}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.introContent}>

            <Text style={styles.introTitle}>
              Almost there!
            </Text>

            <Text style={styles.introText}>
              Review your procurement appointment
              details before confirming your slot.
            </Text>

          </View>

        </View>


        {/* ================= CENTER ================= */}

        <Text style={styles.sectionTitle}>
          Procurement center
        </Text>

        <View style={styles.centerCard}>

          <View style={styles.centerIcon}>
            <Ionicons
              name="business-outline"
              size={25}
              color="#2F7D4A"
            />
          </View>

          <View style={styles.centerDetails}>

            <Text style={styles.centerName}>
              {centerName}
            </Text>

            <View style={styles.locationRow}>

              <Ionicons
                name="location-outline"
                size={14}
                color="#7B8982"
              />

              <Text style={styles.locationText}>
                Muzaffarpur, Bihar
              </Text>

            </View>

            <View style={styles.distanceRow}>

              <Ionicons
                name="navigate-outline"
                size={13}
                color="#7B8982"
              />

              <Text style={styles.distanceText}>
                2.4 km from your location
              </Text>

            </View>

          </View>

        </View>


        {/* ================= APPOINTMENT ================= */}

        <Text style={styles.sectionTitle}>
          Appointment details
        </Text>

        <View style={styles.detailsCard}>

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                DATE
              </Text>

              <Text style={styles.detailValue}>
                {date} September 2026
              </Text>
            </View>

          </View>


          <View style={styles.divider} />


          <View style={styles.detailRow}>

            <View
              style={[
                styles.detailIcon,
                styles.timeIcon,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={19}
                color="#D99A27"
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                TIME
              </Text>

              <Text style={styles.detailValue}>
                {time}
              </Text>
            </View>

          </View>


          <View style={styles.divider} />


          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Ionicons
                name="hourglass-outline"
                size={19}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                ESTIMATED WAIT
              </Text>

              <Text style={styles.detailValue}>
                25 minutes
              </Text>
            </View>

            <View style={styles.aiMiniBadge}>

              <Ionicons
                name="sparkles"
                size={10}
                color="#8B5A00"
              />

              <Text style={styles.aiMiniText}>
                AI
              </Text>

            </View>

          </View>

        </View>


        {/* ================= PROCUREMENT ================= */}

        <Text style={styles.sectionTitle}>
          Procurement details
        </Text>

        <View style={styles.procurementCard}>

          <View style={styles.procurementItem}>

            <View style={styles.procurementIcon}>
              <Ionicons
                name="leaf-outline"
                size={20}
                color="#2F7D4A"
              />
            </View>

            <View>
              <Text style={styles.detailLabel}>
                CROP / COMMODITY
              </Text>

              <Text style={styles.procurementValue}>
                {crop}
              </Text>
            </View>

          </View>


          <View style={styles.procurementItem}>

            <View
              style={[
                styles.procurementIcon,
                styles.quantityIcon,
              ]}
            >
              <Ionicons
                name="scale-outline"
                size={20}
                color="#D99A27"
              />
            </View>

            <View>
              <Text style={styles.detailLabel}>
                APPROX. QUANTITY
              </Text>

              <Text style={styles.procurementValue}>
                {quantity} quintals
              </Text>
            </View>

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
                AI queue insight
              </Text>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  SMART
                </Text>
              </View>

            </View>

            <Text style={styles.aiText}>
              This slot currently has an estimated
              waiting time of 25 minutes based on
              expected queue activity.
            </Text>

          </View>

        </View>


        {/* ================= IMPORTANT NOTE ================= */}

        <View style={styles.noteCard}>

          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#65766C"
          />

          <Text style={styles.noteText}>
            Please arrive at the procurement center
            around 10–15 minutes before your scheduled
            slot. Your final token will be generated
            after confirmation.
          </Text>

        </View>


        {/* ================= CONFIRM BUTTON ================= */}

        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/booking-confirmed',
              params: {
                centerName,
                date,
                time,
                crop,
                quantity,
              },
            })
          }
        >

          <Ionicons
            name="checkmark-circle"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.confirmText}>
            Confirm Booking
          </Text>

        </Pressable>


        <Text style={styles.bottomNote}>
          You can reschedule or cancel this booking
          from My Booking.
        </Text>

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

  reviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },


  /* INTRO */

  introCard: {
    backgroundColor: '#EAF4EC',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E7D9',
  },

  introIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introContent: {
    flex: 1,
    marginLeft: 11,
  },

  introTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18352A',
  },

  introText: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    color: '#66766C',
  },


  /* SECTIONS */

  sectionTitle: {
    marginTop: 21,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '800',
    color: '#18352A',
  },


  /* CENTER */

  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE4',
  },

  centerIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerDetails: {
    flex: 1,
    marginLeft: 11,
  },

  centerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18352A',
  },

  locationRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  locationText: {
    fontSize: 9,
    color: '#7B8982',
  },

  distanceRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  distanceText: {
    fontSize: 8,
    color: '#89958E',
  },


  /* APPOINTMENT */

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E4EAE4',
  },

  detailRow: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeIcon: {
    backgroundColor: '#FFF4D9',
  },

  detailContent: {
    marginLeft: 11,
    flex: 1,
  },

  detailLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#96A29B',
  },

  detailValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800',
    color: '#33463B',
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0ED',
  },

  aiMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF4D9',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  aiMiniText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#8B5A00',
  },


  /* PROCUREMENT */

  procurementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E4EAE4',
  },

  procurementItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  procurementIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  quantityIcon: {
    backgroundColor: '#FFF4D9',
  },

  procurementValue: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800',
    color: '#33463B',
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

  aiText: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 14,
    color: '#68776E',
  },


  /* NOTE */

  noteCard: {
    marginTop: 13,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#EFF2EE',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  noteText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
    color: '#68766E',
  },


  /* BUTTON */

  confirmButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#2F7D4A',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  confirmText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  bottomNote: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 8,
    color: '#89958E',
  },

});