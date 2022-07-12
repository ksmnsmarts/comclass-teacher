import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawStorageService {
    /*--------------------------------
            Draw 관련 변수
          ---------------------------------*/
    drawVarArray: any = [];
    oneOnOneDrawVarArray: any = [];
    pageDrawingEvent = {};
    // 스트림. 스트림은 업로드된 정보를 저장하는곳.
    private drawDataSubject = new BehaviorSubject({});
    // asObservable()를 사용해 스트림에 마지막으로 저장된 곳을 가리킴.
    draw = this.drawDataSubject.asObservable();

    constructor() { }

    /**
     * Draw event 받아오기
     *
     * @param docNum 문서 번호
     * @param pageNum 페이지 번호
     * @returns
     */
    getTeacherDrawingEvents(docNum, pageNum) {
        const drawingEventSet = this.drawVarArray[docNum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하는 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => item.oneOnOneMode === false && item.participantName === 'teacher')
        const drawEvent = {
            pageNum: pageNum,
            drawingEvent: res
        }
        // 없으면 undefined.
        return drawEvent;

    }

    getOneOnOneTeacherDrawingEvents(docNum, pageNum) {
        const drawingEventSet = this.drawVarArray[docNum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하는 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => item.oneOnOneMode === true && item.participantName === 'teacher')
        const drawEvent = {
            pageNum: pageNum,
            drawingEvent: res
        }
        // 없으면 undefined.
        return drawEvent;

    }

    getStudentDrawingEvents(docNum, pageNum) {
        const drawingEventSet = this.drawVarArray[docNum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하는 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => item.participantName !== 'teacher')
        const drawEvent = {
            pageNum: pageNum,
            drawingEvent: res
        }
        // 없으면 undefined.
        return drawEvent;

    }

    getDrawingEvents(docNum, pageNum) {
        const drawingEventSet = this.drawVarArray[docNum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)

        // 없으면 undefined.
        return result;

    }

    /**
     * 해당 page에 새로운 draw event 저장
     * @param {number} pdfNum 페이지 번호
     * @param {object} drawingEvent 새로운 draw event
     */
    setDrawEvent(docNum, pageNum, drawingEvent) {
        if (!this.drawVarArray[docNum - 1]) {
            this.drawVarArray[docNum - 1] = { drawingEventSet: [] };
        }
        if (
            this.drawVarArray[docNum - 1] &&
            !this.drawVarArray[docNum - 1].drawingEventSet
        ) {
            this.drawVarArray[docNum - 1]['drawingEventSet'] = [];
        }

        let drawingEventSet = this.drawVarArray[docNum - 1].drawingEventSet;

        const itemIndex = drawingEventSet.findIndex(
            (item) => item.pageNum === pageNum
        );

        // 현재 해당 page의 data가 없는 경우 최초 생성
        if (itemIndex < 0) {
            this.drawVarArray[docNum - 1].drawingEventSet.push({
                pageNum: pageNum,
                drawingEvent: [drawingEvent],
            });
        }
        // 기존 data에 event 추가
        else {
            this.drawVarArray[docNum - 1].drawingEventSet[
                itemIndex
            ].drawingEvent.push(drawingEvent);
        }
    }
    /**
     * Server에서 수신한 판서 Event 저장
     * - DB와 Local의 모양이 다소 다르기 때문에 변경해서 저장
     * DB: [{page: 1, ...}, {page2: ...}, {page1: ...}]
     * local: [{page:1, [.....], {page:3, [.....]}}
     *
     * @param docNum
     * @param serverDrawingEvent
     */

    setDrawEventSet(docNum, serverDrawingEvent) {
        if (!this.drawVarArray[docNum - 1]) {
            this.drawVarArray[docNum - 1] = { drawingEventSet: [] };
        }
        if (
            this.drawVarArray[docNum - 1] &&
            !this.drawVarArray[docNum - 1].drawingEventSet
        ) {
            this.drawVarArray[docNum - 1]['drawingEventSet'] = [];
        }
        if (serverDrawingEvent.length > 0) {
            for (let i = 0; i < serverDrawingEvent.length; i++) {
                // https://stackoverflow.com/questions/60036060/combine-object-array-if-same-key-value-in-javascript
                const out = serverDrawingEvent.reduce((a, v) => {
                    if (a[v.pageNum]) {
                        a[v.pageNum].drawingEvent.push(v.drawingEvent);
                    } else {
                        a[v.pageNum] = {
                            pageNum: v.pageNum,
                            drawingEvent: [v.drawingEvent],
                        };
                    }
                    return a;
                }, {});

                const outputData = Object.values(out);

                this.drawVarArray[docNum - 1].drawingEventSet = outputData;
                // console.log(docNum, this.drawVarArray[docNum-1].drawingEventSet);
            }
        } else {
            this.drawVarArray[docNum - 1]['drawingEventSet'] = [];
        }
    }

    getOneOnOneDrawData(docNum, pageNum) {
        const drawingEventSet = this.oneOnOneDrawVarArray[docNum - 1]?.drawingEventSet;

        // 없으면 undefined.
        return drawingEventSet?.find((item) => item.pageNum === pageNum);
    }


    setStudentDrawArry(data: Array<String>) {
        this.drawVarArray.concat(data)
        console.log(this.drawVarArray)
    }

    /**
     * 특정 page의 draw event 모두 삭제
     * @param {number} pageNum 페이지 번호
     */
    clearDrawingEvents(pdfnum, pageNum, oneOnOneMode, participantName) {
        const drawingEventSet = this.drawVarArray[pdfnum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하지 않은 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => !(item.oneOnOneMode === false && item.participantName == participantName))
        const drawEvent = [{
            pageNum: pageNum,
            drawingEvent: res
        }]
        this.drawVarArray[pdfnum - 1].drawingEventSet = drawEvent;
        // this.drawVarArray[pdfnum - 1].drawingEventSet = res;
        console.log(this.drawVarArray[pdfnum - 1].drawingEventSet)
    }

    /**
     * 특정 page의 draw event 모두 삭제
     * @param {number} pageNum 페이지 번호
     */
    clearTeacherDrawingEvents(pdfnum, pageNum, participantName) {
        const drawingEventSet = this.drawVarArray[pdfnum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하지 않은 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => !(item.oneOnOneMode === false && item.participantName == participantName))
        const drawEvent = [{
            pageNum: pageNum,
            drawingEvent: res
        }]
        this.drawVarArray[pdfnum - 1].drawingEventSet = drawEvent;
        // this.drawVarArray[pdfnum - 1].drawingEventSet = res;
        console.log(this.drawVarArray[pdfnum - 1].drawingEventSet)
    }

    clearOneOnOneDrawingEvents(pdfnum, pageNum, participantName) {
        const drawingEventSet = this.drawVarArray[pdfnum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하지 않은 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => !(item.oneOnOneMode === true && item.participantName === 'teacher'))
        const drawEvent = [{
            pageNum: pageNum,
            drawingEvent: res
        }]
        this.drawVarArray[pdfnum - 1].drawingEventSet = drawEvent;

        console.log(this.drawVarArray[pdfnum - 1].drawingEventSet)
    }

    clearStudentDrawingEvents(pdfnum, pageNum) {
        const drawingEventSet = this.drawVarArray[pdfnum - 1]?.drawingEventSet;
        //페이지랑 일치하는 애들만 모은 후
        const result = drawingEventSet?.find((item) => item.pageNum === pageNum)
        //한번 더 oneOnOneMode와 참가자가 일치하지 않은 애들을 가져온다
        const res = result?.drawingEvent?.filter((item) => (item.participantName === 'teacher'))
        const drawEvent = [{
            pageNum: pageNum,
            drawingEvent: res
        }]
        this.drawVarArray[pdfnum - 1].drawingEventSet = drawEvent;
    }


    resetStudentDrawingEvents() {

        for (let i = 0; i < this.drawVarArray.length; i++) {
            const drawingEventSet = this.drawVarArray[i]?.drawingEventSet;
            drawingEventSet?.filter((item) => (item.oneOnOneMode == false && item.participantName == 'teacher'))
            console.log(drawingEventSet)
        }
    }

    /**
     * draw event 정보 모두 제거
     */
    clearDrawingEventsAll() {
        for (let i = 0; i < this.drawVarArray.length; i++) {
            this.drawVarArray[i].drawingEventSet = {};
        }
    }




    clearOneOnOneDrawingEventsAll() {
        for (let i = 0; i < this.oneOnOneDrawVarArray.length; i++) {
            this.oneOnOneDrawVarArray[i].drawingEventSet = {};
        }
    }

    memoryRelease() {
        this.drawVarArray = [];
        this.oneOnOneDrawVarArray = [];
        this.pageDrawingEvent = {};
    }
    // onNavUpdate(updateEvent) {
    //   // 스트림을 마지막 곳에 업데이트
    //   // next는 스트림의 마지막 곳에 넣는다.
    //   // console.log('updatedData', profileData);
    //   console.log(updateEvent)
    //   this.drawDataSubject.next(updateEvent);
    // }
}
