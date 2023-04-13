type ItemCarrito = {
  _id?: string;
  id: string;
  value: number;
  description: string;
  ghg: string;
  year: string;
  valorGhg: string;
};
type Carrito = {
  year: string;
  iso: string;
  language: string;
  items: ItemCarrito[];
};
type AparcaCarrito = { [id: string]: Carrito };

export { ItemCarrito, Carrito, AparcaCarrito };
