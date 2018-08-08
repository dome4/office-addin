import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RequirementDescriptionTemplate } from '../../models/requirement-description-template/requirement-description-template';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit {

  // requirement description templates array
  public requirementDescriptionTemplates: RequirementDescriptionTemplate[] = [];

  // subscriptions
  private subscriptions: Subscription[] = [];

  // constructor
  constructor(private storeService: StoreService) { }

  /**
   * ngOnInit
   *
   */
  ngOnInit() {

    // subscribe to requirement description templates
    this.subscriptions.push(
      this.storeService.requirementDescriptionTemplates$.subscribe(
        (templates: RequirementDescriptionTemplate[]) => {
          this.requirementDescriptionTemplates = templates
          console.log(templates)
        }
      )
    );
  }

}
