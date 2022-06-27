import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { StudentInfoService } from 'src/app/0.shared/store/student-info.service';

@Component({
    selector: 'app-comclass-student',
    templateUrl: './comclass-student.component.html',
    styleUrls: ['./comclass-student.component.scss']
})
export class ComclassStudentComponent implements OnInit {

    private unsubscribe$ = new Subject<void>();
    private socket;

    studentList;
    studentCount;
    toggle = false;

    constructor(
        private socketService: SocketService,
        private eventBusService: EventBusService,
        private studentInfoService: StudentInfoService
    ) { 
        this.socket = this.socketService.socket;
    }

    ngOnInit(): void {

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
    }



    clearBtn() {
        // this.toggle = true;
        this.eventBusService.emit(new EventData('studentList', 'defaultMode'));
    }

}
