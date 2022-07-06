import { Injectable } from '@angular/core';
import { Store } from './store';

// const widthSet: {
//   pen: [4, 7, 13],
//   eraser: [30, 45, 60]
// }

class InitEditInfo {
    mode = 'draw'; // draw, sync(여기? 또는 별도?)
    tool = 'pen'; // eraser, ...

    toolsConfig = {
        pointer: { width: 20, color: 'black' },
        pen: { width: 4, color: 'black' },
        highlighter: { width: 20, color: 'ff0' },
        eraser: { width: 60, color: '#ffffff' },
        line: { width: 4, color: 'black' },
        circle: { width: 4, color: 'black' },
        rectangle: { width: 4, color: 'black' },
        roundedRectangle: { width: 4, color: 'black' },
        textarea: { width: 20, color: 'black' },
        text: { width: 20, color: 'black' },

    };

    toolDisabled = false; // move인 경우
    editDisabled = false; // Edit 자체 동작을 모두 방지(권한 관련)
    syncMode = true;
    oneOnOneMode = false;
    studentName = ''; // 1 대 1 모드시 대상 선정
    // syncMode, ....
}


@Injectable({
    providedIn: 'root'
})

export class EditInfoService extends Store<any> {

    constructor() {
        super(new InitEditInfo());
    }

    setEditInfo(editInfo: any): void {

        // Tool Disable 설정
        if (editInfo.mode == 'draw') {
            editInfo.toolDisabled = false;
        }
        if (editInfo.mode == 'move') {
            editInfo.toolDisabled = true;
        }

        this.setState({
            ...this.state, ...editInfo
        });
    }

    memoryRelease() {
        this.state.mode = 'draw'; //'fileList', 'thumbnail';
        this.state.tool = 'pen'; // {_id: '',  currentPage: 1,  numPages: 1}
        this.state.toolsConfig = {
            pointer: { width: 20, color: 'black' },
            pen: { width: 4, color: 'black' },
            highlighter: { width: 20, color: 'ff0' },
            eraser: { width: 60, color: '#ffffff' },
            line: { width: 4, color: 'black' },
            circle: { width: 4, color: 'black' },
            rectangle: { width: 4, color: 'black' },
            roundedRectangle: { width: 4, color: 'black' },
            textarea: { width: 20, color: 'black' },
            text: { width: 20, color: 'black' },
        }

        this.state.toolDisabled = false; // move인 경우
        this.state.editDisabled = false; // Edit 자체 동작을 모두 방지(권한 관련)
        this.state.syncMode = true;
        this.state.oneOnOneMode = false;
        this.state.studentName='';
    }
}
