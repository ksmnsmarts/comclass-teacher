import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  // private url = 'http://localhost:8081'; // comclass 통합전 서버주소
  // private url = 'http://localhost:3000/socketWebRTC';
  private url = environment.socketUrl;
  private _socket: Socket;

  constructor() {
    // autoConnect: false 자동연결을 끄고
    // this._socket.open으로 수동으로 연결
    // 이렇게 하는 이유 : 뒤로 가기로 소켓연결을 끊었을 경우(socket.close()), 다시 컴포넌트 접속시 자동 연결이 안돼서 수동으로 바꿈
    this._socket = io(this.url + '/socketComclass', { transports: ['websocket'], path: '/socketComclass', autoConnect: false });
		// console.log(this._socket);
  }

  get socket() {
		return this._socket.open();
	}

}
