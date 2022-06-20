import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { distinctUntilChanged, pairwise, pluck, Subject, takeUntil } from 'rxjs';
import { CANVAS_CONFIG } from 'src/app/0.shared/config/config';
import { CanvasService } from 'src/app/0.shared/services/canvas/canvas.service';
import { DrawingService } from 'src/app/0.shared/services/drawing/drawing.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { RenderingService } from 'src/app/0.shared/services/rendering/rendering.service';
import { ZoomService } from 'src/app/0.shared/services/zoom/zoom.service';
import { DrawStorageService } from 'src/app/0.shared/storage/draw-storage.service';
import { PdfStorageService } from 'src/app/0.shared/storage/pdf-storage.service';
import { EditInfoService } from 'src/app/0.shared/store/edit-info.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';

@Component({
    selector: 'comclass-canvas',
    templateUrl: './comclass-canvas.component.html',
    styleUrls: ['./comclass-canvas.component.scss'],
})
export class ComclassCanvasComponent implements OnInit {
    private unsubscribe$ = new Subject<void>();
    private currentDocNum: Number;
    private currentPage: Number;

    editDisabled = true;
    dragOn = false;

    currentToolInfo = {
        type: '',
        color: '',
        width: '',
    };

    // preRendering을 위한 변수
    prevViewInfo; //'fileList', 'thumbnail';

    // static: https://stackoverflow.com/questions/56359504/how-should-i-use-the-new-static-option-for-viewchild-in-angular-8
    @ViewChild('canvasContainer', { static: true })
    public canvasContainerRef: ElementRef;
    @ViewChild('coverCanvas', { static: true }) public coverCanvasRef: ElementRef;
    @ViewChild('teacherCanvas', { static: true })
    public teacherCanvasRef: ElementRef;
    @ViewChild('studentGuideCanvas', { static: true })
    public studentGuideCanvasRef: ElementRef;
    @ViewChild('teacherGuideCanvas', { static: true })
    public teacherGuideCanvasRef: ElementRef;
    @ViewChild('bg', { static: true }) public bgCanvasRef: ElementRef;
    @ViewChild('tmp', { static: true }) public tmpCanvasRef: ElementRef;

    canvasContainer: HTMLDivElement;
    coverCanvas: HTMLCanvasElement;
    teacherCanvas: HTMLCanvasElement;
    studentGuideCanvas: HTMLCanvasElement;
    teacherGuideCanvas: HTMLCanvasElement;
    bgCanvas: HTMLCanvasElement;
    tmpCanvas: HTMLCanvasElement;

    rendererEvent1: any;

    constructor(
        private viewInfoService: ViewInfoService,
        private drawingService: DrawingService,
        private canvasService: CanvasService,
        private renderingService: RenderingService,
        private pdfStorageService: PdfStorageService,
        private eventBusService: EventBusService,
        private zoomService: ZoomService,
        private drawStorageService: DrawStorageService,
        private renderer: Renderer2,
        private editInfoService: EditInfoService,
    ) { }

    // Resize Event Listener
    @HostListener('window:resize') resize() {
        const newWidth = window.innerWidth - CANVAS_CONFIG.sidebarWidth;
        const newHeight = window.innerHeight - CANVAS_CONFIG.navbarHeight;
        // sidenav 열릴때 resize event 발생... 방지용도.
        if (
            CANVAS_CONFIG.maxContainerWidth === newWidth &&
            CANVAS_CONFIG.maxContainerHeight === newHeight
        ) {
            return;
        }
        CANVAS_CONFIG.maxContainerWidth = newWidth;
        CANVAS_CONFIG.maxContainerHeight = newHeight;
        this.onResize();
    }

    ngOnInit(): void {
        this.initCanvasSet();

        ////////////////////////////////////////////////
        // Document가 Update 된 경우
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('pageInfo'), distinctUntilChanged())
            .subscribe((pageInfo) => {
                console.log(pageInfo);
                this.currentDocNum = pageInfo.currentDocNum;
                this.currentPage = pageInfo.currentPage;
                // 초기 load 포함 변경사항에 대해 수행
                // (doc change, page change, zoom change 등)
                if (pageInfo.currentDocId) {
                    this.onChangePage();
                }
            });
        ///////////////////////////////////////////////

