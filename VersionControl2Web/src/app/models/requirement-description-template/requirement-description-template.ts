import { RequirementDescriptionTemplatePart } from './requirement-description-template-part';

export class RequirementDescriptionTemplate {

  _id: string;
  version: number;
  name: string;
  template: RequirementDescriptionTemplatePart[];
}
