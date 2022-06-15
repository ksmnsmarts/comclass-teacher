import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ClassService } from 'src/app/0.shared/services/class/class.service';
import { AddClassComponent } from './add-class/add-class.component';


@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

    meetingData;

    constructor(
        public dialog: MatDialog,
        private classService: ClassService,
        private router: Router,
    ) { }

    ngOnInit(): void {

        this.getClass()
    }



    addClass() {
        const dialogRef = this.dialog.open(AddClassComponent, {
            data: {
            },
            width: "400px"
        });
    
        dialogRef.afterClosed().subscribe((data) => {
            this.getClass();
        })
    }
    

    // 수업 목록 가져오기
    getClass() {
        this.classService.getClass().subscribe((data)=> {
            this.meetingData = data;

        })
    }

    // 수업 개설
    openClass(_id) {
        this.router.navigate([`comclass/${_id}`]);
    }


}
