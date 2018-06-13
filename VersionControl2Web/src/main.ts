import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

//declare const Office: any;

//Office.initialize = (reason: any) => {

//   console.log('Version Control: initializing office.js...');

//  // bootstrap
//  platformBrowserDynamic().bootstrapModule(AppModule)
//    .then((success: any) => {
//      // console.log('Version Control: bootstrap success', success);
//    })
//    .catch((error: any) => {
//      console.log('Version Control: bootstrap error', error);
//    });
//};

// bootstrap
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((error: any) => {
    console.log('Version Control: bootstrap error', error);
  });
