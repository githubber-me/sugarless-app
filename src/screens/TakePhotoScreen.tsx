import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { savePhotoSession } from '../storage';
import { PhotoSession } from '../types';

export const TakePhotoScreen = () => {
  const navigation = useNavigation<any>();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [footSide, setFootSide] = useState<'left' | 'right'>('left');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [hasWound, setHasWound] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.textLight} />
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedUri(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const retakePicture = () => {
    setCapturedUri(null);
    setNotes('');
    setHasWound(false);
  };

  const savePhoto = async () => {
    if (!capturedUri) return;

    const session: PhotoSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      footSide,
      imagePath: capturedUri,
      notes: notes.trim() || undefined,
      hasWound,
    };

    try {
      await savePhotoSession(session);
      Alert.alert('Success', 'Photo saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo');
    }
  };

  if (capturedUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePicture} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Photo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Photo captured successfully!</Text>

          {/* Foot Side Selector */}
          <View style={styles.footSelector}>
            <Text style={styles.label}>Which foot?</Text>
            <View style={styles.footButtons}>
              <TouchableOpacity
                style={[styles.footButton, footSide === 'left' && styles.footButtonActive]}
                onPress={() => setFootSide('left')}
              >
                <Text
                  style={[styles.footButtonText, footSide === 'left' && styles.footButtonTextActive]}
                >
                  Left Foot
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footButton, footSide === 'right' && styles.footButtonActive]}
                onPress={() => setFootSide('right')}
              >
                <Text
                  style={[
                    styles.footButtonText,
                    footSide === 'right' && styles.footButtonTextActive,
                  ]}
                >
                  Right Foot
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wound Tag */}
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setHasWound(!hasWound)}>
            <View style={[styles.checkbox, hasWound && styles.checkboxChecked]}>
              {hasWound && <Ionicons name="checkmark" size={18} color={Colors.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Mark as having a wound</Text>
          </TouchableOpacity>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any observations..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
              <Text style={styles.saveButtonText}>Save Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.cameraHeaderTitle}>Take Foot Photo</Text>
        <View style={styles.placeholder} />
      </View>

      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Overlay Guide */}
        <View style={styles.overlay}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>Position your foot within the frame</Text>
        </View>

        {/* Camera Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: Colors.turquoise,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cameraHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 40,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  guideFrame: {
    width: 300,
    height: 400,
    borderWidth: 3,
    borderColor: Colors.turquoise,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  guideText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.turquoise,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.turquoise,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  footSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  footButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  footButtonActive: {
    backgroundColor: Colors.turquoise,
    borderColor: Colors.turquoise,
  },
  footButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footButtonTextActive: {
    color: Colors.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.turquoise,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.turquoise,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.turquoise,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
