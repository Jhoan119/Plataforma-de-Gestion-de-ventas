/**
 * @fileoverview Contexto de Autenticación
 * Firebase Auth para login/registro — Supabase para datos.
 * Si Firebase falla, la app igual renderiza (loading termina siempre).
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserModel } from "../models/User";
import { usuarioService } from "../services/usuarioService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          // Sincronizar con Supabase — si falla, no bloquea la app
          try {
            await usuarioService.sincronizar(firebaseUser);
          } catch (e) {
            console.warn("No se pudo sincronizar usuario con Supabase:", e);
          }

          setUser(new UserModel({
            uid:         firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email:       firebaseUser.email,
            photoURL:    firebaseUser.photoURL,
          }));
        } else {
          setUser(null);
        }
        setLoading(false);  // ← siempre se ejecuta
      },
      (error) => {
        // Firebase falló (sin internet, credenciales mal, etc.)
        console.error("Firebase Auth error:", error);
        setLoading(false);  // ← la app igual carga, solo sin usuario
      }
    );
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
