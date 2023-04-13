<script setup lang="ts">
import { Pie, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';
import { cartItemsStore } from '../stores/cartItems';
import { computed, watch } from 'vue';
import { ItemCarrito } from '../lib/ItemsCarritos';
import { reactive, ref, Ref } from 'vue';
import {
  mapear,
  formatDecimals,
  get_ghg_value,
  get_ghgs_by_id,
  fixDecimals,
  calculo,
} from '../lib/GlobalFunctions';
import Calc from './Calc.vue';
const page = ref('Calculadora');

function changePage(pageName: string) {
  page.value = pageName;
}

let storeCarrito = cartItemsStore();
let ghgCO2e: string = '';

const props = defineProps<{
  carrito: string;
}>();

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

function magicRef(a: any): Ref | any {
  return typeof a == 'object' && !Array.isArray(a) ? reactive(a) : ref(a);
}

const carrito = computed(() => {
  return storeCarrito.carritos[props.carrito] || { items: [] };
});

watch(storeCarrito, () => {
  storeCarrito.save();
});

const items_scoped = computed(() => {
  return mapear(carrito.value);
});

// const items_scoped_values = computed(() => {
//   let values: { [scope: string]: number[] } = {};
//   Object.keys(items_scoped.value).map((scope) => {
//     values[scope] = [];
//     items_scoped.value[scope].map((item) => {
//       values[scope].push(
//         calculo(get_ghg_value(item.id, item.ghg, item.year), item.value)
//       );
//     });
//   });
//   return values;
// });
const items_scoped_values = computed(() => {
  let values: { [scope: string]: number[] } = {};
  Object.keys(items_scoped.value).map((scope) => {
    values[scope] = [];
    items_scoped.value[scope].map((item) => {
      values[scope].push(calculo(item.valorGhg, item.value));
    });
  });
  return values;
});

const items_labels = computed(() => {
  let values: string[] = [];
  Object.keys(items_scoped.value).map((scope) => {
    items_scoped.value[scope].map((item) => {
      values.push(item.description);
    });
  });
  return values;
});

const scopes_values = computed(() => {
  let values: number[] = [];
  Object.keys(items_scoped_values.value).map((scope) => {
    values.push(items_scoped_values.value[scope].reduce((a, b) => a + b));
  });
  return values;
});

const items_values = computed(() => {
  let values: number[] = [];
  Object.keys(items_scoped_values.value).map((scope) => {
    values = [...values, ...items_scoped_values.value[scope]];
  });
  return values;
});

const items_values2 = computed(() => {
  let values: any[] = [];
  Object.keys(items_scoped.value).map((scope) => {
    values = [...values, ...items_scoped.value[scope]];
  });
  return values;
});

const items_values3 = computed(() => {
  let totales: any[] = [];
  let kgN2O: any[] = [];
  let kgCO2: any[] = [];
  let kgCH4: any[] = [];
  Object.keys(items_values2.value).map((scope: any) => {
    let calculoN2O = calculo(
      get_ghg_value(
        items_values2.value[scope].id,
        'kg N2O',
        items_values2.value[scope].year
      ),
      items_values2.value[scope].value
    );

    if (calculoN2O >= 0) {
      kgN2O.push(calculoN2O);
    }

    let calculoCO2 = calculo(
      get_ghg_value(
        items_values2.value[scope].id,
        'kg CO2',
        items_values2.value[scope].year
      ),
      items_values2.value[scope].value
    );

    if (calculoCO2 >= 0) {
      kgCO2.push(calculoCO2);
    }

    let calculoCH4 = calculo(
      get_ghg_value(
        items_values2.value[scope].id,
        'kg CH4',
        items_values2.value[scope].year
      ),
      items_values2.value[scope].value
    );

    if (calculoCH4 >= 0) {
      kgCH4.push(calculoCH4);
    }
  });

  kgN2O = kgN2O.reduce((a: number, b: number) => a + b, 0);
  kgCO2 = kgCO2.reduce((a: number, b: number) => a + b, 0);
  kgCH4 = kgCH4.reduce((a: number, b: number) => a + b, 0);
  totales.push(kgN2O, kgCO2, kgCH4);

  return totales;
});

const labels_values2 = computed(() => {
  let totales: any[] = [];

  Object.keys(items_values2.value).map(() => {
    totales.push('kg N2O', 'kg CO2', 'kgCH4');
  });
  totales.splice(3, totales.length);
  return totales;
});

const chartOptions = magicRef({
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        title: function (context: any) {
          context = context[0];
          let i = context.dataIndex;
          let l: string =
            context.datasetIndex < 1 ? context.label : items_labels.value[i];
          return l;
        },
      },
    },

    legend: {
      labels: {
        generateLabels: function (chart: any) {
          const original =
            ChartJS.overrides.pie.plugins.legend.labels.generateLabels;
          const labelsOriginal: any[] = original.call(this, chart);
          let datasetColors = chart.data.datasets.map(function (e: any) {
            return e.backgroundColor;
          });
          datasetColors = datasetColors.flat();
          labelsOriginal.forEach((label) => {
            label.datasetIndex = (label.index - (label.index % 2)) / 2;
            label.fillStyle = datasetColors[label.index];
          });
          return labelsOriginal;
        },
      },
      onClick: function (mouseEvent: any, legendItem: any, legend: any) {
        legend.chart.getDatasetMeta(legendItem.datasetIndex).hidden =
          legend.chart.isDatasetVisible(legendItem.datasetIndex);
        legend.chart.update();
      },
    },
  },
});

