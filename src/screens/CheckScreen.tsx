import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { SugiMessage } from '../components/SugiMessage';
import { getLatestSensationSession } from '../storage';
import { SensationSession } from '../types';
import { getClassificationLabel, getClassificationEmoji } from '../utils/sensationHelpers';
import { formatFullDate } from '../utils/dateHelpers';

export const CheckScreen = () => {
  const navigation = useNavigation<any>();
  const [latestSession, setLatestSession] = useState<SensationSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestSession();
    const unsubscribe = navigation.addListener('focus', loadLatestSession);
    return unsubscribe;
  }, [navigation]);

  const loadLatestSession = async () => {
    try {
      const session = await getLatestSensationSession();
      setLatestSession(session);
    } catch (error) {
      console.error('Error loading latest sensation session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    navigation.navigate('SensationTest');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.turquoise} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensation Check</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sugi Message */}
        <SugiMessage message="Ready to check your foot sensation? This gentle test takes just 2 minutes." />

        {/* Start Button */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
            <Ionicons name="finger-print" size={24} color={Colors.white} />
            <Text style={styles.startButtonText}>Start Sensation Check</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Ipswich Touch Test</Text>
          <Text style={styles.infoText}>
            This simple screening test helps detect early signs of peripheral neuropathy in your feet.
          </Text>

          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: Colors.turquoiseLight }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                The caregiver lightly touches specific points on each toe
              </Text>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: Colors.turquoiseLight }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                You respond whether you felt, faintly felt, or did not feel the touch
              </Text>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: Colors.turquoiseLight }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Sugi guides you through 6 test points and provides results
              </Text>
            </View>
          </View>
        </View>

        {/* Last Test Result */}
        {latestSession && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Test Result</Text>
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => navigation.navigate('SensationResults', { session: latestSession })}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultDate}>{formatFullDate(latestSession.date)}</Text>
                <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultEmoji}>
                  {getClassificationEmoji(latestSession.classification)}
                </Text>
                <View style={styles.resultInfo}>
                  <Text style={[
                    styles.resultLabel,
                    {
                      color:
                        latestSession.classification === 'normal'
                          ? Colors.success
                          : latestSession.classification === 'borderline'
                          ? Colors.warning
                          : Colors.danger,
                    },
                  ]}>
                    {getClassificationLabel(latestSession.classification)}
                  </Text>
                  <Text style={styles.resultScore}>{latestSession.totalScore}/6</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.turquoise,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  actions: {
    padding: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.turquoise,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.turquoiseDark,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingTop: 6,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resultEmoji: {
    fontSize: 48,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultScore: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
