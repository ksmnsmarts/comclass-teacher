import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { OpenFileComponent } from './open-file/open-file.component';

@Component({
    selector: 'comclass-newpage',
    templateUrl: './comclass-newpage.component.html',
    styleUrls: ['./comclass-newpage.component.scss']
})
export class ComclassNewpageComponent implements OnInit {

    constructor(
        private eventBusService: EventBusService,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
    }


    /*------------------------------------
		Event를 comclass component로 전달
	--------------------------------------*/
    pdfOpen(newpageEvent) {  
        console.log('[ newpage ---> main ] send event:', newpageEvent);      
        this.eventBusService.emit(new EventData('open the blank pdf', newpageEvent));
    }

    openFile(){
        const dialogRef = this.dialog.open(OpenFileComponent);
      
          dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
          });
      
    }
}
