import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ClassService {

    constructor(
        private http: HttpClient,
    ) { }


    // 수업 목록 가져오기
    getClass() {
        return this.http.get('/api/v1/admin/classInfo/getClass');
    }

    // 수업 가져오기
    getClassInfo(data) {
      return this.http.get('/api/v1/admin/classInfo/getClassInfo', { params: data });
    }

    // 수업 등록
    addClass(data) {
        return this.http.post('/api/v1/admin/classInfo/addClass', data);
    }

    // 파일 업로드
    uploadDocument(formData, classId) {
        return this.http.post(`/api/v1/admin/classInfo/upload/${classId}`, formData);
    }

    // 문서 정보 불러오기
    getDocumentsInfo(data) {
        console.log(data)
        console.log('[API] -----> get: Document Info');
        return this.http.get(`/api/v1/admin/classInfo/documentInfo`, {params: data})
    }

    // 각 pdf 요청
    getPdfFile(data) {
        console.log('[API] -----> get: document', data);
        return this.http.get('/api/v1/admin/classInfo/getPdfFile/', { responseType: 'blob', params: data});
    }

}
