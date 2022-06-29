import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { distinctUntilChanged, pairwise, Subject, takeUntil } from 'rxjs';
import { CanvasService } from 'src/app/0.shared/services/canvas/canvas.service';
import { DrawingService } from 'src/app/0.shared/services/drawing/drawing.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { RenderingService } from 'src/app/0.shared/services/rendering/rendering.service';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { PdfStorageService } from 'src/app/0.shared/storage/pdf-storage.service';
import { ClassInfoService } from 'src/app/0.shared/store/class-info';
import { StudentInfoService } from 'src/app/0.shared/store/student-info.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';
import { CANVAS_CONFIG } from '../../../0.shared/config/config';

@Component({
    selector: 'app-comclass-student',
    templateUrl: './comclass-student.component.html',
    styleUrls: ['./comclass-student.component.scss']
})
export class ComclassStudentComponent implements OnInit {

    private unsubscribe$ = new Subject<void>();
    private socket;

    currentDocId: any;
    currentDocNum: any; // 선택한 pdf
    currentPageNum: number = 0;

    studentList = [];
    studentCount;
    toggle = false;
    thumbArray = [];

    @ViewChildren('student_monitoring') student_monitoringRef: QueryList<ElementRef>
    @ViewChildren('studentBg') studentBgRef: QueryList<ElementRef>
    constructor(
        private socketService: SocketService,
        private eventBusService: EventBusService,
        private studentInfoService: StudentInfoService,
        private classInfoService: ClassInfoService,
        private renderingService: RenderingService,
        private viewInfoService: ViewInfoService,
        private canvasService: CanvasService,
        private pdfStorageService: PdfStorageService,
        private drawingService: DrawingService
    ) {
        this.socket = this.socketService.socket;
    }

    ngOnInit(): void {



        this.classInfoService.state$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(async (classInfo) => {
                await new Promise(res => setTimeout(res, 0));
                if (classInfo) {

                    console.log(classInfo)
                    this.studentList = classInfo.currentMembers

                    console.log(classInfo)
                    this.renderFileList();
                }
            });


        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged(), pairwise())
            .subscribe(([prevViewInfo, viewInfo]) => {

                // 현재 Current Page Info 저장
                // this.currentDocId = viewInfo.pageInfo.currentDocId;
                this.currentDocNum = viewInfo.pageInfo.currentDocNum;
                this.currentPageNum = viewInfo.pageInfo.currentPage;

            });

        this.socket.on('studentCount', (data) => {
            console.log('<--- [SOCKET] 현재 참가자 수', data - 1);
            this.studentCount = data - 1;
        });

        this.studentInfoService.currentStudent.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (res: any) => {
                console.log(res)
                this.studentCount = res;
            }
        );

        /************************************************************
         * 모니터링
         ************************************************************/
        this.socket.emit('begin:monitoring', '');

        this.socket.on('send:monitoringCanvas', async (data) => {

            for (let i = 0; i < this.studentList.length; i++) {
                if (this.studentList[i].studentName == data.studentName)
                    this.studentList[i].pageInfo = data.pageInfo
            }

            await new Promise(res => setTimeout(res, 0));
            const canvas = (document.getElementById('student_monitoring' + data.studentName) as HTMLInputElement);
            const studentImgBg = (document.getElementById('studentBg' + data.studentName) as HTMLInputElement);

            const viewport = this.pdfStorageService.getViewportSize(data.pageInfo.currentDocNum, data.pageInfo.currentPage);


            // landscape 문서 : 가로를 300px(studentListMaxSize)로 설정
            if (viewport.width > viewport.height) {
                canvas.width = CANVAS_CONFIG.studentListMaxSize;
                canvas.height = canvas.width * viewport.height / viewport.width;

                studentImgBg.width = CANVAS_CONFIG.studentListMaxSize;
                studentImgBg.height = studentImgBg.width * viewport.height / viewport.width;
            }
            // portrait 문서 : 세로를 300px(studentListMaxSize)로 설정
            else {
                canvas.height = CANVAS_CONFIG.studentListMaxSize;
                canvas.width = canvas.height * viewport.width / viewport.height;

                studentImgBg.height = CANVAS_CONFIG.studentListMaxSize;
                studentImgBg.width = studentImgBg.height * viewport.width / viewport.height;
            }


            this.renderingService.renderThumbBackground(studentImgBg, data.pageInfo.currentDocNum, data.pageInfo.currentPage);
            this.renderingService.renderThumbBoard(canvas, data.pageInfo.currentDocNum, data.pageInfo.currentPage);

        })


        /*-------------------------------------
            monitoring canvas open 상태에서
            학생이 draw 하는 내용에 대한 update.
        ---------------------------------------*/
        this.socket.on('send:monitoringCanvasDrawEvent', (data) => {
            console.log('<--- receive : monitoringCanvas One drawing Event from student.', data);

            const canvas = (document.getElementById('student_monitoring' + data.studentName) as HTMLInputElement);

            if (!canvas) {
                console.log("------------> ERROR:  Check STUDENT LIST... ", data.studentName);
                return;
            }

            // 학생의 drawing event를 그리기
            for (let i = 0; i < this.thumbArray.length; i++) {
                if (this.thumbArray[i].studentName == data.studentName) {
                    const scale = this.thumbArray[i].scale;
                    this.drawingService.drawThumb(data.drawingEvent, canvas, scale);
                }
            }
        
        });
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

        // const numPages = this.viewInfoService.state.documentInfo[this.currentDocNum - 1].numPages;
        this.thumbArray = [];
        let thumbSize;
        for (let i = 0; i < this.studentList.length; i++) {
            thumbSize = this.canvasService.getStudentCanvasSize(1, 1);
            thumbSize.studentName = this.studentList[i]?.studentName
            this.thumbArray.push(thumbSize);
        };

        await new Promise(res => setTimeout(res, 300));
        // for (let i = 0; i < this.student_monitoringRef.toArray().length; i++) {
        for (let i = 0; i < this.studentList.length; i++) {
            console.log(this.student_monitoringRef.toArray()[i].nativeElement)
            await this.renderingService.renderThumbBackground(this.studentBgRef.toArray()[i].nativeElement, 1, 1);
            this.renderingService.renderThumbBoard(this.student_monitoringRef.toArray()[i].nativeElement, 1, 1);

        };

        // 아래와 같은 방식도 사용가능(참고용)
        // https://stackoverflow.com/questions/55737546/access-nth-child-of-viewchildren-querylist-angular
        // this.thumRef.forEach((element, index) => {
        //   this.renderingService.renderThumbBackground(element.nativeElement, index + 1, 1); // element, doc Number, page Number
        // });

    };





    clearBtn() {
        // this.toggle = true;
        this.eventBusService.emit(new EventData('studentList', 'defaultMode'));
    }



}
