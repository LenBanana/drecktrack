import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginUserDto } from '../../interfaces/dtos/LoginUserDto';
import { RegisterUserDto } from '../../interfaces/dtos/RegisterUserDto';
import { AuthService } from './auth-service/auth.service';
import { CommonModule } from '@angular/common';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Modal } from 'bootstrap'; // Make sure Bootstrap JS is included

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthModalComponent implements AfterViewInit {
  @ViewChild('authModal') authModalRef!: ElementRef;
  authModal!: Modal;

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  errorMessages: string[] = [];
  loading = false;

  loginIcon = faSignInAlt;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      displayName: ['', Validators.required],
    });
  }

  ngAfterViewInit() {
    this.authModal = new Modal(this.authModalRef.nativeElement, {
      backdrop: 'static',
      keyboard: false,
    });
    
    // Check if the user is already authenticated
    if (this.authService.isLoggedIn()) {
      // User is authenticated; no need to show the modal
      this.closeModal();
    } else {
      // User is not authenticated; open the modal
      this.openModal();
    }

    // Subscribe to authentication status changes
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.closeModal();
      }
    });
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessages = [];
  }

  onSubmit() {
    this.loading = true;
    this.errorMessages = [];
    if (this.isLoginMode) {
      const loginData: LoginUserDto = this.loginForm.value;
      this.authService.login(loginData).subscribe(
        () => {
          this.loading = false;
          // The modal will close automatically via the subscription
        },
        (error) => {
          this.loading = false;
          this.errorMessages = [
            error.error?.message || 'Login failed. Please check your credentials.',
          ];
        }
      );
    } else {
      const registerData: RegisterUserDto = this.registerForm.value;
      this.authService.register(registerData).subscribe(
        () => {
          this.loading = false;
          this.switchMode();
        },
        (error) => {
          this.loading = false;
          if (error.error && Array.isArray(error.error)) {
            this.errorMessages = error.error.map(
              (err: { description: any }) => err.description
            );
          } else {
            this.errorMessages = [
              'Registration failed. Please check your inputs.',
            ];
          }
        }
      );
    }
  }

  openModal() {
    this.authModal.show();
  }

  closeModal() {
    this.authModal.hide();
  }
}