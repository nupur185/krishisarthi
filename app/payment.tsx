import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Payment & Updates</Text>
          <Text style={styles.headerSubtitle}>
            Procurement payment status
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Status Card */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentTopRow}>
            <View>
              <Text style={styles.paymentLabel}>PAYMENT STATUS</Text>
              <Text style={styles.paymentStatus}>Credited</Text>
            </View>

            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark"
                size={26}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.amount}>₹18,560</Text>

          <Text style={styles.creditText}>
            Amount credited to your registered bank account
          </Text>

          <View style={styles.referenceBox}>
            <Text style={styles.referenceLabel}>Bank Reference</Text>
            <Text style={styles.referenceValue}>
              SBI-KS-260918-8742
            </Text>
          </View>
        </View>

        {/* Procurement Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procurement Summary</Text>

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
                <Text style={styles.summaryLabel}>Commodity</Text>
                <Text style={styles.summaryValue}>Wheat</Text>
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
                <Text style={styles.summaryValue}>3,200 kg</Text>
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
                <Text style={styles.summaryLabel}>MSP Rate</Text>
                <Text style={styles.summaryValue}>₹5.80 / kg</Text>
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
                  Green Valley Center
                </Text>
                <Text style={styles.summarySubtext}>
                  Muzaffarpur, Bihar
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Timeline</Text>

          <View style={styles.timelineCard}>
            {/* Step 1 */}
            <TimelineItem
              icon="checkmark-circle"
              title="Procurement Completed"
              subtitle="18 Sep 2026 • 12:42 PM"
              completed
            />

            <View style={styles.timelineLine} />

            {/* Step 2 */}
            <TimelineItem
              icon="checkmark-circle"
              title="Payment Processing"
              subtitle="18 Sep 2026 • 12:48 PM"
              completed
            />

            <View style={styles.timelineLine} />

            {/* Step 3 */}
            <TimelineItem
              icon="checkmark-circle"
              title="Payment Initiated"
              subtitle="18 Sep 2026 • 01:02 PM"
              completed
            />

            <View style={styles.timelineLine} />

            {/* Step 4 */}
            <TimelineItem
              icon="checkmark-circle"
              title="Credited to Bank"
              subtitle="18 Sep 2026 • 01:05 PM"
              completed
            />
          </View>
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>

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
              Your feedback helps improve procurement services.
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
              Raise a grievance about payment, quality or weightment.
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
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
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
        <Text style={styles.documentTitle}>{title}</Text>
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
    backgroundColor: '#2F7D4A',
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