import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { RenderingService } from 'src/app/0.shared/services/rendering/rendering.service';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { ClassInfoService } from 'src/app/0.shared/store/class-info';
import { StudentInfoService } from 'src/app/0.shared/store/student-info.service';
import { CANVAS_CONFIG } from '../../../0.shared/config/config';

@Component({
    selector: 'app-comclass-student',
    templateUrl: './comclass-student.component.html',
    styleUrls: ['./comclass-student.component.scss']
})
export class ComclassStudentComponent implements OnInit {

    private unsubscribe$ = new Subject<void>();
    private socket;

    studentList = [];
    studentCount;
    toggle = false;

    @ViewChildren('student_monitoring') student_monitoringRef: QueryList<ElementRef>

    student_monitoringCanvas: HTMLCanvasElement;



    constructor(
        private socketService: SocketService,
        private eventBusService: EventBusService,
        private studentInfoService: StudentInfoService,
        private classInfoService: ClassInfoService,
        private renderingService: RenderingService
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
                    

                }
            });
       
        this.socket.on('studentCount', (data) => {
            console.log('<--- [SOCKET] 현재 참가자 수', data -1);
            this.studentCount = data -1;
        });

        this.studentInfoService.currentStudent.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (res: any) => {
                console.log(res)
                this.studentCount = res;
            }	
        );


        this.socket.on('send:monitoringCanvas', (data)=> {
            this.studentList.push(data);
            console.log(this.studentList)
            this.renderFileList();
        })
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
        for (let i = 0; i < this.student_monitoringRef.toArray().length; i++) {
            await this.renderingService.renderBackground('', this.student_monitoringRef.toArray()[i].nativeElement, 1, 1);
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
