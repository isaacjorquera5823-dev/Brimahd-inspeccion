import { PRIMARY, ACCENT, CRITICO_BG, CRITICO_COLOR } from "./theme";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_RESERVE = 14;
const MAX_Y = PAGE_H - FOOTER_RESERVE;
const PT_MM = 0.3527778;
const LINE_FACTOR = 1.18;
const IMG_MAX_H = 85;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lineHeight(fontSizePt) {
  return fontSizePt * PT_MM * LINE_FACTOR;
}

export function crearContexto(doc) {
  return { doc, y: MARGIN };
}

export function asegurarEspacio(ctx, altura) {
  if (ctx.y + altura > MAX_Y) {
    ctx.doc.addPage();
    ctx.y = MARGIN;
  }
}

export function saltoDePagina(ctx) {
  ctx.doc.addPage();
  ctx.y = MARGIN;
}

export function medirTexto(doc, texto, maxWidth, fontSizePt) {
  doc.setFontSize(fontSizePt);
  const lines = doc.splitTextToSize(String(texto ?? ""), Math.max(maxWidth, 5));
  return { lines, height: lines.length * lineHeight(fontSizePt) };
}

function escribirLineas(doc, lines, x, y, fontSizePt) {
  const lh = lineHeight(fontSizePt);
  lines.forEach((linea, i) => doc.text(linea, x, y + i * lh));
  return lines.length * lh;
}

// Píldora de color (badge), usada para criticidad, "En garantía", pisos/zonas, etc.
function dibujarPildora(doc, x, y, texto, bgHex, fgHex, fontSizePt = 8) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSizePt);
  const padX = 3;
  const h = fontSizePt * PT_MM * 1.9;
  const w = doc.getTextWidth(texto) + padX * 2;
  const [br, bg, bb] = hexToRgb(bgHex);
  doc.setFillColor(br, bg, bb);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");
  const [fr, fg, fb] = hexToRgb(fgHex);
  doc.setTextColor(fr, fg, fb);
  doc.text(texto, x + w / 2, y + h / 2 + fontSizePt * PT_MM * 0.38, { align: "center" });
  doc.setTextColor(0, 0, 0);
  return w;
}

function dibujarPildoraOscura(doc, x, y, texto) {
  return dibujarPildora(doc, x, y, texto, "#4a4a4a", "#ffffff", 7);
}

// ===== Estadísticas del informe (misma lógica que generarHTMLInforme en App.jsx) =====
export function calcularEstadisticas(inf) {
  const totalRegistros = inf.tableros.reduce((s, t) => s + (t.registros?.length || 0), 0);
  const contarPorCriticidad = (c) =>
    inf.tableros.reduce(
      (s, t) => s + (t.registros || []).reduce((s2, r) => s2 + r.observaciones.filter((o) => o.criticidad === c).length, 0),
      0
    );
  const criticas = contarPorCriticidad("Crítica");
  const medias = contarPorCriticidad("Media");
  const leves = contarPorCriticidad("Leve");
  const cambios = inf.tableros.reduce((s, t) => s + (t.registros?.filter((r) => r.cambioTablero).length || 0), 0);

  const criticasRows = [];
  inf.tableros.forEach((t) => {
    const zonaTexto = t.zona === "Otro" ? t.zonaOtro : t.zona;
    const ubicLabel = [zonaTexto, t.piso, t.ubicacion, t.numeroSala].filter(Boolean).join(" — ");
    (t.registros || []).forEach((reg, ri) => {
      reg.observaciones
        .filter((o) => o.criticidad === "Crítica")
        .forEach((obs) => {
          criticasRows.push({ ubicacion: ubicLabel, registro: `N° ${ri + 1}`, texto: obs.texto });
        });
    });
  });

  return { totalRegistros, criticas, medias, leves, cambios, criticasRows };
}

// ===== Bloques de dibujo =====

