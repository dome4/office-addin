import { Injectable } from '@angular/core';
import { OoxmlParser } from './ooxml-parser.service';
import { Observable, from, Subscription, merge, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

// Office variables
declare let Office: any;
declare let Word: any;
declare let OfficeExtension: any;

@Injectable()
export class OfficeService {

  constructor(private xmlParser: OoxmlParser) { }

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
   * set given param as content of a rich text element
   * 
   * @param bindingId Binding Id of the rich text element to set
   * @param bindingType Binding Type
   * @param valueToSet value to set
   */
  setRichTextElementContent(bindingId: string, bindingType: any, valueToSet: string) {

    Office.select(`bindings#${bindingId}`).setDataAsync(valueToSet, { coercionType: bindingType },
      (asyncResult) => {
        if (asyncResult.status == Office.AsyncResultStatus.Failed) {
          console.log('Error: ' + asyncResult.error.message);
        }
      });
  }

  /**
   * get the xml representation of the whole document
   * 
   */
  getOoxml() {

    // ToDo: convert to observable
    return from(
      new Promise((resolve, reject) => {

        Word.run((context) => {

          // get ooxml of the whole document
          var bodyOOXML = context.document.body.getOoxml();

          // Synchronize the document state by executing the queued commands,
          // and return a promise to indicate task completion.
          return context.sync().then(() => {
            resolve(bodyOOXML.value.toString());
          });
        })
          .catch((error) => {
            reject("Error: " + JSON.stringify(error));
          });
      })
    );
  }

  /**
   * set whole document to the given xml string
   * 
   * @param xml 
   */
  setOoxml(xml: string) {

    Word.run((context) => {

      // set content from xml param
      context.document.body.insertOoxml(xml, 'Replace');

      // Synchronize the document state by executing the queued commands,
      // and return a promise to indicate task completion.
      return context.sync().then(() => {
        //console.log("Body OOXML updated");
      });
    })
      .catch((error) => {
        console.log("Error: " + JSON.stringify(error));
        if (error instanceof OfficeExtension.Error) {
          console.log("Debug info: " + JSON.stringify(error.debugInfo));
        }
      });
  }

  /**
   * loads the requirement template and replaces the given values
   * 
   * @param params
   */
  getRequirementTemplate(params: object): Observable<string> {

    return this.xmlParser.loadTemplate('requirement.template', params);

  }

  /**
   * insert the next requirement with the given params in the current xml document
   * 
   * @param params requirement params
   */
  insertNextRequirement(params: object): void {

    // temp variables
    let xmlDocument: string;
    let requirementTemplate: string;

    // merge first two observables
    let requestInputs$ = merge(
      this.getOoxml()
        .pipe(
        map(
          result => {
            return {
              type: 'xmlDocument',
              data: result
            };
          })
        )
      ,
      this.getRequirementTemplate(params)
        .pipe(
        map(
          result => {
            return {
              type: 'requirementTemplate',
              data: result
            };
          })
        )
    );

    requestInputs$.pipe(
      switchMap(
        (result: { type: string, data: string }) => {
          if (result.type === 'xmlDocument') {
            xmlDocument = result.data;
          } else if (result.type === 'requirementTemplate') {
            requirementTemplate = result.data;
          } else {
            throw new Error('Error occurred while requesting data');
          }

          if (xmlDocument && requirementTemplate) {
            return this.xmlParser.insertNextRequirement(xmlDocument, requirementTemplate);
          } else {

            // first inner emit with only one result xml string emits flag
            return of('first emit');
          }
        }
      )
    )
      .subscribe(
      (newXMLString: string) => {
        if (newXMLString !== 'first emit') {

          this.setOoxml(newXMLString)
        }
      },
      (error) => {
        console.log(error);
      });
  }

  documentIncludesRequiremntId(xmlDoucment: string, requirementId: string): boolean {

    return xmlDoucment.includes(`"requirement-id": "${requirementId}"`);
  }
}
