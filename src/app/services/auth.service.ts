import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return !!(token && username);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  setAuthData(token: string, username: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  checkAuthAndRedirect(): boolean {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
