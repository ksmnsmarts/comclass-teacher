import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { FileService } from 'src/app/0.shared/services/file/file.service';

@Component({
    selector: 'app-comclass',
    templateUrl: './comclass.component.html',
    styleUrls: ['./comclass.component.scss']
})
export class ComclassComponent implements OnInit {

    private unsubscribe$ = new Subject<void>();

    constructor(
        private eventBusService: EventBusService,
        private fileService: FileService,
    ) { }

    ngOnInit(): void {

        
    }



    
    


    
}
