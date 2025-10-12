import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { getPhotoSessions } from '../storage';
import { PhotoSession } from '../types';
import { formatDate } from '../utils/dateHelpers';

const { width } = Dimensions.get('window');

export const ComparePhotosScreen = () => {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [beforePhoto, setBeforePhoto] = useState<PhotoSession | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<PhotoSession | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await getPhotoSessions();
    const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
    setSessions(sorted);

    // Auto-select most recent two photos
    if (sorted.length >= 2) {
      setAfterPhoto(sorted[0]);
      setBeforePhoto(sorted[1]);
    } else if (sorted.length === 1) {
      setAfterPhoto(sorted[0]);
    }
  };

  const handlePhotoSelect = (photo: PhotoSession, type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforePhoto(photo);
    } else {
      setAfterPhoto(photo);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Photos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Before Photo Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before Photo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.photoThumb,
                  beforePhoto?.id === session.id && styles.photoThumbSelected,
                ]}
                onPress={() => handlePhotoSelect(session, 'before')}
              >
                <Image source={{ uri: session.imagePath }} style={styles.thumbImage} />
                <Text style={styles.thumbDate}>{formatDate(session.timestamp)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* After Photo Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>After Photo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[
                  styles.photoThumb,
                  afterPhoto?.id === session.id && styles.photoThumbSelected,
                ]}
                onPress={() => handlePhotoSelect(session, 'after')}
              >
                <Image source={{ uri: session.imagePath }} style={styles.thumbImage} />
                <Text style={styles.thumbDate}>{formatDate(session.timestamp)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Comparison View */}
        {beforePhoto && afterPhoto && (
          <View style={styles.comparisonSection}>
            <View style={styles.comparisonContainer}>
              {/* Before/After Labels */}
              <View style={styles.comparisonLabels}>
                <View style={styles.labelTag}>
                  <Text style={styles.labelText}>
                    {formatDate(beforePhoto.timestamp)}
                  </Text>
                </View>
                <View style={styles.labelTag}>
                  <Text style={styles.labelText}>
                    {formatDate(afterPhoto.timestamp)}
                  </Text>
                </View>
              </View>

              {/* Image Comparison with Slider */}
              <View style={styles.imageComparison}>
                {/* Before Image (left side) */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: beforePhoto.imagePath }}
                    style={styles.comparisonImage}
                    resizeMode="cover"
                  />
                </View>

                {/* After Image (right side, clipped) */}
                <View style={[styles.imageContainer, styles.afterImageContainer]}>
                  <Image
                    source={{ uri: afterPhoto.imagePath }}
                    style={styles.comparisonImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Slider Divider */}
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderLine} />
                  <View style={styles.sliderHandle}>
                    <Ionicons name="swap-horizontal" size={24} color={Colors.white} />
                  </View>
                </View>
              </View>

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Swipe the divider left and right to compare photos
                </Text>
              </View>
            </View>
          </View>
        )}

        {sessions.length < 2 && (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>Need at least 2 photos to compare</Text>
            <Text style={styles.emptySubtext}>Take more foot photos to see changes over time</Text>
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  photoScroll: {
    paddingLeft: 20,
  },
  photoThumb: {
    width: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  photoThumbSelected: {
    borderColor: Colors.turquoise,
  },
  thumbImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.border,
  },
  thumbDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 8,
    textAlign: 'center',
  },
  comparisonSection: {
    padding: 20,
  },
  comparisonContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  comparisonLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.background,
  },
  labelTag: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  imageComparison: {
    height: 400,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  afterImageContainer: {
    left: '50%',
  },
  comparisonImage: {
    width: '100%',
    height: '100%',
  },
  sliderContainer: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLine: {
    position: 'absolute',
    width: 4,
    height: '100%',
    backgroundColor: Colors.turquoise,
  },
  sliderHandle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});
