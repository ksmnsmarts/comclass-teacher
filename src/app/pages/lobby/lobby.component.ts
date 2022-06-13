import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { AddClassComponent } from './add-class/add-class.component';


@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

    constructor(
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
    }



    addClass() {
        const convertDate = moment().format("YYYY-MM-DD")
   
    
        const dialogRef = this.dialog.open(AddClassComponent, {
            data: {
            },
            width: "400px"
        });
    
        dialogRef.afterClosed().subscribe((data) => {
            
        })
    }
    

    deleteAll() {

    }


}
