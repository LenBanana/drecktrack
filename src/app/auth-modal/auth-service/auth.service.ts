import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginUserDto } from '../../../interfaces/dtos/LoginUserDto';
import { RegisterUserDto } from '../../../interfaces/dtos/RegisterUserDto';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:44327/api/Auth';
  private authTokenKey = 'authToken';

  // BehaviorSubject to hold authentication status
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if token exists in local storage
    const token = localStorage.getItem(this.authTokenKey);
    this.isAuthenticatedSubject.next(!!token);
  }

  register(model: RegisterUserDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, model);
  }

  login(model: LoginUserDto): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, model).pipe(
      tap(response => {
        localStorage.setItem(this.authTokenKey, response.token);
        this.isAuthenticatedSubject.next(true);
        this.router.navigate(['/home']);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.authTokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  isLoggedIn(): boolean {
    const isLoggedIn = this.isAuthenticatedSubject.value;
    if (!isLoggedIn) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/home']);
    }
    return isLoggedIn;
  }
}