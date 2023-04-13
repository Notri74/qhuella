interface StorageInterface {
  set(name: string, value: string): void;
  get(name: string): string;
  setJson(name: string, value: Array<any> | object): void;
  getJson(name: string): Array<any> | object;
}

export { StorageInterface };
