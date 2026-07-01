import React, { useState, useRef } from "react";

const PRIMARY = "#2c2c2c";
const ACCENT = "#e8b923";
const BG = "#f8f8f8";
const FONT = "'Roboto', sans-serif";

const CRITICIDAD = ["Crítica", "Media", "Leve"];
const CRITICO_COLOR = { "Crítica": "#ffffff", "Media": "#7a3800", "Leve": "#1a3a45" };
const CRITICO_BG   = { "Crítica": "#c0392b", "Media": "#f39c12", "Leve": "#7fb3c8" };
const CRITICO_BORDER = { "Crítica": "#a93226", "Media": "#d68910", "Leve": "#5d9db5" };
const PISOS = ["Piso -2","Piso -1","Zócalo","Piso 1","Piso 2","Piso 3","Piso 4","Piso 5","Piso 6","Piso 7","Piso 8","Piso 9","Piso 10","Piso 11","Piso 12","Piso 13","Piso 14","Piso 15","Azotea"];
const UBICACIONES = ["Sala","Pasillo","Shaft","Oficina","Laboratorio","Cancha","Auditorio"];
const OBSERVACIONES_PREDEFINIDAS = [
  // ── Crítica ──
  { texto: "Se detectan ferrules deteriorados o mal instalados; el conductor queda expuesto sin aislación en el punto de conexión", criticidad: "Crítica" },
  { texto: "Circuito de alumbrado accionado mediante protección automática en lugar de interruptor de mando; configuración fuera de norma", criticidad: "Crítica" },
  { texto: "Se observan extensiones de conductores al interior del tablero ejecutadas fuera de norma técnica", criticidad: "Crítica" },
  { texto: "Se detectan dos conductores conectados aguas abajo en cada contactor de alumbrado; configuración no permitida por normativa", criticidad: "Crítica" },
  { texto: "Protección automática en mal estado; se recomienda reemplazo inmediato", criticidad: "Crítica" },
  { texto: "Barra de distribución sin mica protectora; partes activas expuestas representan riesgo de contacto eléctrico directo", criticidad: "Crítica" },
  { texto: "Tablero sin conexión a tierra; ausencia de puesta a tierra en la estructura metálica", criticidad: "Crítica" },
  { texto: "Puerta del tablero sin conexión equipotencial a tierra", criticidad: "Crítica" },
  { texto: "Chapa de acceso en mal estado; no garantiza el cierre seguro del tablero", criticidad: "Crítica" },
  { texto: "Puerta del tablero en mal estado; requiere reemplazo para asegurar la protección del equipamiento", criticidad: "Crítica" },
  { texto: "Se detectan conexiones fuera de norma con múltiples conductores en un mismo punto de conexión", criticidad: "Crítica" },
  { texto: "Se observan conductores sueltos al interior del tablero sin sujeción ni punto de conexión definido", criticidad: "Crítica" },
  { texto: "Se detectan circuitos en corte sin señalización ni protección activa", criticidad: "Crítica" },
  { texto: "Circuito sin protección diferencial; ausencia de dispositivo de protección contra corrientes de fuga", criticidad: "Crítica" },
  { texto: "Se detectan conexiones fuera de norma eléctrica vigente", criticidad: "Crítica" },
  // ── Media ──
  { texto: "Protecciones generales sin separadores entre fases; se recomienda instalación de divisores dieléctricos", criticidad: "Media" },
  { texto: "Conductores conectados a borneras sin ferrule terminal; riesgo de aflojamiento y arco eléctrico", criticidad: "Media" },
  { texto: "Conductores conectados a la barra de neutro sin ferrule terminal", criticidad: "Media" },
  { texto: "Conductores conectados a la barra de tierra sin ferrule terminal", criticidad: "Media" },
  { texto: "Conductores conectados a las protecciones generales sin terminales de conexión", criticidad: "Media" },
  { texto: "Contactor con zumbido anormal durante operación; indica desgaste de bobina o problema en el núcleo magnético", criticidad: "Media" },
  { texto: "Bandejas interiores de canalización colapsadas; se recomienda reemplazo o ampliación", criticidad: "Media" },
  { texto: "Terminales de conexión en mal estado o con instalación deficiente", criticidad: "Media" },
  { texto: "Ventilador de extracción del tablero en mal estado; afecta la disipación térmica del equipamiento", criticidad: "Media" },
  { texto: "Falta señalética de riesgo eléctrico en la puerta del tablero", criticidad: "Media" },
  // ── Leve ──
  { texto: "Se requiere actualización de cuadros de carga y diagramas unilineales", criticidad: "Leve" },
  { texto: "Faltan falsos polos para completar el relleno del riel DIN y evitar acceso accidental a partes activas", criticidad: "Leve" },
  { texto: "Falta rotulación de alimentadores principales", criticidad: "Leve" },
  { texto: "Luces piloto en mal estado; se recomienda reemplazo", criticidad: "Leve" },
  { texto: "Luz interior del tablero en mal estado; se recomienda reemplazo", criticidad: "Leve" },
  { texto: "Rotulación de circuitos incompleta o ilegible; se recomienda actualización", criticidad: "Leve" },
  { texto: "Falta rotulación de luces piloto en la puerta del tablero", criticidad: "Leve" },
];

