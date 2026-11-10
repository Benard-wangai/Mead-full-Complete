// src/components/ErrorBoundary.tsx
// Global Error Boundary for Mead - The Global Luxury Super App
// Catches JavaScript errors in the component tree and displays a beautiful fallback UI

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as themeColors } from '../utils/theme';
import { meadLogger } from '../utils/logger';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    meadLogger.error('Unhandled error caught by ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { backgroundColor: themeColors.black }]}>
          <View style={styles.content}>
            <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />

            <Text style={[styles.title, { color: '#FFFFFF' }]}>
              Something went wrong
            </Text>

            <Text style={[styles.subtitle, { color: '#CCCCCC' }]}>
              Mead encountered an unexpected error. Don`t worry, this has been logged.
            </Text>

            {this.state.error && (
              <ScrollView style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
              </ScrollView>
            )}

            <Button
              title="Restart App"
              onPress={this.handleRestart}
              style={styles.restartButton}
            />

            <Text style={[styles.footerText, { color: '#666' }]}>
              If the problem persists, please restart the app completely.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    maxHeight: 180,
    width: '100%',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  restartButton: {
    backgroundColor: '#FFD700',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

export default ErrorBoundary;