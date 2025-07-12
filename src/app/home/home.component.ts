import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public languageService: LanguageService,
    private router: Router) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
  }

  switchLanguage() {
    this.languageService.switchLanguage();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    Swal.fire({
      icon: 'info',
      title: this.languageService.currentLang === 'ar' ? 'قريباً' : 'Coming Soon',
      text: this.languageService.currentLang === 'ar' ? 'ميزة التسجيل ستتوفر قريباً.' : 'Register feature will be available soon.',
      confirmButtonText: this.languageService.currentLang === 'ar' ? 'حسناً' : 'OK',
      customClass: {
        popup: this.languageService.currentLang === 'ar' ? 'swal2-rtl' : ''
      }
    });
  }
}
