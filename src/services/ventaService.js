/**
 * @fileoverview Servicio de Ventas — Supabase
 * Registra ventas y sus detalles en Supabase.
 */

import { supabase } from "../config/supabase";

export const ventaService = {

  async crear(ventaData) {
    // 1. Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from("ventas")
      .insert({
        id_cliente:      ventaData.id_cliente,
        total:           ventaData.total,
        metodo_contacto: ventaData.metodo_contacto || "web",
        estado:          "pendiente",
      })
      .select()
      .single();

    if (ventaError) throw ventaError;

    // 2. Crear los detalles
    // item.productId es el UUID real del producto en Supabase
    // item.id puede tener sufijos de talla/color por eso usamos productId
    const detalles = ventaData.items.map(item => ({
      id_venta:        venta.id,
      id_producto:     item.productId || item.id, // productId es el UUID limpio
      cantidad:        item.quantity,
      precio_unitario: item.price,
      talla:           item.size  || null,
      color:           item.color || null,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_venta")
      .insert(detalles);

    if (detalleError) throw detalleError;

    return venta.id;
  },

  async getHistorial(uid) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("uid", uid)
      .single();

    if (!usuario) return [];

    const { data, error } = await supabase
      .from("ventas")
      .select(`*, detalle_venta(*, productos(nombre, img))`)
      .eq("id_cliente", usuario.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("ventas")
      .select(`*, usuarios(nombre, email), detalle_venta(*, productos(nombre, img))`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
};
