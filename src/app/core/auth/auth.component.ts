import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListErrorsComponent } from '../../shared/components/list-errors.component';
import { Errors } from '../models/errors.model';
import { UserService } from './services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword?: FormControl<string>;
  username?: FormControl<string>;
}

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth.component.html',
  imports: [RouterLink, ListErrorsComponent, ReactiveFormsModule],
})
export default class AuthComponent implements OnInit {
  authType = '';
  title = '';
  errors: Errors = { errors: {} };
  isSubmitting = false;
  authForm: FormGroup<AuthForm>;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
  ) {
    this.authForm = new FormGroup<AuthForm>({
      email: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      password: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
  }

  ngOnInit(): void {
    this.authType = this.route.snapshot.url.at(-1)!.path;
    this.title = this.authType === 'login' ? 'Sign in' : 'Sign up';

    // Load Google Sign-In
    this.loadGoogleSignIn();

    if (this.authType === 'register') {
      this.authForm.addControl(
        'username',
        new FormControl<string>('', {
          validators: [Validators.required],
          nonNullable: true,
        }),
      );
      this.authForm.addControl(
        'confirmPassword',
        new FormControl<string>('', {
          validators: [Validators.required],
          nonNullable: true,
        }),
      );
    }
  }

  private loadGoogleSignIn(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleSignIn();
    document.head.appendChild(script);
  }

  private initializeGoogleSignIn(): void {
    (window as any).google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleSignIn(response),
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: this.authType === 'login' ? 'signin_with' : 'signup_with',
      },
    );
  }

  handleGoogleSignIn(response: any): void {
    this.isSubmitting = true;
    this.errors = { errors: {} };

    console.log('Google Response:', response);
    console.log('Google ID Token:', response.credential);

    // this.userService.googleAuth(response.credential)
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: () => void this.router.navigateByUrl('/settings'),
    //     error: (err) => {
    //       console.error(err);
    //       this.errors = { errors: err.error?.error || {} };
    //       this.isSubmitting = false;
    //     },
    //   });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.errors = { errors: {} };

    let observable =
      this.authType === 'login'
        ? this.userService.login(this.authForm.value as { email: string; password: string })
        : this.userService.register(
            this.authForm.value as {
              username: string;
              email: string;
              password: string;
              confirmPassword: string;
            },
          );

    observable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigateByUrl('/settings'),
      error: (err) => {
        console.error(err);
        this.errors = { errors: err.error?.error || {} };
        this.isSubmitting = false;
      },
    });
  }
}
