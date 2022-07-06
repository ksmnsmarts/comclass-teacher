import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { pluck, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { SpinnerDialogComponent } from 'src/app/0.shared/dialog/dialog.component';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';
import { ApiService } from 'src/app/0.shared/services/apiService/api.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';


import { RenderingService } from 'src/app/0.shared/services/rendering/rendering.service';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { ZoomService } from 'src/app/0.shared/services/zoom/zoom.service';
import { EditInfoService } from 'src/app/0.shared/store/edit-info.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';


/**
 * File View Component
 * - File Open 처리
 * - File List
 */
@Component({
    selector: 'app-comclass-file-view',
    templateUrl: './comclass-file-view.component.html',
    styleUrls: ['./comclass-file-view.component.scss']
})

export class ComclassFileViewComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private renderingService: RenderingService,
        private viewInfoService: ViewInfoService,
        private apiService: ApiService,
        private socketService: SocketService,
        private eventBusService: EventBusService,
        private editInfoService: EditInfoService,
        private dialogService: DialogService,
        public dialog: MatDialog,
        private zoomService: ZoomService,
    ) {
        this.socket = this.socketService.socket;
    }


    // Open된 File을 comclass component로 전달
    @Output() newLocalDocumentFile = new EventEmitter();

    // image element
    @ViewChildren('thumb') thumRef: QueryList<ElementRef>

    private unsubscribe$ = new Subject<void>();

    private socket;
    meetingId: any;
    myRole: any = 'Presenter'; // 나의 역할(권한)

    documentInfo = [];
    documentPageInfo;

    ngOnInit(): void {

        this.meetingId = this.route.snapshot.params['id'];

        // Document가 Update 된 경우 : File List rendering
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('documentInfo'), distinctUntilChanged())
            .subscribe(async (documentInfo) => {
                this.documentInfo = documentInfo;
                await new Promise(res => setTimeout(res, 0));

                this.renderFileList();
            });


        this.viewInfoService.state$
        .pipe(takeUntil(this.unsubscribe$), pluck('pageInfo'))
        .subscribe((pageInfo) => {
            this.documentPageInfo = pageInfo;
        });



        /*-------------------------------------------
            role에 따라 권한 설정
        ---------------------------------------------*/
        this.eventBusService.on('myRole', this.unsubscribe$, (myRole) => {
            this.myRole = myRole.role
        })


        /*-------------------------------------------
            doc 전환 하는 경우 sync
        ---------------------------------------------*/
        this.socket.on('sync:docChange', (docId) => {
            this.viewInfoService.changeToThumbnailView(docId);

            this.eventBusService.emit(new EventData('docChange', ''))
        })


    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        // this.viewInfoService.memoryRelease();
    }


    /**
     * PDF File 목록 표시
     * - file 변경시에 전체 다시 그림
     * - image 크기는 고정 size
     *
     * @param documentInfo
     * @returns
     */
    async renderFileList() {
        // File List Background 그리기 : 각 문서의 1page만 그림
        for (let i = 0; i < this.thumRef.toArray().length; i++) {
            await this.renderingService.renderThumbBackground(this.thumRef.toArray()[i].nativeElement, i + 1, 1);
        };

        // 아래와 같은 방식도 사용가능(참고용)
        // https://stackoverflow.com/questions/55737546/access-nth-child-of-viewchildren-querylist-angular
        // this.thumRef.forEach((element, index) => {
        //   this.renderingService.renderThumbBackground(element.nativeElement, index + 1, 1); // element, doc Number, page Number
        // });

    };


    /**
     * File List 에서 각 document 클릭
     *  - 해당 문서의 Thumbanil 표시화면으로 이동
     *  - viewInfo를 update
     * @param docId document ID
     */
    clickPdf(docId) {
        console.log('>> click PDF : change to Thumbnail Mode');
        this.viewInfoService.changeToThumbnailView(docId);

        //////////////////////////////////////////////////////////
        /*-------------------------------------------
            doc 전환 하는 경우 sync
        ---------------------------------------------*/
        const data = {
            meetingId: this.meetingId,
            docId: docId
        }

        // Participant 모드 일 경우 sync 기능 적용 제외
        if (this.editInfoService.state.syncMode != 'nonSync') {
            this.socket.emit('sync:doc', data)
        }



        /**********************************************
        * 다른 가로문서, 세로문서를 바라볼 때마다
        * zoomScale이 첫번째 doc의 documentInfo[0]._id로 설정되어
        * zoomScale이 첫번째 문서에 고정 돼 화면에 꽉 차게 나오지 않는 문제를 해결
        **********************************************/
        const obj = this.documentPageInfo;

        obj.pageInfo = {
            currentDocId: obj.currentDocId,
            currentDocNum: obj.currentDocNum,
            currentPage: obj.currentPage,
            zoomScale: this.zoomService.setInitZoomScale(obj.currentDocNum, obj.currentPage)
        }
        this.viewInfoService.setViewInfo(obj);

        //////////////////////////////////////////////////////////
    }


    /**
     * 새로운 File Load (Local)
     * - @output으로 main component(comclass.component로 전달)
     * @param event
     * @returns
     */
    handleUploadFileChanged(event) {
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

            // @OUTPUT -> comclass component로 전달
            this.newLocalDocumentFile.emit(event.target.files[0]);

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








    }

    deletePdf(_id) {
        // thumbnail-container(div) 안에 delete(button)이 존재
        // 2개의 엘리먼트가 동시에 이벤트 발생하는것을 막는 함수 (이벤트 버블링 이슈)
        // https://webisfree.com/2016-06-15/[%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8]-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EB%B2%84%EB%B8%94%EB%A7%81-%EC%A0%9C%EA%B1%B0%EB%B0%A9%EB%B2%95-stoppropagation()

        event.stopPropagation();

        this.dialogService.openDialogConfirm('Are you sure you want to delete it?').subscribe(result => {
            if (result) {
                console.log('>> click PDF : delete');
                this.apiService.deleteMeetingPdfFile({ _id }).subscribe(async (data: any) => {

                    // document delete 확인 후 socket room안의 모든 User에게 전송 (나 포함)
                    await this.socket.emit('check:documents', data.meetingId);
                })


                ///////////////////////////////////////////////////////////////////
                /*---------------------------------------
                    pdf 삭제 시 spinner
                -----------------------------------------*/
                const dialogRef = this.dialog.open(SpinnerDialogComponent, {
                    // width: '300px',

                    data: {
                        content: 'Delete'
                    }
                });


                this.renderFileList().then(async (value) => {
                    await dialogRef.close();
                });
            }
        });


        ///////////////////////////////////////////////////////////////////

        // this.viewInfoService.setViewInfo({ leftSideView: 'fileList' });
    }

}
