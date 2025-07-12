import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translate: TranslateService) {}

  initLanguage() {
    const lang = localStorage.getItem('lang') || 'en';
    this.setDirection(lang);
    this.translate.use(lang);
  }

  switchLanguage() {
    const currentLang = this.translate.currentLang;
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.setDirection(newLang);
    this.translate.use(newLang);
    localStorage.setItem('lang', newLang);
  }

  private setDirection(lang: string) {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  get currentLang() {
    return this.translate.currentLang;
  }
}
