# APP BRIMAHD — CONTEXTO DEL PROYECTO

_Última actualización: noviembre 2026_

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
- **QAS (pruebas):** https://isaacjorquera5823-dev.github.io/brimahd-qas/ — repo https://github.com/isaacjorquera5823-dev/brimahd-qas (ver "Ambientes" abajo)
- ⚠️ StackBlitz (`vitejs-vite-wyjjaygg`) está desincronizado — **no usar**, editar directo en el repo.

## Ambientes (DEV → QAS → PRD)
Isaac viene de SAP y piensa en estos términos — usarlos al hablarle.

| Ambiente | Dónde | Cómo se publica |
|---|---|---|
| **DEV** | `npm run dev` en el PC, opcionalmente expuesto al celular con túnel `cloudflared tunnel --url http://localhost:PUERTO` (exe en `%LOCALAPPDATA%\Programs\cloudflared\`). URL `*.trycloudflare.com` aleatoria y temporal: muere al cerrar el PC/la sesión. **No dársela a terceros.** | — |
| **QAS** | https://isaacjorquera5823-dev.github.io/brimahd-qas/ | Repo separado `brimahd-qas` (carpeta local `otros/brimahd-qas`), solo contiene el workflow + archivo `RAMA`. El workflow hace checkout de `Brimahd-inspeccion` en la rama que diga `RAMA`, build con `vite build --mode qas --base /brimahd-qas/` y publica en Pages. Se dispara al pushear al repo QAS, o a mano (Actions → Publicar QAS → Run workflow) para traer commits nuevos de la misma rama — **un push a la rama de la app NO actualiza QAS solo**. |
| **PRD** | https://isaacjorquera5823-dev.github.io/Brimahd-inspeccion/ | Push a `main` del repo app (`.github/workflows/deploy.yml`). Requiere confirmación explícita de Isaac. |

- **Un solo QAS, no uno por rama** (decisión con Isaac, oct 2026): las ramas se prueban ahí antes de PRD, y la combinación de ramas se prueba ahí antes de fusionar. Desde el 27-oct-2026: `RAMA` = `main` (QAS replica PRD con modo prueba). Decisión de Isaac: el maestro de observaciones no se muestra en QAS (no está cotizado y escribe en el Firestore real); queda solo en la rama `maestro-observaciones`.
- **Modo prueba** (`MODO_PRUEBA` en `App.jsx` = `import.meta.env.DEV || MODE === "qas"`), activo en DEV y QAS, nunca en PRD (el build normal lo elimina; verificado buscando "Modo prueba" en `dist/`):
  - `reserveNextNumber()` no consume el contador: devuelve `PRUEBA-XXXX` con el próximo número solo mirado. Aviso amarillo "Modo prueba" en Inicio.
  - Almacenamiento con sufijo `_qas` (`brimahd_db_qas`, `brimahd_config_qas`): QAS y PRD comparten dominio (`isaacjorquera5823-dev.github.io`) y por lo tanto IndexedDB/localStorage — sin el sufijo, probar en QAS podía pisar un borrador real a medio llenar en PRD.
  - El workflow de QAS se niega a publicar si el build no contiene `brimahd_db_qas` (seguro contra gastar números reales).
  - Existe completo (DEV+QAS, contador + almacenamiento separado) en `main`, `maestro-observaciones` y `diseno-visual`; en esta última también la preferencia de tema (`brimahd_tema_oscuro_qas`). Al unificar las ramas, conservar los tres sufijos.
- ⚠️ **Firestore es uno solo para todos los ambientes.** El modo prueba protege el contador, pero el maestro de observaciones (`config/observacionesMaestro`, solo en `maestro-observaciones`) escribiría en datos reales si QAS apuntara a esa rama, y "Enviar informe" manda correos/WhatsApp reales. Mejora futura: proyecto Firebase separado para QAS.
- El repo app vive dentro de OneDrive: `npm install` reescribe miles de archivos en `node_modules` y OneDrive pide confirmar "eliminar N elementos" — es seguro eliminarlos (son regenerables). A futuro conviene mover los repos fuera de OneDrive.

## Stack
- React + Vite (JavaScript), fuente en `src/App.jsx`
- GitHub Pages + GitHub Actions (`.github/workflows/deploy.yml`) — build y deploy automático en cada push a `main`
- Firebase Firestore, proyecto `brimahd-inspeccion`, región `southamerica-east1`
- IndexedDB para persistencia de borradores (NO localStorage — ver Aprendizajes)

## Firebase / Firestore
- `contadores/informes` → numeración correlativa (INF-XXXX), reservada de forma **atómica** vía transacción para evitar duplicados entre técnicos en paralelo
- `config/licencia` → campo `activa` (boolean) = **kill switch remoto de licencia**. Si `false`, la app muestra pantalla "Servicio suspendido" y bloquea el uso. Si el documento no existe, la app **falla en modo abierto** (carga normal) para evitar auto-bloqueo por mala configuración.
- `historialInformes/{numero}` → **historial de informes emitidos** (en PRD desde el 12-nov-2026). Un documento por informe, id = número (`INF-0121`…), creado por `registrarInformeEmitido()` en `App.jsx` justo después de reservar el número en `generarInforme()`. Campos: `numero`, `emitidoEn` (serverTimestamp, el confiable), `emitidoEnCelular` (ISO del celular, respaldo), `fechaInforme`, `cliente`, `personal`, `cantidadTableros`.
  - **Mejor esfuerzo**: no se espera (`setDoc(...).catch(console.warn)`), si falla nunca frena al técnico. No se escribe en `MODO_PRUEBA` (DEV/QAS), porque Firestore es uno solo.
  - Registra el momento de **reservar el número** ("Generar informe"), no el de enviar el PDF. Un número reservado y nunca enviado igual queda registrado.
  - Los informes INF-0001 a INF-0120 (1-jul al 11-nov-2026) **no tienen fecha individual**: antes solo existía el contador. Lo único conocido es `createTime` (1-jul-2026) y `updateTime` (11-nov-2026) del doc `contadores/informes`, que se leen por la API REST pública de Firestore.
  - Para ver el historial: consola de Firebase → Firestore Database → Datos (desde fuera está bloqueado para lectura, a propósito).
- Reglas de seguridad (editadas a mano en la consola de Firebase, no versionadas en el repo): `contadores/informes` lectura/escritura pública; `config/licencia` solo lectura; `config/observacionesMaestro` y `config/moderacion` lectura/escritura (para `maestro-observaciones`); `historialInformes/{numero}` **solo `create`** (sin leer, editar ni borrar, ni siquiera la app); todo lo demás bloqueado (`{document=**}` en false). Las reglas suman permisos: un `match` específico permite aunque el comodín final diga false. Para ver o editar las reglas hay que entrar con la cuenta Google dueña del proyecto: otras cuentas de Isaac no lo ven ("El proyecto no existe o no tienes permiso").

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
- Informe en PDF (`src/pdfInforme.js`, ver abajo) con botón único "Enviar informe"; nombre automático `INF-XXXX - Cliente - fecha.pdf`. Antes de oct 2026 se descargaba en HTML.
- Vista previa con miniaturas de 900px (`crearMiniatura()`): evita que Safari cierre la pestaña con informes grandes (220 MB → 5 MB con 30 fotos; probado por Emanuel e Isaac en iPhone). El PDF usa las fotos originales.
- Compresión de fotos (`comprimirImagen()`): máx 1600px, JPEG calidad 0.72 (~200-400KB c/u), con compresión adaptativa más agresiva sobre los 50/100/200 fotos (`parametrosCompresion()`)
- Autosave en IndexedDB incluye `tableroEdit`, `editIdx` y `screen` actual — el tablero en edición sobrevive a un crash
- Kill switch de licencia (ver Firebase arriba)
- Historial de informes emitidos en Firestore (`historialInformes`, ver Firebase arriba)
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

## Informe en PDF y envío (en PRD desde oct 2026)
Llegó a `main` desde la rama `pdf-prd` (ya borrada): el contenido de `test-pdf` (hoy `maestro-observaciones`) **sin** el maestro de observaciones.

- **Informe en PDF** (en PRD desde la fusión de `pdf-prd`, oct 2026): módulo nuevo `src/pdfInforme.js` + `src/theme.js` (paleta extraída) + dependencia `jspdf`. `generarPDFInforme()` dibuja el PDF a mano con las primitivas de jsPDF (texto, rectángulos, `addImage`) en vez de convertir el HTML con html2canvas, para no rasterizar fotos grandes en memoria. Cuida la paginación para que el header de un tablero nunca quede solo en una página sin al menos su primer registro — corregido también para el título "Detalle por Tablero" (`dibujarTituloSeccion` acepta `siguienteMinH` y reserva ese bloque junto con el título; `medirLookaheadTablero` calcula cuánto mide el header+primer registro del tablero que sigue).
- **Botón único "Enviar informe"**: reemplaza los antiguos "⬇ Descargar informe" + "📤 Enviar" separados. Intenta primero el panel nativo de compartir (PDF adjunto + asunto/cuerpo del correo prearmados) en cualquier plataforma que lo soporte; si no, cae a descarga directa + enlaces de WhatsApp/Email sin adjunto. El asunto del correo (`construirEmailInforme` → `asunto`) es el mismo nombre que el archivo PDF (`nombreBaseInforme(inf)`: `{numero} - {cliente} - {fechaYYYYMMDD}`), sin extensión.
- **Autoguardado ajustado a 1500ms** (antes 500ms): con 500ms, el guardado en IndexedDB (que clona el informe completo, incluidas todas las fotos ya tomadas) se disparaba justo al pasar de un campo a otro durante el llenado, sintiéndose como lag. Con más margen ya no coincide con el ritmo normal de tipeo. Si en informes grandes (muchos tableros con fotos) sigue notándose lento, la mejora pendiente es separar el autoguardado en partes (no re-clonar tableros ya confirmados que no cambiaron) — cambio más grande a una función de la que depende no perder trabajo ante un crash, evaluarlo con cuidado antes de tocarlo.
- Aprendizajes del PDF: `navigator.share()` no permite dar un texto distinto según qué app elija el usuario (Mail, WhatsApp, etc. reciben el mismo `title`/`text`); jsPDF trae `html2canvas` como dependencia opcional (aparece como chunk en `vite build` aunque nunca se usa, no es un problema real, solo puede confundir al revisar el build).

## 🧪 Solo en la rama `maestro-observaciones` (NO en PRD)
_Se llamaba `test-pdf` hasta el 12-nov-2026; se renombró porque su único contenido propio es el maestro de observaciones (el PDF ya está en `main`)._
- **Maestro compartido de observaciones con moderación** (experimental): dos documentos nuevos en Firestore, `config/observacionesMaestro` (`{aprobadas, pendientes}`) y `config/moderacion` (`{pin}`, PIN inicial `0000`, candado simple sin seguridad real). Si un técnico agrega una observación que no está en la lista fija, queda en `pendientes` hasta que alguien la apruebe desde una pantalla nueva protegida por PIN.
  - ⚠️ **Importante**: Firestore es el mismo proyecto de producción (`brimahd-inspeccion`) para todas las ramas — no hay un Firestore separado para pruebas. Probar esta función desde `maestro-observaciones` ya crea/modifica esos documentos en el Firestore real. Antes de fusionar, revisar las reglas de seguridad en la consola de Firebase para que la escritura a estos dos documentos nuevos quede correctamente restringida.

## Flujo de trabajo de Isaac
- Prefiere entender el porqué de cada decisión, no solo aceptar sugerencias — corrige el enfoque activamente.
- Testea en iPhone/Safari antes de dar por hecho un cambio.
- Contenido para técnicos: corto y visual (tarjetas con capturas), nunca manuales técnicos largos.
- El argumentario de precios/comercial se mantiene como documento separado de la propuesta que ve el cliente.

## Pendiente
- Historial de informes — **solo el primer paso está hecho**: el registro de fechas `historialInformes` (12-nov-2026, ver Firebase arriba). Falta confirmar con el primer informe real (INF-0121) que aparece el documento.
  - **El pedido real de Emanuel sigue pendiente** (oct 2026): guardar el informe completo, buscarlo (por sede, fecha, número) y partir el siguiente desde uno anterior de la misma sede, reutilizando las fotos (decidido por Isaac 14-oct). Decisiones abiertas antes de programar: editar crea un informe nuevo (nuevo INF) y no pisa el original; las fotos no caben en Firestore (1 MB por documento) → Firebase Storage, que exige el plan Blaze (pago por uso); con reglas públicas los informes de clientes quedarían legibles → probablemente requiere login de técnicos; distinguir en el informe las fotos heredadas de las nuevas. Conviene crear la rama después de fusionar `diseno-visual`.
  - Mejoras menores del registro: marcar cuándo se envió el PDF (no solo cuándo se reservó el número).
- Maestro compartido de observaciones (solo en `maestro-observaciones`): revisar reglas de Firebase antes de llevarlo a PRD.
- Rediseño visual (íconos de línea, pantalla de Bienvenida, modo oscuro con toggle, stepper de 2 pasos, hojas inferiores): **ya implementado en la rama `diseno-visual`**. Decisión de Isaac (26-oct-2026): es una mejora para el futuro, no va a PRD por ahora. Ver el CLAUDE.md de esa rama para el detalle.
- Al retomar el rediseño: traer `main` a `diseno-visual` (ya tiene PDF + miniaturas). Los dos `src/theme.js` chocan: unificarlos cuidando que el PDF mantenga colores fijos y no siga el modo oscuro.
- `npm run build` (que corre `tsc -b`) falla por `src/main.tsx` importando `./index.css` sin declaración de tipos — preexistente, no afecta el deploy (que usa `npx vite build` directo).
- Logo real de Brimahd: en esa misma discusión de diseño se decidió sacar el ícono dibujado a mano de la app hasta tener el definitivo — también pendiente de aplicar al código (por ahora la marca seguiría siendo solo texto)
- Mejora de redacción con IA (requiere backend, evaluar Firebase Functions ya que Firebase ya está en el proyecto)
