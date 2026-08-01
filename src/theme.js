// Sistema de tema de la app: modo claro y modo oscuro, con el dorado como
// único color de acento en ambos. El modo oscuro es el modo por defecto.
// Los colores "semánticos" (éxito, peligro, garantía, criticidad, WhatsApp)
// no cuentan como "acento": le dicen algo al usuario, no son decorativos.

export const ACCENT = "#e8b923";
export const ACCENT_TEXT = "#2c2200"; // texto oscuro legible sobre el dorado
export const FONT = "'Roboto', sans-serif";

export const CRITICIDAD = ["Crítica", "Media", "Leve"];

const PALETA_CLARA = {
  modo: "light",
  bg: "#f8f8f8",
  surface: "#ffffff",
  surfaceAlt: "#f0f0f0",
  header: "#2c2c2c",
  headerText: "#ffffff",
  headerTextDim: "rgba(255,255,255,0.6)",
  headerBtnBg: "rgba(255,255,255,0.12)",
  text: "#1c1c1c",
  textDim: "#6b6b6b",
  textFaint: "#a0a0a0",
  border: "#e0e0e0",
  cardShadow: "0 1px 2px rgba(20,15,5,0.04), 0 4px 14px rgba(20,15,5,0.06)",
  inputBg: "#ffffff",
  overlayBg: "#e9e9e9",
  criticidad: {
    "Crítica": { bg: "#fde8e8", text: "#c0392b" },
    "Media": { bg: "#fef3e0", text: "#9c6b0a" },
    "Leve": { bg: "#e6f2f5", text: "#1a6b85" },
  },
  exito: { bg: "#e8f5e9", text: "#2e7d32", solid: "#2e7d32" },
  peligro: { bg: "#fde8e8", text: "#c0392b", solid: "#c0392b" },
  garantia: { bg: "#f1ecfa", text: "#6b4fa0", solid: "#6b4fa0" },
  aviso: { bg: "#fff9ec", text: "#7c5800", border: "#ffe082" },
  whatsapp: "#25D366",
};

const PALETA_OSCURA = {
  modo: "dark",
  bg: "#1c1c1c",
  surface: "#242424",
  surfaceAlt: "#202020",
  header: "#141414",
  headerText: "#f0f0f0",
  headerTextDim: "rgba(240,240,240,0.55)",
  headerBtnBg: "rgba(255,255,255,0.08)",
  text: "#f0f0f0",
  textDim: "#9a9a9a",
  textFaint: "#6f6f6f",
  border: "#333333",
  cardShadow: "none",
  inputBg: "#242424",
  overlayBg: "#2c2c2c",
  criticidad: {
    "Crítica": { bg: "rgba(231,76,60,0.16)", text: "#ff8a7a" },
    "Media": { bg: "rgba(243,156,18,0.16)", text: "#f7bb52" },
    "Leve": { bg: "rgba(127,179,200,0.18)", text: "#8fd0ea" },
  },
  exito: { bg: "rgba(46,125,50,0.2)", text: "#7cd987", solid: "#3a9142" },
  peligro: { bg: "rgba(231,76,60,0.16)", text: "#ff8a7a", solid: "#c0392b" },
  garantia: { bg: "rgba(155,111,213,0.2)", text: "#c9a8f5", solid: "#8a63c4" },
  aviso: { bg: "rgba(232,185,35,0.12)", text: "#f0c84a", border: "rgba(232,185,35,0.35)" },
  whatsapp: "#25D366",
};

export function getTheme(modoOscuro) {
  return modoOscuro ? PALETA_OSCURA : PALETA_CLARA;
}
