import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { MenuItems } from './menu-items';
import { Subscription, Observable } from 'rxjs/Rx';

import { NgCloudAppState } from '../../core/store';
import { AppLayoutActions, getSidebarExpanded$, getChatbarExpanded$, getAppBoxed$, getAppDir$ } from '../../core/store/app-layout';

import * as Ps from 'perfect-scrollbar';

@Component({
  selector: 'app-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']
})
export class HomeLayoutComponent implements OnInit, OnDestroy {
  sidebarExpanded$: Observable<any> = this.store.let(getSidebarExpanded$);
  chatbarExpanded$: Observable<any> = this.store.let(getChatbarExpanded$);
  private _router: Subscription;
  today: number = Date.now();
  url: string;
  boxed$: Observable<any> = this.store.let(getAppBoxed$);

  dir: string;
  @ViewChild('sidemenu') sidemenu;

  messages: any[] = [
    {
      from: 'Nancy',
      subject: 'Brunch?',
      message: 'Did you want to go on Sunday? I was thinking that might work.',
      image: 'assets/avatars/2.png'
    },
    {
      from: 'Mary',
      subject: 'Summer BBQ',
      message: 'Wish I could come, but I have some prior obligations.',
      image: 'assets/avatars/1.png'
    },
    {
      from: 'Bobby',
      subject: 'Oui oui',
      message: 'Do you have Paris reservations for the 15th? I just booked!',
      image: 'assets/avatars/3.png'
    }
  ];

  constructor(public menuItems: MenuItems, private router: Router, private appLayoutActions: AppLayoutActions,
    private store: Store<NgCloudAppState>) {
    this.store.let(getAppDir$).subscribe(dir => {
      this.dir = dir;
    });
  }

  ngOnInit(): void {

    const elemSidebar = <HTMLElement>document.querySelector('.site-sidebar .mat-sidenav-focus-trap .cdk-focus-trap-content');
    const elemContent = <HTMLElement>document.querySelector('.mat-sidenav-content');

    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      Ps.initialize(elemSidebar, { wheelSpeed: 2, suppressScrollX: true });
      Ps.initialize(elemContent, { wheelSpeed: 2, suppressScrollX: true });
    }

    this._router = this.router.events.filter((event: any) => event instanceof NavigationEnd).subscribe(event => {
      this.url = event.url;
      if (this.isOver()) {
        this.sidemenu.close();
      }

      if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
        Ps.update(elemContent);
      }
    });
  }

  @HostListener('click', ['$event'])
  onClick(e: any) {
    const elemSidebar = <HTMLElement>document.querySelector('.site-sidebar .mat-sidenav-focus-trap .cdk-focus-trap-content');
    setTimeout(() => {
      if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
        Ps.update(elemSidebar);
      }
    }, 350);
  }

  ngOnDestroy() {
    this._router.unsubscribe();
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 960px)`).matches;
  }

  isMac(): boolean {
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }

  closeSidebar() {
    return this.store.dispatch(this.appLayoutActions.collapseSidebar());
  }
  openSidebar() {
    return this.store.dispatch(this.appLayoutActions.expandSidebar());
  }

  closeChatbar() {
    return this.store.dispatch(this.appLayoutActions.collapseChatbar());
  }
  openChatbar() {
    return this.store.dispatch(this.appLayoutActions.expandChatbar());
  }
}
