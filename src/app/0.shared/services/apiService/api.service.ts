import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'MyClientCert': '', 'MyToken': '' });
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // private URL = 'http://localhost:8081/'; //comclass 통합 전 Server주소
  private URL = '/api/v1/';
  constructor(
    private http: HttpClient
  ) { }

  // For Test only : meeting id 임시생성
  getMeetingInfo(data) {
    console.log('[API] -----> get: Meeting Info');
    return this.http.get(this.URL + 'comclass' +'/meetingInfo/'+ data)
  }

  getDocumentsInfo(meetingId) {
    console.log('[API] -----> get: Document Info');
    return this.http.get(this.URL + 'comclass' + `/documentInfo/` + meetingId)
  }

  uploadDocument(formData, meetingId) {
    console.log('[API] -----> post: upload New Local Document');
    return this.http.post(this.URL + 'comclass' + `/upload/${meetingId}`, formData);
  }

  getPdfFile(_id) {
    console.log('[API] -----> get: document');
    return this.http.get(this.URL + 'comclass' + `/document/` + _id, { responseType: 'blob' });
  }

  deleteMeetingPdfFile(_id) {
    console.log('[API] -----> get: deleteMeetingPdfFile');
    return this.http.delete(this.URL + 'comclass' + `/deleteMeetingPdfFile/`,  {params: _id});
  }

  deleteDrawingEvent(_id, currentDocNum, currentPage) {
    console.log('[API] -----> get: deleteDrawingEvent');
    return this.http.delete(this.URL + 'comclass' + `/deleteDrawingEvent/`,  {params: {_id, currentDocNum, currentPage}});
  }


}
