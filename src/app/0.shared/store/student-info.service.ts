import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from './store';

@Injectable({
    providedIn: 'root'
})
export class StudentInfoService extends Store<any> {

    private currentStudentInfo = new BehaviorSubject({});
	currentStudent = this.currentStudentInfo.asObservable();

    constructor() {
        super({});
    }

    setStudentInfo(studentInfo: any): void {
        this.setState({
            ...this.state, ...studentInfo
        });

        this.currentStudentInfo.next(studentInfo);
    }
}
