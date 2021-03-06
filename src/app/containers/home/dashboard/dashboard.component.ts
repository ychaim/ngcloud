import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid";
import { DragulaService } from 'ng2-dragula';
import { HomeLayoutState } from '../../../core/store';

import {
    CalendarEvent,
    CalendarEventTimesChangedEvent,
    CalendarEventAction
} from 'angular-calendar';
import { Subject } from 'rxjs/Subject';
import {
    addDays,
    differenceInDays,
    startOfDay,
    isSameDay,
    isSameMonth,
} from 'date-fns';

import { HomeLayoutActions, getDashboardEditMode$ } from '../../../core/store/home-layout';
import { CellDateComponent } from '../../../core/components/ag-components/cell-date.component';

// example services
import { ContactDataService, ContactData } from '../../../shared/services/contact.service';
import { ProjectDataService, ProjectData } from '../../../shared/services/project.service';

const colors: any = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    },
    warm: {
        primary: '#ff4081',
        secondary: '#FDF1BA'
    },
    accent: {
        primary: '#f44336',
        secondary: '#FDF1BA'
    }
};

@Component({
    moduleId: module.id,
    selector: 'ng-dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss']
})

export class DashboardComponent implements OnInit, OnDestroy {
    dashboardEditMode: boolean;
    mapOptions: any = {
        lat: 51.678418,
        lng: 7.809007,
        zoom: 2,
        scrollwheel: false
    }
    initState: any = {
        chart1: true,
        chart2: true,
        chart3: true,
    };
    displayOption: any = {};

    tmpDisplayOption: any = {};
    contacts: ContactData[] = [];
    projects: ProjectData[] = [];
    gridOptions: GridOptions;
    tabLinks = [
        { label: 'Dashboard', link: '../home' },
        { label: 'Activity', link: '../activity' }
    ];
    activeLinkIndex = 0;

    constructor(private store: Store<HomeLayoutState>,
        private router: Router,
        private dragulaService: DragulaService,
        private contactDataService: ContactDataService,
        private projectService: ProjectDataService,
        private homeLayoutActions: HomeLayoutActions,
    ) {
        dragulaService.setOptions('first-bag', {
            moves: function (el: any, container: any, handle: any): any {
                return handle.classList[0] === 'handle';
            }
        });

        this.contactDataService.getAll().subscribe(data => {
            this.contacts = data;
        });

        this.projectService.getAll().subscribe(data => {
            this.projects = data;
        });

        this.gridOptions = {};
        this.gridOptions.columnDefs = [
            {
                headerName: "ID",
                field: "id",
                width: 100
            },
            {
                headerName: "Value",
                field: "value",
                cellRendererFramework: CellDateComponent,
                width: 100
            },

        ];
        this.gridOptions.rowData = [
            { id: 5, value: 10 },
            { id: 10, value: 15 },
            { id: 15, value: 20 }
        ]

        // Initialize the index by checking if a tab link is contained in the url.
        // This is not an ideal check and can be removed if routerLink exposes if it is active.
        // https://github.com/angular/angular/pull/12525
        this.activeLinkIndex = this.tabLinks.indexOf(this.tabLinks.find(tab => router.url.indexOf(tab.link) != -1));
    }

    ngOnDestroy() {
        this.dragulaService.destroy('first-bag');
    }

    ngOnInit() {
        let self = this;
        Object.assign(this.tmpDisplayOption, self.initState);
        self.store.let(getDashboardEditMode$).subscribe((val: any) => {
            self.dashboardEditMode = val;
            if (self.dashboardEditMode) {
                Object.assign(self.displayOption, self.initState);
            } else {
                Object.assign(self.displayOption, self.tmpDisplayOption);
            }
        })
    }

    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public lineChartOptions: any = {
        responsive: true
    };
    public barChartLabels: string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;

    public barChartData: any[] = [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
    ];

    // events
    public chartClicked(e: any): void {
        console.log(e);
    }

    public chartHovered(e: any): void {
        console.log(e);
    }

    public randomize(): void {
        // Only Change 3 values
        let data = [
            Math.round(Math.random() * 100),
            59,
            80,
            (Math.random() * 100),
            56,
            (Math.random() * 100),
            40];
        let clone = JSON.parse(JSON.stringify(this.barChartData));
        clone[0].data = data;
        this.barChartData = clone;
    }
    // lineChart
    public lineChartData: Array<any> = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    public lineChartType: string = 'line';
    public pieChartType: string = 'pie';

    // Pie
    public pieChartLabels: string[] = ['Download Sales', 'In-Store Sales', 'Mail Sales'];
    public pieChartData: number[] = [300, 500, 100];

    public randomizeType(): void {
        this.lineChartType = this.lineChartType === 'line' ? 'bar' : 'line';
        this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
    }

    customize() {
        return this.store.dispatch(this.homeLayoutActions.editDashboard(!this.dashboardEditMode));
    }
    changeTab(index: number) {
        this.activeLinkIndex = index;
        if (this.dashboardEditMode) {
            return this.store.dispatch(this.homeLayoutActions.editDashboard(false));
        }
    }


    // calendar
    viewDate: Date = new Date();
    events: CalendarEvent[] = [
        {
            title: 'Office Meeting',
            color: colors.yellow,
            start: new Date(),
            draggable: true,
        }, {
            title: 'Lunch Break',
            color: colors.blue,
            start: new Date(),
            draggable: true,
        }
        , {
            title: 'URGENT',
            color: colors.accent,
            start: new Date(),
            draggable: true,
        }
    ];
    activeDayIsOpen: boolean = false;
    dayClicked({ date, events }: { date: Date, events: CalendarEvent[] }): void {

        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
                events.length === 0
            ) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    }
}