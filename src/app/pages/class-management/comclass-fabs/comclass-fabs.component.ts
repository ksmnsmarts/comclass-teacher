import { Component, OnInit } from '@angular/core';

import { ZoomService } from 'src/app/0.shared/services/zoom/zoom.service'

import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';


@Component({
  selector: 'app-comclass-fabs',
  templateUrl: './comclass-fabs.component.html',
  styleUrls: ['./comclass-fabs.component.scss']
})
export class ComclassFabsComponent implements OnInit {

  constructor(
    private viewInfoService: ViewInfoService,
    private zoomService: ZoomService

  ) { }

  ngOnInit(): void {

  }


  /**
   * Zoom Button에 대한 동작
   * - viewInfoService의 zoomScale 값 update
   *
   * @param action : 'fitToWidth' , 'fitToPage', 'zoomIn', 'zoomOut'
   */
  clickZoom(action:any){
    console.log(">> Click Zoom: ", action);

    const docNum = this.viewInfoService.state.pageInfo.currentDocNum;
    const currentPage = this.viewInfoService.state.pageInfo.currentPage;
    const prevZoomScale = this.viewInfoService.state.pageInfo.zoomScale;

    const newZoomScale = this.zoomService.calcZoomScale(action, docNum, currentPage, prevZoomScale);

    this.viewInfoService.updateZoomScale(newZoomScale);

  }

}
