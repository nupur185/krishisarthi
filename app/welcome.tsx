import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>

            <View>
              <Text style={styles.logo}>KrishiSarthi</Text>
              <Text style={styles.brandTag}>SMART PROCUREMENT</Text>
            </View>
          </View>

          <View style={styles.saffronLine} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.heroBadgeText}>
              BUILT FOR FARMERS
            </Text>
          </View>

          <Text style={styles.title}>
            From Farm to Fair Market,
            {'\n'}
            <Text style={styles.titleAccent}>
              without the Wait
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Book your procurement slot, track your live queue,
            and stay updated from procurement to payment.
          </Text>

          <View style={styles.heroBottom}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>01</Text>
              <Text style={styles.heroStatText}>Book</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>02</Text>
              <Text style={styles.heroStatText}>Track</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>03</Text>
              <Text style={styles.heroStatText}>Get Paid</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Everything in one place
          </Text>

          <Text style={styles.sectionSubtitle}>
            Simple tools for a smoother procurement experience
          </Text>
        </View>

        <View style={styles.featureBox}>
          <Feature
            icon="📅"
            number="01"
            title="Book your slot"
            text="Choose a convenient procurement time and centre."
          />

          <Feature
            icon="📍"
            number="02"
            title="Track your queue"
            text="See your live token position and estimated wait."
          />

          <Feature
            icon="₹"
            number="03"
            title="Track your payment"
            text="Follow your payment status after procurement."
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Farmer Registration */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.primaryButtonText}>
              Register as Farmer
            </Text>

            <Text style={styles.primaryButtonArrow}>
              →
            </Text>
          </TouchableOpacity>

          {/* Farmer Login */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.secondaryButtonText}>
              Already registered?{' '}
              <Text style={styles.loginAccent}>
                Login
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Operator Login */}
          <TouchableOpacity
            style={styles.operatorButton}
            activeOpacity={0.7}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.operatorIcon}>⚙</Text>

            <Text style={styles.operatorText}>
              Operator Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <View style={styles.footerDot} />

          <Text style={styles.footer}>
            Secure • Simple • Transparent
          </Text>

          <View style={styles.footerDot} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({
  icon,
  number,
  title,
  text,
}: {
  icon: string;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.featureText}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>
            {title}
          </Text>

          <Text style={styles.featureNumber}>
            {number}
          </Text>
        </View>

        <Text style={styles.featureDescription}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },

  /* Header */

  header: {
    marginBottom: 18,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5F1E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D4E7D5',
  },

  logoIcon: {
    fontSize: 28,
  },

  logo: {
    fontSize: 23,
    fontWeight: '800',
    color: '#205C2B',
    letterSpacing: 0.2,
  },

  brandTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#E47B22',
    letterSpacing: 1.4,
    marginTop: 2,
  },

  saffronLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E47B22',
    marginTop: 12,
  },

  /* Hero */

  heroCard: {
    width: '100%',
    backgroundColor: '#205C2B',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    overflow: 'hidden',
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 15,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F2A65A',
    marginRight: 6,
  },

  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EAF5EA',
    letterSpacing: 1.1,
  },

  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  titleAccent: {
    color: '#F2A65A',
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#D9E9DB',
    marginTop: 12,
    maxWidth: 320,
  },

  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },

  heroStat: {
    flex: 1,
    alignItems: 'center',
  },

  heroStatNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F2A65A',
    marginBottom: 2,
  },

  heroStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  /* Features */

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#173B25',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#78847B',
    marginTop: 3,
  },

  featureBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E7ECE7',
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EEF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  featureIconText: {
    fontSize: 19,
  },

  featureText: {
    flex: 1,
  },

  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#254331',
  },

  featureNumber: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C7D2C9',
    marginRight: 4,
  },

  featureDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#748078',
    marginTop: 2,
    paddingRight: 4,
  },

  /* Actions */

  actions: {
    width: '100%',
    marginTop: 20,
  },

  primaryButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#286F2C',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  primaryButtonArrow: {
    color: '#F2A65A',
    fontSize: 21,
    fontWeight: '700',
    marginLeft: 10,
  },

  secondaryButton: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  secondaryButtonText: {
    color: '#68756B',
    fontSize: 13,
    fontWeight: '600',
  },

  loginAccent: {
    color: '#2E7D32',
    fontWeight: '800',
  },

  /* Operator Login */

  operatorButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  operatorIcon: {
    fontSize: 13,
    color: '#7A847C',
    marginRight: 6,
  },

  operatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68756B',
  },

  /* Footer */

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E47B22',
    marginHorizontal: 7,
  },

  footer: {
    textAlign: 'center',
    color: '#9AA49D',
    fontSize: 10,
    fontWeight: '600',
  },
});