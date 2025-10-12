import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Sugi } from '../components/Sugi';
import { SugiMessage } from '../components/SugiMessage';
import { SensationSession, SensationResponse } from '../types';
import {
  getClassificationLabel,
  getClassificationEmoji,
  getSugiMessage,
} from '../utils/sensationHelpers';
import { formatFullDate } from '../utils/dateHelpers';

export const SensationResultsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const session: SensationSession = route.params?.session;

  if (!session) {
    navigation.goBack();
    return null;
  }

  const getResponseColor = (response: SensationResponse | null): string => {
    switch (response) {
      case 'felt':
        return Colors.felt;
      case 'faint':
        return Colors.faint;
      case 'not-felt':
        return Colors.notFelt;
      default:
        return Colors.border;
    }
  };

  const getResponseLabel = (response: SensationResponse | null): string => {
    switch (response) {
      case 'felt':
        return '✓';
      case 'faint':
        return '~';
      case 'not-felt':
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Results</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sugi Mascot */}
        <View style={styles.sugiContainer}>
          <Sugi size={100} />
        </View>

        {/* Result Card */}
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>
            {getClassificationEmoji(session.classification)}
          </Text>
          <Text
            style={[
              styles.resultLabel,
              {
                color:
                  session.classification === 'normal'
                    ? Colors.success
                    : session.classification === 'borderline'
                    ? Colors.warning
                    : Colors.danger,
              },
            ]}
          >
            {getClassificationLabel(session.classification)}
          </Text>
          <Text style={styles.resultScore}>
            {session.totalScore} out of 6 touches felt
          </Text>
          <Text style={styles.resultDate}>{formatFullDate(session.date)}</Text>
        </View>

        {/* Sugi Message */}
        <SugiMessage message={getSugiMessage(session.classification)} />

        {/* Heatmap Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Results</Text>
          <View style={styles.heatmapContainer}>
            <View style={styles.heatmapHeader}>
              <Text style={styles.heatmapLabel}>Left Foot</Text>
              <Text style={styles.heatmapLabel}>Right Foot</Text>
            </View>

            {[1, 3, 5].map((toe) => {
              const leftSite = session.results.find((s) => s.foot === 'left' && s.toe === toe);
              const rightSite = session.results.find((s) => s.foot === 'right' && s.toe === toe);

              return (
                <View key={toe} style={styles.heatmapRow}>
                  <View style={styles.toeInfo}>
                    <Text style={styles.toeName}>
                      {toe === 1 ? 'Big Toe' : toe === 3 ? '3rd Toe' : '5th Toe'}
                    </Text>
                  </View>
                  <View style={styles.heatmapCells}>
                    <View
                      style={[
                        styles.heatmapCell,
                        { backgroundColor: getResponseColor(leftSite?.response || null) },
                      ]}
                    >
                      <Text style={styles.heatmapCellText}>
                        {getResponseLabel(leftSite?.response || null)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.heatmapCell,
                        { backgroundColor: getResponseColor(rightSite?.response || null) },
                      ]}
                    >
                      <Text style={styles.heatmapCellText}>
                        {getResponseLabel(rightSite?.response || null)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.felt }]} />
              <Text style={styles.legendText}>Felt</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.faint }]} />
              <Text style={styles.legendText}>Faint</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: Colors.notFelt }]} />
              <Text style={styles.legendText}>Not Felt</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    color: Colors.textPrimary,
  },
  doneButton: {
    paddingHorizontal: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.turquoise,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sugiContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 30,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  heatmapContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingLeft: 100,
  },
  heatmapLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 80,
    textAlign: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toeInfo: {
    width: 100,
  },
  toeName: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  heatmapCells: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heatmapCell: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapCellText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: Colors.turquoise,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});
