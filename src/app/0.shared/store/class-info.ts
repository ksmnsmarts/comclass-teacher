import { Injectable } from '@angular/core';
import { Store } from './store';

@Injectable({
	providedIn: 'root'
})
export class ClassInfoService extends Store<any> {

	constructor() {
		super({});
	}

  setClassInfo(classInfo : any) : void {
    this.setState({
      ...this.state, ...classInfo
    });
  }

}
