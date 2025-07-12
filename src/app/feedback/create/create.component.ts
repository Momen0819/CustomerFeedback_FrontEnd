import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CreateFeedbackTypeDto } from '../../models/feedback.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NavbarComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateFeedbackComponent implements OnInit {
  createForm: FormGroup;
  isLoading = false;
  currentLanguage: string = 'en';

  constructor(
    public languageService: LanguageService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      nameEn: ['', [Validators.required, Validators.maxLength(100)]],
      nameAr: ['', [Validators.required, Validators.maxLength(100)]],
      descriptionEn: ['', [Validators.maxLength(500)]],
      descriptionAr: ['', [Validators.maxLength(500)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.currentLanguage = this.languageService.currentLang;
  }

  getErrorMessage(controlName: string): string {
    const control = this.createForm.get(controlName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return this.getRequiredMessage(controlName);
      }
      if (control.errors['maxlength']) {
        return this.getMaxLengthMessage(controlName);
      }
    }
    return '';
  }

  getRequiredMessage(controlName: string): string {
    const messages = {
      nameEn: this.currentLanguage === 'ar' ? 'الاسم بالإنجليزية مطلوب' : 'English name is required',
      nameAr: this.currentLanguage === 'ar' ? 'الاسم بالعربية مطلوب' : 'Arabic name is required',
      startDate: this.currentLanguage === 'ar' ? 'تاريخ البداية مطلوب' : 'Start date is required',
      endDate: this.currentLanguage === 'ar' ? 'تاريخ الانتهاء مطلوب' : 'End date is required'
    };
    return messages[controlName as keyof typeof messages] || '';
  }

  getMaxLengthMessage(controlName: string): string {
    const messages = {
      nameEn: this.currentLanguage === 'ar' ? 'الاسم بالإنجليزية يجب أن يكون 100 حرف كحد أقصى' : 'English name must be at most 100 characters',
      nameAr: this.currentLanguage === 'ar' ? 'الاسم بالعربية يجب أن يكون 100 حرف كحد أقصى' : 'Arabic name must be at most 100 characters',
      descriptionEn: this.currentLanguage === 'ar' ? 'الوصف بالإنجليزية يجب أن يكون 500 حرف كحد أقصى' : 'English description must be at most 500 characters',
      descriptionAr: this.currentLanguage === 'ar' ? 'الوصف بالعربية يجب أن يكون 500 حرف كحد أقصى' : 'Arabic description must be at most 500 characters'
    };
    return messages[controlName as keyof typeof messages] || '';
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.showError(this.currentLanguage === 'ar' ? 'يرجى إصلاح الأخطاء في النموذج' : 'Please fix the errors in the form');
      return;
    }

    const startDate = new Date(this.createForm.value.startDate);
    const endDate = new Date(this.createForm.value.endDate);

    if (endDate <= startDate) {
      this.showError(this.currentLanguage === 'ar' ? 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date');
      return;
    }

    this.isLoading = true;

    const feedbackType: CreateFeedbackTypeDto = {
      nameEn: this.createForm.value.nameEn,
      nameAr: this.createForm.value.nameAr,
      descriptionEn: this.createForm.value.descriptionEn || undefined,
      descriptionAr: this.createForm.value.descriptionAr || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    this.apiService.createFeedbackType(feedbackType).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess();
          this.router.navigate(['/feedback']);
        } else {
          this.showError(response.message || 'Failed to create feedback type');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating feedback type:', error);
        this.showError('Failed to create feedback type');
        this.isLoading = false;
      }
    });
  }

  showError(message: string): void {
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

  showSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: this.currentLanguage === 'ar' ? 'تم الإنشاء بنجاح' : 'Created Successfully',
      text: this.currentLanguage === 'ar' ? 'تم إنشاء نوع الملاحظة بنجاح' : 'Feedback type created successfully',
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/feedback']);
  }
}
