import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { distinctUntilChanged, pairwise, Subject, takeUntil } from 'rxjs';
import { CanvasService } from 'src/app/0.shared/services/canvas/canvas.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { RenderingService } from 'src/app/0.shared/services/rendering/rendering.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';

@Component({
    selector: 'comclass-slide-view',
    templateUrl: './comclass-slide-view.component.html',
    styleUrls: ['./comclass-slide-view.component.scss']
})
export class ComclassSlideViewComponent implements OnInit {

    @ViewChildren('thumb') thumRef: QueryList<ElementRef> // 부모 thumb-item 안에 자식 element
    @ViewChildren('thumbWindow') thumbWindowRef: QueryList<ElementRef>

    
    private unsubscribe$ = new Subject<void>();


    currentDocId: any
    currentDocNum: any; // 선택한 pdf
    currentPageNum: number = 0;

    thumbWindow: HTMLDivElement;
    thumbWindowSize = {
        width: '',
        height: ''
    };

    thumbArray = []; // page별 thumbnail size
    scrollRatio: any;


    constructor(
        private canvasService: CanvasService,
        private renderingService: RenderingService,
        private viewInfoService: ViewInfoService,
        private eventBusService: EventBusService,
    ) { }




    ngOnInit(): void {
        // PageInfo 저장해서 사용
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged(), pairwise())
            .subscribe(([prevViewInfo, viewInfo]) => {

                // // 문서가 로드되지 않은 경우
                // if (!viewInfo.isDocLoaded) return;

                // 현재 Current Page Info 저장
                this.currentDocId = viewInfo.pageInfo.currentDocId;
                this.currentDocNum = viewInfo.pageInfo.currentDocNum;
                this.currentPageNum = viewInfo.pageInfo.currentPage;
                
                // File이 변경된 경우 thumbnail 다시 그리기
                // if (prevViewInfo.loadedDate !== viewInfo.loadedDate) {
                //   this.renderThumbnails();
                // }
                // Thumbnail Mode로 전환된 경우 Thumbnail Rendering
                if (prevViewInfo.leftSideView != 'thumbnail' && viewInfo.leftSideView == 'thumbnail') {
                    this.renderThumbnails();
                }

            });

        // container Scroll, Size, 판서event
        this.eventBusListeners();
    }



    ngOnDestory(): void {
        // unsubscribe all subscription
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
      }



    /**
   * Event Bus 관련 Listeners
   * Thumbnail Window 관련
   * 판서 Event 관련
   */
    eventBusListeners() {
        
        /*--------------------------------------
            Scroll event에 따라서 thumbnail window 위치/크기 변경
            --> broadcast from comclass component
        --------------------------------------*/
        this.eventBusService.on('change:containerScroll', this.unsubscribe$, async (data) => {
            console.log('thumnail window')
            this.thumbWindow = this.thumbWindowRef.last.nativeElement;
            this.thumbWindow.style.left = data.left * this.scrollRatio + 'px';
            this.thumbWindow.style.top = data.top * this.scrollRatio + 'px';
        })

        /*-------------------------------------------
            zoom, page 전환등을 하는 경우
    
            1. scroll에 필요한 ratio 계산(thumbnail과 canvas의 크기비율)은 여기서 수행
            2. thumbnail의 window size 계산 수행
        ---------------------------------------------*/
        this.eventBusService.on('change:containerSize', this.unsubscribe$, async (data) => {

            this.scrollRatio = this.thumbArray[this.currentPageNum - 1].width / data.coverWidth;
            this.thumbWindowSize = {
                width: this.thumbArray[this.currentPageNum - 1].width * data.ratio.w + 'px',
                height: this.thumbArray[this.currentPageNum - 1].height * data.ratio.h + 'px'
            };

            // console.log('<---[BUS] change:containerSize ::  this.thumbWindowSize : ', this.thumbWindowSize)
        });

    }

    /////////////////////////////////////////////////////////////////////////////////////////


    /**
    * Thumbnail Click
    *
    * @param pageNum 페이지 번호
    * @returns
    */
    clickThumb(pageNum) {
        if (pageNum == this.currentPageNum) return; // 동일 page click은 무시

        console.log('>> [clickThumb] change Page to : ', pageNum);
        this.viewInfoService.updateCurrentPageNum(pageNum);
    }


    /**
     * File list로 이동
     */
    backToFileList() {
        this.viewInfoService.setViewInfo({ leftSideView: 'fileList' });
    }

    /**
     * 문서 Load에 따른 thumbnail 생성 및 Rendering
     *
     */
    async renderThumbnails() {
        // const numPages = this.viewInfoService.state.numPages;
        const numPages = this.viewInfoService.state.documentInfo[this.currentDocNum - 1].numPages;

        this.thumbArray = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            /*-----------------------------------------------------------
              1. get size of thumbnail canvas --> thumbnail element 생성.
              - width, height, scale return.
            --------------------------------------------------------------*/
            const thumbSize = this.canvasService.getThumbnailSize(this.currentDocNum, pageNum);
            this.thumbArray.push(thumbSize);
        }

        await new Promise(res => setTimeout(res, 0));

        // Thumbnail Background (PDF)
        for (let i = 0; i < this.thumRef.toArray().length; i++) {
            await this.renderingService.renderThumbBackground(this.thumRef.toArray()[i].nativeElement, this.currentDocNum, i + 1);
        };


    }

}


