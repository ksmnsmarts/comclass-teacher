import { Component, OnInit } from '@angular/core';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';

@Component({
    selector: 'comclass-newpage',
    templateUrl: './comclass-newpage.component.html',
    styleUrls: ['./comclass-newpage.component.scss']
})
export class ComclassNewpageComponent implements OnInit {

    constructor(
        private eventBusService: EventBusService,
    ) { }

    ngOnInit(): void {
    }

    
    pdfOpen() {
        this.eventBusService.emit(new EventData('pdf open', 'vcanvas'));
    }
}
