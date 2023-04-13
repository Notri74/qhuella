// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia';
import esLang from '../assets/es.lang.json';
import enLang from '../assets/en.lang.json';
import { ref, onMounted } from 'vue';
import { ItemCarrito, AparcaCarrito, Carrito } from '../lib/ItemsCarritos';
import { Cookiestorage } from '../lib/CookiesStorage';
import MenuItemsVue from '../components/MenuItems.vue';

const langs = {
  ES: esLang as { [key: string]: string },
  UK: enLang as { [key: string]: string },
};

export const menuStore = defineStore({
  id: 'menu',
  state: () => ({
    year: '2018',
    language: 'ES',
    iso: '27001',
  }),

  actions: {
    translate(key: string) {
      if (typeof this.language !== 'undefined') {
        if (
          typeof langs[this.language as keyof typeof langs][key] !== 'undefined'
        ) {
          return langs[this.language as keyof typeof langs][key];
        }
      }

      return {};
    },
    importId(index: string) {
      let id: string[] = [];
      id = index.split('-');
      for (let i = 0; i < id.length; i++) {
        this.year = id[0];
        this.language = id[2];
        this.iso = id[1];
      }
    },
  },
});

///////////////TAL VEZ NO !!!!

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(menuStore, import.meta.hot));
// }
