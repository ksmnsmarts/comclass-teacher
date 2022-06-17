import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import filePdfBox from '@iconify/icons-mdi/file-pdf-box';
import { SpinnerDialogComponent } from 'src/app/0.shared/dialog/dialog.component';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';

export interface DialogData {
    animal: string;
    name: string;
}


@Component({
    selector: 'app-open-file',
    templateUrl: './open-file.component.html',
    styleUrls: ['./open-file.component.scss']
})
export class OpenFileComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<OpenFileComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private eventBusService: EventBusService,
        private dialogService: DialogService,
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    openFile(newpageEvent) {
        console.log('[ newpage ---> main ] send event:', newpageEvent);
        this.eventBusService.emit(new EventData('open the blank pdf', newpageEvent));
        this.dialogRef.close();
    }

    /**
       * 새로운 File Load (Local)
       * - @output으로 main component(white-board.component로 전달)
       * @param event
       * @returns
       */
    openPDF(event) {
        const files: File[] = event.target.files;

        if (event.target.files.length === 0) {
            console.log('file 안들어옴');
            return;
        }

        // 파일 유효성 검사
        const ext = (files[0].name).substring((files[0].name).lastIndexOf('.') + 1);
        if (ext.toLowerCase() != 'pdf') {
            this.dialogService.openDialogNegative(`Please, upload the '.pdf' file.`);
        } else {
            const result = {
                files : event.target.files,
                type : 'pdf'
            }
            console.log(result)
            // @OUTPUT -> white-board component로 전달
            this.eventBusService.emit(new EventData('openFile', result))
            ///////////////////////////////////////////////////////////////////
            /*---------------------------------------
            pdf 업로드 시 spinner
            -----------------------------------------*/
            // const dialogRef = this.dialog.open(SpinnerDialogComponent, {
            //     // width: '300px',

            //     data: {
            //         content: 'Upload'
            //     }
            // });
            // this.eventBusService.emit(new EventData('spinner', dialogRef))
            ///////////////////////////////////////////////////////////////////
        }
        this.dialogRef.close();
    }

    openGSTD(event) {
        const files: File[] = event.target.files;

        if (event.target.files.length === 0) {
            console.log('file 안들어옴');
            return;
        }
        let result;
        // 파일 유효성 검사
        const ext = (files[0].name).substring((files[0].name).lastIndexOf('.') + 1);
        if (ext.toLowerCase() != 'gstd') {
            this.dialogService.openDialogNegative(`Please, upload the '.gstd' file.`);
        } else {

            const result = {
                files : event.target.files,
                type : 'gstd'
            }
            // @OUTPUT -> white-board component로 전달
            this.eventBusService.emit(new EventData('openFile', result))
            ///////////////////////////////////////////////////////////////////
            /*---------------------------------------
            pdf 업로드 시 spinner
            -----------------------------------------*/
            // const dialogRef = this.dialog.open(SpinnerDialogComponent, {
            //     // width: '300px',

            //     data: {
            //         content: 'Upload'
            //     }
            // });
            // this.eventBusService.emit(new EventData('spinner', dialogRef))
            ///////////////////////////////////////////////////////////////////
        }
        this.dialogRef.close();
    }

    openVIDEO(event) {
        const files: File[] = event.target.files;

        if (event.target.files.length === 0) {
            console.log('file 안들어옴');
            return;
        }
        let result;
        // 파일 유효성 검사
        const ext = (files[0].name).substring((files[0].name).lastIndexOf('.') + 1);
        if (!(ext.toLowerCase() == 'mp3' &&  ext.toLowerCase() == 'wav' && ext.toLowerCase() == 'avi' &&
        ext.toLowerCase() == 'mpg' && ext.toLowerCase() == 'mpeg' && ext.toLowerCase() == 'mp4'
        )) {
            this.dialogService.openDialogNegative(`Please, upload the '.pdf' file.`);
        } else {

            const result = {
                files : event.target.files,
                type : 'media'
            }
            // @OUTPUT -> white-board component로 전달
            this.eventBusService.emit(new EventData('openFile', result))
            ///////////////////////////////////////////////////////////////////
            /*---------------------------------------
            pdf 업로드 시 spinner
            -----------------------------------------*/
            const dialogRef = this.dialog.open(SpinnerDialogComponent, {
                // width: '300px',

                data: {
                    content: 'Upload'
                }
            });
            this.eventBusService.emit(new EventData('spinner', dialogRef))
            ///////////////////////////////////////////////////////////////////
        }
        this.dialogRef.close();
    }
}
