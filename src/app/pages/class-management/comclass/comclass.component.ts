import { Component, OnInit } from '@angular/core';
import { lastValueFrom, Subject } from 'rxjs';
import { pluck, takeUntil } from 'rxjs/operators';

import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';

import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { FileService } from 'src/app/0.shared/services/file/file.service';
import { ZoomService } from 'src/app/0.shared/services/zoom/zoom.service'

import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';

import { PdfStorageService } from 'src/app/0.shared/storage/pdf-storage.service';
import { DrawStorageService } from 'src/app/0.shared/storage/draw-storage.service';

import { ActivatedRoute } from '@angular/router';
import { ClassService } from 'src/app/0.shared/services/class/class.service';
import { ClassInfoService } from 'src/app/0.shared/store/class-info';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { EditInfoService } from 'src/app/0.shared/store/edit-info.service';






/**
 * Main Component
 * - Socket 처리
 * - PDF File 변환 처리
 * - PDF, 판서 저장 처리
 * - API 처리
 */

@Component({
    selector: 'app-comclass',
    templateUrl: './comclass.component.html',
    styleUrls: ['./comclass.component.scss']
})
export class ComclassComponent implements OnInit {

    // 화이트보드 비디오 오버레이
    hiddenVideoMode = false;
    dragOn = true;
    classId;
    private unsubscribe$ = new Subject<void>();
    private socket;
    id;
    mobileWidth: any;
    currentMembersCount: any;
    spinner: any;
    // Left Side Bar
    leftSideView;

    mode = 'defaultMode';

    constructor(
        private comclassService: ClassService,
        private viewInfoService: ViewInfoService,
        private eventBusService: EventBusService,
        private classInfoService: ClassInfoService,
        private pdfStorageService: PdfStorageService,
        private drawStorageService: DrawStorageService,
        private fileService: FileService,
        private zoomService: ZoomService,
        private socketService: SocketService,
        private route: ActivatedRoute,
        private editInfoService: EditInfoService
    ) {
        this.socket = this.socketService.socket;
    }

    ngOnInit(): void {

        this.mobileWidth = window.screen.width;

        ////////////////////////////////////////////////
        // param을 가져와 룸 번호 클래스 생성
        this.classId = this.route.snapshot.params['id'];
        // this.socket.emit('join:class', this.classId);
        this.getMeetingInfo()

        this.updateDocuments();
        ////////////////////////////////////////////////

        /////////////////////////////////////////////
        // 새로운 문서 upload 알림 수신

        this.socket.on('check:documents', () => {
            console.log('<--- [SOCKET] check:document');
            this.updateDocuments();
        });
        ///////////////////////////////////////////

        ////////////////////////////////////////////////
        // 새로운 판서 Event 수신
        this.socket.on('draw:teacher', ((data: any) => {
            // console.log('<---[SOCKET] rx drawEvent :', data);
            // console.log(data.drawingEvent, data.docNum, data.pageNum)
            // if (data.drawingEvent.tool.type != 'pointer' && data.participantName == 'teacher' && data.mode == 'syncMode') {
            if (data.drawingEvent.tool.type != 'pointer' && data.participantName == 'teacher') {
                this.drawStorageService.setDrawEvent(data.docNum, data.pageNum, data.drawingEvent);
            }
            this.eventBusService.emit(new EventData('receive:drawEvent', data));
        }))

        ////////////////////////////////////////////////

        ////////////////////////////////////////////////
        // 새로운 판서 Event 수신
        this.socket.on('clearDrawingEvents', ((data: any) => {
            this.drawStorageService.clearDrawingEvents(data.currentDocNum, data.currentPage);
            this.eventBusService.emit(new EventData('receive:clearDrawEvent', data));
        }))

        ////////////////////////////////////////////////


        ////////////////////////////////////////////////////////
        // sidebar의 view mode : HTML 내에서 사용
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('leftSideView'))
            .subscribe((leftSideView) => {
                this.leftSideView = leftSideView;

                console.log('[info] current Left Side View: ', leftSideView);
            });
        ///////////////////////////////////////////////////////



