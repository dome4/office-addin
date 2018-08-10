import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { Requirement } from '../../models/requirement';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-requirement-details',
  templateUrl: './requirement-details.component.html',
  styleUrls: ['./requirement-details.component.css']
})
export class RequirementDetailsComponent implements OnInit, OnDestroy {

  // selected requirement
  public selectedRequirement: Requirement;

  // requirements
  public requirements: Requirement[];

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    // subscribe to requirements
    this.subscriptions.push(
      this.storeService.requirements$.subscribe((requirements: Requirement[]) => this.requirements = requirements)
    );

    // initialize selected requirement with router
    let selectedId = this.route.snapshot.params['id'];
    this.selectedRequirement = Requirement.findById(this.requirements, selectedId);

    // subscribe to selectedRequirement Observable
    // necessary for changes in other components
    this.subscriptions.push(
      this.storeService.selectedRequirement$.subscribe((requirement: Requirement) => this.selectedRequirement = requirement)
    ); 
  }

  ngOnDestroy() {
    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
