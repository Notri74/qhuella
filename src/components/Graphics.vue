<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  mapear,
  get_ghg_value,
  fixDecimals,
  calculo,
} from '../lib/GlobalFunctions';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { reactive, ref, Ref } from 'vue';
import { jsPDF } from 'jspdf';
import { cartItemsStore } from '../stores/cartItems';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

let scopesTotales: number[] = [];
let storeCarrito = cartItemsStore();
let carrito = storeCarrito.carritos;
let valoresScopes: number[] = [];
let ids: string[] = [];
let doc = new jsPDF();

for (let items of Object.keys(carrito)) {
  ids.push(items);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

for (let carr_id of Object.keys(storeCarrito.carritos)) {
  valoresScopes.splice(0, valoresScopes.length);

  let carr = storeCarrito.carritos[carr_id];
  let tablaScope = mapear(carr);
  let totalesScopes = [];
  for (let scope of Object.keys(tablaScope)) {
    let tablaBusqueda = tablaScope[scope];

    let sumatorios = [];

    for (let i = 0; i < tablaBusqueda.length; i++) {
      let resultado: number = calculo(
        tablaBusqueda[i].valorGhg,
        tablaBusqueda[i].value
      );
      sumatorios.push(resultado);
    }

    totalesScopes.push(fixDecimals(sumarValoresScopes(sumatorios)));
  }
  scopesTotales.push(fixDecimals(sumarValoresScopes(totalesScopes)));
}

function sumarValoresScopes(valores: number[]) {
  let sumaScope: number = 0;
  for (let i = 0; i < valores.length; i++) {
    sumaScope += valores[i];
  }
  return sumaScope;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function magicRef(a: any): Ref | any {
  return typeof a == 'object' && !Array.isArray(a) ? reactive(a) : ref(a);
}

const chartData: { labels: any; datasets: any } = magicRef({
    labels: ids,
    datasets: [
      {
        label: 'CO2e',
        data: scopesTotales,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)',
        ],
        borderWidth: 1,
      },
    ],
  }),
  chartOptions = magicRef({
    responsive: true,
  });

function graphicsDownload() {
  let myChart = ChartJS.getChart('my-chart-id');
  let image = myChart?.toBase64Image() || '';

  doc.addImage(image, 'JPEG', 20, 40, 180, 100);
  doc.save('mipdf.pdf');
}
</script>
<template>
  <h1>Co2 emitido</h1>
  <button @click="graphicsDownload()">Download PDF</button>

  <Bar id="my-chart-id" :options="chartOptions" :data="chartData" />
</template>
<style></style>
