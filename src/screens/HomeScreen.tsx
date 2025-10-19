import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Sugi } from '../components/Sugi';
import { SugiMessage } from '../components/SugiMessage';
import { getGreeting, getCurrentDayAndDate, formatDate, formatTime } from '../utils/dateHelpers';
import { getLatestPhotoSession, getLatestSensationSession } from '../storage';
import { PhotoSession, SensationSession } from '../types';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [latestPhoto, setLatestPhoto] = useState<PhotoSession | null>(null);
  const [latestSensation, setLatestSensation] = useState<SensationSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestSessions();
  }, []);

  const loadLatestSessions = async () => {
    try {
      const [photo, sensation] = await Promise.all([
        getLatestPhotoSession(),
        getLatestSensationSession(),
      ]);
      setLatestPhoto(photo);
      setLatestSensation(sensation);
    } catch (error) {
      console.error('Error loading latest sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'photo',
      title: 'Take Foot Photo',
      subtitle: latestPhoto ? `Last: ${formatDate(latestPhoto.timestamp)}` : 'Not started yet',
      icon: 'camera',
      color: Colors.turquoise,
      onPress: () => navigation.navigate('TakePhoto'),
    },
    {
      id: 'sensation',
      title: 'Run Sensation Check',
      subtitle: latestSensation ? `Last: ${formatDate(latestSensation.date)}` : 'Not started yet',
      icon: 'finger-print',
      color: Colors.coral,
      onPress: () => navigation.navigate('SensationTest'),
    },
    {
      id: 'compare',
      title: 'Compare Photos',
      subtitle: 'See changes over time',
      icon: 'git-compare',
      color: '#9B7EDE',
      onPress: () => navigation.navigate('ComparePhotos'),
    },
    {
      id: 'ai',
      title: 'AI Detection',
      subtitle: 'AI-powered analysis',
      icon: 'brain',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('AI'),
    },
  ];

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{getCurrentDayAndDate()}</Text>
        </View>

        {/* Sugi Mascot */}
        <View style={styles.sugiContainer}>
          <Sugi size={100} />
        </View>

        {/* Sugi Message */}
        <SugiMessage message="You're doing great! Keep up with your daily care routine." />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={28} color={action.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        {(latestPhoto || latestSensation) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {latestPhoto && (
              <View style={styles.activityItem}>
                <Ionicons name="camera" size={20} color={Colors.turquoise} />
                <Text style={styles.activityText}>
                  {latestPhoto.footSide.charAt(0).toUpperCase() + latestPhoto.footSide.slice(1)} foot photo
                </Text>
                <Text style={styles.activityTime}>
                  {formatDate(latestPhoto.timestamp)}, {formatTime(latestPhoto.timestamp)}
                </Text>
              </View>
            )}
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
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  sugiContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
