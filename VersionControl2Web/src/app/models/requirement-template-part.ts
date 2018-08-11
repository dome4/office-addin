export class RequirementTemplatePart {

  _id: string;
  next: string;
  version: number;
  value: any;
  type: string;
  head: boolean;
  descriptionTemplateValue: any;

  /*
   * find requirement template part by id
   */
  public static findById(templateParts: RequirementTemplatePart[], id: string) {
    for (var i = 0; i < templateParts.length; i++) {
      if (templateParts[i]._id === id) {
        return templateParts[i];
      }
    }
    throw new Error('RequirementTemplatePart - findById(): id not found');
  }
}