        this.eventBusService.on('blank pdf', this.unsubscribe$, () => {
            console.log('문서 열어');
            //나중에 수정

            this.onChangePage();
        });


        ////////////////////////////////////////////////
        // 현재 sideBar view 정보 받아오기
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged(), pairwise())
            .subscribe(([prevViewInfo, viewInfo]) => {

                console.log(prevViewInfo.leftSideView)

                // 현재 sideBar doc. view 정보 받아서 저장.
                this.prevViewInfo = prevViewInfo.leftSideView


            });
        ///////////////////////////////////////////////



        // Tool update(nav Menu)에 따른 event handler 변경
        this.editInfoService.state$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((editInfo) => {
                console.log('[Editor Setting]: ', editInfo);

                this.editDisabled = editInfo.toolDisabled || editInfo.editDisabled;

                // drag Enable
                this.dragOn = false;
                if (editInfo.mode == 'move') this.dragOn = true;

                const currentTool = editInfo.tool;
                this.currentToolInfo = {
                    type: editInfo.tool, // pen, eraser
                    color: editInfo.toolsConfig[currentTool].color,
                    width: editInfo.toolsConfig[currentTool].width,
                };
                console.log(this.currentToolInfo);

                const zoomScale = this.viewInfoService.state.zoomScale;

                // text모드에서 갑작스럽게 다른 모드로 전환할경우
                // textarea 삭제
                if (editInfo.tool != 'text') {
                    var textInput = <HTMLInputElement>document.getElementById('textarea');
                    if (textInput) {
                        textInput.parentNode.removeChild(textInput);
                    }
                }

                // canvas Event Handler 설정
                this.canvasService.addEventHandler(
                    this.coverCanvas,
                    this.teacherCanvas,
                    this.currentToolInfo,
                    zoomScale
                );
            });

        // continer scroll Listener : thumbnail의 window 처리 용도
        this.rendererEvent1 = this.renderer.listen(
            this.canvasContainer,
            'scroll',
            (event) => {
                this.onScroll();
            }
        );

        this.eventBusListeners();
    }

    ngOnDestroy() {
        // this.canvasService.releaseEventHandler();

        this.unsubscribe$.next();
        this.unsubscribe$.complete();

        // render listener 해제
        this.rendererEvent1();

        // pdf memory release
        this.pdfStorageService.memoryRelease();
    }

    eventBusListeners() {
        // board-nav로 부터 현재 페이지 드로잉 이벤트 삭제
        // 다시 페이지 렌더링
        this.eventBusService.on('rmoveDrawEventPageRendering', this.unsubscribe$, (data) => {
            const viewInfo = this.viewInfoService.state;
            const docNum = viewInfo.pageInfo.currentDocNum;
            const pageNum = viewInfo.pageInfo.currentPage;
            const zoomScale = viewInfo.pageInfo.zoomScale;
            if (this.currentDocNum == docNum && this.currentPage == pageNum) {
                this.pageRender(docNum, pageNum, zoomScale)
            }
        })
    }



    initCanvasSet() {
        this.coverCanvas = this.coverCanvasRef.nativeElement;
        this.teacherGuideCanvas = this.teacherGuideCanvasRef.nativeElement;

        this.teacherCanvas = this.teacherCanvasRef.nativeElement;
        this.studentGuideCanvas = this.studentGuideCanvasRef.nativeElement;

        this.bgCanvas = this.bgCanvasRef.nativeElement;
        this.tmpCanvas = this.tmpCanvasRef.nativeElement;

        this.canvasContainer = this.canvasContainerRef.nativeElement;

        /* container size 설정 */
        CANVAS_CONFIG.maxContainerHeight =
            window.innerHeight - CANVAS_CONFIG.navbarHeight; // pdf 불러오기 사이즈
        CANVAS_CONFIG.maxContainerWidth =
            window.innerWidth - CANVAS_CONFIG.sidebarWidth;

        CANVAS_CONFIG.deviceScale = this.canvasService.getDeviceScale(
            this.coverCanvas
        );
    }

    /**
     * Scroll 발생 시
     */
    onScroll() {
        if (this.viewInfoService.state.leftSideView != 'thumbnail') return;

        this.eventBusService.emit(
            new EventData('change:containerScroll', {
                left: this.canvasContainer.scrollLeft,
                top: this.canvasContainer.scrollTop,
            })
        );
    }
    /**
     * change Page : 아래 사항에 대해 공통으로 사용
     * - 최초 Load된 경우
     * - 페이지 변경하는 경우
     * - 문서 변경하는 경우
     * - scale 변경하는 경우
     */
    onChangePage() {
        const pageInfo = this.viewInfoService.state.pageInfo;

        //document Number -> 1부터 시작.
        const docNum = pageInfo.currentDocNum;
        const pageNum = pageInfo.currentPage;
        const zoomScale = pageInfo.zoomScale;

        console.log(
            `>> changePage to doc: ${docNum}, page: ${pageNum}, scale: ${zoomScale} `
        );

        // // 기존의 rx drawing event 삭제: 다른 page에 그려지는 현상 방지
        // this.drawingService.stopRxDrawing();

        // set Canvas Size
        const ratio = this.canvasService.setCanvasSize(
            docNum,
            pageNum,
            zoomScale,
            this.canvasContainer,
            this.coverCanvas,
            this.teacherCanvas,
            this.bgCanvas,
            this.studentGuideCanvas,
            this.teacherGuideCanvas,
            this.tmpCanvas
        );
        // set Canvas Size
        // const ratio = this.setCanvasSize(docNum, pageNum, zoomScale);
        // BG & Board Render
        this.pageRender(docNum, pageNum, zoomScale);

        // Canvas Event Set
        this.canvasService.addEventHandler(
            this.coverCanvas,
            this.teacherCanvas,
            this.currentToolInfo,
            zoomScale
        );


        // Canvas Event Set
        this.canvasService.addEventHandler(this.coverCanvas, this.teacherCanvas, this.currentToolInfo, zoomScale);

        // Thumbnail window 조정
        if (this.viewInfoService.state.leftSideView === 'thumbnail') {
            this.eventBusService.emit(new EventData('change:containerSize', {
                ratio,
                coverWidth: this.coverCanvas.width,
            }));
        }

        // scroll bar가 있는 경우 page 전환 시 초기 위치로 변경
        this.canvasContainer.scrollTop = 0;
        this.canvasContainer.scrollLeft = 0;
    };


    /**
     * Canvas size 설정
     *
     * @param currentDocNum
     * @param currentPage
     * @param zoomScale
     * @returns
     */
    setCanvasSize(currentDocNum, currentPage, zoomScale) {
        // return this.canvasService.setCanvasSize(currentDocNum, currentPage, zoomScale, this.canvasContainer, this.coverCanvas, this.teacherGuideCanvas, this.teacherCanvas, this.bgCanvas);
        return this.canvasService.setCanvasSize(currentDocNum, currentPage, zoomScale, this.canvasContainer, this.coverCanvas, this.teacherCanvas, this.bgCanvas, this.studentGuideCanvas, this.teacherGuideCanvas, this.tmpCanvas);
    }

    /**
 * draw + pdf rendering
 *
 * @param currentDocNum
 * @param currentPage
 * @param zoomScale
 */
    async pageRender(currentDocNum, currentPage, zoomScale) {

        // 화면을 급하게 확대하거나 축소 시 깜빡거리는 UI 측면 문제 해결 위한 함수
        // this.preRenderBackground(currentPage)

        console.log('>>> page Render! [background and board] + addEventHandler');

       
        // board rendering
        const drawingEvents = this.drawStorageService.getDrawingEvents(currentDocNum, currentPage);
        this.renderingService.renderBoard(this.teacherCanvas, zoomScale, drawingEvents);

         // PDF Rendering
        await this.renderingService.renderBackground(this.tmpCanvas, this.bgCanvas, currentDocNum, currentPage);
    }

    /**
 * Background pre rendering
 * - Main bg를 그리기 전에 thumbnail image 기준으로 배경을 미리 그림.
 * - UI 측면의 효과
 * @param pageNum page 번호
 */
    preRenderBackground(pageNum) {
        const targetCanvas = this.bgCanvas
        const ctx = targetCanvas.getContext("2d");
        const imgElement: any = document.getElementById('thumb_' + pageNum);

        /**************************************************
        * 처음 화이트보드에 들어오면 thumbnail view 아니라 fileList view이기 때문에
        * document.getElementById('thumb_' + pageNum) (이미지)가 정의되지 않아 오류가 난다.
        * 그래서 doc을 클릭하여 thumbnail view 일 경우에만 실행하도록 설정함.
        ****************************************************/
        if (this.prevViewInfo === 'thumbnail') {
            ctx.drawImage(imgElement, 0, 0, targetCanvas.width, targetCanvas.height);
        }
    }

    /**
*
* ViewInfo Store update
* -> document Info 부분 udpate
*    - document _id, currentPage, numPages, fileName
*
* -> currentDocId, current DocNum, currentPage field 초기화
*
*/

    updateViewInfoStore() {
        let documentInfo = [...this.viewInfoService.state.documentInfo];
        const diff = this.pdfStorageService.pdfVarArray.length - documentInfo.length
        if (diff > 0) {
            for (let item of this.pdfStorageService.pdfVarArray) {
                // 기존에 없던 문서인 경우 추가
                const isExist = documentInfo.some((doc) => doc._id === item._id)
                if (!isExist) {
                    documentInfo.push({
                        _id: item._id,
                        currentPage: 1,
                        numPages: item.pdfPages.length,
                        fileName: item.fileName
                    });
                }
            };

        } else if (diff < 0) {
            documentInfo = documentInfo.filter((item) => this.pdfStorageService.pdfVarArray.some((element) => element._id == item._id))
        }
        const obj: any = {
            documentInfo: documentInfo
        }


        // 최초 load인 경우 document ID는 처음 것으로 설정
        if (!this.viewInfoService.state.pageInfo.currentDocId) {
            obj.pageInfo = {
                currentDocId: documentInfo[0]?._id,
                currentDocNum: 1,
                currentPage: 1,
                zoomScale: this.zoomService.setInitZoomScale()
            }
        }


        // viewInfoService 현재 바라보는 문서가 있을경우 함수 실행
        if (this.viewInfoService.state.pageInfo.currentDocId) {
            // 문서 삭제 시 현재 바라보는 문서와 같은 곳일 경우 팝업 창과 함께 첫 화이트보드로 돌아온다.
            // 현재 바라보는 문서 ID와 DB에서 받아온 문서 ID가 일치하는게 없으면 첫 페이지로 돌아오고 문서가 삭제됐다고 알림
            const res = this.pdfStorageService.pdfVarArray.filter((x) => x._id == this.viewInfoService.state.pageInfo.currentDocId);
            console.log(res)
            if (res.length == 0) {
                obj.pageInfo = {
                    currentDocId: documentInfo[0]._id,
                    currentDocNum: 1,
                    currentPage: 1,
                    zoomScale: this.zoomService.setInitZoomScale()
                }
                obj.leftSideView = 'fileList';
                alert('The pdf file has been deleted');
            }
        }


        this.viewInfoService.setViewInfo(obj);
    }
    ///////////////////////////////////////////////////////////


    /**
     * 창 크기 변경시
     *
     */
    onResize() {
        // if (!this.viewInfoService.state.isDocLoaded) return;

        // Resize시 container size 조절.
        const ratio = this.canvasService.setContainerSize(this.coverCanvas, this.canvasContainer);

        if (this.viewInfoService.state.leftSideView != 'thumbnail') return;

        // thumbnail window 크기 변경을 위한 처리.
        this.eventBusService.emit(new EventData("change:containerSize", {
            ratio,
            coverWidth: this.coverCanvas.width,
        }));

    }



}
