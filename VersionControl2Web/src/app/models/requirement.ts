import { RequirementTemplatePart } from './requirement-template-part';
import { RequirementDescriptionTemplate } from './requirement-description-template/requirement-description-template';

export class Requirement {
  _id: string;
  version: number;
  description: string;
  name: string;
  duration: number;
  responsible: string;
  category: string;
  type: string;
  stakeholder: string;
  contractor: string;
  dueDate: Date;
  status: string;
  reason: any;
  descriptionParts: RequirementTemplatePart[];
  relations: any;
  keyWords: string[];
  acceptanceCriteria: string;
  descriptionTemplate: RequirementDescriptionTemplate;

  /*
   * find requirement by id
   */
  public static findById(requirements: Requirement[], id: string) {
    for (var i = 0; i < requirements.length; i++) {
      if (requirements[i]._id === id) {
        return requirements[i];
      }
    }
    throw new Error('Requirement - findById(): id not found');
  }
}
