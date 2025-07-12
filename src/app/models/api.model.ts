// Generic API Response interface for all endpoints
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

