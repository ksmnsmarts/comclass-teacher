import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(
    private http: HttpClient,
  ) { }


  // admin main 에 필요한 정보들
  getAdminMain(){
    return this.http.get('/api/v1/admin/leave/getAdminMain');
  }

}
