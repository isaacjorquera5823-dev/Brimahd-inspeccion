import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, runTransaction } from "firebase/firestore";
import { ACCENT, ACCENT_TEXT, FONT, FONT_MONO, CRITICIDAD, getTheme } from "./theme";
import {
  Settings, Plus, ArrowLeft, Check, X, Camera, AlertTriangle,
  Mail, MessageCircle, Lock, ChevronRight, Download, Send, Sun, Moon, Trash2,
} from "lucide-react";

const PISOS = ["Piso -3","Piso -2","Piso -1","Zócalo","Piso 1","Piso 2","Piso 3","Piso 4","Piso 5","Piso 6","Piso 7","Piso 8","Piso 9","Piso 10","Piso 11","Piso 12","Piso 13","Piso 14","Piso 15","Azotea"];
const UBICACIONES = ["Sala","Pasillo","Shaft","Laboratorio","Cancha","Multicancha","Auditorio","Administración","Coordinación Docente","Coordinación de Carrera","Servicios Digitales","Casino","Sala Eléctrica"];
const MARCAS = ["LEGRAND","SCHNEIDER","ABB","Merlin Gerin","Otro"];
const ZONAS = ["Torre 1","Torre 2","Torre 3","Torre 4","CTI","Boulevard","Otro"];
const OBSERVACIONES_PREDEFINIDAS = [
  // ── Crítica ──
  { texto: "Conexiones fuera de norma", criticidad: "Crítica" },
  { texto: "Contactor Zumbando", criticidad: "Crítica" },
  { texto: "Circuito en corte", criticidad: "Crítica" },
  { texto: "Bypass en protección diferencial", criticidad: "Crítica" },
  { texto: "Automático en mal estado", criticidad: "Crítica" },
  { texto: "Ventilador en mal estado", criticidad: "Crítica" },
  { texto: "Tablero Fuera de Norma", criticidad: "Crítica" },
  { texto: "Faltan protecciones diferenciales", criticidad: "Crítica" },
  { texto: "Cambiar tablero eléctrico", criticidad: "Crítica" },
  { texto: "Falta aterrizar puerta tablero", criticidad: "Crítica" },
  { texto: "Falta aterrizar gabinete", criticidad: "Crítica" },
  { texto: "Mejorar aterrizaje de tablero", criticidad: "Crítica" },
  { texto: "Faltan luces pilotos", criticidad: "Crítica" },
  { texto: "Mica protectora en mal estado", criticidad: "Crítica" },
  { texto: "Cambiar barra tetrapolar por colapso", criticidad: "Crítica" },
  { texto: "No se respeta código de colores en conexiones de borneras", criticidad: "Crítica" },
  { texto: "Cambiar barra tetrapolar, dañada", criticidad: "Crítica" },
  { texto: "Tablero Dañado, se requiere el cambio", criticidad: "Crítica" },
  { texto: "Acceso restringido al tablero", criticidad: "Crítica" },
  { texto: "Cambiar barra tetrapolar por daño o sin mica", criticidad: "Crítica" },
  { texto: "Existen más de una conexión por punto", criticidad: "Crítica" },
  // ── Media ──
  { texto: "Conductor suelto en tablero", criticidad: "Media" },
  { texto: "Cambiar terminales ferrulers", criticidad: "Media" },
  { texto: "Chapa en mal estado", criticidad: "Media" },
  { texto: "Luces pilotos en mal estado", criticidad: "Media" },
  { texto: "Falta cuadros de carga y diagramas", criticidad: "Media" },
  { texto: "Faltan Terminales ferrulers", criticidad: "Media" },
  { texto: "Faltan Terminales de Ojo", criticidad: "Media" },
  { texto: "Falta separadores en protección", criticidad: "Media" },
  { texto: "Faltan tapas BPC", criticidad: "Media" },
  { texto: "Faltan tapas de bandejas interiores", criticidad: "Media" },
  { texto: "Rotular NEUTRO", criticidad: "Media" },
  { texto: "Rotular alimentadores", criticidad: "Media" },
  { texto: "Faltan Fusibles", criticidad: "Media" },
  { texto: "Falta equipos de alumbrado", criticidad: "Media" },
  { texto: "Cambiar equipo de luz interior", criticidad: "Media" },
  { texto: "Cambiar conexión de luces pilotos", criticidad: "Media" },
  { texto: "Falta rotulación de circuitos", criticidad: "Media" },
  { texto: "Faltan falsos polos", criticidad: "Media" },
  { texto: "Cambiar interruptor", criticidad: "Media" },
  { texto: "Riel din suelto", criticidad: "Media" },
  { texto: "Tablero plástico, se recomienda el cambio", criticidad: "Media" },
  { texto: "Tablero colapsado, se recomiendo el cambio", criticidad: "Media" },
  { texto: "Tapa interior del tablero sin calados", criticidad: "Media" },
  // ── Leve ──
  { texto: "Falta Señalética de Peligro", criticidad: "Leve" },
  { texto: "Cambiar señalética de peligro", criticidad: "Leve" },
  { texto: "Actualizar cuadros de carga y diagramas unilineales", criticidad: "Leve" },
  { texto: "Rotular Luces Pilotos", criticidad: "Leve" },
  { texto: "Rotular tablero (actualizar)", criticidad: "Leve" },
  { texto: "Mezcla de marcas en protecciones", criticidad: "Leve" },
];

