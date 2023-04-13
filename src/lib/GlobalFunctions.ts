import { Carrito, ItemCarrito, AparcaCarrito } from './ItemsCarritos';
import { database } from './TiposDB';
import { Item } from './Tipos';
import { cartItemsStore } from '../stores/cartItems';
import { saveAs } from 'file-saver';

const data = database as Item[];
//const storeCarrito = cartItemsStore();

export function downloadJson(json: string) {
  const data = JSON.stringify(json);
  let blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'jsonPrueba');
}

export function get_item_by_id(id: string) {
  return data.find((item) => item.id === id);
}

export function get_ghgs_by_id(id: string, year: string): string[] {
  let item = get_item_by_id(id);
  if (typeof item != 'undefined') {
    return Object.keys(item.GHG[year] || {});
  }
  return [];
}

const decimales = 4;
const decimals_separator = ',';
const units_separator = '.';
export function fixDecimals(value: number): number {
  return Math.round(value * Math.pow(10, decimales)) / Math.pow(10, decimales);
}

export function calculo(ghgValue: string | number, value: number): number {
  ghgValue = typeof ghgValue == 'string' ? parseFloat(ghgValue) : ghgValue;

  return fixDecimals(ghgValue * value);
}

export function formatDecimals(value: number): string {
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
    parts[1] = parts[1].padEnd(decimales, '0');
  }
  return parts.join(decimals_separator);
}
export function get_ghg_value(id: string, ghg: string, year: string): number {
  let itemValue = get_item_by_id(id);

  if (typeof itemValue != 'undefined') {
    return parseFloat(itemValue.GHG[year][ghg]);
  }

  return 0;
}

export function mapear(carrito: Carrito) {
  let i_s: { [scope: string]: ItemCarrito[] } = {};
  let i_s_ordened: { [scope: string]: ItemCarrito[] } = {};

  carrito.items.map((ic) => {
    let i = get_item_by_id(ic.id);
    if (i) {
      i_s[i.scope] = i_s[i.scope] || [];
      i_s[i.scope].push(ic);
    }
  });

  let scopes = Object.keys(i_s).sort();

  if (scopes.length > 0 && scopes[0].toLowerCase().startsWith('outside')) {
    scopes.push(scopes.shift() as string);
  }
  scopes.map((scope) => {
    i_s_ordened[scope] = i_s[scope];
  });
  return i_s_ordened;
}
