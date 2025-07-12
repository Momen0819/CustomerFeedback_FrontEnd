import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    public languageService: LanguageService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.languageService.initLanguage();
  }

  switchLanguage() {
    this.languageService.switchLanguage();
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return controlName === 'username' ?
          this.translateService.instant('login.validation.usernameRequired') :
          this.translateService.instant('login.validation.passwordRequired');
      }
      if (control.errors['minlength']) {
        return this.translateService.instant('login.validation.passwordMinLength');
      }
    }
    return '';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.translateService.get('login.validation.formInvalid').subscribe((message: string) => {
        Swal.fire({
          icon: 'warning',
          title: this.languageService.currentLang === 'ar' ? 'تنبيه' : 'Warning',
          text: message,
          confirmButtonText: this.languageService.currentLang === 'ar' ? 'حسناً' : 'OK',
          customClass: {
            popup: this.languageService.currentLang === 'ar' ? 'swal2-rtl' : ''
          }
        });
      });
      return;
    }

    this.isLoading = true;

    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.setAuthData(response.data.token, response.data.username);
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        } else {
          Swal.fire({
            icon: 'error',
            title: this.translateService.instant('login.loginFailed'),
            text: response.message || this.translateService.instant('login.checkCredentials'),
            confirmButtonText: this.translateService.instant('login.ok'),
            customClass: {
              popup: this.languageService.currentLang === 'ar' ? 'swal2-rtl' : ''
            }
          });
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        Swal.fire({
          icon: 'error',
          title: this.translateService.instant('login.loginFailed'),
          text: this.translateService.instant('login.checkCredentials'),
          confirmButtonText: this.translateService.instant('login.ok'),
          customClass: {
            popup: this.languageService.currentLang === 'ar' ? 'swal2-rtl' : ''
          }
        });
        this.isLoading = false;
      }
    });
  }
}
