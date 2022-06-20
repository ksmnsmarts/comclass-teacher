import { Injectable } from '@angular/core';
import { PdfStorageService } from '../../storage/pdf-storage.service';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../apiService/api.service';

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/pdf/pdf.worker.js';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor(
        private pdfStorageService: PdfStorageService,
        private apiService: ApiService,
        private http: HttpClient
    ) { }


    /*------------------------------------------
              File read API
              - urlFlag: boolean:
              => true: 저장된 file 읽는 경우 => text로 read...
              => false: PDF 문서 불러오는 경우
          --------------------------------------------------*/
    async pdfReadFile(file, docFormat) {
        const fileReader = new FileReader();

        return new Promise(function (resolve, reject) {
            fileReader.onload = function (e) {
                resolve((<FileReader>e.target).result);
            };
            if (docFormat === 'gstd') {
                fileReader.readAsText(file);
            } else {
                // pdf
                fileReader.readAsArrayBuffer(file);
            }
        });
    }

    /**
     *
     * Pdf convert API
     *  https://mozilla.github.io/pdf.js/examples/
     * - cmap
     *   https://github.com/wojtekmaj/react-pdf/blob/master/README.md
     *  https://github.com/mozilla/pdf.js/issues/9380
     *
     * @param file
     * @returns
     */
    async pdfConvert(file) {
        const CMAP_URL = 'assets/cmaps/';
        const CMAP_PACKED = true;
        const pdfPages = [];

        try {
            // new version
            const pdfDoc = await pdfjsLib.getDocument({
                data: file,
                cMapUrl: CMAP_URL,
                cMapPacked: CMAP_PACKED,
            }).promise;

            for (let i = 0; i < pdfDoc.numPages; i++) {
                pdfPages[i] = await pdfDoc.getPage(i + 1);
            }
            // destroy를 위해 pdfDoc도 반환.
            return {
                pdfPages: pdfPages,
                pdfDoc: pdfDoc, // for destroy
            };
        } catch (err) {
            console.log(err);
            alert('오류가 발생하였습니다 : ' + err);
            return {
                success: false,
            };
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*---------------------------------------------
              가로/세로 빈 문서 받아오기
      ---------------------------------------------*/
    getFile(name, callback) {
        console.log('--- > Get blank canvas :', name);

        const arr = [];
        const request = new XMLHttpRequest();
        request.open('GET', '/assets/pdf/' + name, true);
        request.responseType = 'blob';
        request.onload = function () {
            console.log('onload');
            const file = new File([request.response], name, {
                type: 'application/pdf',
            });
            arr.push(file);
            const result = {
                files: arr,
                format: 'pdf',
            };
            callback(result);
        };
        request.send();
    }

    /*---------------------------------
              PDF/GSTD 열기
              - 2가지에 대해서 통합해서 사용.
          ----------------------------------*/
    async openDoc(aFile, type) {
        // 현재 저장된 PDF Array 변수
        let pdfVarArray = this.pdfStorageService.pdfVarArray;
        // 업로드한 파일 buffer형식으로 변환
        let file: any = await this.pdfReadFile(aFile, type);
        let docArrayBuffer;
        const pdfVar: any = {};
        // 객체에 버퍼 담기
        pdfVar.fileBuffer = file;
        /*---------------------
             pdf:
             - 문서 1개
             - drawing 없음
         -----------------------*/
        if (type === 'pdf') {
            pdfVar.fileBuffer = file;
            // drawingEventSet = {};
        } else if (type === 'gstd') {

            /*---------------------
                  gstd:
                  - 문서 n개
                  - drawing 존재 가능
              -----------------------*/
            file = JSON.parse(file);
            pdfVar.fileBuffer = this.base64toAb(file.pdf);
            // drawingEventSet = file.drawingEventSet;
        } else {
            return { success: false };
        }

        // buffer 형식의 pdf에서 데이터 추출 (페이지 수 등)
        const results = await this.pdfConvert(file);
        // pdf id 랜덤으로 준다.
        pdfVar._id = Math.random().toString(36).substr(2,11);
        pdfVar.pdfPages = results.pdfPages; //pdf 문서의 page별 정보
        pdfVar.pdfDestroy = results.pdfDoc;
        pdfVar.loadedDate = new Date().getTime();
        pdfVar.type = type;
        pdfVarArray.push(pdfVar)
        //  PDF Docouments storage에 저장
        this.pdfStorageService.setPdfVarArray(pdfVarArray);




        /*----------------------------------
                Drawing 정보 추가
                - drawing event가 있는 page만 추가
                --> key : p1, p2 .....
                --> event: [{points color, tool, timeDiff}...]
            --------------------------------------*/
        // for (let i = 0; i < Object.keys(drawingEventSet).length; i++) {
        //     const pageNum = parseInt(Object.keys(drawingEventSet)[i].substring(1), 10);
        //     // console.log(drawVar);

        //     for (const item of drawingEventSet['p' + pageNum]) {
        //         // array 초기화
        //         if (!drawVar.drawingEventSet['p' + (pageNum + pageNumBeforeLoad)]) {
        //             drawVar.drawingEventSet['p' + (pageNum + pageNumBeforeLoad)] = [];
        //         }
        //         drawVar.drawingEventSet['p' + (pageNum + pageNumBeforeLoad)].push(item);
        //     }
        // }



        console.log(`---> document(${type}) file Loaded : `, pdfVar);
        console.log('Total Pages:', results.pdfPages.length);
        return {
            success: true,
            docLength: results.pdfPages.length,
        };
    }

    // https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
    base64toAb(strArray) {
        const array = [];
        for (let i = 0; i < strArray.length; i++) {
            const raw = atob(strArray[i]);
            const bufView = new Uint8Array(raw.length);
            for (let k = 0, strLen = raw.length; k < strLen; k++) {
                bufView[k] = raw.charCodeAt(k);
            }
            array.push(bufView.buffer);
        }
        // console.log(array);
        return array;
    }

}
