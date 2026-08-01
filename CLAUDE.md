# APP BRIMAHD — CONTEXTO DEL PROYECTO

_Última actualización: agosto 2026_

Este archivo se lee automáticamente al iniciar Claude Code en esta carpeta. Contiene el historial de decisiones, arquitectura y errores ya resueltos — no los repitas.

## Rol y forma de trabajo

- Eres el desarrollador senior a cargo de mantener y mejorar la app Brimahd, una app
  en producción real usada por técnicos en terreno — prioriza siempre la estabilidad
  sobre la velocidad.
- Nunca hagas cambios directos en la rama main. Todo cambio significativo se prueba
  primero en una rama separada, y solo se fusiona a main con confirmación explícita
  de Isaac.
- Antes de hacer git push a main o fusionar una rama, siempre pide confirmación
  explícita primero.
- Isaac no es programador y está recién aprendiendo a usar Claude Code — explica los
  cambios en español simple, sin asumir conocimiento técnico previo, sin jerga sin
  explicar.
- En performance, cuida especialmente el uso de memoria en iPhone/Safari (ya hubo
  problemas serios de esto antes) — cualquier cambio que maneje fotos, PDFs o informes
  grandes debe evitar acumular todo en memoria de una vez.

## Lenguaje visual / diseño

- La app debe sentirse moderna, elegante y de uso intuitivo — evita soluciones que
  se vean genéricas o anticuadas, prioriza claridad visual y facilidad de uso para
  técnicos en terreno usando el celular, muchas veces con apuro o luz solar directa.
- La app tiene dos modos: claro y oscuro, con un toggle para que el usuario elija
  (no depende solo del sistema operativo). Ambos modos deben verse igual de cuidados,
  no uno como "principal" y el otro como añadido de último momento.
