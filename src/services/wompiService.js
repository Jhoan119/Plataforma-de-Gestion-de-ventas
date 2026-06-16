/**
 * @fileoverview Servicio de Wompi — Sandbox (pruebas)
 * Cuando vayas a producción, reemplaza las llaves por las de prod.
 *
 * ⚠️  IMPORTANTE antes de ir a producción:
 * El secreto de integridad NO debería vivir en el frontend.
 * Muévelo a una Edge Function de Supabase o un backend propio.
 */

export const WOMPI_PUBLIC_KEY      = "pub_test_ki2Os3pZh5rOCiDUTrN7xHYRve4TTDd3";
const        WOMPI_INTEGRITY_SECRET = "test_integrity_oINfy0QexQVGpr6TN0Bh7hn3nROxAsCC";

/**
 * Genera el hash SHA-256 de integridad requerido por Wompi.
 * Concatena: referencia + montoEnCentavos + "COP" + secreto
 */
export async function generarFirma(referencia, montoEnCentavos) {
  const cadena  = `${referencia}${montoEnCentavos}COP${WOMPI_INTEGRITY_SECRET}`;
  const encoded = new TextEncoder().encode(cadena);
  const buffer  = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Genera una referencia única de pago. Formato: PANDEA-<timestamp>-<random> */
export function generarReferencia() {
  const ts  = Date.now();
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PANDEA-${ts}-${rnd}`;
}

/** Convierte pesos COP a centavos (Wompi trabaja en centavos) */
export function toCentavos(pesos) {
  return Math.round(pesos * 100);
}
