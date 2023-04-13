<script setup lang="ts">
import { Cookiestorage } from '../lib/CookiesStorage';
import { ref, onMounted } from 'vue';
import { cartItemsStore } from '../stores/cartItems';
import { utils, writeFile } from 'xlsx';
import Tablaca from '../components/Tablaca.vue';
// import {setCurrentCarrito} from '../stores/menuItems'
import {
  mapear,
  get_ghg_value,
  fixDecimals,
  calculo,
} from '../lib/GlobalFunctions';
import { saveAs } from 'file-saver';
import { menuStore } from '../stores/menuItems';
import Calc from '../components/Calc.vue';

const menuItem = menuStore();
const storeCarrito = cartItemsStore();

let carrito = storeCarrito.carritos;

let valoresScopes: number[] = [];

for (let claves of Object.keys(carrito)) {
  let clav = storeCarrito.carritos;

  for (let i = 0; i < clav[claves].items.length; i++) {
    let id_del_item_db = clav[claves].items[i].id;
    let anio_db = clav[claves].items[i].year;
    let ghg_db = clav[claves].items[i].ghg;
    let value_db = clav[claves].items[i].value;
    let valorScopes = calculo(
      get_ghg_value(id_del_item_db, ghg_db, anio_db),
      value_db
    );
    valoresScopes.push(valorScopes);
  }
}

function sumarValoresScopes(valores: number[]) {
  let sumaScope: number = 0;
  for (let i = 0; i < valores.length; i++) {
    sumaScope += valores[i];
  }
  return sumaScope;
}

function exportToExcel() {
  let wb = utils.book_new();

  for (let carr_id of Object.keys(storeCarrito.carritos)) {
    let tablas: string[][] = [];

    let carr = storeCarrito.carritos[carr_id];
    let tablaScope = mapear(carr);
    let totalesScopes = [];
    for (let scope of Object.keys(tablaScope)) {
      let tablaBusqueda = tablaScope[scope];
      tablas.push([scope]);
      tablas.push([
        'Descripción',
        'Valor Introducido',
        'GHG',
        'Valor Calculado',
      ]);
      let sumatorios = [];

      for (let i = 0; i < tablaBusqueda.length; i++) {
        let resultado: number = calculo(
          tablaBusqueda[i].valorGhg,
          tablaBusqueda[i].value
        );

        sumatorios.push(resultado);
        tablas.push([
          tablaBusqueda[i].description,
          tablaBusqueda[i].value.toString(),
          tablaBusqueda[i].ghg,
          '' + resultado,
        ]);
      }

      tablas.push([
        '',
        '',
        'Total ' + scope,
        '' + fixDecimals(sumarValoresScopes(sumatorios)) + ' kg CO2e',
      ]);

      tablas.push(['', '', '', '']);

      tablas.push(['', '', '', '']);

      totalesScopes.push(fixDecimals(sumarValoresScopes(sumatorios)));
    }
    tablas.push([
      '',
      '',
      'Total ',
      '' + fixDecimals(sumarValoresScopes(totalesScopes)) + ' kg CO2e',
    ]);

    let ws = utils.aoa_to_sheet(tablas);

    ws['!cols'] = [{ width: 25 }, { width: 20 }, { width: 20 }, { width: 20 }];

    utils.book_append_sheet(wb, ws, carr_id);
  }
  writeFile(wb, 'ebvExcel.xlsx');
}

const currentCarrito = ref('');

function setCurrentCarrito(carritoId: string | number) {
  currentCarrito.value = carritoId.toString();

  return currentCarrito.value;
}

let aux: any;

const storage = new Cookiestorage();
const formDataCookie = 'calculadoraFormData';

function loadCarritoPage(carritoId: string | number) {
  let cookie = storage.getJson(formDataCookie) as any;

  let c = carrito[carritoId];

  cookie.year = c.year;
  cookie.language = c.language;
  cookie.iso = c.iso;
  cookie.yearFilter = '';
  cookie.languageFilter = '';
  cookie.isoFilter = '';

  storage.setJson(formDataCookie, cookie);

  changePage('Calculadora', carritoId);
}

onMounted(() => {
  aux = document.getElementById('auxiliar-import-carritos');
  aux.addEventListener('change', function () {
    let fr = new FileReader();
    fr.onload = () => {
      let importedCarritos = JSON.parse(fr.result as string);
      Object.keys(importedCarritos).map((k) => {
        storeCarrito.carritos[k] = importedCarritos[k];
      });
      storeCarrito.save();
      aux.value = null;
    };
    fr.readAsText(aux.files[0]);
  });
});

function importCarritos() {
  aux?.click();
}
function crearJson() {
  let carrito = storeCarrito.carritos;
  const data = JSON.stringify(carrito);
  let blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'JSON');
}

const page = ref('');

function changePage(pageName: string, index: any) {
  menuItem.importId(index);
  page.value = pageName;
}
</script>
<template>
  <ul class="nav nav-tabs">
    <li class="nav-item btn btn-outline">
      <a :class="['nav-link']" href="#" @click="crearJson()">Exportar</a>
    </li>
    <li class="nav-item btn btn-outline">
      <a :class="['nav-link']" href="#" @click="importCarritos()">Importar</a>
    </li>
    <li class="nav-item btn btn-outline">
      <a :class="['nav-link']" href="#" @click="exportToExcel()">Crear Excel</a>
    </li>

    <li class="nav-item btn btn-outline">
      <a :class="['nav-link']" href="#" @click="storeCarrito.deleteCarritos()"
        >Borrar datos</a
      >
    </li>

    <li
      class="nav-item btn btn-outline"
      v-for="(item, index) in carrito"
      :key="index"
    >
      <a
        :class="['nav-link', currentCarrito == (index as string) ? 'active' : '']"
        href="#"
        @click="setCurrentCarrito(index), changePage('Tablaca', index)"
        >{{ index }}
      </a>
      <a
        v-if="currentCarrito == index"
        class="btn btn-info"
        @click="loadCarritoPage(index)"
        >Añadir datos</a
      >
    </li>
  </ul>
  <Calc v-if="page == 'Calculadora'"></Calc>
  <Tablaca
    :carrito="currentCarrito"
    v-if="currentCarrito && page != 'Calculadora'"
  ></Tablaca>

  <input type="file" id="auxiliar-import-carritos" class="d-none" />
</template>

<style scoped>
a:hover {
  color: white;
  background-color: var(--bs-primary);
}
</style>
