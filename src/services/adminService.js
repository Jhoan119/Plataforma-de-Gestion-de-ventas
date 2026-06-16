/**
 * @fileoverview Servicio de Administrador — Supabase
 * Verifica permisos consultando la tabla `admins` (por uid de Firebase).
 */

import { supabase } from "../config/supabase";

export const adminService = {

  /**
   * Verifica si un uid está en la tabla `admins`.
   * @param {string} uid - Firebase UID
   * @returns {Promise<boolean>}
   */
  async isAdmin(uid) {
    if (!uid) return false;
    const { data, error } = await supabase
      .from("admins")
      .select("uid")
      .eq("uid", uid)
      .single();

    if (error || !data) return false;
    return true;
  },
};
