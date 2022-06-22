import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, Subject, takeUntil } from 'rxjs';
import { CANVAS_CONFIG } from 'src/app/0.shared/config/config';
import { ClassService } from 'src/app/0.shared/services/class/class.service';
import { DrawingService } from 'src/app/0.shared/services/drawing/drawing.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { FileService } from 'src/app/0.shared/services/file/file.service';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { ZoomService } from 'src/app/0.shared/services/zoom/zoom.service';
import { DrawStorageService } from 'src/app/0.shared/storage/draw-storage.service';
import { PdfStorageService } from 'src/app/0.shared/storage/pdf-storage.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';

@Component({
    selector: 'app-comclass',
    templateUrl: './comclass.component.html',
    styleUrls: ['./comclass.component.scss'],
})
export class ComclassComponent implements OnInit {
    private unsubscribe$ = new Subject<void>();

    isDocLoaded = false;
    // Left Side Bar
    leftSideView;
    socket
    docLength;

    meetingId:any;

    constructor(
        private eventBusService: EventBusService,
        private fileService: FileService,
        private viewInfoService: ViewInfoService,
        private pdfStorageService: PdfStorageService,
        private zoomService: ZoomService,
        private drawStorageService: DrawStorageService,
        private socketService: SocketService,
        private classService: ClassService,
        private route: ActivatedRoute
    ) {
        this.socket = this.socketService.socket;
    }

    ngOnInit(): void {

        this.route.params.subscribe(params => {
            this.meetingId = params.id;
        });


        ////////////////////////////////////////////////
        // 새로운 판서 Event 수신
        this.socket.on('draw:teacher', (data: any) => {
            // console.log('<---[SOCKET] rx drawEvent :', data);
            // console.log(data.drawingEvent, data.docNum, data.pageNum)

            if (data.drawingEvent.tool.type != 'pointer') {
                this.drawStorageService.setDrawEvent(
                    data.docNum,
                    data.pageNum,
                    data.drawingEvent
                );
            }
            this.eventBusService.emit(new EventData('receive:drawEvent', data));
        });

        ////////////////////////////////////////////////

        /////////////////////////////////////////////////////////
        // 새로운 판서 Event local 저장 + 서버 전송
        this.eventBusService.on('gen:newDrawEvent', this.unsubscribe$, async (data) => {
            const pageInfo = this.viewInfoService.state.pageInfo;
            // local Store 저장
            if (data.tool.type != 'pointer') {
                this.drawStorageService.setDrawEvent(pageInfo.currentDocNum, pageInfo.currentPage, data);
            }

            const newDataEvent = {
                drawingEvent: data,
                docId: pageInfo.currentDocId,
                docNum: pageInfo.currentDocNum,
                pageNum: pageInfo.currentPage
            }

            // console.log(newDataEvent);

            this.socket.emit('draw:teacher', newDataEvent);

        });
        //////////////////////////////////////////////////////////////////

        // sidebar의 view mode : HTML 내에서 사용
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('leftSideView'))
            .subscribe((leftSideView) => {
                this.leftSideView = leftSideView;

                console.log('[info] current Left Side View: ', leftSideView);
        });

