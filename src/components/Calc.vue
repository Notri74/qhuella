<script setup lang="ts">
import { Cookiestorage } from '../lib/CookiesStorage';
import { ref, Ref, computed, reactive, watch } from 'vue';
import MenuItems from './MenuItems.vue';
import { menuStore } from '../stores/menuItems';
import { cartItemsStore } from '../stores/cartItems';
import { Item } from '../lib/Tipos';
import { titles, database } from '../lib/TiposDB';
import Tablaca from './Tablaca.vue';

const storage = new Cookiestorage();
const formDataCookie = 'calculadoraFormData';
const reactiveDataCookie = 'calculadoraReactiveData';
const cookieFormData = storage.getJson(formDataCookie);
const cookieReactiveData: { [key: string]: any } =
  storage.getJson(reactiveDataCookie);
const recursive_year = true;

const menuItem = menuStore();
const storeCarrito = cartItemsStore();

const data = database as Item[];

const this_language = ['UK', 'ES'];
const this_iso = ['Clea', '27001'];
const this_year = new Date().getFullYear();

const formData = reactive({
  ...{
    year: this_year,
    yearFilter: '',
    language: this_language[0],
    languageFilter: '',
    iso: this_iso[0],
    isoFilter: '',
  },
  ...cookieFormData,
});

const valuesGhg = computed(() => {
  let ghgs: { [ghg: string]: string } = {};

  let datos = currentItem;

  if (typeof datos != 'undefined') {
    ghgs = datos.value?.GHG[menuItem.year] || {};
  }

  return ghgs;
});

const decimals = 5;
const decimals_separator = ',';
const units_separator = '.';

