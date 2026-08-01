# APP BRIMAHD — CONTEXTO DEL PROYECTO

_Última actualización: julio 2026_

Este archivo se lee automáticamente al iniciar Claude Code en esta carpeta. Contiene el historial de decisiones, arquitectura y errores ya resueltos — no los repitas.

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
- Primario: `#2c2c2c` (gris carbón) · Acento: `#e8b923` (dorado) · Garantía/info: `#1a5276` (azul) · Fondo: `#f8f8f8` · Tipografía Roboto
- `color-scheme: light` forzado en CSS (evita que el modo oscuro del navegador rompa la app)
- Switches custom (no checkbox nativos) para "Tablero en garantía" y "cambio de tablero recomendado" — más confiables cross-browser
- Fotos a tamaño completo (`object-fit: contain`)
- Inputs a 16px de fuente (evita el zoom automático de iOS Safari al enfocar)
- "Próxima mantención" con selector Mes/Año, no texto libre

## Funcionalidades actuales
- Sede selector: 15 campus DuocUC con auto-completado de contacto/dirección
- Registro de tableros: ubicación, piso, criticidad, observaciones (32 predefinidas con criticidad preasignada), acciones, garantía, fotos
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
- **Para traer el código fuente actual**: `curl -s "https://raw.githubusercontent.com/isaacjorquera5823-dev/Brimahd-inspeccion/main/src/App.jsx"` — la API de GitHub para listar directorios tiene rate limit agresivo, evitarla.

## Flujo de trabajo de Isaac
- Prefiere entender el porqué de cada decisión, no solo aceptar sugerencias — corrige el enfoque activamente.
- Testea en iPhone/Safari antes de dar por hecho un cambio.
- Contenido para técnicos: corto y visual (tarjetas con capturas), nunca manuales técnicos largos.
- El argumentario de precios/comercial se mantiene como documento separado de la propuesta que ve el cliente.

## Pendiente
- Subir a GitHub el kill switch (`App (12).jsx` ya lo tiene) y crear el documento `config/licencia` en Firestore
- Historial de informes en Firestore (ya está la infraestructura, falta extenderla más allá del contador)
- Logo real de Brimahd integrado
- Mejora de redacción con IA (requiere backend, evaluar Firebase Functions ya que Firebase ya está en el proyecto)
