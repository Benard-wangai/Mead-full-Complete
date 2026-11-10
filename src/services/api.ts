// Central API Service for Mead - Supabase auth, REST API, offline queue

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { getEnv } from '../utils/env';
import { meadLogger } from '../utils/logger';
import { meadStorage } from '../utils/storage';
import { addToOfflineQueue } from '../utils/offline';
import { supabase } from '../utils/supabaseClient';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  ensureUserProfile,
  toE164Phone,
} from './authService';

class ApiService {
  private static instance: ApiService | null = null;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: String(getEnv('API_BASE_URL')) || 'https://api.meadtechnologies.com',
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async sendOTP(phone: string, countryCode: string): Promise<string> {
    return sendPhoneOtp(phone, countryCode, { shouldCreateUser: true });
  }

  async verifyOTP(
    phone: string,
    otp: string,
    countryCode: string,
    profile?: { fullName?: string; language?: string }
  ): Promise<{ userId?: string }> {
    const fullPhone = toE164Phone(phone, countryCode);
    const { userId } = await verifyPhoneOtp(fullPhone, otp);
    await ensureUserProfile({
      userId,
      phone: fullPhone,
      fullName: profile?.fullName,
      language: profile?.language,
    });
    return { userId };
  }

  async createBrew(payload: {
    content: string;
    mediaUrl: string | undefined;
    targetType: 'worldwide' | 'countries' | 'regions';
    targets: string[];
    isPaid: boolean;
  }) {
    return this.post('/brews', payload);
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          let token: string | null = await meadStorage.getToken();

          if (!token) {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            token = session?.access_token || null;
          }

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          meadLogger.warn('Failed to attach auth token to request');
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (!error.response) {
          meadLogger.warn('Network offline - queuing API request', {
            url: originalRequest?.url || 'unknown',
            method: originalRequest?.method || 'unknown',
          });

          await addToOfflineQueue('api_request', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            data: originalRequest?.data,
            headers: originalRequest?.headers,
          });

          return Promise.reject(
            new Error('No internet connection. Request queued for later sync.')
          );
        }

        const status = error.response?.status || 500;
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          'An unknown error occurred';

        if (status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;
          try {
            const {
              data: { session },
            } = await supabase.auth.refreshSession();
            if (session?.access_token) {
              await meadStorage.saveToken(session.access_token);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
              }
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            meadLogger.error('Token refresh failed', refreshError);
            await supabase.auth.signOut();
          }
        }

        meadLogger.error('API request failed', {
          status,
          url: originalRequest?.url,
          message: errorMessage,
        });

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  async uploadFile<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadToSupabaseStorage(bucket: string, filePath: string, file: File | Blob) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;
    return data;
  }

  getSupabasePublicUrl(bucket: string, filePath: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = ApiService.getInstance();
