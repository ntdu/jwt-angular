import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':username',
        component: ProfileComponent,
      },
    ],
  },
];

export default routes;
