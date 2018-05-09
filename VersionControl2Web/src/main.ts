import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// bootstrap
platformBrowserDynamic().bootstrapModule(AppModule)
  .then((success: any) => {
    console.log('Version Control: bootstrap success', success);
  })
  .catch((error: any) => {
    console.log('Version Control: bootstrap error', error);
  });
