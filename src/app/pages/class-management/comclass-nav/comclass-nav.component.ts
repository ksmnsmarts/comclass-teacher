import { Component, OnInit } from '@angular/core';
import { CANVAS_CONFIG } from 'src/app/0.shared/config/config';


// icon icon 별로 불러오기
import eraserIcon from '@iconify/icons-mdi/eraser';
import markerIcon from '@iconify/icons-mdi/marker';
import shapeOutlineIcon from '@iconify/icons-mdi/shape-outline';


@Component({
    selector: 'comclass-nav',
    templateUrl: './comclass-nav.component.html',
    styleUrls: ['./comclass-nav.component.scss']
})
export class ComclassNavComponent implements OnInit {

    colorList = [
        { color: 'black' },
        { color: 'white' },
        { color: 'red' },
        { color: 'blue' },
        { color: 'green' },
        { color: 'yellow' }
    ]

    currentColor = 'black';
    currentTool: string = 'pen';
 
    widthSet = CANVAS_CONFIG.widthSet;
    currentWidth = {
        pen: this.widthSet.pen[0],
        eraser: this.widthSet.eraser[2],
    };

    // iconify TEST //////////////////////
    eraserIcon = eraserIcon;
    shapeOutlineIcon = shapeOutlineIcon;
    markerIcon = markerIcon;
    //////////////////////////////////////


    constructor() { }

    ngOnInit(): void {
    }

}
