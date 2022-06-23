import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ClassService } from 'src/app/0.shared/services/class/class.service';
import { AddClassComponent } from './add-class/add-class.component';
import { SocketService } from '../../0.shared/services/socket/socket.service';
import { ClassInfoService } from '../../0.shared/store/class-info'
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

    meetingList;
    socket;
    private unsubscribe$ = new Subject<void>();
    constructor(
        public dialog: MatDialog,
        private classService: ClassService,
        private router: Router,
        private socketService: SocketService,
        private classInfoService: ClassInfoService
    ) {
        this.socket = socketService.socket;
    }

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
            this.meetingList = data;

        })
    }

    // 수업 개설
    openClass(meeting) {
        console.log(meeting)
        this.router.navigate([`comclass/${meeting?._id}`]);
    }

}