const TECNICOS = ["Emanuel Madrid", "César Huerta", "Carlos Madrid"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = [ANIO_ACTUAL, ANIO_ACTUAL + 1, ANIO_ACTUAL + 2, ANIO_ACTUAL + 3];

const SEDES = [
  { nombre: "Sede Alameda",                  contacto: "Angel Carrasco V.",  direccion: "Av. España N°8, Santiago Centro" },
  { nombre: "Sede Padre Alonso de Ovalle",   contacto: "Patricio Navia",     direccion: "P. Alonso de Ovalle N°1586, Santiago Centro" },
  { nombre: "Sede Antonio Varas",            contacto: "Daniel Flores",      direccion: "Antonio Varas N°666, Providencia" },
  { nombre: "Sede Casa Central",             contacto: "Juan Llano",         direccion: "Av. Eliodoro Yáñez N°1595, Providencia" },
  { nombre: "Sede Melipilla",                contacto: "Marcelo Silva F.",   direccion: "Serrano N°1105, Melipilla" },
  { nombre: "Sede Puente Alto",              contacto: "Iván Valdés",        direccion: "Av. Concha y Toro N°1340, Puente Alto" },
  { nombre: "Sede Renca",                    contacto: "Felipe González",    direccion: "Av. Domingo Santa María N°3640, Renca" },
  { nombre: "Sede Valparaíso",               contacto: "Jaime Hernández M.", direccion: "Av. Brasil N°2021, Valparaíso" },
  { nombre: "Sede Quillota",                 contacto: "Christian Muñoz",    direccion: "KM 21 Camino Troncal, San Pedro, Quillota" },
  { nombre: "Sede Maipú",                    contacto: "José Montenegro A.", direccion: "Av. Esquina Blanca N°501, Maipú" },
  { nombre: "Sede Viña del Mar",             contacto: "Christian Muñoz",    direccion: "Álvarez N°2366, Viña del Mar" },
  { nombre: "Sede San Bernardo",             contacto: "Kevin García",       direccion: "Freire N°857, San Bernardo" },
  { nombre: "Sede Plaza Oeste",              contacto: "Omar Morales",       direccion: "Av. Américo Vespucio N°1501, Cerrillos" },
  { nombre: "Sede Plaza Norte",              contacto: "Fabián Osses",       direccion: "Av. Américo Vespucio N°1737, Huechuraba" },
  { nombre: "Sede Plaza Vespucio y Boulevard", contacto: "Raúl Garrido",    direccion: "Froilán Roa N°7107, La Florida" },
];

const defaultConfig = {
  empresa: "Brimahd Ltda.", rut: "76.940.738-3", email: "servicios@brimahd.cl",
  epp: "Casco, Antiparras, Guantes de Aislación, Guantes PU, Zapatos de Seguridad Aislados, Herramientas Aisladas",
};

// Devuelve la fecha de HOY en horario local (YYYY-MM-DD).
// No usar new Date().toISOString() para esto: convierte a UTC y en Chile
// (UTC-4/UTC-3) puede mostrar el día siguiente durante la tarde/noche.
function fechaLocalHoy() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

const defaultInforme = {
  cliente: "", contacto: "", direccion: "", fecha: fechaLocalHoy(),
  personal: [],
  cartaGantt: "", tableros: [],
};

const emptyTablero = () => ({
  id: Date.now(), zona: "Torre 1", zonaOtro: "", ubicacion: "Sala", numeroSala: "", piso: "Piso 1", criticidad: "Media",
  nombreTablero: "", proteccionGeneral: "", marca: "LEGRAND", marcaOtro: "",
  garantia: false, registros: [],
});
const emptyRegistro = () => ({
  id: Date.now(), foto: null, observaciones: [], cambioTablero: false, sinObservaciones: false,
});

// ===== Borrador del informe en curso, guardado en IndexedDB =====
// localStorage tiene un límite muy bajo por sitio (~5 MB en Safari iOS,
// 5-10 MB en Chrome/Android). Un informe con 40+ tableros y fotos puede
// pesar 20-30 MB, muy por sobre ese límite. Cuando se supera,
// localStorage.setItem() lanza un error y, si no se maneja, el borrador
// queda "congelado" en la última versión que sí alcanzó a caber — sin
// avisar nada — mientras el informe real sigue creciendo sin guardarse.
// IndexedDB no tiene ese límite tan bajo (normalmente cientos de MB o más,
// según espacio libre del dispositivo), así que es el lugar correcto para
// guardar el borrador completo de una inspección grande.
const DB_NAME = "brimahd_db";
const DB_STORE = "borrador";
const DB_KEY = "actual";
const BORRADOR_KEY_LEGACY = "brimahd_borrador_informe"; // clave antigua en localStorage, para migrar borradores previos

function abrirDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("IndexedDB no disponible")); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(DB_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function guardarBorradorDB(draft) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(draft, DB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function leerBorradorDB() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(DB_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function borrarBorradorDB() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(DB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = (v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
  return [val, set];
}

// Comprime y redimensiona una foto antes de guardarla en memoria/estado.
// Sin esto, una inspección larga con muchas fotos (ej. 40 tableros x 3 fotos)
// acumula cientos de MB de imágenes sin comprimir en la RAM del navegador,
// lo que puede hacer que el navegador móvil mate la pestaña y se pierda
// todo el trabajo. Redimensionamos al ancho/alto máximo indicado y
// recomprimimos como JPEG, lo que reduce el peso de cada foto entre 80-95%
// sin pérdida visible en el informe final.
function comprimirImagen(file, maxDim = 1600, calidad = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

// Ajusta la calidad/resolución de compresión según cuántas fotos lleva ya el
// informe en curso. En inspecciones grandes (muchos tableros), comprimir un
// poco más las fotos siguientes mantiene acotado el peso total del informe
// y reduce el riesgo de que el navegador se quede sin memoria al generar la
// vista previa o el HTML final.
function parametrosCompresion(totalFotosActuales) {
  if (totalFotosActuales > 200) return { maxDim: 1000, calidad: 0.6 };
  if (totalFotosActuales > 100) return { maxDim: 1250, calidad: 0.65 };
  if (totalFotosActuales > 50) return { maxDim: 1450, calidad: 0.7 };
  return { maxDim: 1600, calidad: 0.72 };
}

// ===== Contador correlativo compartido (Firebase Firestore) =====
// Reemplaza estos valores por el bloque "firebaseConfig" que te entrega la consola de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDBcK_kzOJA2tctImT2k6iWXu3qhPwzP3I",
  authDomain: "brimahd-inspeccion.firebaseapp.com",
  projectId: "brimahd-inspeccion",
  storageBucket: "brimahd-inspeccion.firebasestorage.app",
  messagingSenderId: "242416425759",
  appId: "1:242416425759:web:0a7724ccb8480dc5626e2a",
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const contadorRef = doc(db, "contadores", "informes");

// ===== Control de licencia (kill switch remoto) =====
// Documento en Firestore: colección "config", documento "licencia".
// Campos: { activa: true/false, mensaje: "texto opcional a mostrar" }
// Si el documento no existe, o si hay error de red, se asume ACTIVA
// (fail-open) para no bloquear accidentalmente por falta de conexión.
const licenciaRef = doc(db, "config", "licencia");

async function checkLicencia() {
  try {
    const snap = await getDoc(licenciaRef);
    if (!snap.exists()) return { activa: true };
    const data = snap.data();
    return {
      activa: data.activa !== false,
      mensaje: data.mensaje || "",
    };
  } catch {
    return { activa: true };
  }
}

// Muestra el próximo número sin consumirlo (solo para vista previa en pantalla de inicio)
async function peekNextNumber() {
  const snap = await getDoc(contadorRef);
  const valor = snap.exists() ? snap.data().valor : 1;
  return `INF-${String(valor).padStart(4, "0")}`;
}

// Reserva y consume el siguiente número de forma atómica (a prueba de choques entre celulares)
async function reserveNextNumber() {
  const valorReservado = await runTransaction(db, async (tx) => {
    const snap = await tx.get(contadorRef);
    const actual = snap.exists() ? snap.data().valor : 1;
    tx.set(contadorRef, { valor: actual + 1 }, { merge: true });
    return actual;
  });
  return `INF-${String(valorReservado).padStart(4, "0")}`;
}

function Logo({ size = 36, withText = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="22" r="10" fill={ACCENT} />
        {[0,45,90,135,180,225,270,315].map((deg,i) => {
          const r = deg * Math.PI / 180;
          return <line key={i} x1={30+13*Math.cos(r)} y1={22+13*Math.sin(r)} x2={30+17*Math.cos(r)} y2={22+17*Math.sin(r)} stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"/>;
        })}
        <path d="M8 52 Q20 36 30 34 Q40 36 52 52" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M14 52 Q22 40 30 38 Q38 40 46 52" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      </svg>
      {withText && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.1, fontFamily: FONT }}>Brimahd ltda.</div>
          <div style={{ fontSize: 10, color: ACCENT, fontFamily: FONT, letterSpacing: "0.3px" }}>Servicios Eléctricos</div>
        </div>
      )}
    </div>
  );
}

// Pantalla de vista previa del informe, separada en su propio componente.
// Con informes grandes (muchos tableros/fotos), armar el HTML completo con
// todas las imágenes incrustadas puede tomar varios segundos y bloquear el
// hilo principal del navegador. Si eso pasa DURANTE el mismo render que
// dibuja los botones (Descargar/Enviar/Finalizar), el navegador puede
// quedar "pegado" antes de terminar de pintarlos, dando la sensación de que
// los botones no existen. Por eso el HTML se calcula de forma diferida
// (después del primer pintado) y mientras tanto se muestra un indicador de
// carga, con los botones de navegación (← Editar) ya visibles desde el
// principio.
function VistaPreviaInforme({ informe, config, setScreen, finalizarInforme, generarHTMLInforme, descargarHTML, compartirWhatsApp, enviarEmail, s, t }) {
  const [htmlInforme, setHtmlInforme] = useState(null);
  const [error, setError] = useState(false);
  const [enviarOpen, setEnviarOpen] = useState(false);

  // Al entrar a esta pantalla, deja el scroll del navegador arriba del todo.
  // Si se venía de la lista de tableros (que puede ser muy larga con 40+
  // tableros y quedar con harto scroll), sin esto el navegador a veces
  // conserva esa posición de scroll y la barra de botones queda "escondida"
  // fuera de la vista hasta que el usuario scrollea manualmente.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setHtmlInforme(null);
    setError(false);
    const timer = setTimeout(() => {
      try {
        const html = generarHTMLInforme(informe, config);
        setHtmlInforme(html);
      } catch (e) {
        setError(true);
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [informe, config]);

  const listo = !!htmlInforme;
  const totalRegistros = informe.tableros.reduce((s2, tb) => s2 + (tb.registros?.length || 0), 0);
  const totalCriticas = informe.tableros.reduce((s2, tb) => s2 + (tb.registros || []).reduce((s3, r) => s3 + r.observaciones.filter(o => o.criticidad === "Crítica").length, 0), 0);
  const fechaFmt = new Date(informe.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{ fontFamily: FONT, fontSize: 14, background: t.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: t.header, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
        <button style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, fontSize: 12, padding: "7px 12px" }} onClick={() => setScreen("informe")}><ArrowLeft size={15} /> Editar</button>
        <span style={{ fontSize: 12, fontWeight: 700, color: t.headerText, fontFamily: FONT_MONO }}>{informe.numero}</span>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px 0" }}>
        <div style={{ flex: 1, background: t.surfaceAlt, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{informe.tableros.length}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.3px" }}>Tableros</div>
        </div>
        <div style={{ flex: 1, background: t.surfaceAlt, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.peligro.text }}>{totalCriticas}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.3px" }}>Críticas</div>
        </div>
        <div style={{ flex: 1, background: t.surfaceAlt, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{totalRegistros}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.3px" }}>Registros</div>
        </div>
      </div>
      {error ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: t.peligro.text }}>No se pudo generar la vista previa. Vuelve a "← Editar" e intenta de nuevo. Si el informe tiene muchas fotos, prueba cerrar otras apps para liberar memoria.</div>
        </div>
      ) : !listo ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 13, color: t.textDim }}>Generando vista previa…</div>
        </div>
      ) : (
        <iframe title="Vista previa del informe" srcDoc={htmlInforme} style={{ flex: 1, width: "100%", border: "none", background: "white", margin: "10px 0 0" }} />
      )}
      <div style={{ position: "sticky", bottom: 0, background: t.header, borderTop: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", gap: 10, zIndex: 20 }}>
        <button style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, flex: 1 }} onClick={finalizarInforme}>Finalizar</button>
        <button disabled={!listo} style={{ ...s.btn, ...s.btnAccent, flex: 1.4, opacity: listo ? 1 : 0.5 }} onClick={() => setEnviarOpen(true)}><Send size={15} /> Enviar informe</button>
      </div>

      {enviarOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 30 }} onClick={() => setEnviarOpen(false)} />
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: 480, margin: "0 auto", background: t.header, borderRadius: "18px 18px 0 0", padding: "10px 16px 16px", zIndex: 31 }}>
            <div style={{ width: 36, height: 4, background: t.border, borderRadius: 3, margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: t.headerText, marginBottom: 10 }}>Enviar informe {informe.numero}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: t.surface, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}
              onClick={() => { setEnviarOpen(false); compartirWhatsApp(informe, config, fechaFmt); }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(37,211,102,.16)", color: t.whatsapp, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageCircle size={17} /></div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>WhatsApp</div><div style={{ fontSize: 11, color: t.textDim }}>Abre un mensaje prearmado</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: t.surface, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer" }}
              onClick={() => { setEnviarOpen(false); enviarEmail(informe, config, fechaFmt); }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: t.headerBtnBg, color: t.text, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail size={17} /></div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Email</div><div style={{ fontSize: 11, color: t.textDim }}>Asunto y cuerpo prearmados</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: t.surface, borderRadius: 12, padding: "12px 14px", cursor: listo ? "pointer" : "default", opacity: listo ? 1 : 0.5 }}
              onClick={() => { if (!listo) return; setEnviarOpen(false); descargarHTML(informe, config); }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(227,180,25,.14)", color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Download size={17} /></div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Descargar HTML</div><div style={{ fontSize: 11, color: t.textDim }}>Para adjuntar manualmente</div></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("inicio");
  // Modo oscuro es el modo por defecto; se guarda en el celular para que
  // el toggle se recuerde entre sesiones, igual que la config de empresa.
  const [temaOscuro, setTemaOscuro] = useLocalStorage("brimahd_tema_oscuro", true);
  const t = getTheme(temaOscuro);
  const [config, setConfig] = useLocalStorage("brimahd_config", defaultConfig);
  const [informe, setInforme] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [tableroEdit, setTableroEdit] = useState(null);
  const [sedeSearch, setSedeSearch] = useState("");
  const [obsSearch, setObsSearch] = useState([]);
  const [obsLibreTexto, setObsLibreTexto] = useState([]);
  const [obsLibreCrit, setObsLibreCrit] = useState([]);
  const [obsPicker, setObsPicker] = useState(null); // { regIdx } when picker is open
  const [informeStep, setInformeStep] = useState(0); // 0 = Datos generales, 1 = Tableros
  const [sedeSheetOpen, setSedeSheetOpen] = useState(false);
  const [tecSheetOpen, setTecSheetOpen] = useState(false);
  const [enviarSheetOpen, setEnviarSheetOpen] = useState(false);
  const [swipedTablero, setSwipedTablero] = useState(null);
  const swipeRef = useRef({});
  const fileRef = useRef({});

  const [proximoNumero, setProximoNumero] = useState("Cargando...");
  const [generando, setGenerando] = useState(false);
  const [licencia, setLicencia] = useState({ estado: "cargando", mensaje: "" });
  const [draftDisponible, setDraftDisponible] = useState(null);
  const [autoguardadoError, setAutoguardadoError] = useState(false);
  const draftTimer = useRef(null);

  useEffect(() => {
    peekNextNumber().then(setProximoNumero).catch(() => setProximoNumero("Sin conexión"));
  }, [screen]);

  useEffect(() => {
    // La Bienvenida debe alcanzar a verse (fade-in + tagline + puntitos) aunque
    // la verificación de licencia responda casi al instante en buena conexión.
    const MIN_SPLASH_MS = 2000;
    const inicioSplash = Date.now();
    checkLicencia().then(r => {
      const falta = MIN_SPLASH_MS - (Date.now() - inicioSplash);
      setTimeout(() => {
        setLicencia({ estado: r.activa ? "activa" : "inactiva", mensaje: r.mensaje });
      }, Math.max(0, falta));
    });
  }, []);

  // Al abrir la app, revisa si quedó un borrador guardado de una sesión
  // anterior (ej. la app se cerró o se cayó a mitad de una inspección).
  // Si existe un borrador antiguo en localStorage (de una versión previa de
  // la app), lo migra a IndexedDB y limpia la clave vieja.
  useEffect(() => {
    (async () => {
      try {
        let draft = await leerBorradorDB();
        if (!draft) {
          const raw = localStorage.getItem(BORRADOR_KEY_LEGACY);
          if (raw) {
            const parsed = JSON.parse(raw);
            draft = parsed && parsed.informe ? parsed : { informe: parsed, tableroEdit: null, editIdx: null, screen: "informe" };
            await guardarBorradorDB(draft);
            localStorage.removeItem(BORRADOR_KEY_LEGACY);
          }
        }
        if (draft) {
          const inf = draft.informe;
          const hayTableroEnEdicion = draft.tableroEdit && draft.tableroEdit.registros && draft.tableroEdit.registros.length > 0;
          if (inf && (inf.cliente || (inf.tableros && inf.tableros.length > 0) || hayTableroEnEdicion)) {
            setDraftDisponible(draft);
          }
        }
      } catch {}
    })();
  }, []);

  // Autoguardado: guarda el informe en curso Y el tablero que se está
  // editando en ese momento (tableroEdit), no solo los tableros ya
  // confirmados con "Guardar tablero". Se guarda en IndexedDB (no
  // localStorage) porque un informe grande con muchas fotos puede pesar
  // 20-30 MB, muy por sobre el límite de ~5 MB de localStorage en Safari
  // iOS. Si el guardado falla igualmente, se avisa en pantalla en vez de
  // fallar en silencio.
  useEffect(() => {
    if (!informe) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      const draft = {
        informe,
        tableroEdit: screen === "tablero" ? tableroEdit : null,
        editIdx: screen === "tablero" ? editIdx : null,
        screen: screen === "tablero" ? "tablero" : "informe",
      };
      guardarBorradorDB(draft).then(() => setAutoguardadoError(false)).catch(() => setAutoguardadoError(true));
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [informe, tableroEdit, editIdx, screen]);

  function borrarBorrador() {
    borrarBorradorDB().catch(() => {});
    try { localStorage.removeItem(BORRADOR_KEY_LEGACY); } catch {}
  }

  function continuarBorrador() {
    setInforme(draftDisponible.informe);
    if (draftDisponible.screen === "tablero" && draftDisponible.tableroEdit) {
      setTableroEdit(draftDisponible.tableroEdit);
      setEditIdx(draftDisponible.editIdx ?? null);
      setScreen("tablero");
    } else {
      setInformeStep((draftDisponible.informe.tableros || []).length > 0 ? 1 : 0);
      setScreen("informe");
    }
    setDraftDisponible(null);
  }

  function descartarBorrador() {
    if (!confirm("¿Descartar este borrador? No se podrá recuperar.")) return;
    borrarBorrador();
    setDraftDisponible(null);
  }

  function finalizarInforme() {
    if (!confirm("¿Ya descargaste o enviaste este informe? Se borrará el borrador guardado en este celular.")) return;
    borrarBorrador();
    setInforme(null);
    setScreen("inicio");
  }

  function iniciarInforme() {
    setDraftDisponible(null);
    setInforme({ ...defaultInforme, numero: proximoNumero, fecha: fechaLocalHoy(), tableros: [] });
    setSedeSearch("");
    setInformeStep(0);
    setScreen("informe");
  }

  function updateInforme(k, v) { setInforme(p => ({ ...p, [k]: v })); }
  function toggleTecnico(nombre) {
    setInforme(p => {
      const yaEsta = p.personal.includes(nombre);
      const personal = yaEsta ? p.personal.filter(x => x !== nombre) : [...p.personal, nombre];
      return { ...p, personal };
    });
  }

  function selectSede(sede) {
    updateInforme("cliente", sede.nombre);
    updateInforme("contacto", sede.contacto);
    updateInforme("direccion", sede.direccion);
    setSedeSearch(sede.nombre);
    setSedeFocused(false);
  }

  const sedesFiltradas = SEDES.filter(s =>
    s.nombre.toLowerCase().includes((sedeSearch || "").toLowerCase())
  );

  function openTablero(idx) {
    setEditIdx(idx);
    setTableroEdit(idx === null ? emptyTablero() : { ...informe.tableros[idx], fotos: informe.tableros[idx].fotos || [] });
    setScreen("tablero");
  }

  function saveTablero() {
    if (!tableroEdit.ubicacion) return alert("Selecciona una ubicación");
    if (tableroEdit.registros.length === 0) return alert("Agrega al menos un registro fotográfico");
    if (tableroEdit.registros.some(r => !r.foto)) return alert("Cada registro debe tener una foto");
    if (tableroEdit.registros.some(r => !r.sinObservaciones && r.observaciones.length === 0))
      return alert("Cada registro debe tener al menos una observación, o marcar \"Sin observaciones\"");
    let tableros;
    if (editIdx === null) tableros = [...informe.tableros, tableroEdit];
    else { tableros = [...informe.tableros]; tableros[editIdx] = tableroEdit; }
    updateInforme("tableros", tableros);
    setScreen("informe");
  }

  function deleteTablero(i) {
    if (!confirm("¿Eliminar este tablero?")) return;
    updateInforme("tableros", informe.tableros.filter((_,j) => j !== i));
  }

  async function handleRegistroFoto(e, regIdx) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fotosGuardadas = informe.tableros.reduce((s, t) => s + (t.registros || []).filter(r => r.foto).length, 0);
      const fotosEnEdicion = tableroEdit.registros.filter(r => r.foto).length;
      const { maxDim, calidad } = parametrosCompresion(fotosGuardadas + fotosEnEdicion);
      const dataUrl = await comprimirImagen(file, maxDim, calidad);
      setTableroEdit(p => {
        const regs = [...p.registros];
        regs[regIdx] = { ...regs[regIdx], foto: { name: file.name, data: dataUrl } };
        return { ...p, registros: regs };
      });
    } catch (err) {
      alert("No se pudo procesar la foto. Intenta tomarla de nuevo.");
    }
    // Permite volver a seleccionar el mismo archivo (ej. tomar otra foto) sin
    // que el input "recuerde" el valor anterior.
    e.target.value = "";
  }

  function addRegistro() {
    setTableroEdit(p => ({ ...p, registros: [...p.registros, emptyRegistro()] }));
  }

  function removeRegistro(regIdx) {
    setTableroEdit(p => {
      const regs = p.registros.filter((_,i) => i !== regIdx);
      return { ...p, registros: regs, criticidad: deriveCriticidad(regs) };
    });
  }

  function deriveCriticidad(registros) {
    const all = registros.flatMap(r => r.observaciones);
    const order = ["Crítica","Media","Leve"];
    return order.find(c => all.some(o => o.criticidad === c)) || "Media";
  }

  function addObsToRegistro(regIdx, obs) {
    setTableroEdit(p => {
      const regs = [...p.registros];
      const reg = regs[regIdx];
      if (reg.observaciones.some(o => o.texto === obs.texto)) return p;
      const newObs = [...reg.observaciones, obs];
      regs[regIdx] = { ...reg, observaciones: newObs, sinObservaciones: false };
      return { ...p, registros: regs, criticidad: deriveCriticidad(regs) };
    });
  }

  function toggleSinObservaciones(regIdx) {
    setTableroEdit(p => {
      const regs = [...p.registros];
      const reg = regs[regIdx];
      const nuevoValor = !reg.sinObservaciones;
      regs[regIdx] = {
        ...reg,
        sinObservaciones: nuevoValor,
        observaciones: nuevoValor ? [] : reg.observaciones,
      };
      return { ...p, registros: regs, criticidad: deriveCriticidad(regs) };
    });
  }

  function removeObsFromRegistro(regIdx, obsIdx) {
    setTableroEdit(p => {
      const regs = [...p.registros];
      const reg = regs[regIdx];
      const newObs = reg.observaciones.filter((_,i) => i !== obsIdx);
      regs[regIdx] = { ...reg, observaciones: newObs };
      return { ...p, registros: regs, criticidad: deriveCriticidad(regs) };
    });
  }

  async function generarInforme() {
    if (!informe.cliente.trim()) return alert("Ingresa el nombre del cliente");
    if (informe.tableros.length === 0) return alert("Agrega al menos un tablero");
    setGenerando(true);
    try {
      const numeroFinal = await reserveNextNumber();
      setInforme(p => ({ ...p, numero: numeroFinal }));
      setScreen("preview");
    } catch (e) {
      alert("No se pudo asignar el número de informe. Verifica tu conexión a internet e intenta nuevamente.");
    } finally {
      setGenerando(false);
    }
  }

  function generarHTMLInforme(inf, cfg) {
    const fechaFmt = new Date(inf.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
    const totalRegistros = inf.tableros.reduce((s,t) => s + (t.registros?.length||0), 0);
    const criticas = inf.tableros.reduce((s,t) => s + (t.registros||[]).reduce((s2,r) => s2 + r.observaciones.filter(o=>o.criticidad==="Crítica").length, 0), 0);
    const medias   = inf.tableros.reduce((s,t) => s + (t.registros||[]).reduce((s2,r) => s2 + r.observaciones.filter(o=>o.criticidad==="Media").length, 0), 0);
    const leves    = inf.tableros.reduce((s,t) => s + (t.registros||[]).reduce((s2,r) => s2 + r.observaciones.filter(o=>o.criticidad==="Leve").length, 0), 0);
    const cambios  = inf.tableros.reduce((s,t) => s + (t.registros?.filter(r=>r.cambioTablero).length||0), 0);

    // Tabla de observaciones críticas detallada
    const criticasRows = [];
    inf.tableros.forEach(t => {
      const zonaTexto = t.zona === "Otro" ? t.zonaOtro : t.zona;
      const ubicLabel = [zonaTexto, t.piso, t.ubicacion, t.numeroSala].filter(Boolean).join(' — ');
      (t.registros||[]).forEach((reg, ri) => {
        reg.observaciones.filter(o => o.criticidad === "Crítica").forEach(obs => {
          const rowBg = criticasRows.length % 2 === 0 ? '#fff5f5' : '#ffffff';
          criticasRows.push(`<tr style="background:${rowBg};">
            <td style="padding:9px 12px;font-size:12px;color:#333;border-bottom:1px solid #f5d5d5;font-weight:600;">${ubicLabel}</td>
            <td style="padding:9px 12px;font-size:12px;color:#555;border-bottom:1px solid #f5d5d5;text-align:center;">N° ${ri+1}</td>
            <td style="padding:9px 12px;font-size:12px;color:#333;border-bottom:1px solid #f5d5d5;line-height:1.5;">${obs.texto}</td>
          </tr>`);
        });
      });
    });



    // Detalle por tablero
    const tablerosHTML = inf.tableros.map((t,ti) => {
      const critBg = {'Crítica':'#c0392b','Media':'#f39c12','Leve':'#7fb3c8'}[t.criticidad]||'#888';
      const critFg = {'Crítica':'#fff','Media':'#7a3800','Leve':'#1a3a45'}[t.criticidad]||'#fff';
      const registrosHTML = (t.registros||[]).map((reg,ri) => {
        const obsHTML = reg.observaciones.map((obs, obsIdx) => {
          const bg = {'Crítica':'#c0392b','Media':'#f39c12','Leve':'#7fb3c8'}[obs.criticidad]||'#888';
          const fg = {'Crítica':'#fff','Media':'#7a3800','Leve':'#1a3a45'}[obs.criticidad]||'#fff';
          return `<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:11px;font-weight:700;color:#bbb;min-width:18px;padding-top:1px;">${obsIdx + 1}.</span>
            <span style="flex:1;font-size:12px;color:#333;line-height:1.5;">${obs.texto}</span>
            <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;background:${bg};color:${fg};white-space:nowrap;margin-left:8px;">${obs.criticidad}</span>
          </div>`;
        }).join('');
        const sinObsHTML = reg.sinObservaciones
          ? `<div style="padding:5px 0;font-size:12px;color:#2e7d32;font-weight:600;">&#10003; Sin observaciones</div>`
          : '';
        const cambioHTML = reg.cambioTablero
          ? `<div style="margin-top:8px;padding:8px 12px;background:#fde8e8;border:1px solid #c0392b;border-radius:6px;font-size:12px;font-weight:700;color:#c0392b;">&#9888; Se recomienda cambio de tablero</div>`
          : '';
        return `<div style="border:1px solid #e8e8e8;border-radius:8px;margin-bottom:12px;overflow:hidden;">
          <div style="background:#3a3a3a;color:white;padding:6px 12px;font-size:11px;font-weight:700;">Registro N° ${ri+1}</div>
          ${reg.foto ? `<img src="${reg.foto.data}" style="width:100%;max-height:420px;object-fit:contain;display:block;background:#f0f0f0;" />` : '<div style="height:160px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:12px;background:#f7f7f7;">Sin fotografía</div>'}
          ${obsHTML || sinObsHTML || cambioHTML ? `<div style="padding:12px 14px;">
            ${obsHTML}
            ${sinObsHTML}
            ${cambioHTML}
          </div>` : ''}
        </div>`;
      }).join('');

      const zonaTexto = t.zona === "Otro" ? t.zonaOtro : t.zona;
      const marcaTexto = t.marca === "Otro" ? t.marcaOtro : t.marca;
      const metaItems = [
        t.nombreTablero ? `Nombre tablero: <b>${t.nombreTablero}</b>` : '',
        t.proteccionGeneral ? `Protección general: <b>${t.proteccionGeneral}</b>` : '',
        marcaTexto ? `Marca: <b>${marcaTexto}</b>` : '',
      ].filter(Boolean).join(' &nbsp;·&nbsp; ');

      return `<div style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;page-break-inside:avoid;">
        <div style="background:#2c2c2c;color:white;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:15px;font-weight:700;">${zonaTexto || t.ubicacion}</span>
            <span style="font-size:11px;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:10px;">${t.piso}</span>
            ${zonaTexto ? `<span style="font-size:11px;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:10px;">${t.ubicacion}</span>` : ''}
            ${t.numeroSala ? `<span style="font-size:11px;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:10px;">${t.numeroSala}</span>` : ''}
            ${t.garantia ? '<span style="font-size:11px;background:#6b4fa0;color:white;padding:3px 10px;border-radius:10px;font-weight:700;">En garantía</span>' : ''}
          </div>
          <span style="font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;background:${critBg};color:${critFg};">${t.criticidad}</span>
        </div>
        ${metaItems ? `<div style="background:#f7f7f7;padding:8px 18px;font-size:11px;color:#555;border-bottom:1px solid #e0e0e0;">${metaItems}</div>` : ''}
        <div style="padding:16px 18px;background:white;">
          ${registrosHTML}
        </div>
      </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${inf.numero} — ${inf.cliente}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; background: #f0f0f0; color: #222; }
  @media print {
    body { background: white; }
    .no-print { display: none; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>

<!-- PORTADA / HEADER -->
<div style="background:#2c2c2c;color:white;padding:36px 40px 28px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">
    <div>
      <div style="font-size:22px;font-weight:700;color:#e8b923;letter-spacing:0.5px;">BRIMAHD LTDA.</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:3px;">Servicios Eléctricos y Telecomunicaciones · ${cfg.rut}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:700;color:#e8b923;">${inf.numero}</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:3px;">${fechaFmt}</div>
    </div>
  </div>
  <div style="font-size:26px;font-weight:700;line-height:1.2;margin-bottom:4px;">Informe de Mantención Preventiva</div>
  <div style="font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:24px;">Tableros Eléctricos — Inspección y registro de observaciones</div>
  <div style="background:rgba(255,255,255,0.07);border-left:4px solid #e8b923;padding:14px 18px;border-radius:4px;display:flex;flex-wrap:wrap;gap:14px 36px;">
    <div><div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Cliente</div><div style="font-size:14px;font-weight:600;">${inf.cliente}</div></div>
    ${inf.contacto ? `<div><div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Contacto</div><div style="font-size:14px;font-weight:600;">${inf.contacto}</div></div>` : ''}
    ${inf.direccion ? `<div><div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Dirección</div><div style="font-size:14px;font-weight:600;">${inf.direccion}</div></div>` : ''}
    ${inf.cartaGantt ? `<div><div style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Próxima mantención</div><div style="font-size:14px;font-weight:600;">${inf.cartaGantt}</div></div>` : ''}
  </div>
</div>

<!-- RESUMEN EJECUTIVO -->
<div style="background:white;padding:28px 40px;border-bottom:3px solid #f0f0f0;">
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c2c2c;border-bottom:2px solid #e8b923;padding-bottom:6px;margin-bottom:18px;">Resumen Ejecutivo</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
    <div style="border:1px solid #e5e5e5;border-radius:6px;padding:10px 8px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#2c2c2c;">${inf.tableros.length}</div>
      <div style="font-size:9px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.3px;margin-top:3px;">Tableros</div>
    </div>
    <div style="border:1px solid #e5e5e5;border-radius:6px;padding:10px 8px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#2c2c2c;">${totalRegistros}</div>
      <div style="font-size:9px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.3px;margin-top:3px;">Registros</div>
    </div>
    <div style="border:1px solid #e5e5e5;border-radius:6px;padding:10px 8px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#2c2c2c;">${cambios}</div>
      <div style="font-size:9px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.3px;margin-top:3px;">Cambios recomendados</div>
    </div>
    <div style="background:#fde8e8;border:1px solid #f0d5d5;border-radius:6px;padding:10px 8px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#c0392b;">${criticas}</div>
      <div style="font-size:9px;font-weight:700;color:#c0392b;text-transform:uppercase;letter-spacing:0.3px;margin-top:3px;">Obs. críticas</div>
    </div>
    <div style="background:#fbf1d8;border:1px solid #e8dcc0;border-radius:6px;padding:10px 8px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#b8860b;">${medias}</div>
      <div style="font-size:9px;font-weight:700;color:#b8860b;text-transform:uppercase;letter-spacing:0.3px;margin-top:3px;">Obs. media</div>
    </div>
    <div style="background:#e6f2f5;border:1px solid #cfe0e6;border-radius:6px;padding:10px 8px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#1a6b85;">${leves}</div>
      <div style="font-size:9px;font-weight:700;color:#1a6b85;text-transform:uppercase;letter-spacing:0.3px;margin-top:3px;">Obs. leve</div>
    </div>
  </div>
</div>

<!-- EPP Y PERSONAL -->
<div style="background:white;padding:28px 40px;margin-top:8px;border-bottom:3px solid #f0f0f0;">
  <div style="font-size:15px;font-weight:700;color:#2c2c2c;border-bottom:2px solid #e8b923;padding-bottom:8px;margin-bottom:18px;">Personal y Equipamiento de Seguridad</div>
  <div>
    <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:10px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;color:#888;min-width:140px;flex-shrink:0;">EPP Utilizado</div>
      <p style="font-size:12px;color:#555;line-height:1.6;margin:0;">${cfg.epp}</p>
    </div>
    <div style="display:flex;align-items:baseline;gap:14px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;color:#888;min-width:140px;flex-shrink:0;">Personal de Mantención</div>
      <p style="font-size:13px;color:#333;font-weight:600;margin:0;">${inf.personal.filter(Boolean).join(' · ')}</p>
    </div>
  </div>
</div>

<!-- DETALLE POR TABLERO -->
<div style="background:white;padding:28px 40px;margin-top:8px;border-bottom:3px solid #f0f0f0;">
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2c2c2c;border-bottom:2px solid #e8b923;padding-bottom:6px;margin-bottom:20px;">Detalle por Tablero</div>
  ${tablerosHTML}
</div>



<!-- TABLA OBSERVACIONES CRÍTICAS -->
${criticasRows.length > 0 ? `
<div style="background:white;padding:28px 40px;margin-top:8px;">
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#c0392b;border-bottom:2px solid #c0392b;padding-bottom:6px;margin-bottom:6px;">&#9888; Observaciones Críticas — Resumen para Atención Prioritaria</div>
  <p style="font-size:12px;color:#666;margin-bottom:16px;">Las siguientes observaciones requieren intervención prioritaria. Se recomienda al cliente gestionar su corrección en el corto plazo para evitar riesgos a la instalación y a las personas.</p>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#c0392b;color:white;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;width:28%;">Tablero</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;width:12%;">Registro</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;width:60%;">Observación</th>
      </tr>
    </thead>
    <tbody>
      ${criticasRows.join('')}
    </tbody>
  </table>
</div>` : ''}

<!-- FOOTER -->
<div style="background:#2c2c2c;color:white;padding:20px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
  <div>
    <div style="font-size:15px;font-weight:700;color:#e8b923;">BRIMAHD LTDA.</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:3px;">${cfg.rut} · ${cfg.email}</div>
  </div>
  <div style="text-align:right;font-size:12px;color:rgba(255,255,255,0.65);">
    <div style="font-size:14px;font-weight:700;color:#e8b923;margin-bottom:2px;">${inf.numero}</div>
    <div>${inf.personal.filter(Boolean).join(' · ')}</div>
    ${inf.cartaGantt ? `<div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:2px;">Próxima mantención: ${inf.cartaGantt}</div>` : ''}
  </div>
</div>

</body></html>`;

    return html;
  }

  async function descargarHTML(inf, cfg) {
    const html = generarHTMLInforme(inf, cfg);
    const fechaStr = new Date(inf.fecha + "T12:00:00").toISOString().slice(0,10).replace(/-/g,'');
    const nombreArchivo = `${inf.numero} - ${inf.cliente} - ${fechaStr}.html`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (esIOS) {
      // En iOS, tanto los Blob URL como los data URL abiertos en pestaña nueva
      // fallan de forma intermitente en Safari. La vía confiable es el panel
      // nativo de Compartir de iOS, que permite Guardar en Archivos, enviar por
      // WhatsApp, Email, etc. directamente.
      try {
        const file = new File([blob], nombreArchivo, { type: 'text/html' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: nombreArchivo });
          return;
        }
      } catch (err) {
        if (err && err.name === 'AbortError') return; // el usuario cerró el panel de compartir
        // si falla por otro motivo, seguimos con el respaldo de abajo
      }
      // Respaldo si el dispositivo no soporta compartir archivos: mostramos el
      // informe en la misma pestaña como data URL para que use Compartir desde ahí.
      const reader = new FileReader();
      reader.onload = () => { window.location.href = reader.result; };
      reader.readAsDataURL(blob);
      alert('El informe se abrió en esta pestaña. Toca el ícono de Compartir (⬆) de Safari y elige "Guardar en Archivos" o envíalo directo por WhatsApp/Email.');
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  }

  function compartirWhatsApp(inf, cfg, fechaFmt) {
    const texto = `Hola, adjunto informe de mantención eléctrica *${inf.numero}* correspondiente a *${inf.cliente}* con fecha ${fechaFmt}.\n\nTableros inspeccionados: ${inf.tableros.length}\nPersonal: ${inf.personal.filter(Boolean).join(", ")}\n\nPor favor revisar el informe adjunto. Saludos, ${cfg.empresa}.`;
    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
  }

  function enviarEmail(inf, cfg, fechaFmt) {
    const asunto = `Informe Mantención Eléctrica ${inf.numero} - ${inf.cliente}`;

    // Build critical observations list for email body
    const criticas = [];
    inf.tableros.forEach(t => {
      const zonaTexto = t.zona === "Otro" ? t.zonaOtro : t.zona;
      const ubicLabel = [zonaTexto, t.piso, t.ubicacion, t.numeroSala].filter(Boolean).join(' — ');
      (t.registros||[]).forEach((reg, ri) => {
        reg.observaciones.filter(o => o.criticidad === "Crítica").forEach(obs => {
          criticas.push(`  • [${ubicLabel} / Registro N°${ri+1}] ${obs.texto}`);
        });
      });
    });

    const seccionCriticas = criticas.length > 0
      ? `\n⚠ OBSERVACIONES CRÍTICAS (${criticas.length}):\n\n${criticas.map((c, i) => {
          const parts = c.match(/^\s+•\s+\[(.+?)\s+\/\s+Registro N°(\d+)\]\s+(.+)$/);
          if (!parts) return c;
          return `${i+1}. ${parts[1]} | Registro N°${parts[2]}\n   ${parts[3]}`;
        }).join("\n\n")}\n\nEstas observaciones requieren atención prioritaria. Se recomienda gestionar su corrección en el corto plazo para evitar riesgos a la instalación y a las personas.\n`
      : "";

    const cuerpo = `Estimado/a Sr./Sra. ${inf.contacto || ""},\n\nJunto con saludar, adjunto el informe de mantención preventiva de tableros eléctricos correspondiente a:\n\nCliente: ${inf.cliente}\nFecha: ${fechaFmt}\nN° Informe: ${inf.numero}\nTableros inspeccionados: ${inf.tableros.length}\nPersonal: ${inf.personal.filter(Boolean).join(", ")}\n${inf.cartaGantt ? "Próxima mantención: "+inf.cartaGantt+"\n" : ""}${seccionCriticas}\nEl detalle completo con fotografías y observaciones se encuentra en el archivo adjunto.\n\nQuedamos a su disposición ante cualquier consulta.\n\nSaludos cordiales,\n${cfg.empresa}\n${cfg.rut}\n${cfg.email}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  }

  const s = {
    app: { fontFamily: FONT, fontSize: 14, maxWidth: 480, margin: "0 auto", background: t.bg, color: t.text, minHeight: "100vh", width: "100%" },
    header: { background: t.header, color: t.headerText, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    body: { padding: "16px" },
    card: { background: t.surface, borderRadius: 16, border: t.modo === "light" ? `1px solid ${t.border}` : "none", boxShadow: t.cardShadow, padding: "14px 16px", marginBottom: 12 },
    label: { fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block", fontFamily: FONT },
    input: { width: "100%", padding: "9px 11px", border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 16, boxSizing: "border-box", marginBottom: 10, fontFamily: FONT, WebkitAppearance: "none", appearance: "none", color: t.text, background: t.inputBg },
    select: { width: "100%", padding: "9px 11px", border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 16, boxSizing: "border-box", marginBottom: 10, fontFamily: FONT, WebkitAppearance: "none", appearance: "none", color: t.text, background: t.inputBg },
    textarea: { width: "100%", padding: "9px 11px", border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 16, boxSizing: "border-box", marginBottom: 6, minHeight: 80, resize: "vertical", fontFamily: FONT, color: t.text, background: t.inputBg },
    btn: { padding: "10px 18px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: FONT, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 },
    btnPrimary: { background: t.modo === "light" ? "#2c2c2c" : "#333333", color: "#ffffff" },
    btnAccent: { background: ACCENT, color: ACCENT_TEXT, boxShadow: "0 4px 14px rgba(227,180,25,0.35)", borderRadius: 999 },
    btnDanger: { background: t.peligro.bg, color: t.peligro.text, fontSize: 12, padding: "6px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 6 },
    btnGhost: { background: "transparent", color: t.text, border: `1px solid ${t.border}`, fontSize: 13, padding: "7px 14px", borderRadius: 12, cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 6 },
    row: { display: "flex", gap: 8, alignItems: "center" },
    sectionTitle: { fontSize: 12, fontWeight: 700, color: t.text, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 5, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" },
    badge: (c) => ({ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: t.criticidad[c].bg, color: t.criticidad[c].text, textTransform: "uppercase" }),
  };

  // ── Verificando licencia: pantalla de Bienvenida ──
  if (licencia.estado === "cargando") return (
    <div style={{ ...s.app, background: "#2c2c2c", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes brimahdSplashIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes brimahdDotPulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); } 40% { opacity: 1; background: ${ACCENT}; transform: scale(1); } }
        @keyframes brimahdGlowPulse { 0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); } }
        @media (prefers-reduced-motion: reduce) {
          .brimahd-splash-anim { animation: none !important; }
          .brimahd-splash-loader span { opacity: 0.6 !important; }
        }
      `}</style>
      <div className="brimahd-splash-anim" style={{ position: "absolute", width: 260, height: 260, top: "42%", left: "50%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(232,185,35,0.22) 0%, rgba(232,185,35,0) 70%)", pointerEvents: "none", animation: "brimahdGlowPulse 4s ease-in-out infinite" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative", zIndex: 2 }}>
        <div className="brimahd-splash-anim" style={{ color: "#ffffff", fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em", fontFamily: FONT, animation: "brimahdSplashIn 0.9s cubic-bezier(.16,.84,.44,1) both" }}>Brimahd</div>
        <div className="brimahd-splash-anim" style={{ color: ACCENT, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", fontFamily: FONT, animation: "brimahdSplashIn 0.9s cubic-bezier(.16,.84,.44,1) 0.12s both" }}>Servicios Eléctricos y Telecomunicaciones</div>
        <div className="brimahd-splash-anim brimahd-splash-loader" style={{ marginTop: 22, display: "flex", gap: 6, animation: "brimahdSplashIn 0.9s cubic-bezier(.16,.84,.44,1) 0.24s both" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", animation: "brimahdDotPulse 1.3s ease-in-out infinite" }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", animation: "brimahdDotPulse 1.3s ease-in-out infinite 0.16s" }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", animation: "brimahdDotPulse 1.3s ease-in-out infinite 0.32s" }} />
        </div>
      </div>
    </div>
  );

  // ── Servicio suspendido (kill switch remoto) ──
  if (licencia.estado === "inactiva") return (
    <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ ...s.card, textAlign: "center", maxWidth: 340, margin: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, color: t.textDim }}><Lock size={32} /></div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 8 }}>Servicio suspendido</div>
        <div style={{ fontSize: 13, color: t.textDim, lineHeight: 1.5 }}>
          {licencia.mensaje || "El acceso a esta aplicación se encuentra temporalmente suspendido. Contacta al administrador del servicio para más información."}
        </div>
      </div>
    </div>
  );

  if (screen === "inicio") return (
    <div style={s.app}>
      <style>{`
        @keyframes brimahdAvisoPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .72; transform: scale(1.18); } }
        .brimahd-aviso-pulse { animation: brimahdAvisoPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .brimahd-aviso-pulse { animation: none !important; } }
        details.brimahd-aviso summary { list-style: none; cursor: pointer; }
        details.brimahd-aviso summary::-webkit-details-marker { display: none; }
      `}</style>
      <div style={s.header}>
        <span style={{ fontSize: 15, fontWeight: 700, color: t.headerText, fontFamily: FONT }}>Brimahd ltda. <span style={{ fontSize: 10, color: ACCENT, display: "block", letterSpacing: "0.3px" }}>Servicios Eléctricos</span></span>
        <button style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("config")}><Settings size={15} /> Config</button>
      </div>
      <div style={{ ...s.body, display: "flex", flexDirection: "column", minHeight: "calc(100vh - 53px)", boxSizing: "border-box" }}>
        {draftDisponible && (
          <details className="brimahd-aviso" style={{ background: t.aviso.bg, border: `1px solid ${t.aviso.border}`, borderRadius: 12, flexShrink: 0 }}>
            <summary style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", fontSize: 12, fontWeight: 700, color: t.aviso.text }}>
              <span className="brimahd-aviso-pulse" style={{ width: 16, height: 16, borderRadius: "50%", background: t.aviso.text, color: t.aviso.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>!</span>
              Informe sin terminar
            </summary>
            <div style={{ padding: "0 12px 12px" }}>
              <div style={{ fontSize: 12, color: t.aviso.text, marginBottom: 12, lineHeight: 1.5 }}>
                {draftDisponible.informe.numero || "Sin número"} · {draftDisponible.informe.cliente || "Sin sede"} · {(draftDisponible.informe.tableros || []).length} tablero{(draftDisponible.informe.tableros || []).length === 1 ? "" : "s"} guardado{(draftDisponible.informe.tableros || []).length === 1 ? "" : "s"}
                {draftDisponible.tableroEdit && draftDisponible.tableroEdit.registros && draftDisponible.tableroEdit.registros.length > 0
                  ? ` + 1 tablero en edición (${draftDisponible.tableroEdit.registros.length} registro${draftDisponible.tableroEdit.registros.length === 1 ? "" : "s"})`
                  : ""}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={continuarBorrador}>Continuar informe</button>
                <button style={{ ...s.btn, ...s.btnGhost, flex: 1 }} onClick={descartarBorrador}>Descartar</button>
              </div>
            </div>
          </details>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <button
            onClick={iniciarInforme}
            style={{ width: 88, height: 88, borderRadius: "50%", background: ACCENT, color: ACCENT_TEXT, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, fontFamily: FONT, boxShadow: "0 10px 24px -8px rgba(0,0,0,.4)" }}
            aria-label="Nuevo informe"
          >+</button>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text, marginTop: 2 }}>Nuevo informe</div>
          <div style={{ marginTop: 14, fontSize: 11.5, fontWeight: 600, color: t.textDim, background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 20, padding: "7px 13px" }}>
            Próximo informe · <b style={{ color: t.text, fontFamily: FONT_MONO, fontWeight: 700 }}>{proximoNumero}</b>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: t.textDim, lineHeight: 1.6, padding: "8px 0 4px", flexShrink: 0 }}>
          <strong style={{ color: t.text }}>{config.empresa}</strong> · {config.rut}<br />
          <span style={{ color: ACCENT }}>{config.email}</span>
        </div>
      </div>
    </div>
  );

  if (screen === "config") return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.headerText, fontFamily: FONT }}>Brimahd ltda.</span>
        <button style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("inicio")}><ArrowLeft size={15} /> Volver</button>
      </div>
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.sectionTitle}>Apariencia</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text }}>
              {temaOscuro ? <Moon size={16} /> : <Sun size={16} />}
              Modo {temaOscuro ? "oscuro" : "claro"}
            </span>
            <button onClick={() => setTemaOscuro(!temaOscuro)}
              style={{ width: 52, height: 28, borderRadius: 14, background: temaOscuro ? ACCENT : "#ccc", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, padding: 0 }}>
              <div style={{ position: "absolute", top: 4, left: temaOscuro ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
            </button>
          </div>
        </div>
        <div style={s.card}>
          <div style={s.sectionTitle}>Datos de la empresa</div>
          <label style={s.label}>Nombre empresa</label>
          <input style={s.input} value={config.empresa} onChange={e => setConfig({ ...config, empresa: e.target.value })} />
          <label style={s.label}>RUT</label>
          <input style={s.input} value={config.rut} onChange={e => setConfig({ ...config, rut: e.target.value })} />
          <label style={s.label}>Email</label>
          <input style={s.input} value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} />
          <label style={s.label}>EPP estándar</label>
          <textarea style={s.textarea} value={config.epp} onChange={e => setConfig({ ...config, epp: e.target.value })} />
          <button style={{ ...s.btn, ...s.btnAccent, width: "100%" }} onClick={() => setScreen("inicio")}>Guardar</button>
        </div>
      </div>
    </div>
  );

  if (screen === "informe" && informe) {

    const fieldRow = { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 10 };
    const fieldRowLabel = { fontSize: 10, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.3px", fontFamily: FONT, marginBottom: 3, display: "block" };
    const fieldRowValue = { fontSize: 13, fontWeight: 600, color: t.text, fontFamily: FONT };
    const fieldRowPlaceholder = { ...fieldRowValue, fontWeight: 500, color: t.textFaint };
    const stickyBar = { position: "sticky", bottom: 0, background: t.header, borderTop: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", gap: 10, zIndex: 20 };
    const personalTexto = informe.personal.filter(Boolean).join(", ");

    return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.headerText, fontFamily: FONT }}>Brimahd ltda.</span>
        <button
          style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, fontSize: 12, padding: "6px 12px" }}
          onClick={() => informeStep === 0 ? setScreen("inicio") : setInformeStep(0)}
        ><ArrowLeft size={15} /> {informeStep === 0 ? "Salir" : "Atrás"}</button>
      </div>
      <div style={{ background: ACCENT, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT_TEXT, fontFamily: FONT_MONO }}>Informe {informe.numero}</span>
        <span style={{ fontSize: 11, color: ACCENT_TEXT, opacity: 0.7 }}>{informeStep === 0 ? "Datos generales" : `Tableros (${informe.tableros.length})`}</span>
      </div>
      {autoguardadoError && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.peligro.solid, color: "#ffffff", padding: "8px 18px", fontSize: 12, lineHeight: 1.4 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} /> No se pudo guardar el progreso automáticamente en este celular. Si la app se cierra, podrías perder lo hecho desde ahora. Genera y descarga el informe pronto para no perder trabajo.
        </div>
      )}
      <div style={{ padding: "10px 16px 4px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{ height: 4, flex: 1, borderRadius: 3, background: ACCENT }} />
          <span style={{ height: 4, flex: 1, borderRadius: 3, background: informeStep === 1 ? ACCENT : t.border }} />
        </div>
      </div>

      {informeStep === 0 && (
        <div style={s.body}>
          <div style={fieldRow} onClick={() => { setSedeSearch(""); setSedeSheetOpen(true); }}>
            <div>
              <span style={fieldRowLabel}>Sede</span>
              <span style={informe.cliente ? fieldRowValue : fieldRowPlaceholder}>{informe.cliente || "— Seleccionar sede —"}</span>
            </div>
            <ChevronRight size={16} style={{ color: t.textFaint }} />
          </div>
          <label style={s.label}>Contacto</label>
          <input style={s.input} value={informe.contacto} onChange={e => updateInforme("contacto", e.target.value)} placeholder="Nombre del contacto" />
          <label style={s.label}>Dirección</label>
          <input style={s.input} value={informe.direccion} onChange={e => updateInforme("direccion", e.target.value)} placeholder="Dirección de la sede" />
          <label style={s.label}>Fecha de servicio</label>
          <input style={s.input} type="date" value={informe.fecha} onChange={e => updateInforme("fecha", e.target.value)} />

          <div style={{ ...fieldRow, marginTop: 2 }} onClick={() => setTecSheetOpen(true)}>
            <div>
              <span style={fieldRowLabel}>Personal en terreno</span>
              <span style={personalTexto ? fieldRowValue : fieldRowPlaceholder}>{personalTexto || "— Seleccionar técnicos —"}</span>
            </div>
            <ChevronRight size={16} style={{ color: t.textFaint }} />
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>Próxima mantención</div>
            <label style={s.label}>Fecha próxima visita</label>
            <div style={s.row}>
              <select
                style={{ ...s.select, flex: 1, marginBottom: 0 }}
                value={informe.cartaGantt.split(" ")[0] || ""}
                onChange={e => {
                  const anio = informe.cartaGantt.split(" ")[1] || String(ANIO_ACTUAL);
                  updateInforme("cartaGantt", e.target.value ? `${e.target.value} ${anio}` : "");
                }}
              >
                <option value="">Mes</option>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                style={{ ...s.select, flex: 1, marginBottom: 0 }}
                value={informe.cartaGantt.split(" ")[1] || ""}
                onChange={e => {
                  const mes = informe.cartaGantt.split(" ")[0] || "";
                  updateInforme("cartaGantt", mes ? `${mes} ${e.target.value}` : (e.target.value ? ` ${e.target.value}` : ""));
                }}
              >
                <option value="">Año</option>
                {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div style={{ height: 8 }} />
        </div>
      )}

      {informeStep === 1 && (
        <div style={{ ...s.body, position: "relative" }}>
          {informe.tableros.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 16px", color: t.textFaint, fontSize: 13 }}>
              Todavía no agregas ningún tablero.<br />Usa el botón "+" para agregar el primero.
            </div>
          )}
          {informe.tableros.map((tab, i) => {
            const abierto = swipedTablero === i;
            return (
              <div key={tab.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                <div
                  style={{ position: "absolute", inset: 0, background: t.peligro.solid, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 16px", cursor: "pointer" }}
                  onClick={() => { deleteTablero(i); setSwipedTablero(null); }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 12, fontWeight: 700 }}><Trash2 size={14} /> Eliminar</span>
                </div>
                <div
                  style={{ position: "relative", border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", background: t.bg, transform: abierto ? "translateX(-84px)" : "translateX(0)", transition: "transform .2s ease" }}
                  onTouchStart={e => { swipeRef.current[i] = { startX: e.touches[0].clientX }; }}
                  onTouchMove={e => { const st = swipeRef.current[i]; if (st) st.dx = e.touches[0].clientX - st.startX; }}
                  onTouchEnd={() => {
                    const st = swipeRef.current[i];
                    if (st && st.dx < -40) setSwipedTablero(i);
                    else if (!st || st.dx > -10) { if (abierto) setSwipedTablero(null); }
                    swipeRef.current[i] = null;
                  }}
                  onClick={() => { if (abierto) setSwipedTablero(null); else openTablero(i); }}
                >
                  <div style={{ background: t.header, color: t.headerText, padding: "9px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{(tab.zona === "Otro" ? tab.zonaOtro : tab.zona) || tab.ubicacion}</span>
                    <span style={{ fontSize: 11, background: t.headerBtnBg, padding: "2px 8px", borderRadius: 10 }}>{tab.piso} · {tab.ubicacion}{tab.numeroSala ? ` ${tab.numeroSala}` : ""}</span>
                  </div>
                  <div style={{ padding: "10px 13px", background: t.surface }}>
                    <span style={s.badge(tab.criticidad)}>{tab.criticidad}</span>
                    {tab.garantia && <span style={{ marginLeft: 6, fontSize: 11, background: t.garantia.bg, color: t.garantia.text, padding: "3px 8px", borderRadius: 10, fontWeight: 700 }}>En garantía</span>}
                    <div style={{ fontSize: 12, color: t.textDim, marginTop: 8, lineHeight: 1.5 }}>{tab.registros?.length > 0 ? `${tab.registros.length} registro${tab.registros.length > 1 ? "s" : ""}` : "Sin registros"}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ height: 76 }} />
          <button
            onClick={() => openTablero(null)}
            aria-label="Agregar tablero"
            style={{ position: "fixed", right: 16, bottom: 84, width: 50, height: 50, borderRadius: "50%", background: ACCENT, color: ACCENT_TEXT, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px -6px rgba(0,0,0,.55)", zIndex: 15 }}
          ><Plus size={24} /></button>
        </div>
      )}

      <div style={stickyBar}>
        {informeStep === 0 ? (
          <button style={{ ...s.btn, ...s.btnAccent, width: "100%" }} onClick={() => setInformeStep(1)}>Siguiente →</button>
        ) : (
          <button style={{ ...s.btn, ...s.btnAccent, width: "100%", opacity: generando ? 0.6 : 1 }} onClick={generarInforme} disabled={generando}>{generando ? "Generando…" : "Generar informe →"}</button>
        )}
      </div>

      {sedeSheetOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 30 }} onClick={() => setSedeSheetOpen(false)} />
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: 480, margin: "0 auto", background: t.header, borderRadius: "18px 18px 0 0", padding: "10px 16px 16px", zIndex: 31, maxHeight: "78%", display: "flex", flexDirection: "column" }}>
            <div style={{ width: 36, height: 4, background: t.border, borderRadius: 3, margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: t.headerText, marginBottom: 10 }}>Seleccionar sede</div>
            <input
              style={{ ...s.input, marginBottom: 10, background: t.surface }}
              value={sedeSearch}
              onChange={e => setSedeSearch(e.target.value)}
              placeholder="Buscar sede…"
              autoFocus
            />
            <div style={{ overflowY: "auto" }}>
              {sedesFiltradas.length === 0 && <div style={{ padding: 16, textAlign: "center", color: t.textFaint, fontSize: 13 }}>Sin resultados</div>}
              {sedesFiltradas.map(sede => (
                <div
                  key={sede.nombre}
                  onClick={() => { selectSede(sede); setSedeSheetOpen(false); }}
                  style={{ padding: "11px 12px", borderRadius: 10, marginBottom: 6, fontSize: 13, fontWeight: sede.nombre === informe.cliente ? 700 : 500, background: sede.nombre === informe.cliente ? "rgba(227,180,25,.14)" : t.surface, color: sede.nombre === informe.cliente ? ACCENT : t.text, cursor: "pointer" }}
                >{sede.nombre}</div>
              ))}
            </div>
          </div>
        </>
      )}

      {tecSheetOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 30 }} onClick={() => setTecSheetOpen(false)} />
          <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: 480, margin: "0 auto", background: t.header, borderRadius: "18px 18px 0 0", padding: "10px 16px 16px", zIndex: 31 }}>
            <div style={{ width: 36, height: 4, background: t.border, borderRadius: 3, margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: t.headerText, marginBottom: 10 }}>Personal en terreno <span style={{ color: t.headerTextDim, fontWeight: 500 }}>· elige uno o más</span></div>
            {TECNICOS.map(tec => {
              const sel = informe.personal.includes(tec);
              return (
                <div
                  key={tec}
                  onClick={() => toggleTecnico(tec)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 12px", borderRadius: 10, marginBottom: 6, fontSize: 13, fontWeight: sel ? 700 : 500, background: sel ? "rgba(227,180,25,.14)" : t.surface, color: sel ? ACCENT : t.text, cursor: "pointer" }}
                >{tec}{sel && <Check size={15} />}</div>
              );
            })}
            <button style={{ ...s.btn, ...s.btnAccent, width: "100%", marginTop: 10 }} onClick={() => setTecSheetOpen(false)}>Listo</button>
          </div>
        </>
      )}
    </div>
    );
  }

  if (screen === "tablero" && tableroEdit) {

  // ── Picker de observaciones ──
  if (obsPicker !== null) {
    const regIdx = obsPicker.regIdx;
    const regSearch = obsSearch[regIdx] || "";
    const regFiltered = OBSERVACIONES_PREDEFINIDAS.filter(o =>
      o.texto.toLowerCase().includes(regSearch.toLowerCase())
    );
    const reg = tableroEdit.registros[regIdx];

    function toggleObsChip(obs) {
      const idx = reg.observaciones.findIndex(o => o.texto === obs.texto);
      if (idx >= 0) removeObsFromRegistro(regIdx, idx);
      else addObsToRegistro(regIdx, obs);
    }

    const gruposPorCriticidad = CRITICIDAD.map(crit => ({
      crit,
      items: regFiltered.filter(o => o.criticidad === crit),
    })).filter(g => g.items.length > 0);

    return (
      <div style={s.app}>
        <div style={s.header}>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.headerText, fontFamily: FONT }}>Brimahd ltda.</span>
          <button style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, fontSize: 12, padding: "6px 12px" }}
            onClick={() => setObsPicker(null)}><ArrowLeft size={15} /> Volver</button>
        </div>
        <div style={{ background: ACCENT, padding: "10px 18px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT_TEXT }}>Registro N° {regIdx + 1} — Observaciones</span>
        </div>
        <div style={s.body}>
          <input
            style={{ ...s.input }}
            value={regSearch}
            onChange={e => setObsSearch(p => { const a = [...p]; a[regIdx] = e.target.value; return a; })}
            placeholder="Buscar observación…"
          />
          {regFiltered.length === 0 && (
            <div style={{ padding: "16px", textAlign: "center", color: t.textFaint, fontSize: 13 }}>Sin resultados</div>
          )}
          {gruposPorCriticidad.map(({ crit, items }) => (
            <div key={crit} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: t.criticidad[crit].text, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8, fontFamily: FONT }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.criticidad[crit].text }} />
                {crit}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {items.map((obs, i) => {
                  const sel = reg.observaciones.some(o => o.texto === obs.texto);
                  return (
                    <button key={i} onClick={() => toggleObsChip(obs)}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "8px 12px", borderRadius: 20, cursor: "pointer",
                        border: sel ? "none" : `1px solid ${t.border}`, fontFamily: FONT,
                        background: sel ? t.criticidad[crit].bg : "transparent",
                        color: sel ? t.criticidad[crit].text : t.text,
                        display: "inline-flex", alignItems: "center", gap: 5,
                      }}>
                      {sel && <Check size={12} />}{obs.texto}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <details>
            <summary style={{ listStyle: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: ACCENT, padding: "6px 2px" }}>+ Otra observación (no está en la lista)</summary>
            <div style={{ ...s.card, marginTop: 8 }}>
              <label style={s.label}>Observación</label>
              <input
                style={s.input}
                value={obsLibreTexto[regIdx] || ""}
                onChange={e => setObsLibreTexto(p => { const a = [...p]; a[regIdx] = e.target.value; return a; })}
                placeholder="Escribe la observación"
              />
              <label style={s.label}>Criticidad</label>
              <select
                style={s.select}
                value={obsLibreCrit[regIdx] || "Media"}
                onChange={e => setObsLibreCrit(p => { const a = [...p]; a[regIdx] = e.target.value; return a; })}>
                {CRITICIDAD.map(c => <option key={c}>{c}</option>)}
              </select>
              <button
                style={{ ...s.btn, ...s.btnGhost, width: "100%", padding: 12, marginTop: 10 }}
                onClick={() => {
                  const texto = (obsLibreTexto[regIdx] || "").trim();
                  if (!texto) return;
                  addObsToRegistro(regIdx, { texto, criticidad: obsLibreCrit[regIdx] || "Media", libre: true });
                  setObsLibreTexto(p => { const a = [...p]; a[regIdx] = ""; return a; });
                }}>
                <Plus size={15} /> Agregar observación
              </button>
            </div>
          </details>
          <div style={{ height: 68 }} />
        </div>
        <div style={{ position: "sticky", bottom: 0, background: t.header, borderTop: `1px solid ${t.border}`, padding: "10px 16px 12px", zIndex: 20 }}>
          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: t.headerTextDim, marginBottom: 8 }}>
            {reg.observaciones.length} seleccionada{reg.observaciones.length === 1 ? "" : "s"}
          </div>
          <button style={{ ...s.btn, ...s.btnAccent, width: "100%" }} onClick={() => setObsPicker(null)}>Listo</button>
        </div>
      </div>
    );
  }

  const identResumen = [
    tableroEdit.zona === "Otro" ? tableroEdit.zonaOtro : tableroEdit.zona,
    tableroEdit.piso,
    tableroEdit.nombreTablero || tableroEdit.ubicacion,
    tableroEdit.garantia ? "En garantía" : "",
  ].filter(Boolean).join(" · ");

  return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.headerText, fontFamily: FONT }}>Brimahd ltda.</span>
        <button style={{ ...s.btn, background: t.headerBtnBg, color: t.headerText, fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("informe")}><ArrowLeft size={15} /> Volver</button>
      </div>
      <div style={{ background: ACCENT, padding: "10px 18px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT_TEXT }}>{editIdx === null ? "Nuevo tablero" : "Editar tablero"}</span>
      </div>
      <div style={s.body}>

        {/* ── Datos del tablero ── */}
        <details open={editIdx === null} style={{ marginBottom: 14 }}>
          <summary style={{ listStyle: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "11px 13px" }}>
            <div>
              <div style={{ fontSize: 10, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 3, fontFamily: FONT }}>Identificación</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{identResumen || "Sin completar"}</div>
            </div>
            <ChevronRight size={16} style={{ color: t.textFaint }} />
          </summary>
          <div style={{ ...s.card, marginTop: 8 }}>
            <label style={s.label}>Zona</label>
            <select style={s.select} value={tableroEdit.zona} onChange={e => setTableroEdit(p => ({ ...p, zona: e.target.value, zonaOtro: "" }))}>
              {ZONAS.map(z => <option key={z}>{z}</option>)}
            </select>
            {tableroEdit.zona === "Otro" && (
              <input style={s.input} value={tableroEdit.zonaOtro} onChange={e => setTableroEdit(p => ({ ...p, zonaOtro: e.target.value }))} placeholder="Escribe la zona" />
            )}
            <label style={s.label}>Piso</label>
            <select style={s.select} value={tableroEdit.piso} onChange={e => setTableroEdit(p => ({ ...p, piso: e.target.value }))}>
              {PISOS.map(p => <option key={p}>{p}</option>)}
            </select>
            <label style={s.label}>Ubicación</label>
            <select style={s.select} value={tableroEdit.ubicacion} onChange={e => setTableroEdit(p => ({ ...p, ubicacion: e.target.value, numeroSala: "" }))}>
              {UBICACIONES.map(u => <option key={u}>{u}</option>)}
            </select>
            {(tableroEdit.ubicacion === "Sala" || tableroEdit.ubicacion === "Laboratorio") && (
              <>
                <label style={s.label}>{tableroEdit.ubicacion === "Laboratorio" ? "Nombre laboratorio" : "Número de sala"}</label>
                <input style={s.input} value={tableroEdit.numeroSala} onChange={e => setTableroEdit(p => ({ ...p, numeroSala: e.target.value }))} placeholder={tableroEdit.ubicacion === "Laboratorio" ? "Ej: Laboratorio de Redes" : "Ej: 302"} />
              </>
            )}
            <label style={s.label}>Nombre de tablero</label>
            <input style={s.input} value={tableroEdit.nombreTablero} onChange={e => setTableroEdit(p => ({ ...p, nombreTablero: e.target.value }))} placeholder="Ej: TD-1" />
            <label style={s.label}>Protección general</label>
            <input style={s.input} value={tableroEdit.proteccionGeneral} onChange={e => setTableroEdit(p => ({ ...p, proteccionGeneral: e.target.value }))} placeholder="Ej: 3x100A" />
            <label style={s.label}>Marca</label>
            <select style={s.select} value={tableroEdit.marca} onChange={e => setTableroEdit(p => ({ ...p, marca: e.target.value, marcaOtro: "" }))}>
              {MARCAS.map(m => <option key={m}>{m}</option>)}
            </select>
            {tableroEdit.marca === "Otro" && (
              <input style={s.input} value={tableroEdit.marcaOtro} onChange={e => setTableroEdit(p => ({ ...p, marcaOtro: e.target.value }))} placeholder="Escribe la marca" />
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, padding: "10px 12px", background: tableroEdit.garantia ? t.garantia.bg : t.surfaceAlt, borderRadius: 12 }}>
              <span style={{ fontSize: 13, fontWeight: tableroEdit.garantia ? 700 : 400, color: tableroEdit.garantia ? t.garantia.text : t.textDim }}>Tablero en garantía</span>
              <button onClick={() => setTableroEdit(p => ({ ...p, garantia: !p.garantia }))}
                style={{ width: 52, height: 28, borderRadius: 14, background: tableroEdit.garantia ? t.garantia.solid : "#8a8a8a", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, padding: 0 }}>
                <div style={{ position: "absolute", top: 4, left: tableroEdit.garantia ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
              </button>
            </div>
          </div>
        </details>

        {/* ── Registros ── */}
        <div style={s.sectionTitle}>Registros</div>

        {tableroEdit.registros.map((reg, regIdx) => {
          return (
            <div key={reg.id} style={{ border: `1px solid ${t.border}`, borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ background: t.header, color: t.headerText, padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Registro N° {regIdx + 1}</span>
                <button onClick={() => removeRegistro(regIdx)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: t.headerBtnBg, border: "none", color: t.headerText, borderRadius: 8, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}><Trash2 size={12} /> Eliminar</button>
              </div>
              <div style={{ padding: "14px", background: t.surface }}>
                <input ref={el => { if (!fileRef.current) fileRef.current = {}; fileRef.current[regIdx] = el; }} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                  onChange={e => handleRegistroFoto(e, regIdx)} />
                {reg.foto ? (
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <img src={reg.foto.data} alt="registro" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, border: `1px solid ${t.border}` }} />
                    <button onClick={() => fileRef.current[regIdx]?.click()}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.65)", color: "white", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>
                      <Camera size={13} /> Cambiar foto
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current[regIdx]?.click()}
                    style={{ ...s.btnGhost, width: "100%", marginBottom: 12, padding: "20px", border: `2px dashed ${t.border}`, borderRadius: 12, fontSize: 13, color: t.textDim }}>
                    <Camera size={16} /> Tomar foto (obligatorio)
                  </button>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "10px 12px", background: reg.sinObservaciones ? t.exito.bg : t.surfaceAlt, borderRadius: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: reg.sinObservaciones ? 700 : 400, color: reg.sinObservaciones ? t.exito.text : t.textDim }}>Sin observaciones</span>
                  <button onClick={() => toggleSinObservaciones(regIdx)}
                    style={{ width: 52, height: 28, borderRadius: 14, background: reg.sinObservaciones ? t.exito.solid : "#8a8a8a", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, padding: 0 }}>
                    <div style={{ position: "absolute", top: 4, left: reg.sinObservaciones ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
                  </button>
                </div>
                {reg.sinObservaciones ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 10, background: t.exito.bg, borderRadius: 12 }}>
                    <Check size={15} style={{ color: t.exito.text, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: t.exito.text, fontWeight: 600 }}>Registro marcado sin observaciones</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setObsPicker({ regIdx })}
                      style={{ ...s.btnGhost, width: "100%", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
                      <span style={{ fontSize: 13, color: reg.observaciones.length > 0 ? t.text : t.textFaint }}>
                        {reg.observaciones.length > 0 ? `${reg.observaciones.length} observación${reg.observaciones.length > 1 ? "es" : ""} seleccionada${reg.observaciones.length > 1 ? "s" : ""}` : "Agregar observaciones…"}
                      </span>
                      <ChevronRight size={15} style={{ color: t.textFaint }} />
                    </button>
                    {reg.observaciones.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                        {reg.observaciones.map((obs, oi) => (
                          <div key={oi} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: t.criticidad[obs.criticidad].bg, borderRadius: 10, padding: "7px 10px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: t.criticidad[obs.criticidad].text, minWidth: 18, paddingTop: 1, opacity: 0.7 }}>{oi + 1}.</span>
                            <span style={{ flex: 1, fontSize: 12, color: t.criticidad[obs.criticidad].text, lineHeight: 1.4, fontWeight: 500 }}>{obs.texto}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: t.criticidad[obs.criticidad].text, whiteSpace: "nowrap", opacity: 0.85 }}>{obs.criticidad}</span>
                            <button onClick={() => removeObsFromRegistro(regIdx, oi)} style={{ background: "none", border: "none", cursor: "pointer", color: t.criticidad[obs.criticidad].text, lineHeight: 1, padding: "0 2px", opacity: 0.7, display: "flex" }}><X size={13} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "10px 12px", background: reg.cambioTablero ? t.peligro.bg : t.surfaceAlt, borderRadius: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: reg.cambioTablero ? 700 : 400, color: reg.cambioTablero ? t.peligro.text : t.textDim }}>Se recomienda cambio de tablero</span>
                  <button onClick={() => { const regs = [...tableroEdit.registros]; regs[regIdx] = { ...reg, cambioTablero: !reg.cambioTablero }; setTableroEdit(p => ({ ...p, registros: regs })); }}
                    style={{ width: 52, height: 28, borderRadius: 14, background: reg.cambioTablero ? t.peligro.solid : "#8a8a8a", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, padding: 0 }}>
                    <div style={{ position: "absolute", top: 4, left: reg.cambioTablero ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 68 }} />
      </div>
      <div style={{ position: "sticky", bottom: 0, background: t.header, borderTop: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", gap: 10, zIndex: 20 }}>
        <button style={{ ...s.btn, ...s.btnGhost, flex: 1 }} onClick={addRegistro}>
          <Plus size={15} /> Registro
        </button>
        <button style={{ ...s.btn, ...s.btnAccent, flex: 1.4 }} onClick={saveTablero}>Guardar tablero</button>
      </div>
    </div>
  );
  }

  if (screen === "preview" && informe) {
    return <VistaPreviaInforme informe={informe} config={config} setScreen={setScreen} finalizarInforme={finalizarInforme} generarHTMLInforme={generarHTMLInforme} descargarHTML={descargarHTML} compartirWhatsApp={compartirWhatsApp} enviarEmail={enviarEmail} s={s} t={t} />;
  }
  return null;
}
