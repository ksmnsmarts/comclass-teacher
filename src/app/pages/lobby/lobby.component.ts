import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ClassService } from 'src/app/0.shared/services/class/class.service';
import { AddClassComponent } from './add-class/add-class.component';
import { SocketService } from '../../0.shared/services/socket/socket.service';
import { ClassInfoService } from '../../0.shared/store/class-info'
import { Subject, takeUntil } from 'rxjs';
import { MeetingInfoService } from 'src/app/0.shared/store/meeting-info.service';
import { PdfStorageService } from 'src/app/0.shared/storage/pdf-storage.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';
import { EditInfoService } from 'src/app/0.shared/store/edit-info.service';
import { DrawStorageService } from 'src/app/0.shared/storage/draw-storage.service';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';

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
        private classInfoService: ClassInfoService,
        private pdfStorageService: PdfStorageService,
        private viewInfoService: ViewInfoService,
        private editInfoService: EditInfoService,
        private drawStorageService: DrawStorageService,
        private sockService: SocketService,
        private dialogService: DialogService
    ) {
        this.socket = socketService.socket;
    }

    ngOnInit(): void {

        this.getClass()
        console.log('memoryRelease')
        this.pdfStorageService.memoryRelease();
        this.viewInfoService.memoryRelease();
        this.classInfoService.memoryRelease();
        this.editInfoService.memoryRelease();
        this.drawStorageService.memoryRelease();
    }



    addClass() {
        const dialogRef = this.dialog.open(AddClassComponent, {
            data: {
            },
            width: "400px",
        });

        dialogRef.afterClosed().subscribe((data) => {
            this.getClass();
        })
    }


    // 수업 목록 가져오기
    getClass() {
        this.classService.getClass().subscribe((data) => {
            this.meetingList = data;
        })
    }

    // 수업 개설
    openClass(meeting) {
        this.router.navigate([`/${meeting?.access_key}`]);
    }

    // 수업 삭제
    deleteClass(meetingId) {
        const data = {
            _id: meetingId
        }

        this.dialogService.openDialogConfirm(`삭제하시겠습니까?`).subscribe((result) => {
            if(result) {
                this.classService.deleteClass(data).subscribe((data: any) => {
                    this.getClass();
                })
            }
        })
        
    }
}
