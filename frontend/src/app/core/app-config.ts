import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export type RoleName = 'Admin' | 'Teacher' | 'Student';

export interface AppConfig {
  apiBaseUrl: string; // e.g. http://localhost:4000
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: environment.apiBaseUrl,
};

