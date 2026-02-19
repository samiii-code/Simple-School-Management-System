import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { homeRedirectGuard } from './core/guards/home-redirect.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { UnauthorizedComponent } from './features/misc/unauthorized.component';
import { AdminLayoutComponent } from './features/layouts/admin-layout.component';
import { TeacherLayoutComponent } from './features/layouts/teacher-layout.component';
import { StudentLayoutComponent } from './features/layouts/student-layout.component';
import { AdminUsersComponent } from './features/admin/admin-users.component';
import { AdminSubjectsComponent } from './features/admin/admin-subjects.component';
import { AdminGradesComponent } from './features/admin/admin-grades.component';
import { TeacherGradesComponent } from './features/teacher/teacher-grades.component';
import { StudentMarksComponent } from './features/student/student-marks.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard(['Admin'])],
    children: [
      { path: 'users', component: AdminUsersComponent },
      { path: 'subjects', component: AdminSubjectsComponent },
      { path: 'grades', component: AdminGradesComponent },
      { path: '', pathMatch: 'full', redirectTo: 'users' },
    ],
  },
  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [authGuard, roleGuard(['Teacher'])],
    children: [{ path: 'grades', component: TeacherGradesComponent }, { path: '', pathMatch: 'full', redirectTo: 'grades' }],
  },
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard, roleGuard(['Student'])],
    children: [{ path: 'marks', component: StudentMarksComponent }, { path: '', pathMatch: 'full', redirectTo: 'marks' }],
  },

  { path: '**', redirectTo: '' },
];
