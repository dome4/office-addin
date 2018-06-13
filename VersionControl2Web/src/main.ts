import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// global office variable
declare const Office: any;

/**
 * bootstrap method
 * 
 */
function launch() {
  // bootstrap
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch((error: any) => {
      console.log('Version Control: bootstrap error', error);
    });
}

/**
 * check if the app is started as web app or as office addin
 * 
 */
if (window.hasOwnProperty('Office') && window.hasOwnProperty('Word')) {

  Office.initialize = (reason: any) => {

    console.log('Version Control: initializing office.js...');
    launch();
  };

} else {

  console.log('Version Control: bootstraped as web app');
  launch();
}
