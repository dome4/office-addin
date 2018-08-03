import { Component, OnInit, OnDestroy } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { OfficeService } from '../services/office-api/office.service';
import { Subscription } from 'rxjs';

// Office variables
declare let Office: any;
declare let Word: any;
declare let OfficeExtension: any;

@Component({
  selector: 'app-xml-debug',
  templateUrl: './xml-debug.component.html',
  styleUrls: ['./xml-debug.component.css']
})
export class XmlDebugComponent implements OnInit, OnDestroy {

  // debug variable
  public xmlMessage: string = '';

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private officeService: OfficeService) { }

  ngOnInit() {
  }

  ngOnDestroy() {

    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  // access office document
  onAccessDocument() {

    /*
     * changes in the rich text field 'input' are submitted to the rich text field 'message' with event handler
     *
     */

    // add text binding to message text box
    //Office.context.document.bindings.addFromNamedItemAsync('message', Office.BindingType.Text, { id: 'message'}, (asyncResult) => {

    //  if (asyncResult.status == Office.AsyncResultStatus.Failed) {
    //    console.log('Biding - Action failed. Error: ' + asyncResult.error.message);
    //  } else {
    //    console.log('Binding - Added new binding with type: ' + asyncResult.value.type + ' and id: ' + asyncResult.value.id);
    //  }
    //});

    this.officeService.addBindingFromNamedItem('message', Office.BindingType.Text, 'message');

    // add event handler to input text field and display text in message text field
    Office.context.document.bindings.addFromNamedItemAsync('input', Office.BindingType.Text, { id: 'input' }, (asyncResult) => {

      if (asyncResult.status == Office.AsyncResultStatus.Failed) {
        console.log('Biding - Action failed. Error: ' + asyncResult.error.message);
      } else {
        console.log('Binding - Added new binding with type: ' + asyncResult.value.type + ' and id: ' + asyncResult.value.id);

        // add handler
        Office.select("bindings#input").addHandlerAsync(Office.EventType.BindingDataChanged, (result) => {

          // get data from input and set to message
          Office.select("bindings#input").getDataAsync({ coercionType: "text" },
            (inputText) => {
              if (inputText.status == Office.AsyncResultStatus.Failed) {
                console.log('Error: ' + inputText.error.message);
              } else {
                Office.select("bindings#message").setDataAsync(inputText.value, { coercionType: "text" },
                  (asyncResult) => {
                    if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                      console.log('Error: ' + asyncResult.error.message);
                    }
                  });
              }
            });
        });
      }
    });
  }

  getWholeDocumentAsXml() {

    this.subscriptions.push(
      this.officeService.getOoxml().subscribe(
        (xml: string) => {
          this.xmlMessage = xml;
        },
        (error) => {
          console.log(error);
        })
    );
  }

  setWholeDocumentFromXml() {
    this.officeService.setOoxml(this.xmlMessage);
  }

  getRequirementTemplate() {

    // example params
    let params = {
      counter: '2',
      requirement: {
        id: '123456789',
        version: '1.0',
        name: 'die zweite Anforderung',
        duration: '6',
        description: 'Das System muss Anforderungen abbilden können.'

      }

    };


    this.subscriptions.push(
      this.officeService.getRequirementTemplate(params).subscribe((result: string) => {
        this.xmlMessage = result;
        console.log(result);
      })
    );
  }

  insertNextRequirement() {

    // example params
    let params = {
      counter: '2',
      requirement: {
        id: '123456789',
        version: '1.0',
        name: 'die zweite Anforderung',
        duration: '6',
        description: 'Das System muss Anforderungen abbilden können.'
      }
    };

    this.officeService.insertNextRequirement(params)
    //.then((result: string) => {
    //  this.xmlMessage = result;
    //})
    // ToDo insertNextRequirement needs an observable return type to subscribe
  }

}
