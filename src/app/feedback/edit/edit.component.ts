import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FeedbackTypeDetailDto, EditFeedbackTypeDto } from '../../models/feedback.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NavbarComponent],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditFeedbackComponent implements OnInit {
  editForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  currentLanguage: string = 'en';
  feedbackTypeId: string = '';

  constructor(
    public languageService: LanguageService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.currentLanguage = this.languageService.currentLang;
    this.initForm();
    this.loadFeedbackType();
  }

  initForm(): void {
    this.editForm = this.formBuilder.group({
      nameEn: ['', [Validators.required, Validators.minLength(3)]],
      nameAr: ['', [Validators.required, Validators.minLength(3)]],
      descriptionEn: [''],
      descriptionAr: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return { invalidDateRange: true };
      }
    }

    return null;
  }

  loadFeedbackType(): void {
    this.feedbackTypeId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.feedbackTypeId) {
      this.showError('Invalid feedback type ID');
      this.router.navigate(['/feedback']);
      return;
    }

    this.isLoading = true;
    this.apiService.getFeedbackTypeForEdit(this.feedbackTypeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.populateForm(response.data);
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

  populateForm(data: FeedbackTypeDetailDto): void {
    this.editForm.patchValue({
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      descriptionEn: data.descriptionEn || '',
      descriptionAr: data.descriptionAr || '',
      startDate: this.formatDateForInput(data.startDate),
      endDate: this.formatDateForInput(data.endDate)
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.showFormErrors();
      return;
    }

    this.isSubmitting = true;
    const formData = this.editForm.value;

    const editData: EditFeedbackTypeDto = {
      id: this.feedbackTypeId,
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      descriptionEn: formData.descriptionEn || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    };

    this.apiService.editFeedbackType(editData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess();
          this.router.navigate(['/feedback']);
        } else {
          this.showError(response.message || 'Failed to update feedback type');
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error updating feedback type:', error);
        this.showError('Failed to update feedback type');
        this.isSubmitting = false;
      }
    });
  }

  showFormErrors(): void {
    const errors: string[] = [];

    if (this.editForm.get('nameEn')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'الاسم بالإنجليزية مطلوب' : 'English name is required');
    }
    if (this.editForm.get('nameEn')?.hasError('minlength')) {
      errors.push(this.currentLanguage === 'ar' ? 'الاسم بالإنجليزية يجب أن يكون 3 أحرف على الأقل' : 'English name must be at least 3 characters');
    }
    if (this.editForm.get('nameAr')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'الاسم بالعربية مطلوب' : 'Arabic name is required');
    }
    if (this.editForm.get('nameAr')?.hasError('minlength')) {
      errors.push(this.currentLanguage === 'ar' ? 'الاسم بالعربية يجب أن يكون 3 أحرف على الأقل' : 'Arabic name must be at least 3 characters');
    }
    if (this.editForm.get('startDate')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'تاريخ البداية مطلوب' : 'Start date is required');
    }
    if (this.editForm.get('endDate')?.hasError('required')) {
      errors.push(this.currentLanguage === 'ar' ? 'تاريخ النهاية مطلوب' : 'End date is required');
    }
    if (this.editForm.hasError('invalidDateRange')) {
      errors.push(this.currentLanguage === 'ar' ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date');
    }

    Swal.fire({
      icon: 'error',
      title: this.currentLanguage === 'ar' ? 'خطأ في النموذج' : 'Form Errors',
      html: errors.join('<br>'),
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
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
      title: this.currentLanguage === 'ar' ? 'تم التحديث بنجاح' : 'Updated Successfully',
      text: this.currentLanguage === 'ar' ? 'تم تحديث نوع التقييم بنجاح' : 'Feedback type has been updated successfully',
      confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/feedback']);
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.hasError('required')) {
        return this.currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
      if (field.hasError('minlength')) {
        return this.currentLanguage === 'ar' ? 'يجب أن يكون 3 أحرف على الأقل' : 'Must be at least 3 characters';
      }
    }
    return '';
  }
}
