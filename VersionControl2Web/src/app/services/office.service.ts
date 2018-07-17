import { BehaviorSubject } from "rxjs";

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

  getDocuemntAsOoxml() {

    // context
    var _this = this;

    // source: https://dev.office.com/reference/add-ins/shared/document.getfileasync

    // methode wird nur einmal aufgerufen, ruft sich danach rekursiv selbst auf
    function getSliceAsync(file, nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived) {
      file.getSliceAsync(nextSlice, (sliceResult) => {
        if (sliceResult.status == "succeeded") {
          if (!gotAllSlices) { // Failed to get all slices, no need to continue.
            return;
          }

          // Got one slice, store it in a temporary array.
          // (Or you can do something else, such as
          // send it to a third-party server.)
          docdataSlices[sliceResult.value.index] = sliceResult.value.data;
          if (++slicesReceived == sliceCount) {
            // All slices have been received.
            file.closeAsync();
            onGotAllSlices(docdataSlices, _this);
          }
          else {
            // recursive method call
            getSliceAsync(file, ++nextSlice, sliceCount, gotAllSlices, docdataSlices, slicesReceived);
          }
        }
        else {
          gotAllSlices = false;
          file.closeAsync();
          console.log("getSliceAsync Error:", sliceResult.error.message);
        }
      });
    }

    // Methode wird nur einmal aufgerufen
    // methode fügt result array zu einem String zusammen
    // ToDo hier weiter machen
    function onGotAllSlices(docdataSlices, _this) {
      var docdata = [];
      for (var i = 0; i < docdataSlices.length; i++) {
        docdata = docdata.concat(docdataSlices[i]);
      }

      var fileContent = new String();
      for (var j = 0; j < docdata.length; j++) {
        fileContent += String.fromCharCode(docdata[j]);
      }

      // Now all the file content is stored in 'fileContent' variable,
      // you can do something with it, such as print, fax...

      console.log(fileContent);
      // string kommt komuisch zurueck, bytecode?

      Office.select("bindings#message").setDataAsync(fileContent, { coercionType: "text" },
        (asyncResult) => {
          if (asyncResult.status == Office.AsyncResultStatus.Failed) {
            console.log('Error: ' + asyncResult.error.message);
          }
        });



      // ToDo: fileContent wird noch nicht zurueckgegeben, wird Variable in Array aufgerufen?
    }


    //function getDocumentAsCompressed() {
    Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 4194304 /*4 MB (Maximum)*/ },
      (result) => {
        if (result.status == "succeeded") {
          // If the getFileAsync call succeeded, then
          // result.value will return a valid File Object.
          var myFile = result.value;
          var sliceCount = myFile.sliceCount;
          var slicesReceived = 0, gotAllSlices = true, docdataSlices = [];

          console.log("File size:" + myFile.size + " #Slices: " + sliceCount);

          // Get the file slices.
          getSliceAsync(myFile, 0, sliceCount, gotAllSlices, docdataSlices, slicesReceived);
        }
        else {
          console.log("Error:", result.error.message);
        }
      });
    //}

  }


}
