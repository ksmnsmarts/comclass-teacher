import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/0.shared/services/user/profile.service';
import { DataService } from 'src/app/0.shared/services/store/data.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    userProfileData;


    private unsubscribe$ = new Subject<void>();

    constructor(
        private profileService: ProfileService,
        private dataService: DataService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.profileService.getUserProfile().subscribe(
            (data: any) => {
                console.log(data);
                    this.getUserProfileData();
    
            }
        );
    }


    getUserProfileData() {
        this.dataService.userProfile.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (res: any) => {
                this.userProfileData = res;
            }	
        );
    }


    openClassList() {
        this.router.navigate(['lobby']);
    }
}
