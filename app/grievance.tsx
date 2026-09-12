import React, { useState } from 'react';
import {
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

export default function GrievanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedIssue, setSelectedIssue] = useState('Payment');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    router.push('/grievance-submitted');
  };

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
          <Text style={styles.headerTitle}>Grievance</Text>
          <Text style={styles.headerSubtitle}>
            We are here to help
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#2F7D4A"
            />
          </View>

          <View style={styles.introText}>
            <Text style={styles.introTitle}>
              Raise a Grievance
            </Text>

            <Text style={styles.introSubtitle}>
              Tell us about the issue you faced during
              procurement. Our team will review it.
            </Text>
          </View>
        </View>

        {/* Issue Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What is the issue about?
          </Text>

          <View style={styles.issueGrid}>
            {issueTypes.map((issue) => {
              const selected = selectedIssue === issue.label;

              return (
                <Pressable
                  key={issue.label}
                  onPress={() => setSelectedIssue(issue.label)}
                  style={[
                    styles.issueCard,
                    selected && styles.issueCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.issueIcon,
                      selected && styles.issueIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={issue.icon}
                      size={21}
                      color={selected ? '#FFFFFF' : '#2F7D4A'}
                    />
                  </View>

                  <Text
                    style={[
                      styles.issueLabel,
                      selected && styles.issueLabelSelected,
                    ]}
                  >
                    {issue.label}
                  </Text>

                  {selected && (
                    <View style={styles.selectedCheck}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Booking Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Procurement Reference
          </Text>

          <View style={styles.referenceCard}>
            <View style={styles.referenceRow}>
              <Ionicons
                name="ticket-outline"
                size={20}
                color="#2F7D4A"
              />

              <View style={styles.referenceText}>
                <Text style={styles.referenceLabel}>
                  Token
                </Text>
                <Text style={styles.referenceValue}>
                  A-76
                </Text>
              </View>

              <View style={styles.referenceStatus}>
                <Text style={styles.referenceStatusText}>
                  Completed
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.referenceRow}>
              <Ionicons
                name="business-outline"
                size={20}
                color="#2F7D4A"
              />

              <View style={styles.referenceText}>
                <Text style={styles.referenceLabel}>
                  Center
                </Text>
                <Text style={styles.referenceValue}>
                  Green Valley Center
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Describe the issue
          </Text>

          <View style={styles.inputCard}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Explain what happened..."
              placeholderTextColor="#9AA59E"
              multiline
              textAlignVertical="top"
              style={styles.textInput}
              maxLength={500}
            />

            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Add supporting photo
            <Text style={styles.optional}>  (Optional)</Text>
          </Text>

          <Pressable style={styles.photoCard}>
            <View style={styles.photoIcon}>
              <Ionicons
                name="camera-outline"
                size={25}
                color="#2F7D4A"
              />
            </View>

            <View style={styles.photoText}>
              <Text style={styles.photoTitle}>
                Add Photo
              </Text>

              <Text style={styles.photoSubtitle}>
                Upload a photo related to your grievance
              </Text>
            </View>

            <Ionicons
              name="add-circle-outline"
              size={23}
              color="#2F7D4A"
            />
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
        >
          <Ionicons
            name="send-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.submitButtonText}>
            Submit Grievance
          </Text>
        </Pressable>

        {/* Privacy note */}
        <View style={styles.bottomNote}>
          <Ionicons
            name="lock-closed-outline"
            size={15}
            color="#7C8A82"
          />

          <Text style={styles.bottomNoteText}>
            Your grievance details are securely recorded
            and linked to your procurement record.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
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

  /* Intro */

  introCard: {
    backgroundColor: '#EAF4EC',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introText: {
    flex: 1,
    marginLeft: 12,
  },

  introTitle: {
    color: '#18352A',
    fontSize: 15,
    fontWeight: '700',
  },

  introSubtitle: {
    color: '#62756A',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
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

  optional: {
    color: '#8A958E',
    fontSize: 11,
    fontWeight: '400',
  },

  /* Issue */

  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  issueCard: {
    width: '31.5%',
    minHeight: 94,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8ECE8',
    position: 'relative',
  },

  issueCardSelected: {
    backgroundColor: '#EAF4EC',
    borderColor: '#2F7D4A',
  },

  issueIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  issueIconSelected: {
    backgroundColor: '#2F7D4A',
  },

  issueLabel: {
    color: '#52645A',
    fontSize: 11,
    fontWeight: '600',
  },

  issueLabelSelected: {
    color: '#2F7D4A',
    fontWeight: '700',
  },

  selectedCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2F7D4A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Reference */

  referenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  referenceText: {
    flex: 1,
    marginLeft: 12,
  },

  referenceLabel: {
    color: '#7C8A82',
    fontSize: 10,
  },

  referenceValue: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  referenceStatus: {
    backgroundColor: '#EAF4EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  referenceStatusText: {
    color: '#2F7D4A',
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF0EC',
  },

  /* Description */

  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    minHeight: 150,
  },

  textInput: {
    color: '#18352A',
    fontSize: 13,
    lineHeight: 20,
    minHeight: 110,
  },

  characterCount: {
    color: '#9AA59E',
    fontSize: 10,
    textAlign: 'right',
  },

  /* Photo */

  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B8C9BD',
  },

  photoIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoText: {
    flex: 1,
    marginLeft: 12,
  },

  photoTitle: {
    color: '#18352A',
    fontSize: 13,
    fontWeight: '700',
  },

  photoSubtitle: {
    color: '#7C8A82',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  /* Submit */

  submitButton: {
    backgroundColor: '#2F7D4A',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 2,
  },

  submitButtonPressed: {
    opacity: 0.8,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Bottom */

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingHorizontal: 5,
  },

  bottomNoteText: {
    flex: 1,
    color: '#7C8A82',
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 7,
  },

  bottomSpace: {
    height: 30,
  },
});