<script setup lang="ts">
import { ref } from 'vue';
import Tablas from './pages/Tablas.vue';
import Calc from './components/Calc.vue';
import Graphics from './components/Graphics.vue';

import 'bootstrap';
import 'bootswatch/dist/yeti/bootstrap.min.css';

const page = ref('Calculadora');

function changePage(pageName: string) {
  page.value = pageName;
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Huella de carbono</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarColor01"
        aria-controls="navbarColor01"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor01">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a
              class="nav-link active"
              href="#"
              @click="changePage('Calculadora')"
              >Calculadora
              <span class="visually-hidden">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="#" @click="changePage('Tablas')"
              >Tablas
              <span class="visually-hidden">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="#" @click="changePage('Graficos')"
              >Graficos
              <span class="visually-hidden">(current)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <Tablas v-if="page == 'Tablas'"></Tablas>
  <Calc v-if="page == 'Calculadora'"></Calc>
  <Graphics v-if="page == 'Graficos'"> </Graphics>
</template>
