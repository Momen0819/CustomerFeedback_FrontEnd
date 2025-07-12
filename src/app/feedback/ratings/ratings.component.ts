import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FeedbackDto } from '../../models/feedback.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-feedback-ratings',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class FeedbackRatingsComponent implements OnInit {
  ratings: FeedbackDto[] = [];
  isLoading = false;
  currentLanguage: string = 'en';
  feedbackTypeId: string = '';
  feedbackTypeName: string = '';
  Math = Math;

  constructor(
    public languageService: LanguageService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.currentLanguage = this.languageService.currentLang;
    this.loadRatings();
  }

  loadRatings(): void {
    this.feedbackTypeId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.feedbackTypeId) {
      this.showError('Invalid feedback type ID');
      this.router.navigate(['/feedback']);
      return;
    }

    this.isLoading = true;
    this.apiService.getFeedbackRatings(this.feedbackTypeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.ratings = response.data;
          this.isLoading = false;
        } else {
          this.showError(response.message || 'Failed to load ratings');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.showError('Failed to load ratings');
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
    return date.toLocaleDateString(this.currentLanguage === 'ar' ? 'ar' : 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStarsArray(stars: number): number[] {
    return Array.from({ length: stars }, (_, i) => i + 1);
  }

  getEmptyStarsArray(stars: number): number[] {
    return Array.from({ length: 5 - stars }, (_, i) => i + 1);
  }

  getTotalRatings(): number {
    return this.ratings.length;
  }

  onBack(): void {
    this.router.navigate(['/feedback']);
  }
}
