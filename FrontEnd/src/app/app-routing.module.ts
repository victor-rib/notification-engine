import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationComponent } from './pages/authentication-page/authentication.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ManageEntityComponent } from './pages/manage-entity/manage-entity.component';
import { UserSettingsComponent } from './pages/user-settings/user-settings.component'

const routes: Routes = [
  { path: 'index.html', component: AuthenticationComponent },
  { path: 'notifications', component: LandingPageComponent },
  { path: 'user-settings', component: UserSettingsComponent },
  { path: 'admin-tools', component: ManageEntityComponent },
  { path: '',   redirectTo: '/index.html', pathMatch: 'full' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
