import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { getPhotoSessions } from '../storage';
import { PhotoSession } from '../types';
import { formatDate, formatTime } from '../utils/dateHelpers';

export const PhotosScreen = () => {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    const unsubscribe = navigation.addListener('focus', loadSessions);
    return unsubscribe;
  }, [navigation]);

  const loadSessions = async () => {
    try {
      const data = await getPhotoSessions();
      setSessions(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading photo sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = () => {
    navigation.navigate('TakePhoto');
  };

  const handleComparePhotos = () => {
    navigation.navigate('ComparePhotos');
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
        <Text style={styles.title}>Photos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={24} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Take Foot Photo</Text>
          </TouchableOpacity>

          {sessions.length > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleComparePhotos}>
              <Ionicons name="git-compare" size={24} color={Colors.turquoise} />
              <Text style={styles.secondaryButtonText}>Compare Photos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photo Grid */}
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No photos yet</Text>
            <Text style={styles.emptySubtext}>Take your first foot photo to get started</Text>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {sessions.map((session) => (
              <View key={session.id} style={styles.photoCard}>
                <Image source={{ uri: session.imagePath }} style={styles.photoImage} />
                <View style={styles.photoInfo}>
                  <Text style={styles.photoDate}>{formatDate(session.timestamp)}</Text>
                  <Text style={styles.photoFoot}>
                    {session.footSide.charAt(0).toUpperCase() + session.footSide.slice(1)} foot
                  </Text>
                  {session.hasWound && (
                    <View style={styles.woundTag}>
                      <Text style={styles.woundTagText}>Wound noted</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.turquoise,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.turquoise,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.turquoise,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  photoGrid: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  photoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photoImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.border,
  },
  photoInfo: {
    padding: 16,
  },
  photoDate: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  photoFoot: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  woundTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.danger + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  woundTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
});
