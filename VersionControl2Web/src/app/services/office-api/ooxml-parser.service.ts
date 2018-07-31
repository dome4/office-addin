import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpParameterCodec } from "@angular/common/http";
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import * as Mustache from 'mustache';
import { environment } from '../../../environments/environment';

const api = environment.apiUrl;

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
      map(x => Mustache.render(x, params)),
      catchError(error => of(`error occurred while loading template: ${error}`))
      );
  }

  /**
   * calls the api to insert a new requirement at the end of the current requirement list
   * 
   * @param xml
   */
  insertNextRequirement(xml: string, requirementTemplate: string): Observable<string> {    

    // request body and use custom encoder to prevent + in xml from beeing encoded
    const body = new HttpParams({ encoder: new CustomEncoder() })
      .set('xmlDocument', xml)
      .set('requiremenTemplate', requirementTemplate);

    // request header
    const httpOptions = {
      headers: new HttpHeaders({
        'content-type': 'application/x-www-form-urlencoded'
      }),
      responseType: 'text' as 'text' // ToDo: fix issue https://github.com/angular/angular/issues/18586
    };

    // send request to api
    return this.httpClient.post(`${api}/office/insert-new-requirement`, body, httpOptions)
      .pipe(
      catchError(error => of(`error occurred while inserting new requirement: ${error}`))
      );

  }
}

/**
 * custom encoder from https://github.com/angular/angular/issues/18261
 *
 */
class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
