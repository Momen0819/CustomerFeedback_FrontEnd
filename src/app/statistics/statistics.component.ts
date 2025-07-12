import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ApiService } from '../services/api.service';
import { FeedbackStatisticsDto } from '../models/feedback.model';
import Swal from 'sweetalert2';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { LinearScale, CategoryScale, BarController, BarElement, Legend, Title } from 'chart.js';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('ratingsChart') ratingsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('feedbacksChart') feedbacksChartRef!: ElementRef<HTMLCanvasElement>;

  statistics: FeedbackStatisticsDto[] = [];
  isLoading = false;
  currentLanguage: string = 'en';
  ratingsChart: Chart | null = null;
  feedbacksChart: Chart | null = null;

  // Computed properties for summary
  get totalFeedbacks(): number {
    return this.statistics.reduce((sum, stat) => sum + stat.totalFeedbacks, 0);
  }

  get averageRating(): number {
    if (this.statistics.length === 0) return 0;
    const totalRating = this.statistics.reduce((sum, stat) => sum + stat.averageRating, 0);
    return Number((totalRating / this.statistics.length).toFixed(1));
  }

  get totalTypes(): number {
    return this.statistics.length;
  }

  constructor(
    public languageService: LanguageService,
    private apiService: ApiService
  ) {
    // Register Chart.js components
    Chart.register(LinearScale, CategoryScale, BarController, BarElement, Legend, Title);
  }

  ngOnInit(): void {
    this.languageService.initLanguage();
    this.currentLanguage = this.languageService.currentLang;
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  switchLanguage(): void {
    this.languageService.switchLanguage();
    this.currentLanguage = this.languageService.currentLang;
    this.updateCharts();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.apiService.getFeedbackStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.statistics = response.data;
          this.isLoading = false;
          // Initialize charts after data is loaded
          setTimeout(() => {
            this.initializeCharts();
          }, 100);
        } else {
          this.showError(response.message || 'Failed to load statistics');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.showError('Failed to load statistics');
        this.isLoading = false;
      }
    });
  }

  initializeCharts(): void {
    if (this.statistics.length === 0) return;

    this.createRatingsChart();
    this.createFeedbacksChart();
  }

  createRatingsChart(): void {
    if (!this.ratingsChartRef?.nativeElement) return;

    const ctx = this.ratingsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data: ChartData<'bar'> = {
      labels: this.statistics.map(stat =>
        this.currentLanguage === 'ar' ? stat.nameAr : stat.nameEn
      ),
      datasets: [{
        label: this.currentLanguage === 'ar' ? 'متوسط التقييم' : 'Average Rating',
        data: this.statistics.map(stat => stat.averageRating),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };

    if (this.ratingsChart) {
      this.ratingsChart.destroy();
    }

    this.ratingsChart = new Chart(ctx, config);
  }

  createFeedbacksChart(): void {
    if (!this.feedbacksChartRef?.nativeElement) return;

    const ctx = this.feedbacksChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data: ChartData<'bar'> = {
      labels: this.statistics.map(stat =>
        this.currentLanguage === 'ar' ? stat.nameAr : stat.nameEn
      ),
      datasets: [{
        label: this.currentLanguage === 'ar' ? 'إجمالي الملاحظات' : 'Total Feedbacks',
        data: this.statistics.map(stat => stat.totalFeedbacks),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };

    if (this.feedbacksChart) {
      this.feedbacksChart.destroy();
    }

    this.feedbacksChart = new Chart(ctx, config);
  }

  updateCharts(): void {
    if (this.statistics.length > 0) {
      this.createRatingsChart();
      this.createFeedbacksChart();
    }
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
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(startDate: string, endDate: string): string {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end ? 'active' : 'inactive';
  }

  getStatusText(startDate: string, endDate: string): string {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const isActive = now >= start && now <= end;

    return isActive
      ? (this.currentLanguage === 'ar' ? 'نشط' : 'Active')
      : (this.currentLanguage === 'ar' ? 'منتهي' : 'Ended');
  }

  getAverageRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
  }
}
