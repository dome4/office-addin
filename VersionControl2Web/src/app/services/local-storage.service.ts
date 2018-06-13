export class LocalStorageService {

  /**
   * store data
   * 
   * @param key
   * @param value
   */
  store(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.log(e);
    }
    
  }

  /**
   * get data
   * 
   * @param key
   */
  get(key: string): string {   
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * remove data
   * 
   * @param key
   */
  remove(key: string) { 
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.log(e);
    }
  }
}
