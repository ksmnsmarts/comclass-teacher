import { Component, OnInit, HostListener } from '@angular/core';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

    public isNavbarOnTop: boolean;

    constructor() { }

    ngOnInit(): void {
        this.isNavbarOnTop = true;
    }

    @HostListener('window:scroll', ['$event'])
	onScroll(ev) {
		if (window.scrollY === 0) {
			this.isNavbarOnTop = true;
		} else {
			this.isNavbarOnTop = false;
		}
	}

}
