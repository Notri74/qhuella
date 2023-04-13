<script setup lang="ts">
import { Cookiestorage } from '../lib/CookiesStorage';
import { computed, reactive, watch } from 'vue';
import { menuStore } from '../stores/menuItems';
import ukFlag from '../assets/imgs/flags/uk.png';
import esFlag from '../assets/imgs/flags/es.png';

const menuItem = menuStore();

const flags = {
  ES: esFlag,
  UK: ukFlag,
};

const storage = new Cookiestorage();
const formDataCookie = 'calculadoraFormData';
const cookieFormData = storage.getJson(formDataCookie);

const this_year = new Date().getFullYear();
const this_language = ['UK', 'ES'];
const this_iso = ['Clea', '27001'];

const formData = reactive({
  ...{
    year: this_year,
    // year: menuItem.year,
    yearFilter: '',
    language: this_language[0],
    // language: menuItem.language,
    languageFilter: '',
    iso: this_iso[0],
    // iso: menuItem.iso,
    isoFilter: '',
  },
  ...cookieFormData,
});

// menuItem.year = formData.year.toString();
// menuItem.language = formData.language;
// menuItem.iso = formData.iso;

const years = computed(() => {
  let years: number[] = [];
  for (let i = this_year; i > 2015; i--) {
    years.push(i);
  }
  years = years.filter((y) => y.toString().includes(formData.yearFilter));
  return years;
});

const languages = computed(() => {
  let languages: string[] = [];
  for (let i = 0; i < this_language.length; i++) {
    languages.push(this_language[i]);
  }
  languages = languages.filter((l) =>
    l.toString().includes(formData.languageFilter.toUpperCase())
  );
  return languages;
});

const isos = computed(() => {
  let isos: string[] = [];
  for (let i = 0; i < this_iso.length; i++) {
    isos.push(this_iso[i]);
  }
  isos = isos.filter((is) =>
    is.toString().includes(formData.isoFilter.toUpperCase())
  );
  return isos;
});

watch(formData, (n, o) => {
  storage.setJson(formDataCookie, n);
  menuItem.year = n.year.toString();
  menuItem.language = n.language;
  menuItem.iso = n.iso;
});
</script>

<template>
  <div class="container p-2">
    <div
      class="btn-group"
      role="group"
      aria-label="Button group with nested dropdown"
    >
      <div class="btn-group" role="group">
        <button
          id="btnGroupDrop1"
          type="button"
          class="btn btn-primary dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {{ formData.year }}
        </button>

        <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
          <div class="dropdown-item">
            <input type="search" v-model="formData.yearFilter" />
          </div>
          <div
            class="dropdown-item"
            v-for="y of years"
            @click="formData.year = y"
            :key="y"
          >
            {{ y }}
          </div>
        </div>
      </div>
      <div
        class="btn-group language-button"
        :class="formData.language.toLowerCase()"
        role="group"
      >
        <button
          id="btnGroupDrop1"
          type="button"
          class="btn btn-primary dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <img
            :src="flags[formData.language as keyof typeof flags]"
            class="flag"
            alt=""
          />

          {{ formData.language }}
        </button>

        <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
          <div class="dropdown-item">
            <input type="search" v-model="formData.languageFilter" />
          </div>
          <div
            class="dropdown-item"
            v-for="l of languages"
            :key="l"
            :class="[l.toLowerCase(), 'd-flex', 'align-items-center']"
            @click="formData.language = l"
          >
            <img :src="flags[l as keyof typeof flags]" class="flag" alt="" />

            {{ l }}
          </div>
        </div>
      </div>
      <div class="btn-group" role="group">
        <button
          id="btnGroupDrop1"
          type="button"
          class="btn btn-primary dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {{ formData.iso }}
        </button>

        <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
          <div class="dropdown-item">
            <input type="search" v-model="formData.isoFilter" />
          </div>
          <div
            class="dropdown-item"
            v-for="i of isos"
            @click="formData.iso = i"
            :key="i"
          >
            {{ i }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
img.flag {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.dropdown-item {
  cursor: pointer;
}
</style>