        // 새로운 판서 Event local 저장 + 서버 전송
        this.eventBusService.on('gen:newDrawEvent', this.unsubscribe$, async (data) => {
            console.log(data)
            const pageInfo = this.viewInfoService.state.pageInfo;
            // local Store 저장
            if (data.tool.type != 'pointer') {
                this.drawStorageService.setDrawEvent(pageInfo.currentDocNum, pageInfo.currentPage, data);
            }
            data.mode = this.editInfoService.state.syncMode;

            const newDataEvent = {

                participantName: 'teacher',
                drawingEvent: data,
                docId: pageInfo.currentDocId,
                docNum: pageInfo.currentDocNum,
                pageNum: pageInfo.currentPage
            }

            console.log(newDataEvent);

            this.socket.emit('draw:teacher', newDataEvent);

        });
        //////////////////////////////////////////////////////////////////


        this.eventBusService.on("studentList", this.unsubscribe$, (data) => {
            console.log(data)
            this.mode = data;
        })
    }
    ///////////////////////////////////////////////////////////

    ngOnDestroy() {
        // unsubscribe all subscription
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        // this.pdfStorageService.memoryRelease();
        // socket off
        this.socket.off("draw:teacher");
        this.socket.off("check:documents");
        this.socket.close()
    }

    async getMeetingInfo(){
      const data = {
        _id: this.classId
      }
      const classInfo: any = await lastValueFrom(this.comclassService.getClassInfo(data))
      console.log(classInfo)
      this.socket.emit('join:class', classInfo);
      this.socket.on('update:classInfo', (classInfo) => {
        console.log('classInfo', classInfo)
        this.classInfoService.setClassInfo(classInfo);
      })
    }
    /**
     * Open Local PDF File
     *  - Board File View Component의 @output
     *  - File upload
     *
     * @param newDocumentFile
     */
    onDocumentOpened(newDocumentFile): void {

        const formData: any = new FormData();
        formData.append("DocFile", newDocumentFile);

        this.comclassService.uploadDocument(formData, this.classId).subscribe((result: any) => {
            console.log('[API] <---- upload completed:', result);

            // document upload 확인 후 socket room안의 모든 User에게 전송 (나 포함)
            this.socket.emit('check:documents', this.classId);


        }, (err) => {
            console.log(err);
        });
    }



    /**
     *
    * 서버에서 meeting id에 따른 document data 수신
    * - 수신 후 필요한 document data download
    * - pdf와 draw event local에 저장
    *
    */
    async updateDocuments() {
        console.log('>> do Update Documents');

        const data = {
            classId: this.classId
        }

        // Meeting ID에 해당하는 document 정보 수신
        const result: any = await this.comclassService.getDocumentsInfo(data).toPromise();

        console.log('[API] <----- RX Documents Info : ', result);

        // 문서가 없으면 동작 안함
        if (!result.docResult || result.docResult.length == 0) {
            console.log('no Documents');
            return null;
        }

        // 1. get PDF File & Generate Pdf File Buffer
        const docResult = await this.generatePdfData(result);

        // 2. PDF DRAW Storage Update
        await this.updatePdfAndDrawStorage(docResult);

        // 3. view status update
        this.updateViewInfoStore();

        ///////////////////////////////////////////////////////////////////
        /*---------------------------------------
          pdf 업로드 시 spinner
        -----------------------------------------*/
        this.eventBusService.on('spinner', this.unsubscribe$, (dialogRef) => {
            this.spinner = dialogRef;
        })

        if (this.spinner) {
            this.spinner.close();
        }
        ///////////////////////////////////////////////////////////////////
    }




    /**
     * 각 PDF document api 요청 / 수신
     * @param result
     * @returns
     */

    async generatePdfData(result) {
        const pdfArrayVar = this.pdfStorageService.pdfVarArray;

        // document 길이에 따라 반복 수행
        for (let i = 0; i < result.docResult.length; i++) {
            // this._docIdList.push(result.docResult[i]._id);
            const updatedTime = result.docResult[i].updatedAt;
            console.log("[[[ result length ]]]", result.docResult.length);
            console.log("[[[ result i ]]]", i);
            ////////////////////////////////////////////////////////////////////////
            // PDF File Buffer update
            // pdf가 load된 시간을 비교하여 변경된 경우에만 file 요청)
            // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Optional_chaining
            if (pdfArrayVar[i]?.updatedAt !== updatedTime) {
                try {
                    console.log(result.docResult[i]._id)
                    const data = {
                        _id: result.docResult[i]._id
                    }

                    // PDF File 정보 요청
                    const res = await lastValueFrom(this.comclassService.getPdfFile(data));

                    // Array buffer로 변환
                    const file = await this.fileService.readFile(res);

                    result.docResult[i].fileBuffer = file;

                    console.log(file)

                } catch (err) {
                    console.log(err);
                    return err;
                }
            }

            // 이미 있는 filebuffer에 대해서는 기존 array buffer값을 복사
            else {
                result.docResult[i].fileBuffer = pdfArrayVar[i].fileBuffer;
            }
            ////////////////////////////////////////////////////////////////////////

        }
        return result.docResult;

    }


    /**
     * 수신된 PDF Document 와 Draw Data 저장
     * - pdf 변환
     */
    async updatePdfAndDrawStorage(documentData) {

        console.log(">> do:update Pdf And Draw Storage");

        /*---------------------------------------
          pdf 관련 변수 초기화 : 기존의 pdf clear 및 destroy 수행
        -----------------------------------------*/
        this.pdfStorageService.memoryRelease();

        // 현재 저장된 PDF Array 변수
        let pdfVarArray = this.pdfStorageService.pdfVarArray;
        console.log(pdfVarArray)
        // 문서 개수의 차이
        const diff = documentData.length - pdfVarArray.length;
        console.log('diff : ', diff)
        // document length가 더 긴경우 : 배열 추가
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                pdfVarArray.push({});
            }
        }

        // document length가 더 짧은 경우 (현재는 없음 -> 추후 문서 삭제 등)
        // splice (a, b) a 번째 자리 수에 b 갯수 만큼 삭제
        // splice (a, b, 'c') a 번째 자리 수에 b 갯수 만큼 삭제 후 c 추가
        else if (diff < 0) {
            pdfVarArray.splice(0, (diff * -1));
        }

        for (let i = 0; i < documentData.length; i++) {
            //1. Document 별 판서 Event 저장
            this.drawStorageService.setDrawEventSet(i + 1, documentData[i].drawingEventSet);
            console.log(this.drawStorageService.drawVarArray)
            // 2. PDF 관련값 저장 및 PDF 변환
            pdfVarArray[i]._id = documentData[i]._id;
            pdfVarArray[i].fileBuffer = documentData[i].fileBuffer;
            pdfVarArray[i].updatedAt = documentData[i].updatedAt;
            pdfVarArray[i].fileName = documentData[i].originalFileName;

            // PDF 변환 및 추가 저장
            const result = await this.fileService.pdfConvert(pdfVarArray[i].fileBuffer);
            pdfVarArray[i].pdfDestroy = result.pdfDoc;
            pdfVarArray[i].pdfPages = result.pdfPages;
        }

        //  PDF Docouments storage에 저장
        this.pdfStorageService.setPdfVarArray(pdfVarArray);
        console.log(this.pdfStorageService.pdfVarArray)
        console.log(this.drawStorageService.drawVarArray)

        return;
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
        console.log(documentInfo)
        console.log(this.pdfStorageService.pdfVarArray)
        console.log(this.viewInfoService.state.pageInfo.currentDocId)
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
                currentDocId: documentInfo[0]._id,
                currentDocNum: 1,
                currentPage: 1,
                zoomScale: this.zoomService.setInitZoomScale(1, 1)
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
                    zoomScale: this.zoomService.setInitZoomScale(1, 1)
                }
                obj.leftSideView = 'fileList';
                alert('The pdf file has been deleted');
            }
        }


        this.viewInfoService.setViewInfo(obj);
    }
    ///////////////////////////////////////////////////////////

}
