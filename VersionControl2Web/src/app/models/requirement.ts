import { RequirementTemplatePart } from './requirement-template-part';
import { RequirementDescriptionTemplate } from './requirement-description-template/requirement-description-template';

export class Requirement {
  _id: string;
  name: string;
  description: string;
  descriptionParts: RequirementTemplatePart[];
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
