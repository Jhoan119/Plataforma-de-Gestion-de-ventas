/**
 * @fileoverview Contexto de Autenticación
 * Firebase Auth para login/registro — Supabase para datos y permisos.
 * El campo `rol` de la tabla `usuarios` determina si es admin.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserModel } from "../models/User";
import { usuarioService } from "../services/usuarioService";
import { adminService } from "../services/adminService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          // Sincronizar con Supabase
          try {
            await usuarioService.sincronizar(firebaseUser);
          } catch (e) {
            console.warn("No se pudo sincronizar usuario con Supabase:", e);
          }

          // Verificar si es admin desde Supabase
          const admin = await adminService.isAdmin(firebaseUser.uid);
          setIsAdmin(admin);

          setUser(new UserModel({
            uid:         firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email:       firebaseUser.email,
            photoURL:    firebaseUser.photoURL,
          }));
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase Auth error:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
