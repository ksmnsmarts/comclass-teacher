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

    // 수업 등록
    addClass(data) {
        return this.http.post('/api/v1/admin/classInfo/addClass', data);
    }

    // 파일 업로드
    uploadDocument(formData, classId) {
        console.log(formData, classId)
        return this.http.post(`/api/v1/admin/classInfo/upload/${classId}`, formData);
    }

}
