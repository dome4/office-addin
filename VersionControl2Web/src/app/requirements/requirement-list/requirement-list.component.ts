import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-requirement-list',
  templateUrl: './requirement-list.component.html',
  styleUrls: ['./requirement-list.component.css']
})
export class RequirementListComponent{

  constructor(private storeService: StoreService) { }

}
