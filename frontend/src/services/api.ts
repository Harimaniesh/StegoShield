import axios from 'axios';
import {
  EmbedResponse,
  ExtractResponse,
  SteganalysisResponse,
  ComparisonResponse,
  MetadataResponse,
  HistoryItem,
  DashboardStats,
  ImageCapacityResponse
} from '../types/stego';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const checkCapacityApi = async (file: File): Promise<ImageCapacityResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post<ImageCapacityResponse>('/steganography/capacity', formData);
  return response.data;
};

export const embedPayloadApi = async (
  coverImage: File,
  password: string,
  secretText?: string,
  secretFile?: File
): Promise<EmbedResponse> => {
  const formData = new FormData();
  formData.append('cover_image', coverImage);
  formData.append('password', password);
  if (secretText) {
    formData.append('secret_text', secretText);
  }
  if (secretFile) {
    formData.append('secret_file', secretFile);
  }
  const response = await api.post<EmbedResponse>('/steganography/embed', formData);
  return response.data;
};

export const extractPayloadApi = async (
  stegoImage: File,
  password: string
): Promise<ExtractResponse> => {
  const formData = new FormData();
  formData.append('stego_image', stegoImage);
  formData.append('password', password);
  const response = await api.post<ExtractResponse>('/steganography/extract', formData);
  return response.data;
};

export const steganalyzeApi = async (file: File): Promise<SteganalysisResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post<SteganalysisResponse>('/analysis/steganalyze', formData);
  return response.data;
};

export const compareImagesApi = async (
  originalImage: File,
  stegoImage: File
): Promise<ComparisonResponse> => {
  const formData = new FormData();
  formData.append('original_image', originalImage);
  formData.append('stego_image', stegoImage);
  const response = await api.post<ComparisonResponse>('/analysis/compare', formData);
  return response.data;
};

export const extractMetadataApi = async (file: File): Promise<MetadataResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post<MetadataResponse>('/analysis/metadata', formData);
  return response.data;
};

export const getHistoryApi = async (action?: string): Promise<HistoryItem[]> => {
  const response = await api.get<HistoryItem[]>('/history', {
    params: { action }
  });
  return response.data;
};

export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getHealthApi = async () => {
  const response = await api.get('/health');
  return response.data;
};
