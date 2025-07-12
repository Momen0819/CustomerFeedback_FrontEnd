import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    public languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageService.initLanguage();
  }

  navigateToFeedback(): void {
    // Navigate to feedback page
    this.router.navigate(['/feedback']);
  }

  navigateToStatistics(): void {
    // Navigate to statistics page
    this.router.navigate(['/statistics']);
  }
}
