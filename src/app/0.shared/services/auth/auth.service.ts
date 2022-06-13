import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

import { JwtHelperService } from '@auth0/angular-jwt';

// Env
import { environment } from 'src/environments/environment';

interface Token {
  token: String
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

	constructor(
		private http: HttpClient,
		private jwtHelper: JwtHelperService,

	) { }

	signUp(userData) {
		return this.http.post('/api/v1/adAuth/signUp', userData);
	}

	signIn(userData): Observable<Token> {
		return this.http.post<Token>('/api/v1/adAuth/signIn', userData)
		.pipe(
			shareReplay(),
			tap( 
			(res:any) => {
						this.setToken(res.token)
					}),
		)
	}

	// get verification code + email
	getEcode(emailData) {
		return this.http.post('/api/v1/adAuth/getEcode', emailData)
	}

	// set temp password + email
	getTempPw(emailData) {
		return this.http.put('/api/v1/adAuth/getTempPw', emailData)
	}

  	logOut(): void {
		this.removeToken();
	}

	isAuthenticated(): boolean {
		const token = this.getToken();
		return token ? !this.isTokenExpired(token) : false;
	}

  	getToken(): string {
		return localStorage.getItem(environment.tokenName);
	}

	setToken(token: string): void {
		localStorage.setItem(environment.tokenName, token);
	}

	removeToken(): void {
		localStorage.removeItem(environment.tokenName);
	}

	// jwtHelper
	isTokenExpired(token: string) {
		return this.jwtHelper.isTokenExpired(token);
	}

	getTokenInfo() {
		return this.jwtHelper.decodeToken(this.getToken());
	}

}