export function dibujarTituloSeccion(ctx, texto, opts = {}) {
  const { doc } = ctx;
  const fontSize = opts.fontSize || 11;
  // Si se indica cuánto mide el bloque que sigue inmediatamente (p.ej. el
  // primer tablero de "Detalle por Tablero"), se reserva junto con el título:
  // así nunca queda el título solo al final de una página con el contenido
  // real recién arrancando en la siguiente.
  const necesario = 12 + (opts.siguienteMinH || 0);
  asegurarEspacio(ctx, Math.min(necesario, MAX_Y - MARGIN - 2));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  const [pr, pg, pb] = hexToRgb(PRIMARY);
  doc.setTextColor(pr, pg, pb);
  doc.text(texto.toUpperCase(), MARGIN, ctx.y + 4);
  const [ar, ag, ab] = hexToRgb(ACCENT);
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, ctx.y + 6, MARGIN + CONTENT_W, ctx.y + 6);
  doc.setTextColor(0, 0, 0);
  ctx.y += 11;
}

export function dibujarPortada(ctx, inf, cfg, fechaFmt) {
  const { doc } = ctx;
  const [pr, pg, pb] = hexToRgb(PRIMARY);
  const [ar, ag, ab] = hexToRgb(ACCENT);
  const headerH = 60;

  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, PAGE_W, headerH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(ar, ag, ab);
  doc.text("BRIMAHD LTDA.", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Servicios Eléctricos y Telecomunicaciones · ${cfg.rut || ""}`, MARGIN, 21.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(ar, ag, ab);
  doc.text(inf.numero || "", PAGE_W - MARGIN, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(fechaFmt, PAGE_W - MARGIN, 21.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Informe de Mantención Preventiva", MARGIN, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Tableros Eléctricos — Inspección y registro de observaciones", MARGIN, 38);

  const boxY = 43;
  const boxH = 14;
  doc.setFillColor(58, 58, 58);
  doc.roundedRect(MARGIN, boxY, CONTENT_W, boxH, 2, 2, "F");
  doc.setFillColor(ar, ag, ab);
  doc.rect(MARGIN, boxY, 1.2, boxH, "F");

  const campos = [
    ["Cliente", inf.cliente],
    inf.contacto ? ["Contacto", inf.contacto] : null,
    inf.direccion ? ["Dirección", inf.direccion] : null,
    inf.cartaGantt ? ["Próxima mantención", inf.cartaGantt] : null,
  ].filter(Boolean);
  const colW = (CONTENT_W - 10) / campos.length;
  campos.forEach(([label, valor], i) => {
    const bx = MARGIN + 6 + i * colW;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(200, 200, 200);
    doc.text(label.toUpperCase(), bx, boxY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    const linea = doc.splitTextToSize(String(valor || ""), colW - 4)[0] || "";
    doc.text(linea, bx, boxY + 10.5);
  });

  doc.setTextColor(0, 0, 0);
  ctx.y = headerH + 8;
}

export function dibujarResumenEjecutivo(ctx, stats, inf) {
  const { doc } = ctx;
  dibujarTituloSeccion(ctx, "Resumen Ejecutivo");

  const cols = 3;
  const gap = 4;
  const boxW = (CONTENT_W - gap * (cols - 1)) / cols;
  const boxH = 20;
  const filas = [
    [String(inf.tableros.length), "Tableros", PRIMARY, "#f7f7f7"],
    [String(stats.totalRegistros), "Registros", PRIMARY, "#f7f7f7"],
    [String(stats.cambios), "Cambios recomendados", PRIMARY, "#f7f7f7"],
    [String(stats.criticas), "Obs. críticas", "#c0392b", "#fde8e8"],
    [String(stats.medias), "Obs. media", "#b8860b", "#fbf1d8"],
    [String(stats.leves), "Obs. leve", "#1a6b85", "#e6f2f5"],
  ];

  asegurarEspacio(ctx, boxH * 2 + gap + 6);
  filas.forEach(([valor, label, fgHex, bgHex], i) => {
    const col = i % cols;
    const fila = Math.floor(i / cols);
    const x = MARGIN + col * (boxW + gap);
    const y = ctx.y + fila * (boxH + gap);
    const [br, bg, bb] = hexToRgb(bgHex);
    doc.setFillColor(br, bg, bb);
    doc.setDrawColor(224, 224, 224);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, "FD");
    const [fr, fg, fb] = hexToRgb(fgHex);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(fr, fg, fb);
    doc.text(valor, x + boxW / 2, y + 9, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.3);
    doc.text(label.toUpperCase(), x + boxW / 2, y + 15, { align: "center", maxWidth: boxW - 4 });
  });
  doc.setTextColor(0, 0, 0);
  ctx.y += boxH * 2 + gap + 9;
}

export function dibujarPersonalYEPP(ctx, inf, cfg) {
  const { doc } = ctx;
  dibujarTituloSeccion(ctx, "Personal y Equipamiento de Seguridad", { fontSize: 12 });

  const labelW = 42;
  const textW = CONTENT_W - labelW;
  const eppMed = medirTexto(doc, cfg.epp, textW, 9);
  const personalTexto = inf.personal.filter(Boolean).join(" · ");
  const personalMed = medirTexto(doc, personalTexto, textW, 10);

  asegurarEspacio(ctx, eppMed.height + personalMed.height + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("EPP UTILIZADO", MARGIN, ctx.y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(85, 85, 85);
  escribirLineas(doc, eppMed.lines, MARGIN + labelW, ctx.y + 3, 9);
  ctx.y += Math.max(eppMed.height, 4) + 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("PERSONAL DE MANTENCIÓN", MARGIN, ctx.y + 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  escribirLineas(doc, personalMed.lines, MARGIN + labelW, ctx.y + 3, 10);
  ctx.y += Math.max(personalMed.height, 4) + 10;
  doc.setTextColor(0, 0, 0);
}

// Mide todo lo que necesita un registro fotográfico (incluida la imagen, vía
// getImageProperties que solo lee el header JPEG, sin rasterizar) sin dibujar
// nada. Se usa tanto para reservar espacio antes de dibujar el registro en sí
// como para el "lookahead" de dibujarTablero (evitar dejar el header de un
// tablero huérfano si su primer registro no entra en la página).
function medirRegistro(doc, registro) {
  const numW = 7;
  const pillW = 26;
  const textW = CONTENT_W - 8 - numW - pillW - 6;

  const obsLineas = (registro.observaciones || []).map((obs) => ({
    obs,
    ...medirTexto(doc, obs.texto, textW, 9),
  }));

  let imgW = 0;
  let imgH = 0;
  let hasImg = false;
  if (registro.foto && registro.foto.data) {
    try {
      const props = doc.getImageProperties(registro.foto.data);
      const aspect = props.width / props.height;
      imgW = CONTENT_W;
      imgH = imgW / aspect;
      if (imgH > IMG_MAX_H) {
        imgH = IMG_MAX_H;
        imgW = imgH * aspect;
      }
      hasImg = true;
    } catch {
      hasImg = false;
    }
  }
  const imgBlockH = hasImg ? imgH : 28;

  const miniHeaderH = 7;
  const obsBlockH = obsLineas.reduce((s, o) => s + Math.max(o.height, 4.2) + 2, 0);
  const sinObsH = registro.sinObservaciones ? 6 : 0;
  const cambioH = registro.cambioTablero ? 9 : 0;
  const bottomPad = obsBlockH || sinObsH || cambioH ? 6 : 2;
  const totalH = miniHeaderH + imgBlockH + obsBlockH + sinObsH + cambioH + bottomPad + 4;

  return { numW, pillW, obsLineas, hasImg, imgW, imgH, imgBlockH, miniHeaderH, sinObsH, cambioH, bottomPad, totalH };
}

// Un registro fotográfico dentro de un tablero: mide todo primero para poder
// pedir el espacio necesario con asegurarEspacio antes de dibujar.
function dibujarRegistro(ctx, registro, indice) {
  const { doc } = ctx;
  const { numW, pillW, obsLineas, hasImg, imgW, imgH, imgBlockH, miniHeaderH, sinObsH, cambioH, bottomPad, totalH } =
    medirRegistro(doc, registro);

  // Pide como máximo una página completa: si el bloque no cabe entero ni en
  // una página nueva (caso extremo con muchas observaciones), se dibuja igual
  // y puede desbordar el margen inferior — ver limitación conocida en README del cambio.
  asegurarEspacio(ctx, Math.min(totalH, MAX_Y - MARGIN - 2));

  const startY = ctx.y;

  doc.setFillColor(58, 58, 58);
  doc.rect(MARGIN, ctx.y, CONTENT_W, miniHeaderH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Registro N° ${indice + 1}`, MARGIN + 3, ctx.y + 4.8);
  ctx.y += miniHeaderH;

  if (hasImg) {
    const xOff = MARGIN + (CONTENT_W - imgW) / 2;
    try {
      doc.addImage(registro.foto.data, "JPEG", xOff, ctx.y, imgW, imgH);
    } catch {
      doc.setFillColor(247, 247, 247);
      doc.rect(MARGIN, ctx.y, CONTENT_W, imgBlockH, "F");
    }
  } else {
    doc.setFillColor(247, 247, 247);
    doc.rect(MARGIN, ctx.y, CONTENT_W, imgBlockH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(170, 170, 170);
    doc.text("Sin fotografía", MARGIN + CONTENT_W / 2, ctx.y + imgBlockH / 2, { align: "center" });
  }
  ctx.y += imgBlockH;

  if (obsLineas.length) {
    ctx.y += 3;
    obsLineas.forEach(({ obs, lines, height }, oi) => {
      const rowH = Math.max(height, 4.2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(187, 187, 187);
      doc.text(`${oi + 1}.`, MARGIN + 3, ctx.y + 3.3);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 51, 51);
      escribirLineas(doc, lines, MARGIN + 3 + numW, ctx.y + 3.3, 9);

      const bg = CRITICO_BG[obs.criticidad] || "#888888";
      const fg = CRITICO_COLOR[obs.criticidad] || "#ffffff";
      dibujarPildora(doc, MARGIN + CONTENT_W - pillW - 3, ctx.y + 0.2, obs.criticidad, bg, fg, 6.5);

      ctx.y += rowH + 2;
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.2);
      doc.line(MARGIN + 3, ctx.y - 1, MARGIN + CONTENT_W - 3, ctx.y - 1);
    });
  } else if (registro.sinObservaciones) {
    ctx.y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(46, 125, 50);
    doc.text("✓ Sin observaciones", MARGIN + 3, ctx.y + 3.3);
    ctx.y += sinObsH;
  }

  if (registro.cambioTablero) {
    ctx.y += 2;
    doc.setFillColor(253, 232, 232);
    doc.setDrawColor(192, 57, 43);
    doc.roundedRect(MARGIN + 3, ctx.y, CONTENT_W - 6, 7, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(192, 57, 43);
    doc.text("⚠ Se recomienda cambio de tablero", MARGIN + 6, ctx.y + 4.8);
    ctx.y += 9;
  }

  ctx.y += bottomPad;

  const cardH = ctx.y - startY;
  doc.setDrawColor(232, 232, 232);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, startY, CONTENT_W, cardH, 1.5, 1.5, "S");
  doc.setTextColor(0, 0, 0);
  ctx.y += 5;
}

