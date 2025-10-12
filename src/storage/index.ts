import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoSession, SensationSession } from '../types';

const PHOTO_SESSIONS_KEY = '@sugarless_photo_sessions';
const SENSATION_SESSIONS_KEY = '@sugarless_sensation_sessions';

// Photo Session Storage
export const savePhotoSession = async (session: PhotoSession): Promise<void> => {
  try {
    const existingSessions = await getPhotoSessions();
    const updatedSessions = [...existingSessions, session];
    await AsyncStorage.setItem(PHOTO_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving photo session:', error);
    throw error;
  }
};

export const getPhotoSessions = async (): Promise<PhotoSession[]> => {
  try {
    const sessions = await AsyncStorage.getItem(PHOTO_SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting photo sessions:', error);
    return [];
  }
};

export const getLatestPhotoSession = async (): Promise<PhotoSession | null> => {
  try {
    const sessions = await getPhotoSessions();
    if (sessions.length === 0) return null;
    return sessions.sort((a, b) => b.timestamp - a.timestamp)[0];
  } catch (error) {
    console.error('Error getting latest photo session:', error);
    return null;
  }
};

export const getPhotoSessionsByFootSide = async (footSide: 'left' | 'right'): Promise<PhotoSession[]> => {
  try {
    const sessions = await getPhotoSessions();
    return sessions.filter(session => session.footSide === footSide)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error getting photo sessions by foot side:', error);
    return [];
  }
};

// Sensation Session Storage
export const saveSensationSession = async (session: SensationSession): Promise<void> => {
  try {
    const existingSessions = await getSensationSessions();
    const updatedSessions = [...existingSessions, session];
    await AsyncStorage.setItem(SENSATION_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving sensation session:', error);
    throw error;
  }
};

export const getSensationSessions = async (): Promise<SensationSession[]> => {
  try {
    const sessions = await AsyncStorage.getItem(SENSATION_SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting sensation sessions:', error);
    return [];
  }
};

export const getLatestSensationSession = async (): Promise<SensationSession | null> => {
  try {
    const sessions = await getSensationSessions();
    if (sessions.length === 0) return null;
    return sessions.sort((a, b) => b.date - a.date)[0];
  } catch (error) {
    console.error('Error getting latest sensation session:', error);
    return null;
  }
};

// Clear all data (for testing/debugging)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([PHOTO_SESSIONS_KEY, SENSATION_SESSIONS_KEY]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
