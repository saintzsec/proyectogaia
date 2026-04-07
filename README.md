# GAIA Platform

Plataforma educativa web para aprendizaje basado en proyectos (PBL), ciencia aplicada y sostenibilidad.

## Vista general

GAIA incluye:

- Sitio publico informativo (`/`, proyectos, recursos, minitutoriales).
- Registro/login con Supabase Auth.
- Panel docente para grupos, talleres, evidencias y evaluaciones.
- Panel administrador para colegios, docentes, rubricas y metricas del piloto.

## Stack tecnologico

- `Next.js 15` (App Router) + `React 19` + `TypeScript`
- `Tailwind CSS 4`
- `Supabase` (Postgres, Auth, Storage, RLS)
- `Zod` para validaciones
- `Recharts` para metricas
- Deploy recomendado en `Vercel`

## Estructura del proyecto

```text
src/
  app/
    (site)/                 # Sitio publico
    (auth)/                 # Login/registro
    docente/                # Panel docente
    admin/                  # Panel admin
    actions/                # Server actions
  components/
    ui/                     # Componentes base (button, card, skeleton, etc.)
    layouts/                # Shells y navegacion
    site/                   # Componentes del landing/publico
  lib/
    auth/ db/ grading/ ...  # Utilidades de dominio
supabase/
  migrations/               # SQL versionado
public/
  brand/                    # Logos e imagenes de marca
```

## Requisitos

- Node.js `20+`
- npm `10+`
- Proyecto Supabase creado

## Configuracion local

1. Instala dependencias:

```bash
npm install
```

2. Crea variables de entorno:

```bash
cp .env.example .env.local
```

3. Completa `.env.local` con tus claves de Supabase.

4. Ejecuta en desarrollo:

```bash
npm run dev
```

## Variables de entorno

| Variable | Requerida | Descripcion |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Si | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Si | Clave anon publica |
| `NEXT_PUBLIC_SITE_URL` | Si | URL base del sitio (local o produccion) |
| `SUPABASE_SERVICE_ROLE_KEY` | Si | Solo servidor; necesaria para acciones privilegiadas |

> Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en variables `NEXT_PUBLIC_*`.

## Base de datos (Supabase)

Aplica migraciones SQL en orden desde `supabase/migrations/`.

Opciones:

- SQL Editor (copiar/pegar archivos en orden), o
- Supabase CLI (`supabase db push`) si ya tienes el proyecto vinculado.

Si tras una migracion aparece error de esquema en runtime, recarga el schema cache en Supabase o espera unos segundos.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy en Vercel (GitHub -> Vercel)

1. Sube este repo a GitHub.
2. En Vercel, `Add New Project` e importa el repositorio.
3. Agrega variables de entorno en Vercel (Production y Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.
5. En Supabase Auth configura:
   - `Site URL` (produccion)
   - `Redirect URLs` incluyendo `/auth/callback` para local y produccion.

## Dominio en Namecheap (`proyectogaia.org`)

Flujo recomendado:

1. Compra el dominio en Namecheap.
2. En Vercel agrega dominio custom (`proyectogaia.org` y `www.proyectogaia.org`).
3. Copia los registros DNS sugeridos por Vercel en Namecheap.
4. Espera propagacion DNS.
5. Actualiza `NEXT_PUBLIC_SITE_URL` con el dominio final.
6. Verifica de nuevo callbacks en Supabase.

## Checklist pre-produccion

- [ ] `npm run build` pasa local.
- [ ] No hay secretos en el repo (`.env.local` no versionado).
- [ ] Variables configuradas en Vercel (Production).
- [ ] Migraciones aplicadas en Supabase.
- [ ] Auth redirect URLs correctas.
- [ ] Flujo probado: login, panel docente, evaluaciones, evidencias.
- [ ] Dominio y SSL activos.

## Estado del repositorio para publicar

Este proyecto ya esta preparado para:

- Publicarse en GitHub sin exponer secretos (usando `.env.example`).
- Deploy continuo en Vercel conectado a GitHub.
- Uso de dominio custom en Namecheap.

## Licencia

Definir segun tu estrategia (por ejemplo: privado, propietario o MIT).
