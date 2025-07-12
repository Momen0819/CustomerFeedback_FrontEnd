import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ApiService } from '../services/api.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FeedbackTypeDto } from '../models/feedback.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  feedbackTypes: FeedbackTypeDto[] = [];
  isLoading = false;
  currentLanguage: string = 'en';

  constructor(
    public languageService: LanguageService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.currentLanguage = this.languageService.currentLang;
    this.loadFeedbackTypes();
  }

  loadFeedbackTypes(): void {
    this.isLoading = true;

    this.apiService.getFeedbackTypes().subscribe({
      next: (response) => {
        if (response.success) {
          this.feedbackTypes = response.data;
          this.isLoading = false;
        } else {
          this.showError(response.message || 'Failed to load feedback types');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading feedback types:', error);
        this.showError('Failed to load feedback types');
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(this.currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
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

  onAddFeedback(): void {
    this.router.navigate(['/feedback/create']);
  }



  onEdit(feedbackType: FeedbackTypeDto): void {
    this.router.navigate(['/feedback/edit', feedbackType.id]);
  }

  onViewRatings(feedbackType: FeedbackTypeDto): void {
    this.router.navigate(['/feedback/ratings', feedbackType.id]);
  }

  onDelete(feedbackType: FeedbackTypeDto): void {
    Swal.fire({
      title: this.currentLanguage === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      text: this.currentLanguage === 'ar' ? `هل أنت متأكد من حذف "${feedbackType.name}"؟` : `Are you sure you want to delete "${feedbackType.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, Delete',
      cancelButtonText: this.currentLanguage === 'ar' ? 'إلغاء' : 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDelete(feedbackType.id);
      }
    });
  }

  performDelete(id: string): void {
    this.apiService.deleteFeedbackType(id).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: this.currentLanguage === 'ar' ? 'تم الحذف بنجاح' : 'Deleted Successfully',
            text: this.currentLanguage === 'ar' ? 'تم حذف نوع التقييم بنجاح' : 'Feedback type has been deleted successfully',
            confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
            customClass: {
              popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
            }
          }).then(() => {
            // Reload the feedback types list
            this.loadFeedbackTypes();
          });
        } else {
          this.showError(response.message || 'Failed to delete feedback type');
        }
      },
      error: (error) => {
        console.error('Error deleting feedback type:', error);
        this.showError('Failed to delete feedback type');
      }
    });
  }

  onCopyLink(feedbackType: FeedbackTypeDto): void {
    const publicUrl = `${window.location.origin}/public/${feedbackType.id}`;

    // Copy to clipboard
    navigator.clipboard.writeText(publicUrl).then(() => {
      Swal.fire({
        icon: 'success',
        title: this.currentLanguage === 'ar' ? 'تم نسخ الرابط' : 'Link Copied',
        text: this.currentLanguage === 'ar' ? 'تم نسخ رابط التقييم العام إلى الحافظة' : 'Public feedback link has been copied to clipboard',
        confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
        customClass: {
          popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
        }
      });
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      Swal.fire({
        icon: 'success',
        title: this.currentLanguage === 'ar' ? 'تم نسخ الرابط' : 'Link Copied',
        text: this.currentLanguage === 'ar' ? 'تم نسخ رابط التقييم العام إلى الحافظة' : 'Public feedback link has been copied to clipboard',
        confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
        customClass: {
          popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
        }
      });
    });
  }
}
