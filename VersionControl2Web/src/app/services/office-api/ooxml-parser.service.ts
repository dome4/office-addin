import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  loadTemplate(template_name: string, data: object): Observable<string> {

    return this.httpClient.get(`assets/xml-templates/${template_name}.xml`, { responseType: 'text' })
  }
}
