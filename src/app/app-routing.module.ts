import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { FrontdeskComponent } from './topview/frontdesk/frontdesk.component';
import { SettingsComponent } from './topview/settings/settings.component';
import { ReportsComponent } from './topview/reports/reports.component';
// import { KitchenComponent } from './topview/kitchen/kitchen.component';
// import { BarComponent } from './topview/bar/bar.component';
import { LoginComponent } from './topview/login/login.component';
import { RootnavComponent } from './rootnav/rootnav.component';
import { AuthGuard } from './auth.guard';
// import { HandOverComponent } from './topview/hand-over/hand-over.component';
import { HomeComponent } from './topview/home/home.component';
import { StudentTable2Component } from './tables/student-table2/student-table2.component';
import { StudentInfoComponent } from './topview/student-info/student-info.component';
import { MakepayComponent } from './topview/makepay/makepay.component';
import { PaymentInfoComponent } from './topview/payment-info/payment-info.component';
import { OutstandingComponent } from './topview/outstanding/outstanding.component';
import { DashComponent } from './topview/dash/dash.component';
import { BillsComponent } from './topview/bills/bills.component';
import { AdvpostingComponent } from './topview/advposting/advposting.component';
// import { FrontdeskManagerComponent } from './topview/frontdesk-manager/frontdesk-manager.component';
// import { BarManagerComponent } from './topview/bar-manager/bar-manager.component';
// import { RestaurantManagerComponent } from './topview/restaurant-manager/restaurant-manager.component';

const routes: Routes = [
    {path: 'login',
    component: LoginComponent
  },
    {path: 'nav',
    component: RootnavComponent,
    canActivate: [AuthGuard],

    children: [
      {
        path: '',
        outlet: 'nav',
        component: RootnavComponent
    },
    { path: '',
    redirectTo: 'home',
    pathMatch: 'full'
},
      {path: 'home', component: HomeComponent},
      {path: 'outstandingandcreditors', component: OutstandingComponent},
      {path: 'settings', component: SettingsComponent},
      {path: 'dash', component: DashComponent},


      {path: 'paymentinfo', component: PaymentInfoComponent},
      {path: 'makepay', component: MakepayComponent},
      {path: 'bills', component: BillsComponent},
      {path: 'advancedposting', component: AdvpostingComponent},


      {path: 'studentinfo', component: StudentInfoComponent},

    ]


  },

  { path: '',
      redirectTo: '/login',
      pathMatch: 'full'
  },




];

@NgModule({
  // imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forRoot(routes,
    {onSameUrlNavigation: 'reload'})],

  exports: [RouterModule]
})
export class AppRoutingModule { }
