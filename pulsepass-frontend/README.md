# PulsePass — Frontend (Fase 5)

SPA en **React 19 + TypeScript (strict) + Tailwind v4 + React Router v8 + TanStack Query + React Hook Form/zod**,
construida según el PRD y siguiendo la arquitectura del laboratorio DeepBlue Rescue
(`lib/http.ts` → `api.ts` → hooks → páginas, zod para todo dato externo, proxy de Vite hacia Spring Boot).

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173  (proxy /api → http://localhost:8080)
npm run build    # tsc -b + vite build
npm run lint
npm test         # Vitest + Testing Library + MSW (88 pruebas, sin backend real)
```

Requiere Node ≥ 22.22. Variable (pública): `VITE_API_BASE_URL=/api` (ver `.env.example`).

## Estructura

```
src/
  lib/            http.ts (fetch+Bearer+ApiError) · errores.ts · rutas.ts (RUTAS) · formato.ts · queryClient.ts
  layouts/        Layout · Navbar · MenuUsuario · Footer · RutaProtegida · RutaPorRol · SoloAnonimo
  componentes/    UI genérica: Boton, Campo/Selector/AreaTexto, Badge, Modal, Tabla<T>, Aviso(s), Estados…
  funcionalidades/{auth,eventos,artistas,sedes,usuarios,tickets,admin}/  tipos.ts(zod) · api.ts · hooks.ts · componentes/
  pages/          las 20 páginas del PRD §8 (lazy, excepto Inicio y Layout)
  routes.tsx      árbol de rutas (createBrowserRouter) · router.tsx · main.tsx
  test/           setup (MSW) · mocks/handlers.ts · utils.tsx (renderApp con Router+Query+Auth)
```

## Roles de demostración (según PRD §22)

| Persona | Rol UI | Qué probar |
|---|---|---|
| Andrea / Carlos | USER | comprar, mis tickets, cancelar |
| Laura | STAFF (o USER menor de edad → 409 por edad) | validación de ingreso, tickets pagados |
| Administración | ADMIN | crear/publicar evento, asociar artista |

## ⚠️ Diferencias entre el PRD y el backend entregado (zip)

Los tipos zod se escribieron contra los **DTO reales** del zip, no contra el texto del PRD:

| Tema | PRD | Backend real (zip) | Decisión |
|---|---|---|---|
| Seguridad (Fase 4) | `/api/auth/login`, `/api/auth/me`, JWT, roles | **No existe** en el zip (solo Fases 1–3) | La UI implementa el contrato del PRD; hasta tener la Fase 4, login/compra/roles no funcionan contra ese backend |
| Nombre del evento | `name` | respuesta `title`; la solicitud sigue siendo `name` | `EventoSchema.title`, `CrearEventoSchema.name` |
| Sede / artistas | `venueName`… | objetos anidados `venue` y `artists[]` | tipados como anidados |
| Registro | sin teléfono/ciudad | `phone` y `city` obligatorios | campos añadidos al formulario; `password` se envía (Fase 4) |
| Ticket | incluye titular | **no** incluye usuario | "Titular" solo en el detalle propio (perfil de sesión); la tabla STAFF muestra fecha de compra |
| Descripción de evento | contador /500 | máx. 2000 | contador /2000 |
| Rol en `/auth/me` | `USER` | puede venir `ROLE_USER` | se normaliza quitando `ROLE_` |
| `/staff/eventos/:eventCode/tickets` | código obligatorio | — | código opcional para el enlace "Tickets pagados" de la navbar |

Supuesto pendiente (PRD R-FE-002): forma exacta de `AuthenticatedUserResponse` (mínimo `username`, `email`, `roles`).
Ajustar `funcionalidades/auth/tipos.ts` al confirmar con la Fase 4.

## Notas de diseño

- Las imágenes de `imagenes/` del PRD (32 PNG) no venían en la entrega: el diseño se implementó desde los
  wireframes/capturas incluidas en el PDF. Copiarlas a `docs/diseno/`.
- Modo oscuro por clase (`dark:`), inicial según `prefers-color-scheme`; la preferencia del tema es lo único en `localStorage`.
  El token JWT vive solo en memoria + `sessionStorage`.
