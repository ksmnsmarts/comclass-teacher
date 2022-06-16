import { Injectable } from '@angular/core';
import { PdfStorageService } from '../../storage/pdf-storage.service';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../apiService/api.service';

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/pdf/pdf.worker.js';


@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor(
        private pdfStorageService: PdfStorageService,
        private apiService: ApiService,
        private http: HttpClient,
    ) { }


    /**
     *
     * File read API
      - urlFlag: boolean:
      => true: 저장된 file 읽는 경우 => text로 read...
      => false: PDF 문서 불러오는 경우
     *
     */
    readFile(file) {
        const fileReader = new FileReader();
        return new Promise(function (resolve, reject) {
            fileReader.onload = function (e) {
                resolve((<FileReader>e.target).result);
            };
            fileReader.readAsArrayBuffer(file);
        });
    }

    /*------------------------------------------
            File read API
            - urlFlag: boolean:
            => true: 저장된 file 읽는 경우 => text로 read...
            => false: PDF 문서 불러오는 경우
        --------------------------------------------------*/
    async pdfReadFile(file, docFormat) {
        // const readFilePromise = $q.defer();
        let readFilePromise;
        const fileReader = new FileReader();

        return new Promise(function (resolve, reject) {
            fileReader.onload = function (e) {
                resolve((<FileReader>e.target).result);
            };
            if (docFormat === 'gstd') {
                fileReader.readAsText(file);
            }
            else { // pdf
                fileReader.readAsArrayBuffer(file);
            }
        });
    };


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
        const CMAP_URL = '/assets/lib/pdf/cmaps/'; // --> 나중에 서버로 이동할지 check.
        const CMAP_PACKED = true;
        const pdfPages = [];

        try {
            // new version
            const pdfDoc = await pdfjsLib.getDocument({
                data: file,
                cMapUrl: CMAP_URL,
                cMapPacked: CMAP_PACKED
            }).promise;

            for (let i = 0; i < pdfDoc.numPages; i++) {
                pdfPages[i] = await pdfDoc.getPage(i + 1);
            }
            // destroy를 위해 pdfDoc도 반환.
            return {
                pdfPages: pdfPages,
                pdfDoc: pdfDoc // for destroy
            };
        } catch (err) {
            console.log(err);
            alert('오류가 발생하였습니다 : ' + err);
            return {
                success: false
            }
        }
    };



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
            const file = new File([request.response], name, { type: "application/pdf" });
            arr.push(file);
            const result = {
                files: arr,
                format: 'pdf'
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
        const pdfVar = Object.assign({}, this.pdfStorageService.getPdfVar());
        // const drawVar = Object.assign({}, this.drawStorageService.getDrawVar());
        /*-----------------------------------
            Local File Read (type: pdf, stsg)
        ---------------------------------------*/
        let file:any = await this.pdfReadFile(aFile, type);
        
        let docArrayBuffer;
        // let drawingEventSet;
        // const pageNumBeforeLoad = pdfVar.totalPdfDoc_file.length; // drawing에 사용

        /*---------------------
            pdf:
            - 문서 1개
            - drawing 없음
        -----------------------*/
        if (type === 'pdf') {
            console.log(file)
            docArrayBuffer = [file];
            // drawingEventSet = {};
        }

        /*---------------------
            gstd:
            - 문서 n개
            - drawing 존재 가능
        -----------------------*/
        else if (type === "gstd") {
            file = JSON.parse(file);
            docArrayBuffer = this.base64toAb(file.pdf);
            // drawingEventSet = file.drawingEventSet;
        }
        else {
            return { success: false };
        }

        /*---------------------------------------------------
            읽어온 arrayBuffer를 저장
            --> 공유 용도.
            -flatten 루틴은 gstd에서만 필요하지만 편의상 둠.
            https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_flatten
        ----------------------------------------------------*/
        pdfVar.fileBuffer.push(docArrayBuffer);
        pdfVar.fileBuffer = pdfVar.fileBuffer.reduce((a, b) => a.concat(b), []);

        /*-----------------------------------------------------
            PDF.js에서 사용할 format으로 파일 convert
            - * typedarray말고 그냥 arrayBuffer로 해도 정상동작...
            - gstd에서 문서가 여러개 합쳐진 경우 고려.
        --------------------------------------------------------*/

        for (let i = 0; i < docArrayBuffer.length; i++) {
            const results = await this.pdfConvert(docArrayBuffer[i]);

            // => pdf page별 정보 (array);
            const pdfPages = results.pdfPages;

            // for Destroy : memory release.
            pdfVar.pdfDestroy.push(results.pdfDoc);

            /*----------------------------------------
                문서별 변환된 시간과 page 수 저장.
                - share 용도.
            -----------------------------------------*/
            pdfVar.loadedDate.push(new Date().getTime());
            pdfVar.pagePerFileBuffer.push(pdfPages.length);
            /*--------------------------
                merge total pdf file
            --------------------------*/
            pdfVar.totalPdfDoc_file = pdfVar.totalPdfDoc_file.concat(pdfPages);
        }

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

        /*-------------------------------
            변경사항 저장
        --------------------------------*/
        this.pdfStorageService.setPdfVar(pdfVar);
        // drawStorageService.setDrawVar(drawVar);

        console.log(`---> document(${type}) file Loaded : `, pdfVar);
        console.log('Total Pages:', pdfVar.totalPdfDoc_file.length);
        return {
            success: true,
            docLength: pdfVar.totalPdfDoc_file.length
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
    };


}