// Mide cuánto ocupa el header + metadatos + primer registro de un tablero,
// para poder reservar ese bloque completo con asegurarEspacio (evita que el
// header quede huérfano al final de una página). La usa dibujarTablero para
// sí mismo, y dibujarTituloSeccion para el título "Detalle por Tablero" que
// lo precede, así tampoco el título queda huérfano del tablero.
function medirLookaheadTablero(doc, tablero) {
  const metaItemsPrevia = [
    tablero.nombreTablero && `Nombre tablero: ${tablero.nombreTablero}`,
    tablero.proteccionGeneral && `Protección general: ${tablero.proteccionGeneral}`,
    (tablero.marca === "Otro" ? tablero.marcaOtro : tablero.marca) && `Marca: ${tablero.marca === "Otro" ? tablero.marcaOtro : tablero.marca}`,
  ].filter(Boolean);
  const headerH0 = 12;
  const metaH0 = metaItemsPrevia.length
    ? medirTexto(doc, metaItemsPrevia.join("   ·   "), CONTENT_W - 8, 8).height + 5
    : 0;
  let lookaheadH = headerH0 + metaH0 + 4;
  if (tablero.registros && tablero.registros.length > 0) {
    lookaheadH += medirRegistro(doc, tablero.registros[0]).totalH;
  }
  return lookaheadH;
}

