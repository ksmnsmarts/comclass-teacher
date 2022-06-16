import { Injectable } from '@angular/core';
import { Store } from './store';

@Injectable({
	providedIn: 'root'
})
export class ClassInfoService extends Store<any> {

	constructor() {
		super({});
	}

  setClassInfo(ClassInfo : any) : void {
    this.setState({
      ...this.state, ...ClassInfo
    });
  }

}
