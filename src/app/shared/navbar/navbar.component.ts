import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  currentLanguage: string = 'en';

  constructor(
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.currentLang;
    this.loadUserData();
  }

  loadUserData(): void {
    const storedUsername = this.authService.getUsername();
    if (storedUsername) {
      this.username = storedUsername;
    } else {
      // If no username stored, redirect to login
      this.router.navigate(['/login']);
    }
  }

  switchLanguage(): void {
    this.languageService.switchLanguage();
    this.currentLanguage = this.languageService.currentLang;
  }

  logout(): void {
    Swal.fire({
      title: this.currentLanguage === 'ar' ? 'تأكيد تسجيل الخروج' : 'Confirm Logout',
      text: this.currentLanguage === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.currentLanguage === 'ar' ? 'نعم' : 'Yes',
      cancelButtonText: this.currentLanguage === 'ar' ? 'لا' : 'No',
      customClass: {
        popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();

        Swal.fire({
          icon: 'success',
          title: this.currentLanguage === 'ar' ? 'تم تسجيل الخروج' : 'Logged Out',
          text: this.currentLanguage === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Successfully logged out',
          confirmButtonText: this.currentLanguage === 'ar' ? 'حسناً' : 'OK',
          customClass: {
            popup: this.currentLanguage === 'ar' ? 'swal2-rtl' : ''
          }
        });
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToFeedback(): void {
    this.router.navigate(['/feedback']);
  }

  navigateToStatistics(): void {
    this.router.navigate(['/statistics']);
  }
}
