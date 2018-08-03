export class RequirementDescriptionTemplate {

  _id: string;
  version: number;
  name: string;
  template: {
    type: string,
    value: any
  }[];
}
