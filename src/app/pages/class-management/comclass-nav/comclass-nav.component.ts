import { Component, OnInit } from '@angular/core';
import { CANVAS_CONFIG } from 'src/app/0.shared/config/config';

// icon icon 별로 불러오기
import eraserIcon from '@iconify/icons-mdi/eraser';
import markerIcon from '@iconify/icons-mdi/marker';
import shapeOutlineIcon from '@iconify/icons-mdi/shape-outline';
import { EditInfoService } from 'src/app/0.shared/store/edit-info.service';
import { EventBusService } from 'src/app/0.shared/services/eventBus/event-bus.service';
import { DrawStorageService } from 'src/app/0.shared/storage/draw-storage.service';
import { ViewInfoService } from 'src/app/0.shared/store/view-info.service';
import { ApiService } from 'src/app/0.shared/services/apiService/api.service';
import { SocketService } from 'src/app/0.shared/services/socket/socket.service';
import { EventData } from 'src/app/0.shared/services/eventBus/event.class';
import { distinctUntilChanged, pluck, Subject, takeUntil } from 'rxjs';


@Component({
    selector: 'comclass-nav',
    templateUrl: './comclass-nav.component.html',
    styleUrls: ['./comclass-nav.component.scss'],
})
export class ComclassNavComponent implements OnInit {
    isSyncMode: any;
    colorList = [
        { color: 'black' },
        { color: 'white' },
        { color: 'red' },
        { color: 'blue' },
        { color: 'green' },
        { color: 'yellow' },
    ];

    select: any;
    currentColor = 'black';
    currentTool: string = 'pen';

    widthSet = CANVAS_CONFIG.widthSet;
    currentWidth = {
        pen: this.widthSet.pen[0],
        eraser: this.widthSet.eraser[2],
    };

    // iconify TEST //////////////////////
    eraserIcon = eraserIcon;
    shapeOutlineIcon = shapeOutlineIcon;
    markerIcon = markerIcon;
    //////////////////////////////////////

    offLine = true;
    className;
    numStudents;
    mode;

    isDocLoaded;
    isRecording;
    isGuideMode;
    onNavUpdate;

    currentDocId;
    currentDocNum;
    currentPage;

    socket;
    colorSet;

    constructor(
        private editInfoService: EditInfoService,
        private eventBusService: EventBusService,
        private drawStorageService: DrawStorageService,
        private viewInfoService: ViewInfoService,
        private apiService: ApiService,
        private socketService: SocketService
    ) {
        this.socket = this.socketService.socket;
    }
    private unsubscribe$ = new Subject<void>();

    ngOnInit(): void {
        // 현재 Page 변경
        this.viewInfoService.state$
            .pipe(
                takeUntil(this.unsubscribe$),
                pluck('pageInfo'),
                distinctUntilChanged()
            )
            .subscribe((pageInfo) => {
                this.currentDocNum = pageInfo.currentDocNum;
                this.currentPage = pageInfo.currentPage;
                this.currentDocId = pageInfo.currentDocId;
            });

        this.editInfoService.state$
            .pipe(takeUntil(this.unsubscribe$), distinctUntilChanged())
            .subscribe((editInfo) => {
                this.mode = editInfo.mode;
                this.currentTool = editInfo.tool;
                this.currentColor = editInfo.toolsConfig.pen.color;
                this.currentWidth = {
                    pen: editInfo.toolsConfig.pen.width,
                    eraser: editInfo.toolsConfig.eraser.width,
                };
            });
    }

    clickMenu(exit) { }

    /**
     * Pen, Eraser 선택
     *
     * @param tool : 'pen', 'eraser'
     *
     */
    async changeTool(tool) {
        // console.log(tool)
        const editInfo = Object.assign({}, this.editInfoService.state);

        if (
            editInfo.tool == 'eraser' &&
            editInfo.mode == 'draw' &&
            tool == 'eraser'
        ) {
            if (confirm('Do you want to delete all drawings on the current page?')) {
                const data = {
                    docId: this.currentDocId,
                    currentDocNum: this.currentDocNum,
                    currentPage: this.currentPage,
                };
                // 다른 사람들에게 드로우 이벤트 제거
                this.socket.emit('clearDrawingEvents', data);
                // 자기자신한테 있는 드로우 이벤트 제거
                this.drawStorageService.clearDrawingEvents(
                    this.currentDocNum,
                    this.currentPage
                );
                this.eventBusService.emit(
                    new EventData('rmoveDrawEventPageRendering', '')
                );
                this.eventBusService.emit(
                    new EventData('rmoveDrawEventThumRendering', '')
                );
            } else {
                return;
            }
        }
        editInfo.mode = 'draw';
        editInfo.tool = tool;
        this.editInfoService.setEditInfo(editInfo);

        // 지우개 2번 Click은 여기서 check 하는 것이 좋을 듯?
    }

    changeSyncState(event) { }

    /**
     * 색상 변경
     *
     * - 현재 pen인 경우에만 반응
     * @param color 색상 : 향후 HEXA로 변경 고려
     *
     */
    changeColor(color) {
        const editInfo = Object.assign({}, this.editInfoService.state);
        editInfo.mode = 'draw';
        if (editInfo.mode != 'draw' || editInfo.tool == 'erasar') return;
        editInfo.toolsConfig.pen.color = color;
        editInfo.toolsConfig.highlighter.color = color;
        editInfo.toolsConfig.line.color = color;
        editInfo.toolsConfig.circle.color = color;
        editInfo.toolsConfig.rectangle.color = color;
        editInfo.toolsConfig.roundedRectangle.color = color;
        editInfo.toolsConfig.text.color = color;
        this.editInfoService.setEditInfo(editInfo);
    }

    /**
     * Width 변경
     *
     * -현재 Pen 또는 eraser인 경우에만 반응
     *
     * @param width
     */
    changeWidth(width) {
        const editInfo = Object.assign({}, this.editInfoService.state);

        if (editInfo.mode != 'draw') return;

        // textarea 모드거나 text모드 상태에서 width를 수정하면 같이 바뀥다.
        if (editInfo.tool == 'text' || editInfo.tool == 'textarea') {
            editInfo.toolsConfig['text'].width = width;
            editInfo.toolsConfig['textarea'].width = width;
        } else {
            const tool = editInfo.tool; // tool: 'pen', 'eraser', 'shape'
            editInfo.toolsConfig[tool].width = width;
        }
        this.editInfoService.setEditInfo(editInfo);
    }

    /**
     * Move 선택
     *
     * @param mode : 현재는 'move'만 있음 (향후 sync?)
     *
     */
    changeMode(mode) {
        const editInfo = Object.assign({}, this.editInfoService.state);
        editInfo.mode = mode;
        this.editInfoService.setEditInfo(editInfo);
    }
}
