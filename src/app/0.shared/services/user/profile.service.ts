import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, tap } from 'rxjs/operators';
import { DataService } from '../store/data.service';

@Injectable({
	providedIn: 'root'
})
export class ProfileService {

	constructor(
		private http: HttpClient,
		private dataService: DataService,
	) { }

	getUserProfile() {
		return this.http.get('/api/v1/admin/profile')
		.pipe(
			shareReplay(),
			tap( 
				(res: any) => {
					this.dataService.updateUserProfile(res);
				}
			)
		);
	}

}
