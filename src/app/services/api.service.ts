import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { LoginData, LoginRequest } from '../models/auth.model';
import { ApiResponse } from '../models/api.model';
import { FeedbackTypeResponse, CreateFeedbackTypeDto, CreateFeedbackTypeResponse, FeedbackTypeDto, FeedbackTypeDetailDto, EditFeedbackTypeDto, EditFeedbackTypeResponse, FeedbackDto, FeedbackRatingsResponse, PublicFeedbackTypeDto, CreateFeedbackDto, CreateFeedbackResponse, FeedbackStatisticsResponse } from '../models/feedback.model';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7149/api';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': this.getCurrentLanguage(),
    })
  };

  constructor(private http: HttpClient, private languageService: LanguageService) {}

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get current language from localStorage or language service
  private getCurrentLanguage(): string {
    return localStorage.getItem('lang') || 'en';
  }

  // Create headers with authentication
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': this.getCurrentLanguage(),
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Create headers for public API (no authentication)
  private getPublicHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': this.getCurrentLanguage()
    });
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  // Login API
  login(credentials: LoginRequest): Observable<ApiResponse<LoginData>> {
    const url = `${this.baseUrl}/auth/login`;
    return this.http.post<ApiResponse<LoginData>>(url, credentials, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Get Feedback Types API
  getFeedbackTypes(): Observable<FeedbackTypeResponse> {
    const url = `${this.baseUrl}/FeedbackType`;
    return this.http.get<FeedbackTypeResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Create Feedback Type API
  createFeedbackType(feedbackType: CreateFeedbackTypeDto): Observable<CreateFeedbackTypeResponse> {
    const url = `${this.baseUrl}/FeedbackType/Create`;
    return this.http.post<CreateFeedbackTypeResponse>(url, feedbackType, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Get Feedback Type Details for Edit API
  getFeedbackTypeForEdit(id: string): Observable<ApiResponse<FeedbackTypeDetailDto>> {
    const url = `${this.baseUrl}/FeedbackType/${id}`;
    return this.http.get<ApiResponse<FeedbackTypeDetailDto>>(url, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Edit Feedback Type API
  editFeedbackType(feedbackType: EditFeedbackTypeDto): Observable<EditFeedbackTypeResponse> {
    const url = `${this.baseUrl}/FeedbackType/Edit`;
    return this.http.put<EditFeedbackTypeResponse>(url, feedbackType, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Delete Feedback Type API
  deleteFeedbackType(id: string): Observable<ApiResponse<string>> {
    const url = `${this.baseUrl}/FeedbackType/Delete/${id}`;
    return this.http.delete<ApiResponse<string>>(url, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Get Feedback Ratings API
  getFeedbackRatings(id: string): Observable<FeedbackRatingsResponse> {
    const url = `${this.baseUrl}/FeedbackType/GetRatings/${id}`;
    return this.http.get<FeedbackRatingsResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Public API - Get Feedback Type
  getPublicFeedbackType(id: string): Observable<ApiResponse<PublicFeedbackTypeDto>> {
    const url = `${this.baseUrl}/Public/GetFeedbackType/${id}`;
    return this.http.get<ApiResponse<PublicFeedbackTypeDto>>(url, { headers: this.getPublicHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Public API - Create Feedback
  createPublicFeedback(feedback: CreateFeedbackDto): Observable<CreateFeedbackResponse> {
    const url = `${this.baseUrl}/Public/CreateFeedback`;
    return this.http.post<CreateFeedbackResponse>(url, feedback, { headers: this.getPublicHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Get Feedback Statistics API
  getFeedbackStatistics(): Observable<FeedbackStatisticsResponse> {
    const url = `${this.baseUrl}/Statistics/Get`;
    return this.http.get<FeedbackStatisticsResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }


  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  clearAuthToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return token !== null && token.length > 0;
  }
}
