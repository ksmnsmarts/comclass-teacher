import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';
import { AuthService } from 'src/app/0.shared/services/auth/auth.service';


interface FormData {
    email: string;
    password: string;
    confirmedPassword: string;
    name: string;
}



@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

    form: FormGroup;
    pwdMatchFlag: boolean;

    signUpFormData: FormData = {
        email: '',
        password: '',
        confirmedPassword: '',
        name: '',
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
            confirmedPassword: ['', [Validators.required, Validators.minLength(4), Validators.minLength(15)]],
            name: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        // console.log(this.f);
    }

    get f() {
        return this.form.controls;
    }

    signUp() {
        this.authService.signUp(this.signUpFormData).subscribe((data: any) => {

            this.dialogService.openDialogConfirm(`회원가입하시겠습니까?`).subscribe((result) => {
                if (result) {
                    if (data.message == 'created') {
                        this.dialogService.openDialogPositive(`Created !`);
                        this.router.navigate(['']);
                    }

                    if (data.message == 'duplicated') {
                        this.dialogService.openDialogNegative(`Email duplicated!`);
                    }
                }
            })
        })
    }

	errorAlert(err) {
		switch(err) {
			case 'duplicated':
				this.dialogService.openDialogNegative('The email is already taken.');
				break;
		}
	};
}
