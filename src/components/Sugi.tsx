import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface SugiProps {
  size?: number;
  animated?: boolean;
}

export const Sugi: React.FC<SugiProps> = ({ size = 120, animated = true }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Gentle bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Gentle scale pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {/* Droplet body */}
      <View style={[styles.droplet, { width: size, height: size }]}>
        {/* Shine effect */}
        <View style={[styles.shine, { width: size * 0.3, height: size * 0.3 }]} />

        {/* Eyes */}
        <View style={styles.eyes}>
          <View style={[styles.eye, { width: size * 0.12, height: size * 0.12 }]} />
          <View style={[styles.eye, { width: size * 0.12, height: size * 0.12 }]} />
        </View>

        {/* Smile */}
        <View style={[styles.smile, { width: size * 0.35, height: size * 0.18 }]} />

        {/* Nurse cap */}
        <View style={[styles.cap, { width: size * 0.5, height: size * 0.15, top: size * 0.05 }]}>
          <View style={[styles.cross, { width: size * 0.08, height: size * 0.08 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  droplet: {
    backgroundColor: Colors.turquoise,
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
    borderBottomLeftRadius: 1000,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  shine: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1000,
    transform: [{ rotate: '-45deg' }],
  },
  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '45%',
    position: 'absolute',
    top: '42%',
    transform: [{ rotate: '-45deg' }],
  },
  eye: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 1000,
  },
  smile: {
    position: 'absolute',
    top: '58%',
    borderBottomWidth: 3,
    borderBottomColor: Colors.textPrimary,
    borderRadius: 1000,
    transform: [{ rotate: '-45deg' }],
  },
  cap: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-45deg' }],
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cross: {
    position: 'relative',
  },
});
