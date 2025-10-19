// AI Detection Screen - Diabetes detection using Roboflow API
// Provides camera capture, image upload, and AI-powered detection results
// Adapted from Next.js reference implementation for React Native

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Colors } from '../constants/colors';

interface DetectionResult {
  visualization?: string;
  predictions?: Record<string, unknown>;
  output?: {
    image?: {
      base64?: string;
      value?: string;
      mime?: string;
      url?: string;
    };
    json?: Record<string, unknown>;
  };
}

interface Prediction {
  width: number;
  height: number;
  x: number;
  y: number;
  confidence: number;
  class_id: number;
  class: string;
  detection_id: string;
  parent_id: string;
}

interface DetectionsPayload {
  outputs: Array<{
    count_objects: number;
    output_image: { type: 'base64'; value: string };
    predictions: {
      image: { width: number; height: number };
      predictions: Prediction[];
    };
  }>;
  profiler_trace: unknown[];
}

const { width: screenWidth } = Dimensions.get('window');

export const AIScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [normalized, setNormalized] = useState<DetectionsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  // Handle image picker
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = `data:image/jpeg;base64,${asset.base64}`;
      setSelectedImage(base64);
      setResult(null);
      setNormalized(null);
    }
  };

  // Start camera
  const startCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setShowCamera(true);
    } else {
      Alert.alert('Permission needed', 'Please grant camera access to take photos.');
    }
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        });
        
        if (photo.base64) {
          const base64 = `data:image/jpeg;base64,${photo.base64}`;
          setSelectedImage(base64);
          setShowCamera(false);
          setResult(null);
          setNormalized(null);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo');
        console.error(error);
      }
    }
  };

  // Submit image for detection
  const handleDetect = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select or capture an image first');
      return;
    }

    const apiKey = Constants.expoConfig?.extra?.NEXT_PUBLIC_ROBOFLOW_API_KEY;
    
    if (!apiKey) {
      Alert.alert('Error', 'Roboflow API key is not configured. Please add NEXT_PUBLIC_ROBOFLOW_API_KEY to your environment variables.');
      return;
    }

    setLoading(true);

    try {
      // Support both data URL base64 strings and remote URLs
      const isDataUrlBase64 = typeof selectedImage === 'string' && selectedImage.startsWith('data:image');
      const imageInput = isDataUrlBase64
        ? {
            type: 'base64' as const,
            value: (selectedImage.split(',')[1] ?? selectedImage), // strip data URL prefix if present
          }
        : {
            type: 'url' as const,
            value: selectedImage,
          };

      const response = await fetch(
        'https://serverless.roboflow.com/diabetesapp/workflows/detect-count-and-visualize',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            inputs: {
              image: imageInput,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to process image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Normalize for viewer rendering
      try {
        const normalizedPayload = normalizeForViewer(data, selectedImage);
        setNormalized(normalizedPayload);
      } catch (error) {
        console.error('Failed to normalize data for viewer:', error);
        setNormalized(null);
      }
      
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process image');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Convert API response to DetectionsPayload used by DetectionsViewer
  const normalizeForViewer = (apiResult: Record<string, unknown>, selectedImageDataUrl: string | null): DetectionsPayload | null => {
    // Type-safe property access using type assertions
    const result = apiResult as Record<string, unknown>;
    
    // Prefer annotated base64 if provided; else use original selected image
    const output = result.output as Record<string, unknown> | undefined;
    const outputImage = output?.image as Record<string, unknown> | undefined;
    const base64FromApi = outputImage?.base64 as string | undefined
      || outputImage?.value as string | undefined
      || (result.output_image as Record<string, unknown> | undefined)?.value as string | undefined;
    
    const base64FromSelected = (selectedImageDataUrl && selectedImageDataUrl.startsWith('data:image'))
      ? selectedImageDataUrl.split(',')[1]
      : null;
    const base64 = base64FromApi || base64FromSelected;
    if (!base64) return null;

    // Extract predictions array from common shapes
    const predictions = result.predictions as unknown[] | undefined;
    const outputJson = output?.json as Record<string, unknown> | undefined;
    const outputPredictions = output?.predictions as Record<string, unknown> | undefined;
    const outputs = result.outputs as Record<string, unknown>[] | undefined;
    const firstOutput = outputs?.[0] as Record<string, unknown> | undefined;
    const firstOutputPredictions = firstOutput?.predictions as Record<string, unknown> | undefined;
    
    const preds = Array.isArray(predictions)
      ? predictions
      : Array.isArray(outputJson?.predictions)
      ? outputJson.predictions as unknown[]
      : Array.isArray(outputPredictions?.predictions)
      ? outputPredictions.predictions as unknown[]
      : Array.isArray(firstOutputPredictions?.predictions)
      ? firstOutputPredictions.predictions as unknown[]
      : [];

    // Image dimensions if present
    const imgMeta = (outputJson?.image as Record<string, unknown> | undefined)
      || ((result.predictions as Record<string, unknown> | undefined)?.image as Record<string, unknown> | undefined)
      || (outputPredictions?.image as Record<string, unknown> | undefined)
      || (firstOutputPredictions?.image as Record<string, unknown> | undefined)
      || {};

    const width = typeof imgMeta.width === 'number' ? imgMeta.width : 0;
    const height = typeof imgMeta.height === 'number' ? imgMeta.height : 0;

    const count = typeof apiResult?.count_objects === 'number'
      ? apiResult.count_objects
      : (Array.isArray(preds) ? preds.length : 0);

    const payload: DetectionsPayload = {
      outputs: [
        {
          count_objects: count,
          output_image: { type: 'base64', value: base64 },
          predictions: {
            image: { width, height },
            predictions: (preds || []) as Prediction[],
          },
        },
      ],
      profiler_trace: [],
    };

    return payload;
  };

  // Reset everything
  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setNormalized(null);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={[styles.button, styles.captureButton]}
                onPress={capturePhoto}
              >
                <Text style={styles.buttonText}>Capture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DiabetesCare AI</Text>
        <Text style={styles.subtitle}>AI-Powered Detection Assistant</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Select or capture an image</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!result && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={handleImagePicker}
            >
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={startCamera}
            >
              <Text style={[styles.buttonText, styles.cameraButtonText]}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Detect and Reset Buttons */}
        {selectedImage && !result && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.detectButton]}
              onPress={handleDetect}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>Detecting...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Detect</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Display */}
        {result && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Detection Complete</Text>
            
            {/* Visualization with annotations */}
            {result.visualization && (
              <View style={styles.imageResultContainer}>
                <Image
                  source={{ uri: result.visualization }}
                  style={styles.resultImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Alternative image display */}
            {(!result.visualization && (result.output?.image?.base64 || result.output?.image?.value || result.output?.image?.url)) && (
              <View style={styles.imageResultContainer}>
                <Image
                  source={{
                    uri: result.output?.image?.base64
                      ? `data:${result.output.image.mime || 'image/jpeg'};base64,${result.output.image.base64}`
                      : result.output?.image?.value
                      ? `data:${result.output.image.mime || 'image/jpeg'};base64,${result.output.image.value}`
                      : (result.output?.image?.url as string)
                  }}
                  style={styles.resultImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Predictions Display */}
            {result.predictions && Object.keys(result.predictions).length > 0 && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Predictions</Text>
                <ScrollView style={styles.predictionsScroll} nestedScrollEnabled>
                  {Object.entries(result.predictions).map(([key, value]) => (
                    <View key={key} style={styles.predictionItem}>
                      <Text style={styles.predictionKey}>{key}:</Text>
                      <Text style={styles.predictionValue}>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* JSON Output Data */}
            {result.output?.json && Object.keys(result.output.json).length > 0 && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Detection Data</Text>
                <ScrollView style={styles.predictionsScroll} nestedScrollEnabled>
                  {Object.entries(result.output.json).map(([key, value]) => (
                    <View key={key} style={styles.predictionItem}>
                      <Text style={styles.predictionKey}>{key}</Text>
                      <Text style={styles.predictionValue}>
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Full Response Display */}
            {!result.predictions && !result.output?.json && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Full Response</Text>
                <ScrollView style={styles.predictionsScroll} nestedScrollEnabled>
                  <Text style={styles.predictionValue}>
                    {JSON.stringify(result, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.detectButton]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Detect Another Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        {!selectedImage && !result && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              • Upload an image from your gallery{'\n'}
              • Or take a photo with your camera{'\n'}
              • AI analyzes and detects patterns{'\n'}
              • Get detailed results instantly
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          DiabetesCare © 2025 • Built by Mirror Photos LLC
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
  },
  mainContent: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 12,
    padding: 20,
  },
  imageContainer: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 250,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.white,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  galleryButton: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  cameraButton: {
    backgroundColor: '#facc15', // yellow
    borderWidth: 1,
    borderColor: Colors.black,
  },
  cameraButtonText: {
    color: Colors.black,
  },
  detectButton: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  resetButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  resetButtonText: {
    color: Colors.black,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  imageResultContainer: {
    borderWidth: 2,
    borderColor: Colors.black,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 250,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultCard: {
    backgroundColor: '#fef3c7', // yellow-100
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  predictionsScroll: {
    maxHeight: 200,
  },
  predictionItem: {
    backgroundColor: '#fef3c7', // yellow-100
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  predictionKey: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  cameraButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  captureButton: {
    backgroundColor: '#ef4444', // red
    borderWidth: 1,
    borderColor: Colors.black,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.black,
  },
});
