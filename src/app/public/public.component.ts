import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ApiService } from '../services/api.service';
import { PublicFeedbackTypeDto, CreateFeedbackDto } from '../models/feedback.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  feedbackForm!: FormGroup;
  feedbackType: PublicFeedbackTypeDto | null = null;
  isLoading = false;
  isSubmitting = false;
  currentLanguage: string = 'en';
  feedbackTypeId: string = '';
  hasSubmitted = false;

  constructor(
    public languageService: LanguageService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.currentLanguage = this.languageService.currentLang;
    this.initForm();
    this.loadFeedbackType();
  }

  switchLanguage(): void {
    this.languageService.switchLanguage();
    this.currentLanguage = this.languageService.currentLang;
  }

  initForm(): void {
    this.feedbackForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      stars: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  loadFeedbackType(): void {
    this.feedbackTypeId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.feedbackTypeId) {
      this.showError('Invalid feedback type ID');
      return;
    }

    // Check if user has already submitted feedback for this type
    this.checkSubmissionStatus();

    this.isLoading = true;
    this.apiService.getPublicFeedbackType(this.feedbackTypeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.feedbackType = response.data;
          this.isLoading = false;
        } else {
          this.showError(response.message || 'Failed to load feedback type');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading feedback type:', error);
        this.showError('Failed to load feedback type');
        this.isLoading = false;
      }
    });
  }

  checkSubmissionStatus(): void {
    const submittedFeedback = this.getSubmittedFeedback();
    this.hasSubmitted = submittedFeedback.includes(this.feedbackTypeId);
  }

  getSubmittedFeedback(): string[] {
    const stored = localStorage.getItem('submittedFeedback');
    return stored ? JSON.parse(stored) : [];
  }

  addToSubmittedFeedback(): void {
    const submittedFeedback = this.getSubmittedFeedback();
    if (!submittedFeedback.includes(this.feedbackTypeId)) {
      submittedFeedback.push(this.feedbackTypeId);
      localStorage.setItem('submittedFeedback', JSON.stringify(submittedFeedback));
    }
  }

  showError(message: string): void {
    // For public component, we'll use a simple alert instead of SweetAlert
    Swal.fire({
      icon: 'error',
      title: this.currentLanguage === 'ar' ? 'خطأ' : 'Error',
      text: message,
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(this.currentLanguage === 'ar' ? 'ar' : 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isActive(startDate: string, endDate: string): boolean {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  }

  getStatusClass(startDate: string, endDate: string): string {
    return this.isActive(startDate, endDate) ? 'active' : 'inactive';
  }

  getStatusText(startDate: string, endDate: string): string {
    return this.isActive(startDate, endDate)
      ? (this.currentLanguage === 'ar' ? 'نشط' : 'Active')
      : (this.currentLanguage === 'ar' ? 'غير نشط' : 'Inactive');
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.showFormErrors();
      return;
    }

    if (this.hasSubmitted) {
      this.showAlreadySubmittedMessage();
      return;
    }

    this.isSubmitting = true;
    const formData = this.feedbackForm.value;

    const feedbackData: CreateFeedbackDto = {
      feedbackTypeId: this.feedbackTypeId,
      fullName: formData.fullName,
      email: formData.email,
      comment: formData.comment,
      stars: formData.stars
    };

    this.apiService.createPublicFeedback(feedbackData).subscribe({
      next: (response) => {
        if (response.success) {
          this.addToSubmittedFeedback();
          this.hasSubmitted = true;
          this.showSuccess();
          this.feedbackForm.reset();
        } else {
          // Handle specific API error messages
          this.showApiError(response.message || 'Failed to submit feedback');
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        // Extract error message from HttpErrorResponse
        let errorMessage = 'Failed to submit feedback';

        if (error.error && typeof error.error === 'object' && error.error.message) {
          // Backend error response with message field
          errorMessage = error.error.message;
        } else if (error.message) {
          // Generic error message
          errorMessage = error.message;
        }

        this.showApiError(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  showAlreadySubmittedMessage(): void {
    const message = this.currentLanguage === 'ar'
      ? 'لقد قمت بالفعل بإرسال ملاحظتك لهذا النوع من التقييم. شكراً لك!'
      : 'You have already submitted feedback for this type. Thank you!';
    Swal.fire({
      icon: 'info',
      title: this.currentLanguage === 'ar' ? 'تم الإرسال مسبقاً' : 'Already Submitted',
      text: message,
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  showFormErrors(): void {
    const errors: string[] = [];

    if (this.feedbackForm.get('fullName')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required');
    }
    if (this.feedbackForm.get('fullName')?.hasError('minlength')) {
      errors.push(this.currentLanguage === 'ar' ? 'الاسم الكامل يجب أن يكون حرفين على الأقل' : 'Full name must be at least 2 characters');
    }
    if (this.feedbackForm.get('email')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
    }
    if (this.feedbackForm.get('email')?.hasError('email')) {
      errors.push(this.currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Please enter a valid email');
    }
    if (this.feedbackForm.get('comment')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'التعليق مطلوب' : 'Comment is required');
    }
    if (this.feedbackForm.get('comment')?.hasError('minlength')) {
      errors.push(this.currentLanguage === 'ar' ? 'التعليق يجب أن يكون 10 أحرف على الأقل' : 'Comment must be at least 10 characters');
    }
    if (this.feedbackForm.get('stars')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'التقييم مطلوب' : 'Rating is required');
    }
    if (this.feedbackForm.get('stars')?.hasError('min')) {
      errors.push(this.currentLanguage === 'ar' ? 'يجب اختيار تقييم من 1 إلى 5' : 'Please select a rating from 1 to 5');
    }

    Swal.fire({
      icon: 'error',
      title: this.currentLanguage === 'ar' ? 'خطأ في التحقق' : 'Validation Error',
      text: errors.join('\n'),
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  showSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: this.currentLanguage === 'ar' ? 'نجح' : 'Success',
      text: this.currentLanguage === 'ar' ? 'تم إرسال ملاحظتك بنجاح! شكراً لك' : 'Your feedback has been submitted successfully! Thank you',
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  showApiError(message: string): void {
    // Show the exact backend error message
    Swal.fire({
      icon: 'error',
      title: this.currentLanguage === 'ar' ? 'خطأ' : 'Error',
      text: message,
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.feedbackForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.hasError('required')) {
        return this.currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
      if (field.hasError('minlength')) {
        return this.currentLanguage === 'ar' ? 'يجب أن يكون حرفين على الأقل' : 'Must be at least 2 characters';
      }
      if (field.hasError('email')) {
        return this.currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Please enter a valid email';
      }
      if (field.hasError('min')) {
        return this.currentLanguage === 'ar' ? 'يجب اختيار تقييم من 1 إلى 5' : 'Please select a rating from 1 to 5';
      }
    }
    return '';
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  selectRating(rating: number): void {
    this.feedbackForm.patchValue({ stars: rating });
  }
}
