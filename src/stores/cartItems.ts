// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ItemCarrito, AparcaCarrito } from '../lib/ItemsCarritos';
import { Cookiestorage } from '../lib/CookiesStorage';

const cookie = new Cookiestorage();

export const cartItemsStore = defineStore('carrito', {
  state: () => ({
    carritos: (cookie.getJson('eduCarro') || {}) as AparcaCarrito,
  }),
  actions: {
    save() {
      cookie.setJson('eduCarro', this.carritos);
    },
    createId(year: string, iso: string, language: string) {
      return year + '-' + iso + '-' + language;
    },
    addItem(year: string, iso: string, language: string, item: ItemCarrito) {
      let id_carrito = this.createId(year, iso, language);
      if (typeof this.carritos[id_carrito] == 'undefined') {
        this.carritos[id_carrito] = {
          year,
          iso,
          language,
          items: [],
        };
      }
      item._id = Date.now().toString() + '.' + Math.random().toString();
      this.carritos[id_carrito].items.push(item);
      this.save();
    },
    deleteItem(id_carrito: string, id: string) {
      if (this.carritos[id_carrito]) {
        for (let i = 0; i < this.carritos[id_carrito].items.length; i++) {
          if (this.carritos[id_carrito].items[i]._id == id) {
            this.carritos[id_carrito].items.splice(i, 1);
          }
        }
        if (this.carritos[id_carrito].items.length < 1) {
          delete this.carritos[id_carrito];
        }
        this.save();
      }
    },
    deleteCarritos() {
      for (let item in this.carritos) {
        delete this.carritos[item];
      }
      cookie.setJson('eduCarro', {});
    },
  },
});
