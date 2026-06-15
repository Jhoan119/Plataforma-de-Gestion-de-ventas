/**
 * @fileoverview Botón de pago Wompi
 * Integración oficial via elemento <script> con data-attributes.
 * Wompi requiere que el script se inyecte en el DOM con los parámetros
 * como atributos — no acepta instanciación programática directa.
 */

import { useEffect, useRef, useState } from "react";
import {
  WOMPI_PUBLIC_KEY,
  generarFirma,
  generarReferencia,
  toCentavos,
} from "../../services/wompiService";

export default function WompiButton({
  total,
  usuario,
  onExito,
  onError,
  disabled = false,
}) {
  const containerRef  = useRef(null);
  const referenciaRef = useRef(generarReferencia());
  const [firma,      setFirma]     = useState("");
  const [listo,      setListo]     = useState(false);
  const [cargando,   setCargando]  = useState(true); // true mientras genera firma

  // Generar firma al montar o cuando cambia el total
  useEffect(() => {
    async function calcularFirma() {
      setCargando(true);
      try {
        const montoEnCentavos = toCentavos(total);
        const hash = await generarFirma(referenciaRef.current, montoEnCentavos);
        setFirma(hash);
      } catch (err) {
        console.error("Error generando firma Wompi:", err);
        onError?.(err);
      } finally {
        setCargando(false);
      }
    }
    if (total > 0) calcularFirma();
  }, [total]);

  // Inyectar el script de Wompi cuando la firma esté lista
  useEffect(() => {
    if (!firma || !containerRef.current) return;

    // Limpiar script anterior si existía
    const anterior = containerRef.current.querySelector("script");
    if (anterior) containerRef.current.removeChild(anterior);

    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";

    // Parámetros obligatorios
    script.setAttribute("data-render",          "button");
    script.setAttribute("data-public-key",      WOMPI_PUBLIC_KEY);
    script.setAttribute("data-currency",        "COP");
    script.setAttribute("data-amount-in-cents", String(toCentavos(total)));
    script.setAttribute("data-reference",       referenciaRef.current);
    script.setAttribute("data-signature:integrity", firma);

    // Parámetros opcionales
    script.setAttribute("data-redirect-url",
      `${window.location.origin}/pago-resultado`);

    if (usuario?.email) {
      script.setAttribute("data-customer-data:email",     usuario.email);
      script.setAttribute("data-customer-data:full-name", usuario.displayName || "");
    }

    // Callback de resultado (Wompi llama a esta función global)
    const callbackName = `wompiCallback_${Date.now()}`;
    window[callbackName] = (result) => {
      const tx = result?.transaction;
      if (tx?.status === "APPROVED") {
        onExito?.(tx);
      } else if (tx) {
        onError?.(tx);
      }
      // Generar nueva referencia para próximo intento
      referenciaRef.current = generarReferencia();
    };
    script.setAttribute("data-on-approved", callbackName);

    script.onload = () => setListo(true);
    script.onerror = () => {
      console.error("No se pudo cargar el widget de Wompi");
      setListo(false);
    };

    containerRef.current.appendChild(script);

    return () => {
      delete window[callbackName];
    };
  }, [firma]);

  return (
    <div>
      {/* Wompi renderiza su botón aquí automáticamente */}
      <div ref={containerRef} />

      {/* Estado de carga mientras genera la firma o carga el script */}
      {(cargando || !listo) && (
        <button disabled style={{
          width: "100%", padding: "14px",
          background: "#ccc", color: "#fff",
          border: "none", borderRadius: "8px",
          fontSize: "16px", fontWeight: "600",
          cursor: "not-allowed",
        }}>
          {cargando ? "Preparando pago..." : "Cargando pasarela..."}
        </button>
      )}
    </div>
  );
}
