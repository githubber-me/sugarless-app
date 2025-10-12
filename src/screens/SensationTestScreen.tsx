import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { SensationResponse, SensationSite } from '../types';
import {
  initializeSensationSites,
  getTestInstruction,
  calculateSensationScore,
  classifySensationResult,
} from '../utils/sensationHelpers';
import { saveSensationSession } from '../storage';

export const SensationTestScreen = () => {
  const navigation = useNavigation<any>();
  const [sites] = useState<SensationSite[]>(initializeSensationSites());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentSite = sites[currentIndex];
  const totalSites = sites.length;

  const handleResponse = async (response: SensationResponse) => {
    // Update the site with the response
    sites[currentIndex].response = response;

    if (currentIndex < totalSites - 1) {
      // Move to next site
      setCurrentIndex(currentIndex + 1);
      setProgress(((currentIndex + 1) / totalSites) * 100);
    } else {
      // Test complete - calculate results
      const score = calculateSensationScore(sites);
      const classification = classifySensationResult(score);

      const session = {
        id: Date.now().toString(),
        date: Date.now(),
        results: sites,
        totalScore: score,
        classification,
      };

      try {
        await saveSensationSession(session);
        navigation.replace('SensationResults', { session });
      } catch (error) {
        console.error('Error saving sensation session:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Running Test</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Progress</Text>
        <Text style={styles.progressCount}>
          {currentIndex + 1} / {totalSites}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(progress || 1/6 * 100)}%` }]} />
      </View>

      {/* Test Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="finger-print" size={64} color={Colors.turquoise} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>
          {getTestInstruction(currentSite)}
        </Text>
        <Text style={styles.instructionSubtitle}>
          Caregiver: Lightly touch this toe. Patient: Did you feel it?
        </Text>
      </View>

      {/* Foot Visualization */}
      <View style={styles.footVisualization}>
        <Text style={styles.footLabel}>Left Foot</Text>
        <Text style={styles.footLabel}>Right Foot</Text>
      </View>
      <View style={styles.toesContainer}>
        {[1, 3, 5].map((toe) => {
          const leftSite = sites.find((s) => s.foot === 'left' && s.toe === toe);
          const rightSite = sites.find((s) => s.foot === 'right' && s.toe === toe);
          const isLeftActive = currentSite.foot === 'left' && currentSite.toe === toe;
          const isRightActive = currentSite.foot === 'right' && currentSite.toe === toe;

          return (
            <View key={toe} style={styles.toeRow}>
              <View
                style={[
                  styles.toe,
                  isLeftActive && styles.toeActive,
                  leftSite?.response && styles.toeCompleted,
                ]}
              />
              <View
                style={[
                  styles.toe,
                  isRightActive && styles.toeActive,
                  rightSite?.response && styles.toeCompleted,
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Response Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.feltButton]}
          onPress={() => handleResponse('felt')}
        >
          <Ionicons name="checkmark" size={24} color={Colors.white} />
          <Text style={styles.buttonText}>Felt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.faintButton]}
          onPress={() => handleResponse('faint')}
        >
          <Text style={styles.buttonText}>~ Faint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.notFeltButton]}
          onPress={() => handleResponse('not-felt')}
        >
          <Ionicons name="close" size={24} color={Colors.white} />
          <Text style={styles.buttonText}>Not Felt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.turquoise,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.turquoise,
    borderRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.turquoiseLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footVisualization: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  footLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toesContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  toeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
    marginBottom: 16,
  },
  toe: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
  },
  toeActive: {
    backgroundColor: Colors.turquoise,
    transform: [{ scale: 1.1 }],
  },
  toeCompleted: {
    backgroundColor: Colors.success,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  feltButton: {
    backgroundColor: Colors.felt,
  },
  faintButton: {
    backgroundColor: Colors.faint,
  },
  notFeltButton: {
    backgroundColor: Colors.notFelt,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});
