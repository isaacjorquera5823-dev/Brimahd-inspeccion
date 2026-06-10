import { useState, useRef } from 'react';

const PRIMARY = '#2c2c2c';
const ACCENT = '#e8b923';
const BG = '#f8f8f8';
const FONT = "'Roboto', sans-serif";

const CRITICIDAD = ['Crítico', 'Atención', 'Planificado'];
const CRITICO_COLOR = {
  Crítico: '#c0392b',
  Atención: '#d35400',
  Planificado: '#1a5276',
};
const CRITICO_BG = {
  Crítico: '#fde8e8',
  Atención: '#fef3e2',
  Planificado: '#e8f4fd',
};
const PISOS = [
  'Piso -1',
  'Piso 1',
  'Piso 2',
  'Piso 3',
  'Piso 4',
  'Piso 5',
  'Piso 6',
  'Terraza',
  'Otro',
];

const defaultConfig = {
  empresa: 'Brimahd Ltda.',
  rut: '76.940.738-3',
  email: 'servicios@brimahd.cl',
  epp: 'Casco, Antiparras, Guantes de Aislación, Guantes PU, Zapatos de Seguridad Aislados, Herramientas Aisladas',
};

const defaultInforme = {
  cliente: '',
  contacto: '',
  direccion: '',
  fecha: new Date().toISOString().slice(0, 10),
  personal: [''],
  condicion:
    'Continuar con el servicio y eliminar de manera paulatina las observaciones.',
  cartaGantt: '',
  tableros: [],
};

const emptyTablero = () => ({
  id: Date.now(),
  nombre: '',
  piso: 'Piso 1',
  criticidad: 'Atención',
  observaciones: '',
  acciones: '',
  garantia: false,
  fotos: [],
});

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch {
      return init;
    }
  });
  const set = (v) => {
    setVal(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };
  return [val, set];
}

function Logo({ size = 36, withText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="22" r="10" fill={ACCENT} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={30 + 13 * Math.cos(r)}
              y1={22 + 13 * Math.sin(r)}
              x2={30 + 17 * Math.cos(r)}
              y2={22 + 17 * Math.sin(r)}
              stroke={ACCENT}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
        <path
          d="M8 52 Q20 36 30 34 Q40 36 52 52"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M14 52 Q22 40 30 38 Q38 40 46 52"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      {withText && (
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              fontFamily: FONT,
            }}
          >
            Brimahd ltda.
          </div>
          <div
            style={{
              fontSize: 10,
              color: ACCENT,
              fontFamily: FONT,
              letterSpacing: '0.3px',
            }}
          >
            Servicios Eléctricos
          </div>
        </div>
      )}
    </div>
  );
}

async function mejorarRedaccion(tableros) {
  const input = tableros.map((t, i) => ({
    index: i,
    nombre: t.nombre,
    observaciones: t.observaciones,
    acciones: t.acciones,
  }));

  const prompt = `Eres un redactor técnico especialista en informes de mantención eléctrica en español chileno.
Tu tarea es corregir ortografía, mejorar redacción y uniformar el tono profesional-técnico de los siguientes textos de un informe de inspección eléctrica.

Reglas:
- Corrige errores ortográficos y gramaticales en todos los campos
- En el campo "nombre": corrige ortografía y capitalización correcta, pero mantén el nombre técnico reconocible
- En "observaciones" y "acciones": usa lenguaje técnico profesional pero claro
- Mantén el contenido original, solo mejora la forma
- No agregues ni elimines observaciones
- Responde SOLO con un JSON válido, sin texto adicional, sin markdown

Input:
${JSON.stringify(input)}

Responde con este formato exacto:
[{"index":0,"nombre":"...","observaciones":"...","acciones":"..."},...]`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.map((c) => c.text || '').join('') || '[]';
  const clean = text.replace(/```json|```/g, '').trim();
  const improved = JSON.parse(clean);

  return tableros.map((t, i) => {
    const found = improved.find((x) => x.index === i);
    if (!found) return t;
    return {
      ...t,
      nombre: found.nombre || t.nombre,
      observaciones: found.observaciones || t.observaciones,
      acciones: found.acciones || t.acciones,
    };
  });
}

