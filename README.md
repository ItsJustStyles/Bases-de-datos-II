# Tarea Corta 1 — Contenerización con Docker

Backend en Node.js/Express para registrar partidas de Valorant (agente, mapa, resultado, kills/deaths/assists). Corre en tres contenedores levantados con Docker Compose: la aplicación, PostgreSQL y Keycloak como proveedor de identidad. Las migraciones de la base las aplica un cuarto contenedor de Flyway que corre una sola vez antes de que la app arranque.

## Requisitos previos

- Docker y Docker Compose instalados.
- Puertos libres en la máquina: 8000 (app), 5433 (Postgres), 8080 (Keycloak).

## Cómo levantarlo

```bash
git clone https://github.com/ItsJustStyles/Bases-de-datos-II.git
cd <carpeta-del-repo>
cp .env.example .env
docker compose up --build
```

Con eso alcanza. Compose levanta Postgres, corre las migraciones con Flyway, levanta Keycloak importando el realm ya configurado, y solo después arranca la app (espera a que Flyway termine y a que Keycloak esté sano). La primera vez tarda un poco más porque Keycloak es el que más demora en arrancar.

Para apagar todo:

```bash
docker compose down
```

Esto no borra el volumen de Postgres, así que los datos quedan. Si en algún momento se quiere empezar de cero:

```bash
docker compose down -v
```

## Variables de entorno

El repo trae un `.env.example` con estos valores de ejemplo. Hay que copiarlo a `.env` antes de levantar el sistema (ese archivo sí puede editarse, pero funciona tal cual para probar):

```
APP_PORT=8000

POSTGRES_DB=tarea1_db
POSTGRES_USER=app_user
POSTGRES_PASSWORD=changeme123

KEYCLOAK_REALM=tarea1-realm
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=changeme123
```

Nada de esto va escrito en el Dockerfile ni en el código: la app las lee por variables de entorno (`src/config/env.js`).

## Autenticación

La autenticación no la escribimos nosotros, la resuelve Keycloak. El realm `tarea1-realm` y el client `tarea1-app` ya vienen configurados en `Keycloak/realm-export.json` y se importan solos al levantar el contenedor.

Hay dos roles:

- **jugador**: puede crear partidas.
- **coach**: puede editar y eliminar partidas.

Para las pruebas manuales, el realm trae dos usuarios ya creados:

| Usuario | Contraseña | Rol |
|---|---|---|
| player1 | player123 | jugador |
| coach1 | coach123 | coach |

Para conseguir un token (password grant, sirve para probar rápido con curl o Postman):

```bash
curl.exe -X POST http://localhost:8080/realms/tarea1-realm/protocol/openid-connect/token -d "client_id=tarea1-app" -d "grant_type=password" -d "username=player1" -d "password=player123"

curl.exe -X POST http://localhost:8080/realms/tarea1-realm/protocol/openid-connect/token -d "client_id=tarea1-app" -d "grant_type=password" -d "username=coach1" -d "password=coach123"
```

Eso devuelve un `access_token` que se manda como `Authorization: Bearer <token>` en las rutas protegidas.

## Rutas

Documentación interactiva (Swagger) disponible en `http://localhost:8000/docs` una vez que el sistema está arriba, donde se puede probar cada ruta desde el navegador.

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| GET | `/health` | No | Confirma que el proceso está vivo. No toca la base. Devuelve `{ status: "ok" }`. |
| GET | `/ready` | No | Confirma que la app puede hablar con Postgres. 200 si sí, 503 si no. |
| GET | `/partidas` | No | Lista las partidas. Admite filtros opcionales `?mapa=Ascent` y `?resultado=victoria`. |
| GET | `/partidas/:id` | No | Trae una partida por id. 404 si no existe. |
| POST | `/partidas` | Sí (rol jugador) | Crea una partida. |
| PUT | `/partidas/:id` | Sí (rol coach) | Actualiza una partida. 404 si no existe. |
| DELETE | `/partidas/:id` | Sí (rol coach) | Elimina una partida. Responde 204. |

Cuerpo esperado para crear/actualizar una partida:

```json
{
  "agente_id": 1,
  "mapa_id": 1,
  "resultado_id": 1,
  "kills": 18,
  "deaths": 9,
  "assists": 5
}
```

`agente_id`, `mapa_id` y `resultado_id` son obligatorios y tienen que existir de antes (los catálogos de agentes, mapas y resultados ya vienen con datos de ejemplo cargados por la migración `V2__seed_datos.sql`). `kills`, `deaths` y `assists` son opcionales y por defecto quedan en 0.

Una solicitud sin token a una ruta protegida responde 401. Con token válido pero sin el rol que corresponde, responde 403.

## Comprobar que los datos persisten

```bash
# 1. Crear una partida (con token de jugador)
# 2. Apagar sin borrar el volumen
docker compose down
# 3. Volver a levantar
docker compose up
# 4. La partida creada en el paso 1 debe seguir apareciendo en GET /partidas
```

## Pruebas

```bash
cd Backend
npm install
npm test              # unitarias + integración
npm run test:unit     # solo unitarias
npm run test:integration   # solo integración (requiere el sistema levantado con docker compose)
```

Las unitarias prueban la validación de una partida sin tocar ni Postgres ni Keycloak. Las de integración pegan contra el sistema real ya levantado (por eso hay que correr `docker compose up` antes).

## Estructura del repo

```
Backend/            servicio HTTP, Dockerfile, pruebas
Scripts/            migraciones de Postgres (Flyway)
Keycloak/           realm y client ya exportados
docker-compose.yml  orquesta app + postgres + keycloak + flyway
.env.example        variables necesarias para levantar el sistema
```

## Decisión de imagen base

`node:20-slim` para la app: trae Node sin el peso extra de la imagen completa. El Dockerfile solo instala dependencias de producción (`npm install --omit=dev`), copia únicamente la carpeta `src` (no el resto del repo) y no incluye `node_modules` del entorno de desarrollo, historial de Git ni archivos de configuración que no necesita en tiempo de ejecución.