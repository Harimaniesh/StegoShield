export interface ImageCapacityResponse {
  dimensions: string;
  width: number;
  height: number;
  format: string;
  file_size_bytes: number;
  sha256_hash: string;
  max_payload_bytes: number;
  channels: number;
}

export interface EmbedResponse {
  success: boolean;
  stego_image_url: string;
  stego_filename: string;
  original_dimensions: string;
  format: string;
  original_file_size: number;
  stego_file_size: number;
  max_capacity_bytes: number;
  payload_size_bytes: number;
  encryption_status: string;
  sha256_hash: string;
}

export interface ExtractResponse {
  success: boolean;
  payload_type: 'text' | 'file';
  filename?: string;
  file_extension?: string;
  recovered_text?: string;
  file_download_url?: string;
  payload_size_bytes: number;
  sha256_hash: string;
}

export interface ChannelStats {
  mean: number;
  std_dev: number;
  min: number;
  max: number;
  entropy: number;
  variance: number;
  lsb_ratio: number;
}

export interface SteganalysisResponse {
  filename: string;
  dimensions: string;
  width: number;
  height: number;
  channels: number;
  file_size_bytes: number;
  sha256_hash: string;
  overall_entropy: number;
  channel_stats: Record<string, ChannelStats>;
  lsb_distribution: Record<string, number>;
  chi_square_p_value: number;
  pixel_variance: number;
  noise_level: number;
  stego_indicators: string[];
  risk_score: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_value: number;
  disclaimer: string;
}

export interface ComparisonResponse {
  dimensions_match: boolean;
  original_dimensions: string;
  stego_dimensions: string;
  mean_absolute_error: number;
  peak_signal_noise_ratio: number;
  changed_pixels_count: number;
  changed_pixels_percentage: number;
  original_file_size: number;
  stego_file_size: number;
  file_size_diff_bytes: number;
  diff_map_url: string;
}

export interface MetadataResponse {
  filename: string;
  format: string;
  mode: string;
  dimensions: string;
  width: number;
  height: number;
  file_size_bytes: number;
  has_exif: boolean;
  exif_data: Record<string, any>;
  camera_make?: string;
  camera_model?: string;
  software?: string;
  date_time?: string;
  color_profile?: string;
}

export interface HistoryItem {
  id: string;
  action_type: 'EMBED' | 'EXTRACT' | 'STEGANALYZE' | 'COMPARE';
  filename: string;
  file_size_bytes: number;
  image_format: string;
  image_dimensions: string;
  sha256_hash: string;
  risk_score?: string;
  risk_value?: number;
  payload_size_bytes?: number;
  created_at: string;
}

export interface DashboardStats {
  images_analyzed: number;
  messages_embedded: number;
  payloads_extracted: number;
  suspicious_images: number;
  average_risk_score: number;
  average_risk_rating: string;
  recent_activity: HistoryItem[];
  risk_distribution: Record<string, number>;
}