////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
function fixDecimals(value: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
function calculo(ghgValue: string | number, value: number): number {
  ghgValue = typeof ghgValue == 'string' ? parseFloat(ghgValue) : ghgValue;
  return fixDecimals(ghgValue * value);
}

const data_base_filtered = computed(() => {
  let filt_data = data;
  if (recursive_year) {
    filt_data = JSON.parse(JSON.stringify(filt_data));
    filt_data = filt_data.map((r) => {
      r.AUX = r.AUX || {};
      let y = parseInt(menuItem.year);
      let ys = Object.keys(r.GHG)
        .map((y) => parseInt(y))
        .sort();
      if (!ys.includes(y) && ys.length > 0 && ys[0] < y) {
        let temp_year = 0;
        let temp_year_part = 0;
        while (ys[temp_year_part] < y) {
          temp_year = ys[temp_year_part];
          temp_year_part++;
        }
        r.GHG[y.toString()] = r.GHG[temp_year.toString()];
        r.AUX[y.toString()] = temp_year.toString();
      } else {
        r.AUX[y.toString()] = y.toString();
      }
      return r;
    });
  }

  filt_data = filt_data.filter((r) => {
    let y = menuItem.year;
    let ys = Object.keys(r.GHG);
    return ys.includes(y);
  });

  return filt_data;
});

function formatDecimals(value: number): string {
  let parts = value.toString().split('.');
  parts[0] =
    parts[0]
      .split('')
      .reverse()
      .join('')
      .match(/.{1,3}/g)
      ?.join(units_separator)
      .split('')
      .reverse()
      .join('') ?? '0';
  //parts[0] = parts[0].match(/.{1,3}/g)?.join('.') ?? "0";

  if (parts[1]) {
    parts[1] = parts[1].padEnd(decimals, '0');
  }
  return parts.join(decimals_separator);
}

const value: Ref<number> = ref(1);
const description: Ref<string> = ref('');

const currentItem = computed(() => {
  let datos = data_base_filtered.value.find((r) => {
    return conditionData.year(r);
  });
  return datos;
});

const reactiveData = reactive({
  ...{
    scope: '',
    level1: '',
    level2: '',
    level3: '',
    level4: '',
    ColumnText: '',
    UOM: '',
  },
  ...cookieReactiveData,
});

function get_item_by_id(id: string): Item | undefined {
  return data.find((i) => i.id == id);
}

const conditionData = {
  scope: (row: Item) => {
    return true;
  },
  level1: (row: Item) => {
    return reactiveData.scope == row.scope;
  },
  level2: (row: Item) => {
    return conditionData.generic(row, 'level1');
  },
  level3: (row: Item) => {
    return conditionData.generic(row, 'level2');
  },
  level4: (row: Item) => {
    return conditionData.generic(row, 'level3');
  },
  ColumnText: (row: Item) => {
    return conditionData.generic(row, 'level4');
  },
  UOM: (row: Item) => {
    return conditionData.generic(row, 'ColumnText');
  },
  year: (row: Item) => {
    return conditionData.generic(row, 'UOM');
  },
  generic: (row: Item, condition: string = 'scope') => {
    let conditionCB = conditionData[condition as keyof typeof conditionData];
    let reactiveValue = reactiveData[condition as keyof typeof reactiveData];
    let rowValue = row[condition as keyof Item];
    if (conditionCB(row) && reactiveValue == rowValue) {
      return true;
    }
    return false;
  },
};

function dataFilter(filter: string): string[] {
  let filters: string[] = [];

  let hasEmptyValue = false;

  data_base_filtered.value.map((row) => {
    let cb: CallableFunction =
      conditionData[filter as keyof typeof conditionData];
    let filterValues: string[] = [];
    if (filter == 'year') {
      filterValues = Object.keys(row.GHG);
    } else {
      filterValues = [row[filter as keyof Item] as string];
    }
    for (let i = 0; i < filterValues.length; i++) {
      let filterValue = filterValues[i];
      if (cb(row) && !filters.includes(filterValue)) {
        if (filterValue === '') {
          hasEmptyValue = true;
        }

        filters.push(filterValue);
      }
    }
  });

  // Replanteamiento de version o eliminacion
  if (!filters.includes(reactiveData[filter as keyof typeof reactiveData])) {
    //reactiveData[filter as keyof typeof reactiveData] = '';
  }
  return filters;
}

const currentCarritoId = computed(() => {
  let id = storeCarrito.createId(
    menuItem.year,
    menuItem.iso,
    menuItem.language
  );

  return id;
});

function getRealYear(item?: Item) {
  if (item) {
    item.AUX = item.AUX || {};
    if (typeof item.AUX[menuItem.year] != 'undefined') {
      return item.AUX[menuItem.year];
    }
  }
  return menuItem.year;
}

const valorCO2e = computed(() => {
  let ghgs = valuesGhg.value;

  let valor = '';

  if (typeof ghgs != 'undefined') {
    valor = ghgs['kg CO2e'];
  }

  return valor;
});

function addItemToCart(
  year: string,
  iso: string,
  language: string,
  currentItem: any
) {
  const [ghgKey, ghgValue] = Object.entries(valuesGhg)[0];

  storeCarrito.addItem(year, iso, language, {
    id: currentItem?.id || '',
    //@ts-ignore
    ghg: valuesGhg.value,
    value: value.value,
    description: description.value,
    year: getRealYear(currentItem),
    valorGhg: valorCO2e.value,
  });
}
////////////////////////////////////////
watch(formData, (n, o) => {
  storage.setJson(formDataCookie, n);
});

watch(reactiveData, (n, o) => {
  storage.setJson(reactiveDataCookie, n);
});
</script>

<template>
  <div>
    <h1>Calculadora Huella Carbono</h1>
    <div>
      <MenuItems></MenuItems>
    </div>
  </div>
  <div class="container p-3">
    <div class="d-flex">
      <div
        class="form-group"
        v-for="(reactiveVar, reactiveKey) in reactiveData"
      >
        <label
          v-if="menuItem.language.toLocaleUpperCase() == 'UK'"
          class="form-label mt-4"
          >{{ titles.en[reactiveKey] }}</label
        >
        <label v-else class="form-label mt-4">
          {{ titles.es[reactiveKey] }}
        </label>
        <select
          class="form-select"
          v-model="reactiveData[reactiveKey]"
          :key="reactiveKey"
        >
          <option
            v-for="val in dataFilter(reactiveKey)"
            :key="val"
            :value="val"
          >
            {{ menuItem.translate(val) }}
          </option>
        </select>
      </div>
    </div>
    <div>
      <div class="form-group">
        <div class="input-group mb-3">
          <input
            class="form-control"
            type="number"
            v-model="value"
            placeholder="Introduce un valor"
          />
          <button
            class="btn btn-primary"
            @click="
              addItemToCart(
                menuItem.year,
                menuItem.iso,
                menuItem.language,
                currentItem
              )
            "
          >
            Añadir
          </button>
        </div>
        <input
          class="form-control"
          type="text"
          v-model="description"
          placeholder="Introduce una descripción"
          required
        />

        <div>
          Valor convertido a CO2e:
          {{ formatDecimals(calculo(valorCO2e, parseFloat(value.toString()))) }}
        </div>
      </div>
    </div>
    <div></div>
  </div>
  <Tablaca :carrito="currentCarritoId"></Tablaca>
</template>

<style scoped></style>
