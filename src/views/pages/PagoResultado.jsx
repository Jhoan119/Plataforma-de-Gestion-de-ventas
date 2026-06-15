/**
 * @fileoverview Página de resultado de pago
 * Wompi redirige aquí después del pago con ?id=<transaction_id>
 * Solo se usa si el usuario cierra el widget sin que el callback se dispare.
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PagoResultado() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const [estado, setEstado] = useState("verificando");

  useEffect(() => {
    const id = params.get("id");
    if (!id) { setEstado("sin-id"); return; }

    // Consultar el estado de la transacción directamente a Wompi
    fetch(`https://sandbox.wompi.co/v1/transactions/${id}`)
      .then(r => r.json())
      .then(data => {
        const status = data?.data?.status;
        setEstado(status === "APPROVED" ? "aprobado" : "rechazado");
      })
      .catch(() => setEstado("error"));
  }, [params]);

  const mensajes = {
    verificando: { icon: "⏳", titulo: "Verificando pago...", color: "#6b7280" },
    aprobado:    { icon: "✅", titulo: "¡Pago aprobado!",    color: "#059669" },
    rechazado:   { icon: "❌", titulo: "Pago rechazado",     color: "#dc2626" },
    "sin-id":    { icon: "⚠️", titulo: "Sin información",    color: "#d97706" },
    error:       { icon: "⚠️", titulo: "Error verificando",  color: "#d97706" },
  };

  const { icon, titulo, color } = mensajes[estado] || mensajes.error;

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <div style={{ fontSize: "3rem" }}>{icon}</div>
      <h2 style={{ color, marginTop: 12 }}>{titulo}</h2>
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => navigate("/")}
          style={{ padding: "10px 24px", cursor: "pointer" }}>
          Inicio
        </button>
        <button onClick={() => navigate("/mis-compras")}
          style={{ padding: "10px 24px", cursor: "pointer" }}>
          Mis compras
        </button>
      </div>
    </div>
  );
}
