import { StorageInterface } from './Storage';

class Cookiestorage implements StorageInterface {
  days: number = 30;

  constructor(days: number = 30) {
    this.days = days;
  }

  set(name: string, value: string) {
    let expires = '';

    if (this.days) {
      const date = new Date();
      date.setTime(date.getTime() + this.days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
  }
  get(name: string) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
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

export { Cookiestorage };
