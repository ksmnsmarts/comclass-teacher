import { Injectable, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad } from '@angular/router';
import { DialogService } from '../dialog/dialog.service';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AdminGuard implements CanActivate, OnInit {

    constructor(
        private router: Router,
        private auth: AuthService,
        private dialogService: DialogService,
    ) {

    }

    ngOnInit() {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        const isAdmin: boolean = this.auth.getTokenInfo().isAdmin;

        if (!isAdmin) {
            this.dialogService.openDialogNegative('Cannot access.');
            this.router.navigate(['']);
            return false;      

        } else {
            console.log('>>> return true from admin guard');
            return true;      
        }
    }
}
