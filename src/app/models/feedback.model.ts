import { ApiResponse } from './api.model';

export interface FeedbackTypeDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface FeedbackTypeResponse extends ApiResponse<FeedbackTypeDto[]> {}

export interface CreateFeedbackTypeDto {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
}

export interface CreateFeedbackTypeResponse extends ApiResponse<string> {}

export interface FeedbackTypeDetailDto {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
}

export interface EditFeedbackTypeDto {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
}

export interface EditFeedbackTypeResponse extends ApiResponse<string> {}

export interface FeedbackDto {
  fullName: string;
  email: string;
  comment: string;
  stars: number;
  createdDate: string;
}

export interface FeedbackRatingsResponse extends ApiResponse<FeedbackDto[]> {}

export interface PublicFeedbackTypeDto {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
}

export interface CreateFeedbackDto {
  feedbackTypeId: string;
  fullName: string;
  email: string;
  comment: string;
  stars: number;
}

export interface CreateFeedbackResponse extends ApiResponse<string> {}

export interface FeedbackStatisticsDto {
  feedbackTypeId: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  totalFeedbacks: number;
  averageRating: number;
}

export interface FeedbackStatisticsResponse {
  success: boolean;
  message: string;
  data: FeedbackStatisticsDto[];
}
