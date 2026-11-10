// src/components/Toast.tsx
// Global Toast System for Mead with Context + Hook

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/theme';

// eslint-disable-next-line no-unused-vars
const { width } = Dimensions.get('window');

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  // eslint-disable-next-line no-unused-vars
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Component (the visual notification)
const ToastNotification: React.FC<{
  toast: ToastMessage | null;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  useTheme();
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(onClose, toast.duration || 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const getIcon = () => {
    if (toast.type === 'success') return <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />;
    if (toast.type === 'error') return <Ionicons name="close-circle" size={28} color="#FF3B30" />;
    return <Ionicons name="information-circle" size={28} color="#FFD700" />;
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ translateY }],
        opacity,
        backgroundColor: toast.type === 'success' ? '#1A3C2A' : toast.type === 'error' ? '#3C1A1A' : '#1A1A1A',
        borderColor: toast.type === 'success' ? '#4CAF50' : toast.type === 'error' ? '#FF3B30' : '#FFD700',
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <Text style={styles.message} numberOfLines={3}>{toast.message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Toast Provider
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type,
      duration,
    };
    setToast(newToast);
  };

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastNotification toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: { marginRight: 14 },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  closeButton: { padding: 4, marginLeft: 8 },
});

export default ToastNotification;