export function dibujarTablero(ctx, tablero, indice) {
  const { doc } = ctx;
  const zonaTexto = tablero.zona === "Otro" ? tablero.zonaOtro : tablero.zona;
  const marcaTexto = tablero.marca === "Otro" ? tablero.marcaOtro : tablero.marca;

  const metaItemsPrevia = [
    tablero.nombreTablero && `Nombre tablero: ${tablero.nombreTablero}`,
    tablero.proteccionGeneral && `Protección general: ${tablero.proteccionGeneral}`,
    marcaTexto && `Marca: ${marcaTexto}`,
  ].filter(Boolean);
  const lookaheadH = medirLookaheadTablero(doc, tablero);
  // Reserva el header + metadatos junto con el primer registro: si no entran
  // juntos en lo que queda de página, se pasa el bloque completo a la
  // siguiente en vez de dejar el header del tablero solo, sin contenido,
  // seguido de un salto de página con un hueco grande en blanco.
  asegurarEspacio(ctx, Math.min(lookaheadH, MAX_Y - MARGIN - 2));
  const headerY = ctx.y;
  const headerH = 12;
  const [pr, pg, pb] = hexToRgb(PRIMARY);
  doc.setFillColor(pr, pg, pb);
  doc.roundedRect(MARGIN, headerY, CONTENT_W, headerH, 2, 2, "F");

  const tituloTablero = zonaTexto || tablero.ubicacion || "";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(tituloTablero, MARGIN + 4, headerY + 7.5);

  let bx = MARGIN + 4 + doc.getTextWidth(tituloTablero) + 5;
  const by = headerY + 3.2;
  bx += dibujarPildoraOscura(doc, bx, by, tablero.piso) + 2;
  if (zonaTexto) bx += dibujarPildoraOscura(doc, bx, by, tablero.ubicacion) + 2;
  if (tablero.numeroSala) bx += dibujarPildoraOscura(doc, bx, by, tablero.numeroSala) + 2;
  if (tablero.garantia) dibujarPildora(doc, bx, by, "En garantía", "#6b4fa0", "#ffffff", 7);

  const critBg = CRITICO_BG[tablero.criticidad] || "#888888";
  const critFg = CRITICO_COLOR[tablero.criticidad] || "#ffffff";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const critW = doc.getTextWidth(tablero.criticidad) + 6;
  dibujarPildora(doc, MARGIN + CONTENT_W - critW - 4, by, tablero.criticidad, critBg, critFg, 8);

  doc.setTextColor(0, 0, 0);
  ctx.y = headerY + headerH;

  const metaItems = metaItemsPrevia;
  if (metaItems.length) {
    const metaTexto = metaItems.join("   ·   ");
    const metaMed = medirTexto(doc, metaTexto, CONTENT_W - 8, 8);
    doc.setFillColor(247, 247, 247);
    doc.setDrawColor(224, 224, 224);
    doc.rect(MARGIN, ctx.y, CONTENT_W, metaMed.height + 5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(85, 85, 85);
    escribirLineas(doc, metaMed.lines, MARGIN + 4, ctx.y + 4, 8);
    doc.setTextColor(0, 0, 0);
    ctx.y += metaMed.height + 5;
  }
  ctx.y += 4;

  (tablero.registros || []).forEach((reg, ri) => dibujarRegistro(ctx, reg, ri));

  ctx.y += 6;
}

export function dibujarTablaCriticas(ctx, filas) {
  const { doc } = ctx;
  dibujarTituloSeccion(ctx, "Observaciones Críticas — Resumen para Atención Prioritaria", { fontSize: 10.5 });

  const nota =
    "Las siguientes observaciones requieren intervención prioritaria. Se recomienda al cliente gestionar su corrección en el corto plazo para evitar riesgos a la instalación y a las personas.";
  const notaMed = medirTexto(doc, nota, CONTENT_W, 8.5);
  asegurarEspacio(ctx, notaMed.height + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(102, 102, 102);
  escribirLineas(doc, notaMed.lines, MARGIN, ctx.y + 3, 8.5);
  doc.setTextColor(0, 0, 0);
  ctx.y += notaMed.height + 6;

  const colTablero = CONTENT_W * 0.28;
  const colRegistro = CONTENT_W * 0.14;
  const colObs = CONTENT_W - colTablero - colRegistro;

  const dibujarHeaderTabla = () => {
    doc.setFillColor(192, 57, 43);
    doc.rect(MARGIN, ctx.y, CONTENT_W, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("TABLERO", MARGIN + 3, ctx.y + 5.3);
    doc.text("REGISTRO", MARGIN + colTablero + 3, ctx.y + 5.3);
    doc.text("OBSERVACIÓN", MARGIN + colTablero + colRegistro + 3, ctx.y + 5.3);
    doc.setTextColor(0, 0, 0);
    ctx.y += 8;
  };

  asegurarEspacio(ctx, 16);
  dibujarHeaderTabla();

  filas.forEach((fila, i) => {
    const tabMed = medirTexto(doc, fila.ubicacion, colTablero - 6, 8);
    const obsMed = medirTexto(doc, fila.texto, colObs - 6, 8);
    const rowH = Math.max(tabMed.height, obsMed.height, 6) + 4;

    if (ctx.y + rowH > MAX_Y) {
      doc.addPage();
      ctx.y = MARGIN;
      dibujarHeaderTabla();
    }

    if (i % 2 === 0) {
      doc.setFillColor(255, 245, 245);
      doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, "F");
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 51, 51);
    escribirLineas(doc, tabMed.lines, MARGIN + 3, ctx.y + 4, 8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(85, 85, 85);
    doc.text(fila.registro, MARGIN + colTablero + 3, ctx.y + 4);

    doc.setTextColor(51, 51, 51);
    escribirLineas(doc, obsMed.lines, MARGIN + colTablero + colRegistro + 3, ctx.y + 4, 8);

    ctx.y += rowH;
    doc.setDrawColor(245, 213, 213);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y);
  });

  doc.setTextColor(0, 0, 0);
  ctx.y += 6;
}

export function estamparFooters(doc, inf, cfg) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(136, 136, 136);
    doc.text(`${inf.numero || ""} · ${cfg.empresa || ""}`, MARGIN, PAGE_H - 7);
    doc.text(`Página ${i} de ${total}`, PAGE_W - MARGIN, PAGE_H - 7, { align: "right" });
  }
}

