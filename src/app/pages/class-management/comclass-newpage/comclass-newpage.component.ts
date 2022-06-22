import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { OpenFileComponent } from './open-file/open-file.component';

@Component({
    selector: 'comclass-newpage',
    templateUrl: './comclass-newpage.component.html',
    styleUrls: ['./comclass-newpage.component.scss']
})
export class ComclassNewpageComponent implements OnInit {


    meetingId;

    constructor(
        private eventBusService: EventBusService,
        public dialog: MatDialog,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.meetingId = params;

            console.log(this.meetingId)
        });
    }


    /*------------------------------------
		Event를 comclass component로 전달
	--------------------------------------*/
    pdfOpen(newpageEvent) {
        this.eventBusService.emit(new EventData('open the blank pdf', newpageEvent));
    }

    openFile(){
        const dialogRef = this.dialog.open(OpenFileComponent, {
            data : this.meetingId.id,
        })

        dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        });

    }
}
