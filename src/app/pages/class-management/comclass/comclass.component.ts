import { Component, OnInit } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { ClassInfoService } from 'src/app/0.shared/store/class-info';

interface ClassInfo {
  _id: String,
  teacher: String,
  subject: String,
  Manager: Object,
  status: String,
  currentMembers: Array<String>,
}

@Component({
    selector: 'app-comclass',
    templateUrl: './comclass.component.html',
    styleUrls: ['./comclass.component.scss']
})
export class ComclassComponent implements OnInit {
    classInfo: ClassInfo;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private classInfoService: ClassInfoService
    ) {

    }

    ngOnInit(): void {
        this.classInfoService.state$
            .pipe(takeUntil(this.unsubscribe$)).subscribe((meetingData) => {
                if (meetingData) {
                    console.log('[[ meetingInfo ]]', meetingData)
                    this.classInfo = meetingData;
                }
        });

    }

    ngOnDestroy() {
      // unsubscribe all subscription
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }






}
