import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as Mustache from 'mustache';

@Injectable()
export class OoxmlParser {

  constructor(private httpClient: HttpClient) { }

  /**
   * parse xml-string to XML Document
   * 
   * @param xml xml-string
   */
  getXML(xml: string): XMLDocument {
    return new DOMParser().parseFromString(xml, "text/xml");
  }

  /**
   * parse XML Document to xml-string
   * 
   * @param doc XMLDocument
   */
  getString(doc: XMLDocument): string {
    return new XMLSerializer().serializeToString(doc);
  }

  /**
   * loads template with the given name and replaces the given values in the template
   * 
   * @param template_name
   * @param params
   */
  loadTemplate(template_name: string, params: object): Observable<string> {

    return this.httpClient.get(`assets/xml-templates/${template_name}.xml`, { responseType: 'text' })
      .pipe(
      map(x => Mustache.render(x, params))
      )
  }

  getLastRequirementNode(xml: string) {

    // find fitting node
    let xmlDoc: XMLDocument = new DOMParser().parseFromString(xml, 'text/xml');

    // get last w:p of a requirement    
    let findReqEnd = (x: Element) => (
      x.childNodes[0].nodeValue.replace(/\s/g, '').includes('{"requirement-id":')
      && x.childNodes[0].nodeValue.replace(/\s/g, '').includes('"end"}')
    );

    // w:p node is two nodes above
    let findParagraphParent = (x: Element) => x.parentNode.parentNode.nodeName.replace(/\s/g, '') === 'w:p'


    let nodes = Array.from(xmlDoc.getElementsByTagName('w:t'))
      .filter(node => findReqEnd(node))
      .filter(node => findParagraphParent(node))

    console.log(nodes);

    // ToDo: array with references on the last node of a xml file -> are these references able to change the xml doc?


  }
}
