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


    //////////////////////////////////////
    docLength;


    //////////////////////////////////////

    constructor(
        private eventBusService: EventBusService,
        private fileService: FileService,
    ) { }

    ngOnInit(): void {

        this.eventBusService.on('open the blank pdf', this.unsubscribe$, (data) => {
            this.newpageEvent(data)
        })
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
                this.fileService.getFile('vcanvas.pdf',(result) => {
                    this.openFile(result.files, result.format);
                });
                break;
            // case 'hcanvas':
            //     this.fileService.getFile('hcanvas.pdf', function(result) {
            //         openFile(result.files, result.format);
            //     });
            //     break;
            // case 'openFile':
            //     this.dialogService.openFile(event).then((result) => {
            //         openFile(result.files, result.format);
            //     }, () => {});
            //     break;
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
    async openFile (fileInput, sourceType) {
        console.log('\n> open File...');

        console.log(fileInput);
        const aFILE = fileInput[0];
        if (!aFILE) {
            alert('파일을 선택해주세요!');
            return;
        }

        // check valid fomat
        // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
        const fileFormat = aFILE.name.split('.').pop().toLowerCase();

        if ((sourceType === "pdf" && fileFormat !== 'pdf')
            || (sourceType === "gstd" && fileFormat !== 'gstd')) {
            // dialogService.simpleToast('지원하지 않는 파일형식입니다.', 'error');
            return;
        }

        /*----------------------------
            pdf / gstd File open
        -----------------------------*/
        if (sourceType === "pdf" || sourceType === "gstd") {
            // dialogService.showSpinner();

            const result = await this.fileService.openDoc(aFILE, sourceType);
            if (!result.success) {
                alert("문서 변환중 오류가 발생하였습니다.");
                // dialogService.hideSpinner();
                return;
            }

            console.log('\n> start Thumbnail Rendering...');
            this.docLength = result.docLength; // 전체 문서 길이

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
    };
}
