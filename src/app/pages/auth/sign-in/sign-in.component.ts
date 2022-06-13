import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';
import { AuthService } from 'src/app/0.shared/services/auth/auth.service';

interface LoginFormData {
    email: string;
    password: string;
}

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

    form: FormGroup;

    signInFormData: LoginFormData = {
        email: '',
        password: '',
    };

    constructor(
        private router: Router,
        private authService: AuthService,
        private fb: FormBuilder,
        private dialogService: DialogService,
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(4), Validators.minLength(15)]],
        });
    }

    ngOnInit(): void {
        // console.log(this.f);
    }

    get f() {
        return this.form.controls;
    }

    signIn() {
        this.authService.signIn(this.signInFormData).subscribe(
            (data: any) => {
                if (data.token != '' && data.token != null) {
                    this.router.navigate(['comclass/main']);
                }
            },
            err => {
                console.log(err.error);
                this.errorAlert(err.error.message);
            },
        );
    }

    errorAlert(err) {
        switch (err) {
            case 'not found':
                this.dialogService.openDialogNegative('The email does not exist. Try again.');
                break;
            case 'mismatch':
                this.dialogService.openDialogNegative('Password is incorrect. Try again.');
                break;
            case 'retired':
                this.dialogService.openDialogNegative(`An employee who's retired at the company.`);
                break;
        }
    };
}
