import { Component } from '@angular/core';
import { RequirementService } from './services/requirement.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Requirement } from './models/requirement';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  public requirements: Requirement[] = [];


  constructor(private reqService: RequirementService) { }


  ngOnInit() {
    this.reqService.getRequirements()
      .subscribe(requirements => {

        console.log('Request');
        console.log(requirements);

        this.requirements = requirements;
    });
  }
}
