import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { TakePhotoScreen } from '../screens/TakePhotoScreen';
import { ComparePhotosScreen } from '../screens/ComparePhotosScreen';
import { SensationTestScreen } from '../screens/SensationTestScreen';
import { SensationResultsScreen } from '../screens/SensationResultsScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="TakePhoto" component={TakePhotoScreen} />
        <Stack.Screen name="ComparePhotos" component={ComparePhotosScreen} />
        <Stack.Screen name="SensationTest" component={SensationTestScreen} />
        <Stack.Screen name="SensationResults" component={SensationResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