export default function App() {
  const [screen, setScreen] = useState('inicio');
  const [config, setConfig] = useLocalStorage('brimahd_config', defaultConfig);
  const [counter, setCounter] = useLocalStorage('brimahd_counter', 1);
  const [informe, setInforme] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [tableroEdit, setTableroEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const fileRef = useRef();

  const numInforme = `INF-${String(counter).padStart(4, '0')}`;

  function iniciarInforme() {
    setInforme({
      ...defaultInforme,
      numero: numInforme,
      fecha: new Date().toISOString().slice(0, 10),
      tableros: [],
    });
    setScreen('informe');
  }

  function updateInforme(k, v) {
    setInforme((p) => ({ ...p, [k]: v }));
  }
  function addPersonal() {
    updateInforme('personal', [...informe.personal, '']);
  }
  function updatePersonal(i, v) {
    const p = [...informe.personal];
    p[i] = v;
    updateInforme('personal', p);
  }
  function removePersonal(i) {
    updateInforme(
      'personal',
      informe.personal.filter((_, j) => j !== i)
    );
  }

  function openTablero(idx) {
    setEditIdx(idx);
    setTableroEdit(
      idx === null
        ? emptyTablero()
        : { ...informe.tableros[idx], fotos: informe.tableros[idx].fotos || [] }
    );
    setScreen('tablero');
  }

  function saveTablero() {
    if (!tableroEdit.nombre.trim())
      return alert('Ingresa el nombre del tablero');
    let tableros;
    if (editIdx === null) tableros = [...informe.tableros, tableroEdit];
    else {
      tableros = [...informe.tableros];
      tableros[editIdx] = tableroEdit;
    }
    updateInforme('tableros', tableros);
    setScreen('informe');
  }

  function deleteTablero(i) {
    if (!confirm('¿Eliminar este tablero?')) return;
    updateInforme(
      'tableros',
      informe.tableros.filter((_, j) => j !== i)
    );
  }

  function handleFotos(e) {
    const files = Array.from(e.target.files);
    files.forEach((f) => {
      const r = new FileReader();
      r.onload = (ev) =>
        setTableroEdit((p) => ({
          ...p,
          fotos: [...(p.fotos || []), { name: f.name, data: ev.target.result }],
        }));
      r.readAsDataURL(f);
    });
  }

  function removeFoto(i) {
    setTableroEdit((p) => ({ ...p, fotos: p.fotos.filter((_, j) => j !== i) }));
  }

  async function generarInforme() {
    if (!informe.cliente.trim()) return alert('Ingresa el nombre del cliente');
    if (informe.tableros.length === 0)
      return alert('Agrega al menos un tablero');
    setLoading(true);
    setLoadingMsg('Revisando ortografía y redacción con IA...');
    try {
      // Mejorar tableros (nombre, observaciones, acciones)
      const tablerosCorregidos = await mejorarRedaccion(informe.tableros);

      // Mejorar condición con una llamada separada
      const condRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: `Corrige ortografía y mejora la redacción profesional del siguiente texto de un informe de mantención eléctrica. Responde SOLO con el texto corregido, sin comillas ni explicaciones:\n\n${informe.condicion}`,
            },
          ],
        }),
      });
      const condData = await condRes.json();
      const condCorregida =
        condData.content
          ?.map((c) => c.text || '')
          .join('')
          .trim() || informe.condicion;

      setInforme((p) => ({
        ...p,
        tableros: tablerosCorregidos,
        condicion: condCorregida,
      }));
      setCounter(counter + 1);
      setScreen('preview');
    } catch (e) {
      console.error(e);
      alert(
        'No se pudo mejorar la redacción. Se generará el informe con el texto original.'
      );
      setCounter(counter + 1);
      setScreen('preview');
    } finally {
      setLoading(false);
    }
  }

  function imprimirPDF() {
    window.print();
  }

  const s = {
    app: {
      fontFamily: FONT,
      fontSize: 14,
      maxWidth: 480,
      margin: '0 auto',
      background: BG,
      minHeight: '100vh',
    },
    header: {
      background: PRIMARY,
      color: 'white',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    body: { padding: '16px' },
    card: {
      background: 'white',
      borderRadius: 10,
      border: '1px solid #e0e0e0',
      padding: '14px 16px',
      marginBottom: 12,
    },
    label: {
      fontSize: 11,
      color: '#888',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: 4,
      display: 'block',
      fontFamily: FONT,
    },
    input: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid #e0e0e0',
      borderRadius: 7,
      fontSize: 14,
      boxSizing: 'border-box',
      marginBottom: 10,
      fontFamily: FONT,
    },
    textarea: {
      width: '100%',
      padding: '9px 11px',
      border: '1px solid #e0e0e0',
      borderRadius: 7,
      fontSize: 13,
      boxSizing: 'border-box',
      marginBottom: 10,
      minHeight: 80,
      resize: 'vertical',
      fontFamily: FONT,
    },
    btn: {
      padding: '10px 18px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: FONT,
    },
    btnPrimary: { background: PRIMARY, color: 'white' },
    btnAccent: { background: ACCENT, color: PRIMARY },
    btnDanger: {
      background: '#fde8e8',
      color: '#c0392b',
      fontSize: 12,
      padding: '6px 12px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      fontFamily: FONT,
    },
    btnGhost: {
      background: 'transparent',
      color: PRIMARY,
      border: '1px solid #e0e0e0',
      fontSize: 13,
      padding: '7px 14px',
      borderRadius: 7,
      cursor: 'pointer',
      fontFamily: FONT,
    },
    row: { display: 'flex', gap: 8, alignItems: 'center' },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: PRIMARY,
      borderBottom: `2px solid ${ACCENT}`,
      paddingBottom: 5,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    badge: (c) => ({
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 12,
      background: CRITICO_BG[c],
      color: CRITICO_COLOR[c],
      textTransform: 'uppercase',
    }),
  };

  // ── LOADING ──
  if (loading)
    return (
      <div
        style={{
          ...s.app,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Logo size={56} withText={false} />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: PRIMARY,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          Mejorando redacción con IA
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#888',
            marginBottom: 32,
            textAlign: 'center',
            maxWidth: 260,
          }}
        >
          {loadingMsg}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: ACCENT,
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
      </div>
    );

  // ── INICIO ──
  if (screen === 'inicio')
    return (
      <div style={s.app}>
        <div style={s.header}>
          <Logo size={38} withText={true} />
          <button
            style={{
              ...s.btn,
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: 12,
              padding: '6px 12px',
            }}
            onClick={() => setScreen('config')}
          >
            ⚙ Config
          </button>
        </div>
        <div style={s.body}>
          <div style={{ ...s.card, textAlign: 'center', padding: '32px 16px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: PRIMARY,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Logo size={40} withText={false} />
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: PRIMARY,
                marginBottom: 6,
              }}
            >
              App de Inspección
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
              Próximo número:
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: ACCENT,
                marginBottom: 20,
              }}
            >
              {numInforme}
            </div>
            <button
              style={{
                ...s.btn,
                ...s.btnPrimary,
                width: '100%',
                padding: '13px',
              }}
              onClick={iniciarInforme}
            >
              + Crear nuevo informe
            </button>
          </div>
          <div style={{ ...s.card, background: '#f0f0f0', border: 'none' }}>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
              <strong style={{ color: PRIMARY }}>{config.empresa}</strong> ·{' '}
              {config.rut}
              <br />
              <span style={{ color: ACCENT }}>{config.email}</span>
            </div>
          </div>
          <div
            style={{
              ...s.card,
              background: '#f0f7f0',
              border: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>✨</span>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
              <strong style={{ color: PRIMARY }}>
                Redacción con IA activada.
              </strong>{' '}
              Al generar el informe, Claude revisará ortografía y mejorará
              automáticamente la redacción de todas las observaciones.
            </div>
          </div>
        </div>
      </div>
    );

  // ── CONFIG ──
  if (screen === 'config')
    return (
      <div style={s.app}>
        <div style={s.header}>
          <Logo size={32} withText={true} />
          <button
            style={{
              ...s.btn,
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: 12,
              padding: '6px 12px',
            }}
            onClick={() => setScreen('inicio')}
          >
            ← Volver
          </button>
        </div>
        <div style={s.body}>
          <div style={s.card}>
            <div style={s.sectionTitle}>Datos de la empresa</div>
            <label style={s.label}>Nombre empresa</label>
            <input
              style={s.input}
              value={config.empresa}
              onChange={(e) =>
                setConfig({ ...config, empresa: e.target.value })
              }
            />
            <label style={s.label}>RUT</label>
            <input
              style={s.input}
              value={config.rut}
              onChange={(e) => setConfig({ ...config, rut: e.target.value })}
            />
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
            />
            <label style={s.label}>EPP estándar</label>
            <textarea
              style={s.textarea}
              value={config.epp}
              onChange={(e) => setConfig({ ...config, epp: e.target.value })}
            />
            <button
              style={{ ...s.btn, ...s.btnPrimary, width: '100%' }}
              onClick={() => setScreen('inicio')}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );

  // ── INFORME ──
  if (screen === 'informe' && informe)
    return (
      <div style={s.app}>
        <div style={s.header}>
          <Logo size={32} withText={true} />
          <button
            style={{
              ...s.btn,
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: 12,
              padding: '6px 12px',
            }}
            onClick={() => setScreen('inicio')}
          >
            ← Salir
          </button>
        </div>
        <div
          style={{
            background: ACCENT,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>
            Informe {informe.numero}
          </span>
          <span style={{ fontSize: 11, color: PRIMARY, opacity: 0.7 }}>
            Datos generales
          </span>
        </div>
        <div style={s.body}>
          <div style={s.card}>
            <div style={s.sectionTitle}>Cliente</div>
            <label style={s.label}>Nombre cliente</label>
            <input
              style={s.input}
              value={informe.cliente}
              onChange={(e) => updateInforme('cliente', e.target.value)}
              placeholder="Ej: DuocUC Plaza Oeste"
            />
            <label style={s.label}>Contacto</label>
            <input
              style={s.input}
              value={informe.contacto}
              onChange={(e) => updateInforme('contacto', e.target.value)}
              placeholder="Nombre del contacto"
            />
            <label style={s.label}>Dirección</label>
            <input
              style={s.input}
              value={informe.direccion}
              onChange={(e) => updateInforme('direccion', e.target.value)}
              placeholder="Dirección de la sede"
            />
            <label style={s.label}>Fecha</label>
            <input
              style={s.input}
              type="date"
              value={informe.fecha}
              onChange={(e) => updateInforme('fecha', e.target.value)}
            />
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>Personal en terreno</div>
            {informe.personal.map((p, i) => (
              <div key={i} style={{ ...s.row, marginBottom: 8 }}>
                <input
                  style={{ ...s.input, marginBottom: 0, flex: 1 }}
                  value={p}
                  onChange={(e) => updatePersonal(i, e.target.value)}
                  placeholder={`Técnico ${i + 1}`}
                />
                {informe.personal.length > 1 && (
                  <button style={s.btnDanger} onClick={() => removePersonal(i)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              style={{ ...s.btnGhost, width: '100%', marginTop: 4 }}
              onClick={addPersonal}
            >
              + Agregar técnico
            </button>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>Condiciones</div>
            <label style={s.label}>Condición de servicio</label>
            <textarea
              style={s.textarea}
              value={informe.condicion}
              onChange={(e) => updateInforme('condicion', e.target.value)}
            />
            <label style={s.label}>Próxima mantención</label>
            <input
              style={s.input}
              value={informe.cartaGantt}
              onChange={(e) => updateInforme('cartaGantt', e.target.value)}
              placeholder="Ej: Agosto 2026"
            />
          </div>

          <div style={s.card}>
            <div
              style={{
                ...s.row,
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={s.sectionTitle}>
                Tableros ({informe.tableros.length})
              </div>
            </div>
            {informe.tableros.map((t, i) => (
              <div
                key={t.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  marginBottom: 10,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: PRIMARY,
                    color: 'white',
                    padding: '9px 13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {t.nombre || 'Sin nombre'}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: 'rgba(255,255,255,0.15)',
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {t.piso}
                  </span>
                </div>
                <div style={{ padding: '10px 13px' }}>
                  <span style={s.badge(t.criticidad)}>{t.criticidad}</span>
                  {t.garantia && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        background: '#e8f4fd',
                        color: '#1a5276',
                        padding: '3px 8px',
                        borderRadius: 10,
                        fontWeight: 700,
                      }}
                    >
                      En garantía
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      color: '#555',
                      marginTop: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {t.observaciones?.slice(0, 100)}
                    {t.observaciones?.length > 100 ? '…' : ''}
                  </div>
                  {t.fotos?.length > 0 && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      📷 {t.fotos.length} foto{t.fotos.length > 1 ? 's' : ''}
                    </div>
                  )}
                  <div
                    style={{
                      ...s.row,
                      marginTop: 10,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      style={s.btnDanger}
                      onClick={() => deleteTablero(i)}
                    >
                      Eliminar
                    </button>
                    <button
                      style={{
                        ...s.btnGhost,
                        fontSize: 12,
                        padding: '6px 14px',
                      }}
                      onClick={() => openTablero(i)}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              style={{ ...s.btn, ...s.btnAccent, width: '100%', marginTop: 4 }}
              onClick={() => openTablero(null)}
            >
              + Agregar tablero
            </button>
          </div>

          <button
            style={{
              ...s.btn,
              ...s.btnPrimary,
              width: '100%',
              padding: 14,
              fontSize: 15,
            }}
            onClick={generarInforme}
          >
            ✨ Generar informe con IA
          </button>
          <div
            style={{
              fontSize: 11,
              color: '#aaa',
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Claude revisará la redacción automáticamente
          </div>
          <div style={{ height: 20 }} />
        </div>
      </div>
    );

  // ── TABLERO ──
  if (screen === 'tablero' && tableroEdit)
    return (
      <div style={s.app}>
        <div style={s.header}>
          <Logo size={32} withText={true} />
          <button
            style={{
              ...s.btn,
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: 12,
              padding: '6px 12px',
            }}
            onClick={() => setScreen('informe')}
          >
            ← Volver
          </button>
        </div>
        <div style={{ background: ACCENT, padding: '10px 18px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>
            {editIdx === null ? 'Nuevo tablero' : 'Editar tablero'}
          </span>
        </div>
        <div style={s.body}>
          <div style={s.card}>
            <label style={s.label}>Nombre del tablero</label>
            <input
              style={s.input}
              value={tableroEdit.nombre}
              onChange={(e) =>
                setTableroEdit((p) => ({ ...p, nombre: e.target.value }))
              }
              placeholder="Ej: Tablero General Shaft"
            />
            <label style={s.label}>Piso</label>
            <select
              style={s.input}
              value={tableroEdit.piso}
              onChange={(e) =>
                setTableroEdit((p) => ({ ...p, piso: e.target.value }))
              }
            >
              {PISOS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <label style={s.label}>Criticidad</label>
            <div style={{ ...s.row, marginBottom: 12 }}>
              {CRITICIDAD.map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    setTableroEdit((p) => ({ ...p, criticidad: c }))
                  }
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    border: `2px solid ${
                      tableroEdit.criticidad === c
                        ? CRITICO_COLOR[c]
                        : '#e0e0e0'
                    }`,
                    background:
                      tableroEdit.criticidad === c ? CRITICO_BG[c] : 'white',
                    color:
                      tableroEdit.criticidad === c ? CRITICO_COLOR[c] : '#888',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: FONT,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div style={{ ...s.row, marginBottom: 12 }}>
              <input
                type="checkbox"
                id="garantia"
                checked={tableroEdit.garantia}
                onChange={(e) =>
                  setTableroEdit((p) => ({ ...p, garantia: e.target.checked }))
                }
              />
              <label
                htmlFor="garantia"
                style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}
              >
                Tablero en garantía
              </label>
            </div>
            <label style={s.label}>Observaciones encontradas</label>
            <textarea
              style={s.textarea}
              value={tableroEdit.observaciones}
              onChange={(e) =>
                setTableroEdit((p) => ({ ...p, observaciones: e.target.value }))
              }
              placeholder="Describe los problemas detectados..."
            />
            <label style={s.label}>Acciones ejecutadas en esta visita</label>
            <textarea
              style={s.textarea}
              value={tableroEdit.acciones}
              onChange={(e) =>
                setTableroEdit((p) => ({ ...p, acciones: e.target.value }))
              }
              placeholder="Ej: Se cambian fusibles, se instala mica en barra..."
            />
            <label style={s.label}>Fotos</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFotos}
            />
            <button
              style={{ ...s.btnGhost, width: '100%', marginBottom: 10 }}
              onClick={() => fileRef.current.click()}
            >
              📷 Agregar fotos
            </button>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
            >
              {(tableroEdit.fotos || []).map((f, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={f.data}
                    alt={f.name}
                    style={{
                      width: 70,
                      height: 70,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '1px solid #e0e0e0',
                    }}
                  />
                  <button
                    onClick={() => removeFoto(i)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      background: '#c0392b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            style={{ ...s.btn, ...s.btnPrimary, width: '100%', padding: 14 }}
            onClick={saveTablero}
          >
            Guardar tablero
          </button>
          <div style={{ height: 20 }} />
        </div>
      </div>
    );

  // ── PREVIEW ──
  if (screen === 'preview' && informe) {
    const criticos = informe.tableros.filter(
      (t) => t.criticidad === 'Crítico'
    ).length;
    const atencion = informe.tableros.filter(
      (t) => t.criticidad === 'Atención'
    ).length;
    const planif = informe.tableros.filter(
      (t) => t.criticidad === 'Planificado'
    ).length;
    const fechaFmt = new Date(informe.fecha + 'T12:00:00').toLocaleDateString(
      'es-CL',
      { day: '2-digit', month: 'long', year: 'numeric' }
    );

    return (
      <div style={{ fontFamily: FONT, fontSize: 14, background: BG }}>
        <div
          style={{
            background: PRIMARY,
            padding: '10px 20px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="no-print"
        >
          <button
            style={{
              ...s.btn,
              background: 'rgba(255,255,255,0.12)',
              color: 'white',
              fontSize: 12,
              padding: '7px 14px',
            }}
            onClick={() => setScreen('informe')}
          >
            ← Editar
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{
                ...s.btn,
                background: '#25D366',
                color: 'white',
                fontSize: 12,
              }}
              onClick={() => {
                const texto = `Hola, adjunto informe de mantención eléctrica *${
                  informe.numero
                }* correspondiente a *${
                  informe.cliente
                }* con fecha ${fechaFmt}.\n\nTableros inspeccionados: ${
                  informe.tableros.length
                }\nPersonal: ${informe.personal
                  .filter(Boolean)
                  .join(
                    ', '
                  )}\n\nPor favor revisar el informe adjunto. Saludos, ${
                  config.empresa
                }.`;
                window.open(
                  'https://wa.me/?text=' + encodeURIComponent(texto),
                  '_blank'
                );
              }}
            >
              WhatsApp
            </button>
            <button
              style={{ ...s.btn, ...s.btnAccent, fontSize: 12 }}
              onClick={imprimirPDF}
            >
              🖨 PDF
            </button>
          </div>
        </div>
        <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

        {/* PORTADA */}
        <div
          style={{
            background: PRIMARY,
            color: 'white',
            padding: '40px 36px 32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 32,
            }}
          >
            <Logo size={44} withText={true} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {fechaFmt}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: ACCENT,
                  marginTop: 4,
                }}
              >
                {informe.numero}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            Informe de Mantención
            <br />
            Preventiva de Tableros
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
              marginBottom: 22,
            }}
          >
            Inspección y registro de observaciones
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderLeft: `4px solid ${ACCENT}`,
              padding: '12px 16px',
              borderRadius: 4,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px 32px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                Cliente
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {informe.cliente}
              </div>
            </div>
            {informe.contacto && (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 2,
                  }}
                >
                  Contacto
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {informe.contacto}
                </div>
              </div>
            )}
            {informe.cartaGantt && (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 2,
                  }}
                >
                  Próxima mantención
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {informe.cartaGantt}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESUMEN */}
        <div style={{ background: 'white', padding: '28px 36px' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: PRIMARY,
              borderBottom: `2px solid ${ACCENT}`,
              paddingBottom: 5,
              marginBottom: 18,
            }}
          >
            Resumen ejecutivo
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              marginBottom: 22,
            }}
          >
            {[
              {
                n: informe.tableros.length,
                l: 'Tableros inspeccionados',
                c: PRIMARY,
              },
              { n: criticos, l: 'Observaciones críticas', c: '#c0392b' },
              { n: atencion, l: 'Atención prioritaria', c: '#d35400' },
              { n: planif, l: 'Planificados', c: '#1a5276' },
            ].map((k, i) => (
              <div
                key={i}
                style={{
                  background: BG,
                  border: '1px solid #e8e8e8',
                  borderRadius: 8,
                  padding: '12px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 700, color: k.c }}>
                  {k.n}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#888',
                    marginTop: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {k.l}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: PRIMARY,
              borderBottom: `2px solid ${ACCENT}`,
              paddingBottom: 5,
              marginBottom: 10,
            }}
          >
            EPP
          </div>
          <p
            style={{
              fontSize: 13,
              color: '#555',
              marginBottom: 18,
              lineHeight: 1.6,
            }}
          >
            {config.epp}
          </p>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: PRIMARY,
              borderBottom: `2px solid ${ACCENT}`,
              paddingBottom: 5,
              marginBottom: 10,
            }}
          >
            Personal de mantención
          </div>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 18 }}>
            {informe.personal.filter(Boolean).join(' · ')}
          </p>
          <div
            style={{
              padding: '12px 14px',
              background: BG,
              border: '1px solid #e8e8e8',
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: PRIMARY,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Condición:{' '}
            </span>
            <span style={{ fontSize: 12, color: '#555' }}>
              {informe.condicion}
            </span>
          </div>
          <div
            style={{
              marginTop: 10,
              padding: '8px 14px',
              background: '#f0f7f0',
              border: '1px solid #c8e6c9',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            className="no-print"
          >
            <span>✨</span>
            <span style={{ fontSize: 11, color: '#2e7d32' }}>
              Redacción revisada y mejorada con IA
            </span>
          </div>
        </div>

        {/* TABLEROS */}
        <div
          style={{ background: 'white', padding: '0 36px 36px', marginTop: 8 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: PRIMARY,
              borderBottom: `2px solid ${ACCENT}`,
              paddingBottom: 5,
              marginBottom: 18,
            }}
          >
            Detalle por tablero
          </div>
          {informe.tableros.map((t) => (
            <div
              key={t.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                marginBottom: 16,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: PRIMARY,
                  color: 'white',
                  padding: '10px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {t.nombre}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    background: 'rgba(255,255,255,0.15)',
                    padding: '3px 10px',
                    borderRadius: 12,
                  }}
                >
                  {t.piso}
                </span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <span style={s.badge(t.criticidad)}>{t.criticidad}</span>
                {t.garantia && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      background: '#e8f4fd',
                      color: '#1a5276',
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    En garantía
                  </span>
                )}
                {t.observaciones && (
                  <>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        margin: '10px 0 5px',
                      }}
                    >
                      Observaciones
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#333',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {t.observaciones}
                    </div>
                  </>
                )}
                {t.acciones && (
                  <>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: PRIMARY,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        margin: '10px 0 5px',
                      }}
                    >
                      Acciones ejecutadas
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#333',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        background: '#f0f7f0',
                        padding: '8px 12px',
                        borderRadius: 6,
                        borderLeft: '3px solid #27ae60',
                      }}
                    >
                      {t.acciones}
                    </div>
                  </>
                )}
                {t.fotos?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 8,
                      }}
                    >
                      Fotografías
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {t.fotos.map((f, fi) => (
                        <img
                          key={fi}
                          src={f.data}
                          alt={f.name}
                          style={{
                            width: 140,
                            height: 105,
                            objectFit: 'cover',
                            borderRadius: 6,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PIE */}
        <div
          style={{
            background: PRIMARY,
            color: 'white',
            padding: '20px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Logo size={32} withText={true} />
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                marginTop: 6,
              }}
            >
              {config.rut} · {config.email}
            </div>
          </div>
          <div
            style={{
              textAlign: 'right',
              fontSize: 12,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            <strong style={{ color: ACCENT }}>{informe.numero}</strong>
            <br />
            {informe.personal.filter(Boolean).join(' · ')}
            <br />
            {informe.cartaGantt && (
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                Próx. mantención: {informe.cartaGantt}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