// ===== Orquestador =====
// Genera el PDF dibujando directamente con las primitivas de jsPDF (texto,
// rectángulos, addImage) en vez de rasterizar el HTML completo con
// html2canvas — las fotos ya llegan comprimidas como dataURL JPEG desde
// comprimirImagen() en App.jsx, así que aquí solo se insertan, sin volver a
// procesarlas. Cede el hilo cada 5 tableros para no congelar la UI en
// informes grandes.
export async function generarPDFInforme(inf, cfg) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: `${inf.numero || ""} - ${inf.cliente || ""}`, author: cfg.empresa || "" });

  const fechaFmt = new Date(inf.fecha + "T12:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const ctx = crearContexto(doc);
  const stats = calcularEstadisticas(inf);

  dibujarPortada(ctx, inf, cfg, fechaFmt);
  dibujarResumenEjecutivo(ctx, stats, inf);
  dibujarPersonalYEPP(ctx, inf, cfg);
  const siguienteMinH = inf.tableros.length > 0 ? medirLookaheadTablero(doc, inf.tableros[0]) : 0;
  dibujarTituloSeccion(ctx, "Detalle por Tablero", { fontSize: 11, siguienteMinH });

  for (let i = 0; i < inf.tableros.length; i++) {
    dibujarTablero(ctx, inf.tableros[i], i);
    if (i % 5 === 4) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  if (stats.criticasRows.length > 0) {
    dibujarTablaCriticas(ctx, stats.criticasRows);
  }

  estamparFooters(doc, inf, cfg);

  return doc.output("blob");
}
