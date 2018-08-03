import { RequirementTemplatePart } from "./requirement-template-part";

export class Requirement {
  _id: string;
  name: string;
  description: string;
  descriptionParts: RequirementTemplatePart[];

  /*
   * find requirement by id
   */
  public static findById(requirements: Requirement[], id: string) {
    for (var i = 0; i < requirements.length; i++) {
      if (requirements[i]._id === id) {
        return requirements[i];
      }
    }
    return null;
  }
}