- Modo oscuro: fondos oscuros en capas, nunca negro puro (ej: #1c1c1c fondo general,
  #141414 header/superficies elevadas, #242424 tarjetas internas). Texto principal
  blanco/gris claro (~#f0f0f0, nunca blanco puro #fff), texto secundario gris medio
  (~#9a9a9a).
- Modo claro: fondo #f8f8f8, header/superficies en carbón (#2c2c2c), tarjetas
  blancas con sombra suave.
- El dorado (#e8b923) es el único color de acento en ambos modos — se usa para el
  logo/ícono principal y el botón de acción principal (pill button, completamente
  redondeado, texto oscuro encima). No agregar más colores de acento sin justificación.
- Tarjetas con esquinas bien redondeadas (14-16px de radio), diferenciadas del fondo
  solo por el tono de superficie, sin bordes marcados.
- Iconos de línea delgada (outline icons), nunca iconos rellenos.
- Badges de estado (criticidad, alertas) usan fondo de color suave del mismo tono
  del texto que llevan encima, nunca texto negro sobre fondo de color.
- Prioriza alto contraste y elementos grandes y fáciles de tocar en ambos modos.

## Qué es esto
App móvil (React + Vite) que digitaliza los informes de inspección de tableros eléctricos para Brimahd Ltda. en campus DuocUC. Reemplazó un flujo manual en Word que tardaba 1-2 semanas. Tres técnicos (Emanuel Madrid, César Huerta, Carlos Madrid) la usan en terreno desde su propio celular, mayoritariamente iPhone/Safari.

Isaac es el desarrollador y dueño del código/IP. Emanuel Madrid Valenzuela (dueño de Brimahd Ltda., RUT 76.940.738-3, servicios@brimahd.cl) es el cliente, bajo modelo SaaS/licencia con suspensión remota si no paga.

## URLs
- **App:** https://isaacjorquera5823-dev.github.io/Brimahd-inspeccion/
- **Presentación comercial:** https://isaacjorquera5823-dev.github.io/brimahd-presentacion/
- **Repo app:** https://github.com/isaacjorquera5823-dev/Brimahd-inspeccion
- **Repo presentación:** https://github.com/isaacjorquera5823-dev/brimahd-presentacion
- ⚠️ StackBlitz (`vitejs-vite-wyjjaygg`) está desincronizado — **no usar**, editar directo en el repo.

## Stack
- React + Vite (JavaScript), fuente en `src/App.jsx`
- GitHub Pages + GitHub Actions (`.github/workflows/deploy.yml`) — build y deploy automático en cada push a `main`
- Firebase Firestore, proyecto `brimahd-inspeccion`, región `southamerica-east1`
- IndexedDB para persistencia de borradores (NO localStorage — ver Aprendizajes)

## Firebase / Firestore
- `contadores/informes` → numeración correlativa (INF-XXXX), reservada de forma **atómica** vía transacción para evitar duplicados entre técnicos en paralelo
- `config/licencia` → campo `activa` (boolean) = **kill switch remoto de licencia**. Si `false`, la app muestra pantalla "Servicio suspendido" y bloquea el uso. Si el documento no existe, la app **falla en modo abierto** (carga normal) para evitar auto-bloqueo por mala configuración.
- Reglas de seguridad: solo esos documentos son de lectura/escritura pública, el resto bloqueado.

## Diseño
- Primario: `#2c2c2c` (gris carbón) · Acento: `#e8b923` (dorado) · Garantía: `#6b4fa0` (morado) · Fondo: `#f8f8f8` · Tipografía declarada como `'Roboto', sans-serif` pero sin webfont cargado (no hay `<link>` ni `@font-face` en `index.html`) — en la práctica cae a la fuente del sistema de cada celular
- `color-scheme: light` forzado en CSS (evita que el modo oscuro del navegador rompa la app)
- Switches custom (no checkbox nativos) para "Tablero en garantía" y "cambio de tablero recomendado" — más confiables cross-browser
- Fotos a tamaño completo (`object-fit: contain`)
- Inputs a 16px de fuente (evita el zoom automático de iOS Safari al enfocar)
- "Próxima mantención" con selector Mes/Año, no texto libre

## Funcionalidades actuales
- Sede selector: 15 campus DuocUC con auto-completado de contacto/dirección
- Registro de tableros: ubicación, piso, criticidad, observaciones (50 predefinidas con criticidad preasignada), acciones, garantía, fotos
- Vista previa **unificada**: `VistaPreviaInforme` renderiza el HTML final real vía `<iframe srcDoc={...}>` usando la misma función `generarHTMLInforme(inf, cfg)` que la descarga — imposible que diverjan
- Descarga HTML con nombre automático (`INF-XXXX - Cliente - fecha.html`), envío por WhatsApp y Email prellenados
- Compresión de fotos (`comprimirImagen()`): máx 1600px, JPEG calidad 0.72 (~200-400KB c/u), con compresión adaptativa más agresiva sobre los 50/100/200 fotos (`parametrosCompresion()`)
- Autosave en IndexedDB incluye `tableroEdit`, `editIdx` y `screen` actual — el tablero en edición sobrevive a un crash
- Kill switch de licencia (ver Firebase arriba)
- Manual de uso para técnicos: `manual-brimahd-capturas.html` v2.0, HTML autocontenido con capturas reales en base64, formato de tarjetas en 8 pasos

## Aprendizajes clave (no repetir estos errores)
- **localStorage es insuficiente**: límite ~5MB en Safari iOS, muy por debajo de un borrador completo (20-30MB con fotos). Fallaba en silencio por `catch {}` vacíos. Solución: IndexedDB, con errores visibles al usuario.
- **Safari iOS tiene límites de memoria severos**: fotos sin comprimir en base64 duplicadas en el iframe de vista previa pueden llegar a 1-2GB RAM y matar la pestaña. Toda foto pasa por compresión antes de guardarse.
- **El tablero en edición debe estar en el autosave**: guardar solo `informe.tableros` (confirmados) pierde el tablero abierto si hay un crash.
- **Vista previa unificada evita drift**: mantener JSX de preview y HTML de descarga como dos código separados causaba KPIs y layouts que no coincidían.
- **Kill switch en modo "fail-open"**: si el doc de Firestore no existe, la app debe cargar igual (no auto-bloquearse por error de config).
- **Hooks de React nunca dentro de returns condicionales**: causó Error #310 (pantalla en blanco en mobile). Se resolvió inlineando JSX en los `.map()` en vez de sub-componentes con `useState` propio.
- **Vite bloquea hosts desconocidos por defecto**: para probar la app por un túnel HTTPS (cloudflared/ngrok) hay que agregar el host a `server.allowedHosts` en `vite.config.ts`, si no tira 403 "Blocked request". (Esto es sobre la herramienta de desarrollo, no sobre la app en sí.)
- **Para traer el código fuente actual**: `curl -s "https://raw.githubusercontent.com/isaacjorquera5823-dev/Brimahd-inspeccion/main/src/App.jsx"` — la API de GitHub para listar directorios tiene rate limit agresivo, evitarla.

## 🧪 En pruebas — rama `test-pdf` (NO fusionada a `main`, NO probada en producción)
Todo lo de esta sección vive **solo** en la rama `test-pdf` del repo. Lo que corre hoy en producción (`main`, `https://isaacjorquera5823-dev.github.io/Brimahd-inspeccion/`) sigue exactamente como está descrito en las secciones de arriba: descarga en HTML, sin maestro de observaciones, sin botón único de enviar. No tratar nada de lo siguiente como parte de la app terminada — es trabajo en curso, pendiente de que Isaac lo pruebe en su celular y confirme explícitamente la fusión a `main`.

- **Descarga en PDF en vez de HTML** (experimental): módulo nuevo `src/pdfInforme.js` + `src/theme.js` (paleta extraída) + dependencia `jspdf`. `generarPDFInforme()` dibuja el PDF a mano con las primitivas de jsPDF (texto, rectángulos, `addImage`) en vez de convertir el HTML con html2canvas, para no rasterizar fotos grandes en memoria. Cuida la paginación para que el header de un tablero nunca quede solo en una página sin al menos su primer registro.
- **Botón único "Enviar informe"** (experimental): en esta rama reemplaza los antiguos "⬇ Descargar informe" + "📤 Enviar" separados. Intenta primero el panel nativo de compartir (PDF adjunto + asunto/cuerpo del correo prearmados) en cualquier plataforma que lo soporte; si no, cae a descarga directa + enlaces de WhatsApp/Email sin adjunto.
- **Maestro compartido de observaciones con moderación** (experimental): dos documentos nuevos en Firestore, `config/observacionesMaestro` (`{aprobadas, pendientes}`) y `config/moderacion` (`{pin}`, PIN inicial `0000`, candado simple sin seguridad real). Si un técnico agrega una observación que no está en la lista fija, queda en `pendientes` hasta que alguien la apruebe desde una pantalla nueva protegida por PIN.
  - ⚠️ **Importante**: Firestore es el mismo proyecto de producción (`brimahd-inspeccion`) para todas las ramas — no hay un Firestore separado para pruebas. Probar esta función desde `test-pdf` ya crea/modifica esos documentos en el Firestore real. Antes de fusionar, revisar las reglas de seguridad en la consola de Firebase para que la escritura a estos dos documentos nuevos quede correctamente restringida.
- Aprendizajes de esta rama, por si se retoma: `navigator.share()` no permite dar un texto distinto según qué app elija el usuario (Mail, WhatsApp, etc. reciben el mismo `title`/`text`); jsPDF trae `html2canvas` como dependencia opcional (aparece como chunk en `vite build` aunque nunca se usa, no es un problema real, solo puede confundir al revisar el build).

## Flujo de trabajo de Isaac
- Prefiere entender el porqué de cada decisión, no solo aceptar sugerencias — corrige el enfoque activamente.
- Testea en iPhone/Safari antes de dar por hecho un cambio.
- Contenido para técnicos: corto y visual (tarjetas con capturas), nunca manuales técnicos largos.
- El argumentario de precios/comercial se mantiene como documento separado de la propuesta que ve el cliente.

## Pendiente
- Historial de informes en Firestore (ya está la infraestructura, falta extenderla más allá del contador)
- Probar en terreno y fusionar (o no) la rama `test-pdf` — ver sección "🧪 En pruebas" arriba. Requiere confirmación explícita de Isaac antes de fusionar a `main`.
- Rediseño visual (íconos de línea, botones/tarjetas con más sombra, pantalla de Bienvenida, modo oscuro con toggle): esto va un paso *antes* incluso de `test-pdf` — solo existe como mockup aprobado (Artifact fuera del repo), todavía no se aplicó a ningún código. Ver "Lenguaje visual / diseño" arriba para el objetivo.
- Logo real de Brimahd: en esa misma discusión de diseño se decidió sacar el ícono dibujado a mano de la app hasta tener el definitivo — también pendiente de aplicar al código (por ahora la marca seguiría siendo solo texto)
- Mejora de redacción con IA (requiere backend, evaluar Firebase Functions ya que Firebase ya está en el proyecto)
