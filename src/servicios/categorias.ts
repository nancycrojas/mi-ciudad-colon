import { categorias } from "../mocks/categorias";
import type { Categoria } from "../tipos/categorias";

export async function obtenerCategorias(): Promise<Categoria[]> {
  return categorias;
}
