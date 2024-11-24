import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule,FormGroup,FormBuilder,Validator, Validators } from '@angular/forms';
import { SupaService } from '../../service/supa.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; // Import du RouterModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!:FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  error: string | null = null;



  constructor(private formBuilder:FormBuilder,private auth:SupaService,private router:Router){
    this.loginForm=this.formBuilder.group({
    email: formBuilder.control('',[Validators.required,Validators.email]),
    password:formBuilder.control('',[Validators.required,Validators.minLength(6)])

    })

  }
  
    async onSignIn() {
      try {
        const data = await this.auth.signIn(
           this.loginForm.value.email,this.loginForm.value.password
        );
  
        const user = data.user;
        const session = data.session;
  
        console.log('User signed in:', user);
        console.log('JWT Token:', session?.access_token);
  
        // Optionally store the token in localStorage
        localStorage.setItem('supabase.auth.token', session?.access_token || '');
        this.router.navigate(['admin/dashbord']);

  
        // Handle successful login (e.g., navigate to a different route)
      } catch (error: any) {
        this.error = error.message; // Handle the error if sign in fails
        this.errorMessage = 'Invalid email or password. Please try again.';

        
      }
    }
  }