const chartData = computed(() => {
  return {
    labels: [...Object.keys(items_scoped.value), ...items_labels.value],
    datasets: [
      {
        backgroundColor: ['#FFCCFF', '#FFFF33'],
        data: scopes_values.value,
      },
      {
        backgroundColor: [
          'hsl(0, 100%, 60%)',
          'hsl(0, 100%, 35%)',
          'hsl(180, 100%, 60%)',
          'hsl(180, 100%, 35%)',
          'hsl(100, 100%, 60%)',
          'hsl(100, 100%, 35%)',
        ],
        data: items_values.value,
      },
    ],
  };
});

const chartData2 = computed(() => {
  return {
    labels: labels_values2.value,
    datasets: [
      {
        label: 'Gases',
        data: items_values3.value,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
        ],
        hoverOffset: 4,
      },
    ],
  };
});
</script>

<template>
  <table class="table table-hover" v-if="props.carrito">
    <tbody scope="row" v-for="(i_scope, ind) in items_scoped" :key="ind">
      <tr class="table-success">
        <th colspan="5">{{ ind }}</th>
      </tr>

      <tr class="table-secondary">
        <th scope="col">Descripción</th>
        <th scope="col">Valor introducido</th>
        <th scope="col">GHG</th>
        <th scope="col">Valor convertido</th>
        <th style="border-top: 0; border-right: 0"></th>
      </tr>

      <tr v-for="(i_carr, index) in i_scope" :key="index">
        <td><input type="text" v-model="i_carr.description" /></td>
        <td><input type="number" v-model="i_carr.value" /></td>

        <td>
          <ul v-for="val in get_ghgs_by_id(i_carr.id, i_carr.year)" :key="val">
            <li v-if="val == 'kg CO2e'">
              <b> {{ val }}</b>
            </li>
            <li v-else>
              {{ val }}
            </li>
          </ul>
        </td>
        <td>
          <ul v-for="val in get_ghgs_by_id(i_carr.id, i_carr.year)" :key="val">
            <li v-if="val == 'kg CO2e'">
              <b>
                {{
                  formatDecimals(
                    calculo(
                      get_ghg_value(i_carr.id, val, i_carr.year),
                      i_carr.value
                    )
                  )
                }}</b
              >
            </li>
            <li v-else>
              {{
                formatDecimals(
                  calculo(
                    get_ghg_value(i_carr.id, val, i_carr.year),
                    i_carr.value
                  )
                )
              }}
            </li>
          </ul>
        </td>

        <td>
          <button
            @click="
              storeCarrito.deleteItem(
                props.carrito as string,
                i_carr._id as string
              )
            "
          >
            BORRAR
          </button>
        </td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <th class="t-right">{{ ind }}</th>
        <th>
          {{
            formatDecimals(
              fixDecimals(
                i_scope
                  .map((i_carr: ItemCarrito) => {
                    return calculo(i_carr.valorGhg, i_carr.value);
                  })
                  .reduce((a: number, b: number) => a + b, 0)
              )
            )
          }}

          kg CO2e
        </th>
      </tr>
    </tbody>
    <tfoot v-if="carrito.items.length > 0">
      <tr>
        <td colspan="2"></td>
        <th class="t-right">Total Scopes</th>
        <th>
          {{
            formatDecimals(
              fixDecimals(
                carrito.items
                  .map((i_carr: ItemCarrito) => {
                    return calculo(i_carr.valorGhg, i_carr.value);
                  })
                  .reduce((a: number, b: number) => a + b, 0)
              )
            )
          }}
          kg CO2e
        </th>
      </tr>
    </tfoot>
  </table>

  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <Pie id="pie" :options="chartOptions" :data="chartData" />
      </div>
      <div class="col-md-6">
        <Doughnut id="pie" :data="chartData2" />
      </div>
    </div>
  </div>
</template>
<style>
tbody {
  border-bottom: 2px solid var(--bs-purple);
}

tbody:last-child {
  border-bottom: 0;
}

.t-right {
  text-align: right !important;
}

ul {
  list-style: none;
}
</style>
