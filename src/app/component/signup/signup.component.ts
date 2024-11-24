import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
import { SupaService } from '../../service/supa.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router'; // Import du RouterModule

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private auth: SupaService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async onSignUp() {
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const { email, password, confirmPassword } = this.signupForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    try {
      const data = await this.auth.signUp(email, password);

      console.log('User signed up successfully:', data.user);

      this.showToastMessage('User signed up successfully');

      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during signup.';
    } finally {
      this.loading = false;
    }
  }

  showToastMessage(message: string) {
    this.snackBar.open(message, 'close', {
      duration: 3000, // Durée en millisecondes
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'green-snackbar',
    });
  }
}
