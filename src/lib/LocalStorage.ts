import { StorageInterface } from './Storage';

class LocalStorage implements StorageInterface {
  set(name: string, value: string) {}
  get(name: string) {
    return '';
  }
  setJson(name: string, value: Array<any> | object) {
    this.set(name, JSON.stringify(value));
  }
  getJson(name: string): Array<any> | object {
    let cookie = this.get(name);
    if (typeof cookie == 'string' && cookie != '') {
      let obj = JSON.parse(cookie);
      if (typeof obj == typeof {} || typeof obj == typeof []) {
        return obj;
      }
    }
    return {};
  }
}

export { LocalStorage };
