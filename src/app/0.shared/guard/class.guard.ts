import { Injectable, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DialogService } from '../dialog/dialog.service';
import { ClassService } from '../services/class/class.service';

@Injectable()
export class ClassGuard implements CanActivate, OnInit {

    meetingId: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dialogService: DialogService,
        private classService: ClassService
    ) { }

    ngOnInit() {
        console.log('auth redirect oninit');

    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        // 라우팅이 된 시점에서 route.params['id']로 방이 존재하는지 파악
        try {
            const data = {
                access_key: route.params['id']
            }

            const meetingInfo: any = await lastValueFrom(this.classService.getClassInfo(data))
      
            // 방이 존재하면 이미 라우팅 된 페이지로 그대로 진행
            if (meetingInfo) {
                return true;
            } 

        } catch (error) {
            this.dialogService.openDialogNegative("방을 찾을 수 없습니다.");
            this.router.navigate(['']);

            // window.open('http://localhost:4200/', "_self");
            // this.router.navigate(['http://localhost:4200/']);
            // this.router.navigate(['/sign-in'], {queryParams: {params : state.url} });
            console.log(error)
        }

    }

}
