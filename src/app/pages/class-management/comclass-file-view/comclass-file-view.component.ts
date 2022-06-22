import { Component, ElementRef, EventEmitter, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, pluck, Subject, takeUntil } from 'rxjs';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';
import { RenderingService } from 'src/app/0.shared/services/rendering/rendering.service';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { PdfStorageService } from 'src/app/0.shared/storage/pdf-storage.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';
import { OpenFileComponent } from '../comclass-newpage/open-file/open-file.component';

@Component({
    selector: 'comclass-file-view',
    templateUrl: './comclass-file-view.component.html',
    styleUrls: ['./comclass-file-view.component.scss']
})
export class ComclassFileViewComponent implements OnInit {


    // Open된 File을 white-board component로 전달
    @Output() newLocalDocumentFile = new EventEmitter();
    // image element
    @ViewChildren('thumb') thumRef: QueryList<ElementRef>



    private socket;
    private unsubscribe$ = new Subject<void>();


    documentInfo = [];
    meetingId;


    constructor(
        private renderingService: RenderingService,
        private viewInfoService: ViewInfoService,
        private pdfStorageService: PdfStorageService,
        private socketService: SocketService,
        private route: ActivatedRoute,

        private dialogService: DialogService,
        public dialog: MatDialog,
    ) {
        this.socket = this.socketService.socket;
    }



    ngOnInit(): void {

        this.route.params.subscribe(params => {
            this.meetingId = params.id;
        });


        // Document가 Update 된 경우 : File List rendering
        this.viewInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), pluck('documentInfo'), distinctUntilChanged())
            .subscribe(async (documentInfo) => {
                this.documentInfo = documentInfo;
                await new Promise(res => setTimeout(res, 0));

                console.log(this.documentInfo)

                    this.renderFileList();
                
            });
    }


    ngOnDestroy(): void {

        this.unsubscribe$.next();
        this.unsubscribe$.complete();
      }



    /**
    * PDF File 목록 표시
    * - file 변경시에 전체 다시 그림
    * - image 크기는 고정 size
    *
    * @param documentInfo
    * @returns
    */
    async renderFileList() {
        
        // File List Background 그리기 : 각 문서의 1page만 그림
        for (let i = 0; i < this.thumRef.toArray().length; i++) {
            await this.renderingService.renderThumbBackground(this.thumRef.toArray()[i].nativeElement, i + 1, 1);
        };
        // 아래와 같은 방식도 사용가능(참고용)
        // https://stackoverflow.com/questions/55737546/access-nth-child-of-viewchildren-querylist-angular
        // this.thumRef.forEach((element, index) => {
        //   this.renderingService.renderThumbBackground(element.nativeElement, index + 1, 1); // element, doc Number, page Number
        // });

    };



    /**
     * 새로운 File Load (Local)
     * - @output으로 main component(white-board.component로 전달)
     * @param event
     * @returns
     */
     handleUploadFileChanged(event) {
        const files: File[] = event.target.files;

        if (event.target.files.length === 0) {
            console.log('file 안들어옴');
            return;
        }

        // @OUTPUT -> white-board component로 전달
        this.newLocalDocumentFile.emit(event.target.files[0]);
    }



    /**
 * File List 에서 각 document 클릭
 *  - 해당 문서의 Thumbanil 표시화면으로 이동
 *  - viewInfo를 update
 * @param docId document ID
 */
    clickPdf(docId) {
        console.log(docId)
        console.log('>> click PDF : change to Thumbnail Mode');
        this.viewInfoService.changeToThumbnailView(docId);
    }


    openFile(){
        const dialogRef = this.dialog.open(OpenFileComponent, {
            data : this.meetingId.id,
        }) 
      
        dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        });
      
    }
}
