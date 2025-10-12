import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface SugiMessageProps {
  message: string;
}

export const SugiMessage: React.FC<SugiMessageProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  bubble: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
