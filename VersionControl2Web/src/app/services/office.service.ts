import { BehaviorSubject } from "rxjs";
import * as JSZip from 'jszip';

// Office variable
declare let Office: any;

export class OfficeService {

  // xml document observable
  public ooxmlDocument$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Adds a binding to a named item in the document
   * function to reduce amount of count and if no additional features are necessary
   *
   * @param itemName
   * @param bindingType
   * @param options
   * @param callback
   */
  addBindingFromNamedItem(itemName: string, bindingType: any, bindingId: string, callback?) { // ToDo add BindingType

    Office.context.document.bindings.addFromNamedItemAsync(itemName, bindingType, { id: bindingId }, (asyncResult) => {

      if (asyncResult.status == Office.AsyncResultStatus.Failed) {
        console.log('Biding - Action failed. Error: ' + asyncResult.error.message);
      } else {
        console.log('Binding - Added new binding with type: ' + asyncResult.value.type + ' and id: ' + asyncResult.value.id);

        callback();
      }
    });

    // ToDo: destroy handler after usage

  }

  /**
   * method returns the whole document as ooxml object
   * 
   */
  getDocuemntAsOoxml() {

    // source: https://dev.office.com/reference/add-ins/shared/document.getfileasync

    // promise trying
    return new Promise((resolve, reject) => {

      /**
       * entry point
       * get the whole document as a compressed ooxml file
       *
       */
      Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 65536 /*64 KB*/ },
        (result) => {
          if (result.status == Office.AsyncResultStatus.Succeeded) {
            // If the getFileAsync call succeeded, then
            // result.value will return a valid File Object.
            var myFile = result.value;
            var sliceCount = myFile.sliceCount;
            var slicesReceived = 0, gotAllSlices = true, docdataSlices = [];

            // Get the file slices.
            getSliceAsync(myFile, 0, sliceCount, gotAllSlices, docdataSlices, slicesReceived);
          }
          else {
            reject('Error:' + result.error.message);
          }
        });


      /**
       * method gets the file slices
       * 
       * @param file
       * @param nextSlice
       * @param sliceCount
       * @param gotAllSlices
       * @param docdataSlices
       * @param slicesReceived
       */
      let getSliceAsync = (file, nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived) => {
        file.getSliceAsync(nextSlice, (sliceResult) => {
          if (sliceResult.status == Office.AsyncResultStatus.Succeeded) {
            if (!gotAllSlices) {
              // Failed to get all slices, no need to continue.
              return;
            }

            // Got one slice, store it in a temporary array.
            docdataSlices[sliceResult.value.index] = sliceResult.value.data;
            if (++slicesReceived == sliceCount) {
              // All slices have been received.
              file.closeAsync();
              onGotAllSlices(docdataSlices);
            }
            else {
              // recursive method call
              getSliceAsync(file, ++nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived);
            }
          }
          else {
            gotAllSlices = false;
            file.closeAsync();
            reject('getSliceAsync Error:' + sliceResult.error.message);
          }
        });
      }

      /**
       * method is called if all slices were received
       * @param docdataSlices
       */
      let onGotAllSlices = (docdataSlices) => {
        var docdata = [];
        for (var i = 0; i < docdataSlices.length; i++) {
          docdata = docdata.concat(docdataSlices[i]);
        }

        // JSZip - decode compressed file
        JSZip.loadAsync(docdata).then((data) => {

          // search for the document.xml
          data.forEach((relativePath: string, file: JSZip.JSZipObject) => {

            // Word
            if (file.name == 'word/document.xml') {

              // get content of the file as string
              file.async('text').then((fileContent) => {

                // do something with the xml-string            
                // resolve promise
                resolve(fileContent);
              });
            }

            // ToDo: add if condition for Excel, ...
          });
        });
      }
    });
  }
}