const TECNICOS = ["Emanuel Madrid", "César Huerta", "Carlos Madrid"];

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

const defaultInforme = {
  cliente: "", contacto: "", direccion: "", fecha: new Date().toISOString().slice(0,10),
  personal: [""], condicion: "Continuar con el servicio y eliminar de manera paulatina las observaciones.",
  cartaGantt: "", tableros: [],
};

const emptyTablero = () => ({
  id: Date.now(), ubicacion: "Sala", numeroSala: "", piso: "Piso 1", criticidad: "Media",
  garantia: false, registros: [],
});
const emptyRegistro = () => ({
  id: Date.now(), foto: null, observaciones: [], cambioTablero: false,
});

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = (v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };
  return [val, set];
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


export default function App() {
  const [screen, setScreen] = useState("inicio");
  const [config, setConfig] = useLocalStorage("brimahd_config", defaultConfig);
  const [counter, setCounter] = useLocalStorage("brimahd_counter", 1);
  const [informe, setInforme] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [tableroEdit, setTableroEdit] = useState(null);
  const [enviarScreen, setEnviarScreen] = useState(false);
  const [sedeSearch, setSedeSearch] = useState("");
  const [sedeFocused, setSedeFocused] = useState(false);
  const [obsSearch, setObsSearch] = useState([]);
  const [obsFocused, setObsFocused] = useState([]);
  const fileRef = useRef({});

  const numInforme = `INF-${String(counter).padStart(4,"0")}`;

  function iniciarInforme() {
    setInforme({ ...defaultInforme, numero: numInforme, fecha: new Date().toISOString().slice(0,10), tableros: [] });
    setSedeSearch("");
    setScreen("informe");
  }

  function updateInforme(k, v) { setInforme(p => ({ ...p, [k]: v })); }
  function addPersonal() { updateInforme("personal", [...informe.personal, ""]); }
  function updatePersonal(i, v) { const p = [...informe.personal]; p[i] = v; updateInforme("personal", p); }
  function removePersonal(i) { updateInforme("personal", informe.personal.filter((_,j) => j !== i)); }

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

  function handleRegistroFoto(e, regIdx) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      setTableroEdit(p => {
        const regs = [...p.registros];
        regs[regIdx] = { ...regs[regIdx], foto: { name: file.name, data: ev.target.result } };
        return { ...p, registros: regs };
      });
    };
    r.readAsDataURL(file);
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
      regs[regIdx] = { ...reg, observaciones: newObs };
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

  function generarInforme() {
    if (!informe.cliente.trim()) return alert("Ingresa el nombre del cliente");
    if (informe.tableros.length === 0) return alert("Agrega al menos un tablero");
    setCounter(counter + 1);
    setScreen("preview");
  }

  function descargarHTML(inf, cfg) {
    const fechaFmt = new Date(inf.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
    const totalRegistros = inf.tableros.reduce((s,t) => s + (t.registros?.length||0), 0);
    const criticas = inf.tableros.filter(t => t.criticidad === "Crítica").length;
    const medias   = inf.tableros.filter(t => t.criticidad === "Media").length;
    const leves    = inf.tableros.filter(t => t.criticidad === "Leve").length;
    const cambios  = inf.tableros.reduce((s,t) => s + (t.registros?.filter(r=>r.cambioTablero).length||0), 0);

    // Tabla de observaciones críticas detallada
    const criticasRows = [];
    inf.tableros.forEach(t => {
      const ubicLabel = `${t.ubicacion}${t.numeroSala ? " "+t.numeroSala : ""} — ${t.piso}`;
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
        const cambioHTML = reg.cambioTablero
          ? `<div style="margin-top:8px;padding:8px 12px;background:#fde8e8;border:1px solid #c0392b;border-radius:6px;font-size:12px;font-weight:700;color:#c0392b;">&#9888; Se recomienda cambio de tablero</div>`
          : '';
        return `<div style="border:1px solid #e8e8e8;border-radius:8px;margin-bottom:12px;overflow:hidden;">
          <div style="background:#3a3a3a;color:white;padding:6px 12px;font-size:11px;font-weight:700;">Registro N° ${ri+1}</div>
          ${reg.foto ? `<img src="${reg.foto.data}" style="width:100%;max-height:320px;object-fit:cover;display:block;" />` : '<div style="height:160px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:12px;background:#f7f7f7;">Sin fotografía</div>'}
          ${obsHTML || cambioHTML ? `<div style="padding:12px 14px;">
            ${obsHTML}
            ${cambioHTML}
          </div>` : ''}
        </div>`;
      }).join('');

      return `<div style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;page-break-inside:avoid;">
        <div style="background:#2c2c2c;color:white;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:15px;font-weight:700;">${t.ubicacion}${t.numeroSala ? " "+t.numeroSala : ""}</span>
            <span style="font-size:11px;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:10px;">${t.piso}</span>
            ${t.garantia ? '<span style="font-size:11px;background:#1a5276;color:white;padding:3px 10px;border-radius:10px;font-weight:700;">En garantía</span>' : ''}
          </div>
          <span style="font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;background:${critBg};color:${critFg};">${t.criticidad}</span>
        </div>
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
  body { font-family: Arial, sans-serif; font-size: 14px; background: #f0f0f0; color: #222; }
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
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
    <div style="background:#f8f8f8;border:1px solid #e8e8e8;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:30px;font-weight:700;color:#2c2c2c;">${inf.tableros.length}</div>
      <div style="font-size:10px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Tableros inspeccionados</div>
    </div>
    <div style="background:#f8f8f8;border:1px solid #e8e8e8;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:30px;font-weight:700;color:#2c2c2c;">${totalRegistros}</div>
      <div style="font-size:10px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Registros fotográficos</div>
    </div>
    <div style="background:#fde8e8;border:1px solid #e8c8c8;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:30px;font-weight:700;color:#c0392b;">${cambios}</div>
      <div style="font-size:10px;color:#c0392b;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Cambios de tablero recomendados</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
    <div style="background:#c0392b;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:30px;font-weight:700;color:white;">${criticas}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.8);margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Crítica</div>
    </div>
    <div style="background:#f39c12;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:30px;font-weight:700;color:#7a3800;">${medias}</div>
      <div style="font-size:10px;color:#7a3800;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Media</div>
    </div>
    <div style="background:#7fb3c8;border-radius:8px;padding:14px;text-align:center;">
      <div style="font-size:30px;font-weight:700;color:#1a3a45;">${leves}</div>
      <div style="font-size:10px;color:#1a3a45;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Leve</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#2c2c2c;border-bottom:1px solid #e8b923;padding-bottom:4px;margin-bottom:8px;">EPP Utilizado</div>
      <p style="font-size:12px;color:#555;line-height:1.7;">${cfg.epp}</p>
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#2c2c2c;border-bottom:1px solid #e8b923;padding-bottom:4px;margin-bottom:8px;">Personal de Mantención</div>
      <p style="font-size:13px;color:#333;font-weight:600;">${inf.personal.filter(Boolean).join(' · ')}</p>
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
      ${criticasRows}
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

    const fechaStr = new Date(inf.fecha + "T12:00:00").toISOString().slice(0,10).replace(/-/g,'');
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const reader = new FileReader();
    reader.onload = () => {
      const a = document.createElement('a');
      a.href = reader.result;
      a.download = `${inf.numero} - ${inf.cliente} - ${fechaStr}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    reader.readAsDataURL(blob);
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
      const ubicLabel = `${t.ubicacion}${t.numeroSala ? " "+t.numeroSala : ""} — ${t.piso}`;
      (t.registros||[]).forEach((reg, ri) => {
        reg.observaciones.filter(o => o.criticidad === "Crítica").forEach(obs => {
          criticas.push(`  • [${ubicLabel} / Registro N°${ri+1}] ${obs.texto}`);
        });
      });
    });

    const seccionCriticas = criticas.length > 0
      ? `\n⚠ OBSERVACIONES CRÍTICAS (${criticas.length}):\n${"─".repeat(40)}\n${criticas.join("\n")}\n${"─".repeat(40)}\n\nEstas observaciones requieren atención prioritaria. Se recomienda gestionar su corrección en el corto plazo para evitar riesgos a la instalación y a las personas.\n`
      : "";

    const cuerpo = `Estimado/a Sr./Sra. ${inf.contacto || ""},\n\nJunto con saludar, adjunto el informe de mantención preventiva de tableros eléctricos correspondiente a:\n\nCliente: ${inf.cliente}\nFecha: ${fechaFmt}\nN° Informe: ${inf.numero}\nTableros inspeccionados: ${inf.tableros.length}\nPersonal: ${inf.personal.filter(Boolean).join(", ")}\n${inf.cartaGantt ? "Próxima mantención: "+inf.cartaGantt+"\n" : ""}${seccionCriticas}\nEl detalle completo con fotografías y observaciones se encuentra en el archivo adjunto.\n\nQuedamos a su disposición ante cualquier consulta.\n\nSaludos cordiales,\n${cfg.empresa}\n${cfg.rut}\n${cfg.email}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  }

  const s = {
    app: { fontFamily: FONT, fontSize: 14, maxWidth: 480, margin: "0 auto", background: BG, minHeight: "100vh", width: "100%" },
    header: { background: PRIMARY, color: "white", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    body: { padding: "16px" },
    card: { background: "white", borderRadius: 10, border: "1px solid #e0e0e0", padding: "14px 16px", marginBottom: 12 },
    label: { fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block", fontFamily: FONT },
    input: { width: "100%", padding: "9px 11px", border: "1px solid #e0e0e0", borderRadius: 7, fontSize: 16, boxSizing: "border-box", marginBottom: 10, fontFamily: FONT, WebkitAppearance: "none", appearance: "none" },
    textarea: { width: "100%", padding: "9px 11px", border: "1px solid #e0e0e0", borderRadius: 7, fontSize: 16, boxSizing: "border-box", marginBottom: 6, minHeight: 80, resize: "vertical", fontFamily: FONT },
    btn: { padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: FONT },
    btnPrimary: { background: PRIMARY, color: "white" },
    btnAccent: { background: ACCENT, color: PRIMARY },
    btnDanger: { background: "#fde8e8", color: "#c0392b", fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: FONT },
    btnGhost: { background: "transparent", color: PRIMARY, border: "1px solid #e0e0e0", fontSize: 13, padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontFamily: FONT },
    row: { display: "flex", gap: 8, alignItems: "center" },
    sectionTitle: { fontSize: 12, fontWeight: 700, color: PRIMARY, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 5, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" },
    badge: (c) => ({ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: CRITICO_BG[c], color: CRITICO_COLOR[c], textTransform: "uppercase", border: `1px solid ${CRITICO_BORDER[c]}` }),
  };

  if (screen === "inicio") return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda. <span style={{ fontSize: 10, color: ACCENT, display: "block", letterSpacing: "0.3px" }}>Servicios Eléctricos</span></span>
        <button style={{ ...s.btn, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("config")}>⚙ Config</button>
      </div>
      <div style={s.body}>
        <div style={{ ...s.card, textAlign: "center", padding: "32px 16px" }}>

          <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY, marginBottom: 6 }}>App de Inspección</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>Próximo número:</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT, marginBottom: 20 }}>{numInforme}</div>
          <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", padding: "13px" }} onClick={iniciarInforme}>+ Crear nuevo informe</button>
        </div>
        <div style={{ ...s.card, background: "#f0f0f0", border: "none" }}>
          <div style={{ fontSize: 12, color: "#888", textAlign: "center" }}>
            <strong style={{ color: PRIMARY }}>{config.empresa}</strong> · {config.rut}<br />
            <span style={{ color: ACCENT }}>{config.email}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "config") return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda.</span>
        <button style={{ ...s.btn, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("inicio")}>← Volver</button>
      </div>
      <div style={s.body}>
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
          <button style={{ ...s.btn, ...s.btnPrimary, width: "100%" }} onClick={() => setScreen("inicio")}>Guardar</button>
        </div>
      </div>
    </div>
  );

  if (screen === "informe" && informe) return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda.</span>
        <button style={{ ...s.btn, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("inicio")}>← Salir</button>
      </div>
      <div style={{ background: ACCENT, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>Informe {informe.numero}</span>
        <span style={{ fontSize: 11, color: PRIMARY, opacity: 0.7 }}>Datos generales</span>
      </div>
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.sectionTitle}>Cliente</div>
          <label style={s.label}>Sede</label>
          <select
            style={s.input}
            value={informe.cliente}
            onChange={e => {
              const sede = SEDES.find(s => s.nombre === e.target.value);
              if (sede) selectSede(sede);
              else updateInforme("cliente", "");
            }}
          >
            <option value="">— Seleccionar sede —</option>
            {SEDES.map(sede => (
              <option key={sede.nombre} value={sede.nombre}>{sede.nombre}</option>
            ))}
          </select>
          <label style={s.label}>Contacto</label>
          <input style={s.input} value={informe.contacto} onChange={e => updateInforme("contacto", e.target.value)} placeholder="Nombre del contacto" />
          <label style={s.label}>Dirección</label>
          <input style={s.input} value={informe.direccion} onChange={e => updateInforme("direccion", e.target.value)} placeholder="Dirección de la sede" />
          <label style={s.label}>Fecha</label>
          <input style={s.input} type="date" value={informe.fecha} onChange={e => updateInforme("fecha", e.target.value)} />
        </div>
        <div style={s.card}>
          <div style={s.sectionTitle}>Personal en terreno</div>
          {informe.personal.map((p, i) => (
            <div key={i} style={{ ...s.row, marginBottom: 8 }}>
              <select style={{ ...s.input, marginBottom: 0, flex: 1 }} value={p} onChange={e => updatePersonal(i, e.target.value)}>
                <option value="">— Seleccionar técnico —</option>
                {TECNICOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {informe.personal.length > 1 && <button style={s.btnDanger} onClick={() => removePersonal(i)}>✕</button>}
            </div>
          ))}
          <button style={{ ...s.btnGhost, width: "100%", marginTop: 4 }} onClick={addPersonal}>+ Agregar técnico</button>
        </div>
        <div style={s.card}>
          <div style={s.sectionTitle}>Próxima mantención</div>
          <label style={s.label}>Fecha próxima visita</label>
          <input style={s.input} value={informe.cartaGantt} onChange={e => updateInforme("cartaGantt", e.target.value)} placeholder="Ej: Agosto 2026" />
        </div>
        <div style={s.card}>
          <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 12 }}>
            <div style={s.sectionTitle}>Tableros ({informe.tableros.length})</div>
          </div>
          {informe.tableros.map((t, i) => (
            <div key={t.id} style={{ border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ background: PRIMARY, color: "white", padding: "9px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{t.ubicacion}{t.numeroSala ? ` ${t.numeroSala}` : ""}</span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 10 }}>{t.piso}</span>
              </div>
              <div style={{ padding: "10px 13px" }}>
                <span style={s.badge(t.criticidad)}>{t.criticidad}</span>
                {t.garantia && <span style={{ marginLeft: 6, fontSize: 11, background: "#e8f4fd", color: "#1a5276", padding: "3px 8px", borderRadius: 10, fontWeight: 700 }}>En garantía</span>}
                <div style={{ fontSize: 12, color: "#555", marginTop: 8, lineHeight: 1.5 }}>{t.registros?.length > 0 ? `${t.registros.length} registro${t.registros.length > 1 ? "s" : ""}` : "Sin registros"}</div>

                <div style={{ ...s.row, marginTop: 10, justifyContent: "flex-end" }}>
                  <button style={s.btnDanger} onClick={() => deleteTablero(i)}>Eliminar</button>
                  <button style={{ ...s.btnGhost, fontSize: 12, padding: "6px 14px" }} onClick={() => openTablero(i)}>Editar</button>
                </div>
              </div>
            </div>
          ))}
          <button style={{ ...s.btn, ...s.btnAccent, width: "100%", marginTop: 4 }} onClick={() => openTablero(null)}>+ Agregar tablero</button>
        </div>
        <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", padding: 14, fontSize: 15 }} onClick={generarInforme}>Generar informe →</button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );

  if (screen === "tablero" && tableroEdit) {
  // Per-registro obs search state (one per registro)
  return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda.</span>
        <button style={{ ...s.btn, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 12, padding: "6px 12px" }} onClick={() => setScreen("informe")}>← Volver</button>
      </div>
      <div style={{ background: ACCENT, padding: "10px 18px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{editIdx === null ? "Nuevo tablero" : "Editar tablero"}</span>
      </div>
      <div style={s.body}>

        {/* ── Datos del tablero ── */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Identificación</div>
          <label style={s.label}>Ubicación</label>
          <select style={s.input} value={tableroEdit.ubicacion} onChange={e => setTableroEdit(p => ({ ...p, ubicacion: e.target.value, numeroSala: "" }))}>
            {UBICACIONES.map(u => <option key={u}>{u}</option>)}
          </select>
          {tableroEdit.ubicacion === "Sala" && (
            <>
              <label style={s.label}>Número de sala</label>
              <input style={s.input} value={tableroEdit.numeroSala} onChange={e => setTableroEdit(p => ({ ...p, numeroSala: e.target.value }))} placeholder="Ej: 302" />
            </>
          )}
          <label style={s.label}>Piso</label>
          <select style={s.input} value={tableroEdit.piso} onChange={e => setTableroEdit(p => ({ ...p, piso: e.target.value }))}>
            {PISOS.map(p => <option key={p}>{p}</option>)}
          </select>
          <div style={{ ...s.row, marginTop: 4 }}>
            <input type="checkbox" id="garantia" checked={tableroEdit.garantia} onChange={e => setTableroEdit(p => ({ ...p, garantia: e.target.checked }))} />
            <label htmlFor="garantia" style={{ fontSize: 13, color: "#333", cursor: "pointer" }}>Tablero en garantía</label>
          </div>
        </div>

        {/* ── Registros ── */}
        <div style={s.sectionTitle}>Registros</div>

        {tableroEdit.registros.map((reg, regIdx) => {
          const regSearch = obsSearch[regIdx] || "";
          const regFocused = obsFocused[regIdx] || false;
          const regFiltered = OBSERVACIONES_PREDEFINIDAS.filter(o =>
            o.texto.toLowerCase().includes(regSearch.toLowerCase())
          );
          return (
            <div key={reg.id} style={{ border: "1px solid #e0e0e0", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ background: PRIMARY, color: "white", padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Registro N° {regIdx + 1}</span>
                <button onClick={() => removeRegistro(regIdx)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>Eliminar</button>
              </div>
              <div style={{ padding: "14px" }}>
                <input ref={el => { if (!fileRef.current) fileRef.current = {}; fileRef.current[regIdx] = el; }} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                  onChange={e => handleRegistroFoto(e, regIdx)} />
                {reg.foto ? (
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <img src={reg.foto.data} alt="registro" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0" }} />
                    <button onClick={() => fileRef.current[regIdx]?.click()}
                      style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>
                      📷 Cambiar foto
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current[regIdx]?.click()}
                    style={{ ...s.btnGhost, width: "100%", marginBottom: 12, padding: "20px", border: "2px dashed #e0e0e0", borderRadius: 8, fontSize: 13, color: "#888" }}>
                    📷 Tomar foto (obligatorio)
                  </button>
                )}
                <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block", fontFamily: FONT }}>Agregar observación</label>
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <input
                    style={{ ...s.input, marginBottom: 0 }}
                    value={regSearch}
                    onChange={e => setObsSearch(p => { const a = [...p]; a[regIdx] = e.target.value; return a; })}
                    onFocus={() => setObsFocused(p => { const a = [...p]; a[regIdx] = true; return a; })}
                    onBlur={() => setTimeout(() => setObsFocused(p => { const a = [...p]; a[regIdx] = false; return a; }), 150)}
                    placeholder="Buscar observación…"
                  />
                  {regFocused && regFiltered.length > 0 && (
                    <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, background: "white", border: "1px solid #e0e0e0", borderRadius: 7, zIndex: 999, maxHeight: 260, overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", marginBottom: 4 }}>
                      {regFiltered.map((obs, i) => (
                        <div key={i}
                          onMouseDown={() => { addObsToRegistro(regIdx, obs); setObsSearch(p => { const a = [...p]; a[regIdx] = ""; return a; }); }}
                          style={{ padding: "9px 13px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f8f8f8"}
                          onMouseLeave={e => e.currentTarget.style.background = "white"}>
                          <span style={{ fontSize: 13, color: PRIMARY, flex: 1, lineHeight: 1.4 }}>{obs.texto}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: CRITICO_BG[obs.criticidad], color: CRITICO_COLOR[obs.criticidad], marginLeft: 8, whiteSpace: "nowrap", border: `1px solid ${CRITICO_BORDER[obs.criticidad]}` }}>{obs.criticidad}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {reg.observaciones.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                    {reg.observaciones.map((obs, oi) => (
                      <div key={oi} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: CRITICO_BG[obs.criticidad], border: `1px solid ${CRITICO_BORDER[obs.criticidad]}`, borderRadius: 7, padding: "7px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: CRITICO_COLOR[obs.criticidad], minWidth: 18, paddingTop: 1, opacity: 0.7 }}>{oi + 1}.</span>
                        <span style={{ flex: 1, fontSize: 12, color: CRITICO_COLOR[obs.criticidad], lineHeight: 1.4, fontWeight: 500 }}>{obs.texto}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: CRITICO_COLOR[obs.criticidad], whiteSpace: "nowrap", opacity: 0.85 }}>{obs.criticidad}</span>
                        <button onClick={() => removeObsFromRegistro(regIdx, oi)} style={{ background: "none", border: "none", cursor: "pointer", color: CRITICO_COLOR[obs.criticidad], fontSize: 14, lineHeight: 1, padding: "0 2px", opacity: 0.7 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "10px 12px", background: reg.cambioTablero ? "#fde8e8" : "#f8f8f8", border: `1px solid ${reg.cambioTablero ? "#c0392b" : "#e0e0e0"}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: reg.cambioTablero ? 700 : 400, color: reg.cambioTablero ? "#c0392b" : "#555" }}>Se recomienda cambio de tablero</span>
                  <button onClick={() => { const regs = [...tableroEdit.registros]; regs[regIdx] = { ...reg, cambioTablero: !reg.cambioTablero }; setTableroEdit(p => ({ ...p, registros: regs })); }}
                    style={{ width: 52, height: 28, borderRadius: 14, background: reg.cambioTablero ? "#c0392b" : "#ccc", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, padding: 0 }}>
                    <div style={{ position: "absolute", top: 4, left: reg.cambioTablero ? 26 : 4, width: 20, height: 20, borderRadius: "50%", background: "white" }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button style={{ ...s.btn, ...s.btnAccent, width: "100%", marginBottom: 12 }} onClick={addRegistro}>
          + Agregar registro
        </button>

        <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", padding: 14 }} onClick={saveTablero}>Guardar tablero</button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
  }

  if (screen === "preview" && enviarScreen && informe) {
    const fechaFmt = new Date(informe.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
    return (
      <div style={s.app}>
        <div style={s.header}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda.</span>
          <button style={{ ...s.btn, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 12, padding: "6px 12px" }} onClick={() => setEnviarScreen(false)}>← Volver</button>
        </div>
        <div style={{ background: ACCENT, padding: "10px 18px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>📤 Enviar informe {informe.numero}</span>
        </div>
        <div style={s.body}>
          <div style={{ ...s.card, background: "#fff9ec", border: "1px solid #ffe082", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#7c5800", lineHeight: 1.6 }}>
              💡 Asegúrate de haber descargado el informe antes de continuar para poder adjuntarlo.
            </div>
          </div>
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, marginBottom: 14 }}>Elige cómo enviar</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ ...s.btn, background: "#25D366", color: "white", width: "100%", padding: 13, fontSize: 14 }}
                onClick={() => compartirWhatsApp(informe, config, fechaFmt)}>
                📱 Enviar por WhatsApp
              </button>
              <button style={{ ...s.btn, background: "#0072c6", color: "white", width: "100%", padding: 13, fontSize: 14 }}
                onClick={() => enviarEmail(informe, config, fechaFmt)}>
                ✉ Enviar por Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "preview" && informe) {
    const criticos = informe.tableros.filter(t => t.criticidad === "Crítico").length;
    const atencion = informe.tableros.filter(t => t.criticidad === "Atención").length;
    const planif = informe.tableros.filter(t => t.criticidad === "Planificado").length;
    const fechaFmt = new Date(informe.fecha + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

    return (
      <div style={{ fontFamily: FONT, fontSize: 14, background: BG }}>
        <div style={{ background: PRIMARY, padding: "10px 16px", display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }} className="no-print">
          <button style={{ ...s.btn, background: "rgba(255,255,255,0.12)", color: "white", fontSize: 12, padding: "7px 12px" }} onClick={() => setScreen("informe")}>← Editar</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...s.btn, ...s.btnAccent, fontSize: 12, padding: "8px 14px" }} onClick={() => descargarHTML(informe, config)}>⬇ Descargar informe</button>
            <button style={{ ...s.btn, background: "#e85d26", color: "white", fontSize: 12, padding: "8px 14px" }} onClick={() => setEnviarScreen(true)}>📤 Enviar</button>
          </div>
        </div>
        <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
        <div style={{ background: PRIMARY, color: "white", padding: "40px 36px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda. <span style={{ fontSize: 11, color: ACCENT, display: "block", letterSpacing: "0.3px" }}>Servicios Eléctricos</span></span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{fechaFmt}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 4 }}>{informe.numero}</div>
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>Informe de Mantención<br />Preventiva de Tableros</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 22 }}>Inspección y registro de observaciones</div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderLeft: `4px solid ${ACCENT}`, padding: "12px 16px", borderRadius: 4, display: "flex", flexWrap: "wrap", gap: "12px 32px" }}>
            <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Cliente</div><div style={{ fontSize: 13, fontWeight: 600 }}>{informe.cliente}</div></div>
            {informe.contacto && <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Contacto</div><div style={{ fontSize: 13, fontWeight: 600 }}>{informe.contacto}</div></div>}
            {informe.cartaGantt && <div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Próxima mantención</div><div style={{ fontSize: 13, fontWeight: 600 }}>{informe.cartaGantt}</div></div>}
          </div>
        </div>
        <div style={{ background: "white", padding: "28px 36px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: PRIMARY, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 5, marginBottom: 18 }}>Resumen ejecutivo</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 22 }}>
            {[
              { n: informe.tableros.length, l: "Tableros inspeccionados", c: PRIMARY },
              { n: criticos, l: "Observaciones críticas", c: "#c0392b" },
              { n: atencion, l: "Atención prioritaria", c: "#d35400" },
              { n: planif, l: "Planificados", c: "#1a5276" },
            ].map((k,i) => (
              <div key={i} style={{ background: BG, border: "1px solid #e8e8e8", borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: k.c }}>{k.n}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{k.l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: PRIMARY, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 5, marginBottom: 10 }}>EPP</div>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 18, lineHeight: 1.6 }}>{config.epp}</p>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: PRIMARY, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 5, marginBottom: 10 }}>Personal de mantención</div>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 18 }}>{informe.personal.filter(Boolean).join(" · ")}</p>
          <div style={{ padding: "12px 14px", background: BG, border: "1px solid #e8e8e8", borderRadius: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: 0.5 }}>Condición: </span>
            <span style={{ fontSize: 12, color: "#555" }}>{informe.condicion}</span>
          </div>
        </div>
        <div style={{ background: "white", padding: "0 36px 36px", marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: PRIMARY, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 5, marginBottom: 18 }}>Detalle por tablero</div>
          {informe.tableros.map((t) => (
            <div key={t.id} style={{ border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ background: PRIMARY, color: "white", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{t.ubicacion}{t.numeroSala ? ` ${t.numeroSala}` : ""}</span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 12 }}>{t.piso}</span>
              </div>
              <div style={{ padding: "12px 16px" }}>
                <span style={s.badge(t.criticidad)}>{t.criticidad}</span>
                {t.garantia && <span style={{ marginLeft: 6, fontSize: 11, background: "#e8f4fd", color: "#1a5276", padding: "3px 8px", borderRadius: 10, fontWeight: 700 }}>En garantía</span>}
                {t.registros?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Registros fotográficos</div>
                    {t.registros.map((reg, ri) => (
                      <div key={ri} style={{ border: "1px solid #e8e8e8", borderRadius: 7, marginBottom: 8, overflow: "hidden" }}>
                        <div style={{ background: "#3a3a3a", color: "white", padding: "5px 10px", fontSize: 11, fontWeight: 700 }}>Registro N° {ri + 1}</div>
                        {reg.foto && <img src={reg.foto.data} alt="" style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }} />}
                        {(reg.observaciones.length > 0 || reg.cambioTablero) && (
                          <div style={{ padding: "10px 12px" }}>
                            {reg.observaciones.map((obs, oi) => (
                              <div key={oi} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", minWidth: 18, paddingTop: 1 }}>{oi + 1}.</span>
                                <span style={{ flex: 1, fontSize: 12, color: "#333", lineHeight: 1.5 }}>{obs.texto}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: CRITICO_BG[obs.criticidad], color: CRITICO_COLOR[obs.criticidad], whiteSpace: "nowrap" }}>{obs.criticidad}</span>
                              </div>
                            ))}
                            {reg.cambioTablero && (
                              <div style={{ marginTop: 8, padding: "7px 10px", background: "#fde8e8", border: "1px solid #c0392b", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#c0392b" }}>
                                ⚠ Se recomienda cambio de tablero
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {t.fotos?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Fotografías</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {t.fotos.map((f, fi) => <img key={fi} src={f.data} alt={f.name} style={{ width: 140, height: 105, objectFit: "cover", borderRadius: 6, border: "1px solid #e0e0e0" }} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: PRIMARY, color: "white", padding: "20px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: FONT }}>Brimahd ltda.</span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{config.rut} · {config.email}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
            <strong style={{ color: ACCENT }}>{informe.numero}</strong><br />
            {informe.personal.filter(Boolean).join(" · ")}<br />
            {informe.cartaGantt && <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Próx. mantención: {informe.cartaGantt}</span>}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
