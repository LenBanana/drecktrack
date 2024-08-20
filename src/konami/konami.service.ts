import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KonamiService {
  konamiCodeEnteredSubject = new Subject<void>();
  
  konamiCodeInString = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ]

  enteredKeys: string[] = [];

  constructor() { 
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.enteredKeys.push(e.key);
      this.enteredKeys = this.enteredKeys.slice(-10);
      if (this.enteredKeys.join('') === this.konamiCodeInString.join('')) {
        this.konamiCodeEnteredSubject.next();
        this.enteredKeys = [];
      }
    });
  }
}