        // 문서가 있을 경우 문서열기 modal 가리기
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('documentInfo'))
            .subscribe((documentInfo) => {
                if(documentInfo.length > 0) {
                    this.isDocLoaded = true;
                }
        });

        this.eventBusService.on('open the blank pdf', this.unsubscribe$, (data) => {
            this.newpageEvent(data);
            this.isDocLoaded = true;
        });
        this.eventBusService.on('openFile', this.unsubscribe$, (data) => {
            console.log('event Bus == openfile');
            this.openFile(data.files, data.type);
            this.isDocLoaded = true;
        });
        this.eventBusService.on('isDocLoaded', this.unsubscribe$, (data) => {
            this.isDocLoaded = true;
        });
    }


    ngOnDestroy(): void {

        this.unsubscribe$.next();
        this.unsubscribe$.complete();

        
    }

    /**
     * PDF / GSTD / Media File 열기위해 받아오는 부분
     *
     * @param {file} fileInput input type file에서 불러온 data.
     * @param {string} sourceType pdf/gstd/media
     *
     */
    newpageEvent(event) {
        console.log('<--- event from newpage component :', event);
        switch (event) {
            case 'vcanvas':
                this.fileService.getFile('vcanvas.pdf', (result) => {
                    this.openFile(result.files, result.format);
                });
                break;
            case 'hcanvas':
                this.fileService.getFile('hcanvas.pdf', (result) => {
                    this.openFile(result.files, result.format);
                });
                break;

            default:
                break;
        }
    }

    /**
     * PDF / GSTD / Media File 열기
     *
     * @param {file} fileInput input type file에서 불러온 data.
     * @param {string} sourceType pdf/gstd/media
     *
     */
    async openFile(fileInput, sourceType) {
        console.log('\n> open File...');

        const aFILE = fileInput[0];
        if (!aFILE) {
            alert('파일을 선택해주세요!');
            return;
        }
        console.log(this.meetingId)

        ////////////////////////////////////////////////////////////////////////
        // 파일 업로드
        const formData: any = new FormData();
        formData.append("DocFile", aFILE);

        this.classService.uploadDocument(formData, this.meetingId).subscribe((result: any) => {
            console.log('[API] <---- upload completed:', result);

            // document upload 확인 후 socket room안의 모든 User에게 전송 (나 포함)
            // this.socket.emit('check:documents', this.meetingId);


        }, (err) => {
            console.log(err);
        });
        ////////////////////////////////////////////////////////////////////////


        // check valid fomat
        // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
        const fileFormat = aFILE.name.split('.').pop().toLowerCase();

        if (
            (sourceType === 'pdf' && fileFormat !== 'pdf') ||
            (sourceType === 'gstd' && fileFormat !== 'gstd')
        ) {
            // dialogService.simpleToast('지원하지 않는 파일형식입니다.', 'error');
            return;
        }

        /*----------------------------
                    pdf / gstd File open
                -----------------------------*/
        if (sourceType === 'pdf' || sourceType === 'gstd') {
            // dialogService.showSpinner();

            const result = await this.fileService.openDoc(aFILE, sourceType);
            if (!result.success) {
                alert('문서 변환중 오류가 발생하였습니다.');
                // dialogService.hideSpinner();
                return;
            }

            const documentInfo = [...this.viewInfoService.state.documentInfo];

            for (let item of this.pdfStorageService.pdfVarArray) {
                // 기존에 없던 문서인 경우 추가
                const isExist = documentInfo.some((doc) => doc._id === item._id);
                if (!isExist) {
                    documentInfo.push({
                        _id: item._id,
                        currentPage: 1,
                        numPages: item.pdfPages.length,
                        // fileName: item.fileName
                    });
                }
            }
            // console.log(this.pdfStorageService.pdfVar);
            const obj: any = {
                documentInfo: documentInfo,
            };

            // 최초 load인 경우 document ID는 처음 것으로 설정
            if (!this.viewInfoService.state.pageInfo.currentDocId) {
                obj.pageInfo = {
                    currentDocId: documentInfo[0]._id,
                    currentDocNum: 1,
                    currentPage: 1,
                    zoomScale: this.zoomService.setInitZoomScale(),
                };
            }
            this.viewInfoService.setViewInfo(obj);
        }

        this.drawStorageService.setDrawEventSet(1, 0);

        // this.eventBusService.emit(new EventData('blank pdf', ''));

        /*-------------------------------------------
                        Trigger Thumb Component
                         timeout --> 가끔 trigger 안되는 현상 방지.
                    ---------------------------------------------*/
        // $timeout(() => {
        //     thumbUpdateEvent({
        //         name: 'open:document',
        //         data: this.docLength
        //     });
        // }, 0);
    }

    /**
     * Open Local PDF File
     *  - Board File View Component의 @output
     *  - File upload
     *
     * @param newDocumentFile
     */
    async onDocumentOpened(newDocumentFile) {
        // this.pdfStorageService.memoryRelease();

        ////////////////////////////////////////////////////////////////////////
        // 파일 업로드
        // const formData: any = new FormData();
        // formData.append("DocFile", newDocumentFile);

        // this.classService.uploadDocument(formData, this.meetingId).subscribe((result: any) => {
        //     console.log('[API] <---- upload completed:', result);

        //     // document upload 확인 후 socket room안의 모든 User에게 전송 (나 포함)
        //     // this.socket.emit('check:documents', this.meetingId);
        // }, (err) => {
        //     console.log(err);
        // });
        ////////////////////////////////////////////////////////////////////////


        const numPages = await this.fileService.openDoc(newDocumentFile, 'pdf');

        const documentInfo = [...this.viewInfoService.state.documentInfo];

        for (let item of this.pdfStorageService.pdfVarArray) {
            // 기존에 없던 문서인 경우 추가
            const isExist = documentInfo.some((doc) => doc._id === item._id);
            if (!isExist) {
                documentInfo.push({
                    _id: item._id,
                    currentPage: 1,
                    numPages: item.pdfPages.length,
                    // fileName: item.fileName
                });
            }
        }
        // console.log(this.pdfStorageService.pdfVar);
        const obj: any = {
            documentInfo: documentInfo,
        };

        // 최초 load인 경우 document ID는 처음 것으로 설정
        if (!this.viewInfoService.state.pageInfo.currentDocId) {
            obj.pageInfo = {
                currentDocId: documentInfo[0]._id,
                currentDocNum: 1,
                currentPage: 1,
                zoomScale: this.zoomService.setInitZoomScale(),
            };
        }
        this.viewInfoService.setViewInfo(obj);
    }

    /**
     *
     * 서버에서 meeting id에 따른 document data 수신
     * - 수신 후 필요한 document data download
     * - pdf와 draw event local에 저장
     *
     */
    async updateDocuments() {
        // console.log('>> do Update Documents');

        // // Meeting ID에 해당하는 document 정보 수신
        // const result: any = await this.apiService.getDocumentsInfo(this.meetingId).toPromise();

        // console.log('[API] <----- RX Documents Info : ', result);

        // // 문서가 없으면 동작 안함
        // if (!result.docResult || result.docResult.length == 0) {
        //     console.log('no Documents');
        //     return null;
        // }

        // // 1. get PDF File & Generate Pdf File Buffer
        // const docResult = await this.generatePdfData(result);

        // // 2. PDF DRAW Storage Update
        // await this.updatePdfAndDrawStorage(docResult);

        // // 3. view status update
        this.updateViewInfoStore();
    }

    /**
     * 각 PDF document api 요청 / 수신
     * @param result
     * @returns
     */

    async generatePdfData(result) {
        // const pdfArrayVar = this.pdfStorageService.pdfVarArray;
        // // document 길이에 따라 반복 수행
        // for (let i = 0; i < result.docResult.length; i++) {
        //     // this._docIdList.push(result.docResult[i]._id);
        //     const updatedTime = result.docResult[i].updatedAt;
        //     ////////////////////////////////////////////////////////////////////////
        //     // PDF File Buffer update
        //     // pdf가 load된 시간을 비교하여 변경된 경우에만 file 요청)
        //     // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Optional_chaining
        //     if (pdfArrayVar[i]?.updatedAt !== updatedTime) {
        //         try {
        //             // PDF File 정보 요청
        //             const res = await this.apiService.getPdfFile(result.docResult[i]._id).toPromise()
        //             // Array buffer로 변환
        //             const file = await this.fileService.readFile(res);
        //             result.docResult[i].fileBuffer = file;
        //         } catch (err) {
        //             console.log(err);
        //             return err;
        //         }
        //     }
        //     // 이미 있는 filebuffer에 대해서는 기존 array buffer값을 복사
        //     else {
        //         result.docResult[i].fileBuffer = pdfArrayVar[i].fileBuffer;
        //     }
        //     ////////////////////////////////////////////////////////////////////////
        // }
        // return result.docResult;
    }

    /**
     * 수신된 PDF Document 와 Draw Data 저장
     * - pdf 변환
     */
    async updatePdfAndDrawStorage(documentData) {
        // console.log(">> do:update Pdf And Draw Storage");
        // console.log(documentData)
        // /*---------------------------------------
        //   pdf 관련 변수 초기화 : 기존의 pdf clear 및 destroy 수행
        // -----------------------------------------*/
        // this.pdfStorageService.memoryRelease();
        // // 현재 저장된 PDF Array 변수
        // let pdfVarArray = this.pdfStorageService.pdfVarArray;
        // console.log(pdfVarArray)
        // // 문서 개수의 차이
        // const diff = documentData.length - pdfVarArray.length;
        // console.log('diff : ', diff)
        // // document length가 더 긴경우 : 배열 추가
        // if (diff > 0) {
        //     for (let i = 0; i < diff; i++) {
        //         pdfVarArray.push({});
        //     }
        // }
        // // document length가 더 짧은 경우 (현재는 없음 -> 추후 문서 삭제 등)
        // // splice (a, b) a 번째 자리 수에 b 갯수 만큼 삭제
        // // splice (a, b, 'c') a 번째 자리 수에 b 갯수 만큼 삭제 후 c 추가
        // else if (diff < 0) {
        //     pdfVarArray.splice(0, (diff * -1));
        // }
        // for (let i = 0; i < documentData.length; i++) {
        //     //1. Document 별 판서 Event 저장
        //     this.drawStorageService.setDrawEventSet(i + 1, documentData[i].drawingEventSet);
        //     console.log(this.drawStorageService.drawVarArray)
        //     // 2. PDF 관련값 저장 및 PDF 변환
        //     pdfVarArray[i]._id = documentData[i]._id;
        //     pdfVarArray[i].fileBuffer = documentData[i].fileBuffer;
        //     pdfVarArray[i].updatedAt = documentData[i].updatedAt;
        //     pdfVarArray[i].fileName = documentData[i].originalFileName;
        //     // PDF 변환 및 추가 저장
        //     const result = await this.fileService.pdfConvert(pdfVarArray[i].fileBuffer);
        //     pdfVarArray[i].pdfDestroy = result.pdfDoc;
        //     pdfVarArray[i].pdfPages = result.pdfPages;
        // }
        // //  PDF Docouments storage에 저장
        // this.pdfStorageService.setPdfVarArray(pdfVarArray);
        // console.log(this.drawStorageService.drawVarArray)
        // return;
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
        console.log(documentInfo);
        console.log(this.pdfStorageService.pdfVarArray);
        console.log(this.viewInfoService.state.pageInfo.currentDocId);
        const diff =
            this.pdfStorageService.pdfVarArray.length - documentInfo.length;
        if (diff > 0) {
            for (let item of this.pdfStorageService.pdfVarArray) {
                // 기존에 없던 문서인 경우 추가
                const isExist = documentInfo.some((doc) => doc._id === item._id);
                if (!isExist) {
                    documentInfo.push({
                        _id: item._id,
                        currentPage: 1,
                        numPages: item.pdfPages.length,
                        fileName: item.fileName,
                    });
                }
            }
        } else if (diff < 0) {
            documentInfo = documentInfo.filter((item) =>
                this.pdfStorageService.pdfVarArray.some(
                    (element) => element._id == item._id
                )
            );
        }
        const obj: any = {
            documentInfo: documentInfo,
        };

        // 최초 load인 경우 document ID는 처음 것으로 설정
        if (!this.viewInfoService.state.pageInfo.currentDocId) {
            obj.pageInfo = {
                currentDocId: documentInfo[0]._id,
                currentDocNum: 1,
                currentPage: 1,
                zoomScale: this.zoomService.setInitZoomScale(),
            };
        }

        // viewInfoService 현재 바라보는 문서가 있을경우 함수 실행
        if (this.viewInfoService.state.pageInfo.currentDocId) {
            // 문서 삭제 시 현재 바라보는 문서와 같은 곳일 경우 팝업 창과 함께 첫 화이트보드로 돌아온다.
            // 현재 바라보는 문서 ID와 DB에서 받아온 문서 ID가 일치하는게 없으면 첫 페이지로 돌아오고 문서가 삭제됐다고 알림
            const res = this.pdfStorageService.pdfVarArray.filter(
                (x) => x._id == this.viewInfoService.state.pageInfo.currentDocId
            );
            console.log(res);
            if (res.length == 0) {
                obj.pageInfo = {
                    currentDocId: documentInfo[0]._id,
                    currentDocNum: 1,
                    currentPage: 1,
                    zoomScale: this.zoomService.setInitZoomScale(),
                };
                obj.leftSideView = 'fileList';
                alert('The pdf file has been deleted');
            }
        }

        this.viewInfoService.setViewInfo(obj);
    }
    ///////////////////////////////////////////////////////////
}
