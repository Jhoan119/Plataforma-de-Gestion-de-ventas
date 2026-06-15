/**
 * @fileoverview Controlador del Panel de Administrador
 * Usa el isAdmin del AuthContext (ya verificado al login) en vez de re-verificar.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { firestoreProductService } from "../services/firestoreProductService";
import { cloudinaryService } from "../services/cloudinaryService";

export function useAdminController() {
  // isAdmin ya viene verificado desde AuthContext — no re-consultamos Supabase
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [loading,  setLoading]  = useState(true);
  const [products, setProducts] = useState([]);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  useEffect(() => {
    async function init() {
      // Esperar a que AuthContext termine de cargar
      if (authLoading) return;
      if (isAdmin) await loadProducts();
      setLoading(false);
    }
    init();
  }, [user, isAdmin, authLoading]);

  async function loadProducts() {
    const data = await firestoreProductService.getAll();
    setProducts(data);
  }

  async function createProduct(productData) {
    setError(""); setSuccess("");
    try {
      await firestoreProductService.create(productData);
      await loadProducts();
      setSuccess("¡Producto creado exitosamente!");
      return true;
    } catch {
      setError("Error al crear el producto.");
      return false;
    }
  }

  async function updateProduct(id, productData) {
    setError(""); setSuccess("");
    try {
      await firestoreProductService.update(id, productData);
      await loadProducts();
      setSuccess("¡Producto actualizado exitosamente!");
      return true;
    } catch {
      setError("Error al actualizar el producto.");
      return false;
    }
  }

  async function deleteProduct(id) {
    setError(""); setSuccess("");
    try {
      await firestoreProductService.delete(id);
      await loadProducts();
      setSuccess("Producto eliminado.");
      return true;
    } catch {
      setError("Error al eliminar el producto.");
      return false;
    }
  }

  async function uploadImage(file) {
    try {
      return await cloudinaryService.uploadImage(file);
    } catch {
      setError("Error al subir la imagen.");
      return null;
    }
  }

  return {
    isAdmin, loading: loading || authLoading, products,
    createProduct, updateProduct, deleteProduct,
    uploadImage, error, success,
  };
}
