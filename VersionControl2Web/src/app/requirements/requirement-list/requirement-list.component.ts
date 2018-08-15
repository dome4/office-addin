import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { OfficeService } from '../../services/office-api/office.service';
import { OoxmlParser } from '../../services/office-api/ooxml-parser.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-requirement-list',
  templateUrl: './requirement-list.component.html',
  styleUrls: ['./requirement-list.component.css']
})
export class RequirementListComponent implements OnInit, OnDestroy {

  // indicator for the template model
  public showTemplateModal: boolean = true;

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private storeService: StoreService,
    private officeService: OfficeService,
    private xmlParser: OoxmlParser
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * insert empty specification sheet in Word
   *
   */
  insertSpecificationSheet() {

    // start app loading
    this.storeService.appLoading$.next(true);

    this.subscriptions.push(
      this.xmlParser.loadTemplate('specification-sheet.template', {}).subscribe((template: string) => {

        try {
          this.officeService.setOoxml(template);
        } catch (error) {

          if (error instanceof ReferenceError) {

            // error occurres if Word object is not defined
            console.error('insertSpecificationSheet() - tried to use an office function in a web app');
          } else {

            throw error;
          }
        }

        // close modal
        this.showTemplateModal = false;

        // end app loading
        this.storeService.appLoading$.next(false);

      })
    );
  }
}
