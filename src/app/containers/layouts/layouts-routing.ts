import { Routes } from '@angular/router';

import { FlexLayoutComponent } from './flex-layout/flex-layout.component';
import { GoldenLayoutComponent } from './golden-layout/golden-layout.component';

export const LayoutRoutes: Routes = [
    {
        path: '',
        children: [
             { path: '', redirectTo: 'flex-layout', pathMatch: 'full'},
            {
                path: 'flex-layout',
                component: FlexLayoutComponent
            },
            {
                path: 'golden-layout',
                component: GoldenLayoutComponent
            }
        ]
    },
];
