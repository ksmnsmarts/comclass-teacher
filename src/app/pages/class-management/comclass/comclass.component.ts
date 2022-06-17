import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { FileService } from 'src/app/0.shared/services/file/file.service';
import { ZoomService } from 'src/app/0.shared/services/zoom/zoom.service';
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
  //////////////////////////////////////
  docLength;

  //////////////////////////////////////

  constructor(
    private eventBusService: EventBusService,
    private fileService: FileService,
    private viewInfoService: ViewInfoService,
    private pdfStorageService: PdfStorageService,
    private zoomService: ZoomService
  ) {}

  ngOnInit(): void {
    this.eventBusService.on('open the blank pdf', this.unsubscribe$, (data) => {
      this.newpageEvent(data);
      this.isDocLoaded = true;
    });
    this.eventBusService.on('openFile', this.unsubscribe$, (data) => {
      console.log('event Bus == openfile');
      this.openFile(data.files, data.type);
      this.isDocLoaded = true;
    });
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

    console.log(fileInput);
    const aFILE = fileInput[0];
    if (!aFILE) {
      alert('파일을 선택해주세요!');
      return;
    }

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

    console.log('blank pdf start-------------------------');
    this.eventBusService.emit(new EventData('blank pdf', ''));

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
}
