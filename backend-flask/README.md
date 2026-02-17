# CuidadorApp - Backend Flask

API REST para gestionar una PYME de acompañantes/cuidadores de pacientes. Incluye autenticación JWT, permisos por rol, subida de documentos, reportes y paginación.

## Requisitos

- Python 3.10+
- PostgreSQL 12+

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/johansantallana/CuidadorApp_MonoRepo.git
cd CuidadorApp_MonoRepo/backend-flask
```

### 2. Crear y activar entorno virtual

```bash
python -m venv venv
```

**Windows (PowerShell):**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copiar el archivo de ejemplo y editar con tus credenciales:

```bash
cp .env.example .env
```

Contenido del `.env`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/cuidadorapp
FLASK_APP=run.py
FLASK_ENV=development
JWT_SECRET_KEY=tu-clave-secreta-aqui
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `FLASK_APP` | Archivo de entrada (siempre `run.py`) |
| `FLASK_ENV` | `development` activa debug mode |
| `JWT_SECRET_KEY` | Clave para firmar los tokens JWT |

### 5. Crear la base de datos

En PostgreSQL:

```sql
CREATE DATABASE cuidadorapp;
```

### 6. Ejecutar migraciones

```bash
flask db upgrade
```

### 7. Levantar el servidor

```bash
python run.py
```

El servidor arranca en `http://localhost:5000`

---

## Modelo de datos

```
Usuario (1) ──── (1) Cuidador (1) ──── (N) Guardia (N) ──── (1) Paciente
   │                    │
   │                    ├──── (N) Pago
   │                    │
   │                    └──── (N) Documento
   │
   └──── (1) Paciente (a través del rol "familia")
```

### Tablas

| Tabla | Descripción | Campos principales |
|-------|-------------|-------------------|
| **usuarios** | Cuentas de acceso | email, password (hash), rol |
| **cuidadores** | Datos del trabajador | nombre, documento, telefono, activo |
| **pacientes** | Datos del paciente | nombre, direccion, contacto_familia |
| **guardias** | Turnos de trabajo | fecha, horas_trabajadas, informe, cuidador_id, paciente_id |
| **pagos** | Pagos a cuidadores | monto, fecha_pago, metodo, confirmado, cuidador_id |
| **documentos** | Archivos del cuidador | nombre_archivo, tipo_documento, ruta_archivo, cuidador_id |

### Relaciones

- Un **usuario** puede tener un perfil de **cuidador** o estar vinculado a un **paciente** (según su rol)
- Un **cuidador** puede tener muchas **guardias**, muchos **pagos** y muchos **documentos**
- Un **paciente** puede tener muchas **guardias** (con distintos cuidadores)
- La tabla **guardias** conecta cuidadores con pacientes (relación muchos a muchos)

---

## Autenticación

La API usa **JWT (JSON Web Token)**. Para acceder a las rutas protegidas necesitas enviar el token en el header:

```
Authorization: Bearer <token>
```

### Roles

Hay 3 roles: `admin`, `cuidador`, `familia`.

| Acción | admin | cuidador | familia |
|--------|:-----:|:--------:|:-------:|
| Gestionar usuarios | SI | NO | NO |
| Gestionar cuidadores | SI | NO | NO |
| Gestionar pacientes | SI | NO | SI |
| Crear/ver guardias | SI | Solo las suyas | NO |
| Ver guardias por paciente | SI | NO | SI |
| Gestionar pagos | SI | NO | NO |
| Subir/ver documentos | SI | Solo los suyos | NO |
| Ver reportes | SI | NO | NO |

---

## Paginación

Todos los endpoints que devuelven listas soportan paginación con query params:

```
GET /usuarios/?pagina=1&por_pagina=10
```

**Respuesta paginada:**

```json
{
  "datos": [...],
  "pagina": 1,
  "por_pagina": 10,
  "total": 25,
  "paginas": 3
}
```

| Parámetro | Default | Descripción |
|-----------|---------|-------------|
| `pagina` | 1 | Número de página |
| `por_pagina` | 10 | Cantidad de items por página |

---

## Endpoints

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | `/auth/login` | No | Iniciar sesión |
| POST | `/auth/logout` | SI | Cerrar sesión (invalida el token) |
| PUT | `/auth/cambiar-password` | SI | Cambiar contraseña propia |

**Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "123456"}'
```

Respuesta:
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "email": "admin@example.com",
    "rol": "admin"
  }
}
```

**Logout:**
```bash
curl -X POST http://localhost:5000/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Cambiar contraseña:**
```bash
curl -X PUT http://localhost:5000/auth/cambiar-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"password_actual": "123456", "password_nueva": "nuevapass"}'
```

La contraseña nueva debe tener al menos 6 caracteres.

---

### Usuarios

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/usuarios/` | admin | Listar usuarios (paginado) |
| GET | `/usuarios/<id>` | admin | Obtener usuario por ID |
| POST | `/usuarios/` | Público | Registrar usuario |
| PUT | `/usuarios/<id>` | admin | Actualizar usuario |
| DELETE | `/usuarios/<id>` | admin | Eliminar usuario |

**Registrar usuario:**
```bash
curl -X POST http://localhost:5000/usuarios/ \
  -H "Content-Type: application/json" \
  -d '{"email": "nuevo@example.com", "password": "123456", "rol": "cuidador"}'
```

Respuesta:
```json
{
  "id": 1,
  "email": "nuevo@example.com",
  "rol": "cuidador"
}
```

Roles válidos: `admin`, `cuidador`, `familia`. Solo un admin puede crear otros admins (requiere token de admin).

---

### Cuidadores

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/cuidadores/` | admin | Listar cuidadores (paginado) |
| GET | `/cuidadores/<id>` | admin | Obtener cuidador por ID |
| POST | `/cuidadores/` | admin | Crear cuidador |
| PUT | `/cuidadores/<id>` | admin | Actualizar cuidador |
| DELETE | `/cuidadores/<id>` | admin | Eliminar cuidador |

**Crear cuidador:**
```bash
curl -X POST http://localhost:5000/cuidadores/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan Pérez", "documento": "12345678", "telefono": "555-1234", "usuario_id": 2}'
```

Respuesta:
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "documento": "12345678",
  "telefono": "555-1234",
  "activo": true,
  "usuarioId": 2
}
```

---

### Pacientes

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/pacientes/` | admin, familia | Listar pacientes (paginado) |
| GET | `/pacientes/<id>` | admin, familia | Obtener paciente por ID |
| POST | `/pacientes/` | admin, familia | Crear paciente |
| PUT | `/pacientes/<id>` | admin, familia | Actualizar paciente |
| DELETE | `/pacientes/<id>` | admin | Eliminar paciente |

**Crear paciente:**
```bash
curl -X POST http://localhost:5000/pacientes/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "María García", "direccion": "Calle 123", "contacto_familia": "555-9999", "usuario_id": 3}'
```

Respuesta:
```json
{
  "id": 1,
  "nombre": "María García",
  "direccion": "Calle 123",
  "contactoFamilia": "555-9999",
  "usuarioId": 3
}
```

---

### Guardias

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/guardias/` | admin, cuidador | Listar guardias (paginado) |
| GET | `/guardias/<id>` | admin, cuidador | Obtener guardia por ID |
| GET | `/guardias/cuidador/<id>` | admin, cuidador | Guardias por cuidador (paginado) |
| GET | `/guardias/paciente/<id>` | admin, familia | Guardias por paciente (paginado) |
| GET | `/guardias/horas/cuidador/<id>` | admin, cuidador | Total horas por cuidador |
| GET | `/guardias/horas/cuidador/<cid>/paciente/<pid>` | admin, cuidador | Horas por cuidador y paciente |
| POST | `/guardias/` | admin, cuidador | Crear guardia |
| PUT | `/guardias/<id>` | admin, cuidador | Actualizar guardia |
| DELETE | `/guardias/<id>` | admin, cuidador | Eliminar guardia |

Un cuidador solo puede crear, actualizar y eliminar sus propias guardias.

**Crear guardia:**
```bash
curl -X POST http://localhost:5000/guardias/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2026-03-15", "horas_trabajadas": 8, "informe": "Paciente estable", "cuidador_id": 1, "paciente_id": 1}'
```

Respuesta:
```json
{
  "id": 1,
  "fecha": "2026-03-15",
  "horasTrabajadas": 8,
  "informe": "Paciente estable",
  "cuidadorId": 1,
  "pacienteId": 1
}
```

Validaciones: `horas_trabajadas` debe ser mayor a 0. El `cuidador_id` y `paciente_id` deben existir en la base de datos. Formato de fecha: `YYYY-MM-DD`.

**Consultar horas por cuidador:**
```bash
curl http://localhost:5000/guardias/horas/cuidador/1 \
  -H "Authorization: Bearer <token>"
```

Respuesta:
```json
{
  "cuidador_id": 1,
  "total_horas": 48,
  "total_guardias": 6
}
```

---

### Pagos

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/pagos/` | admin | Listar pagos (paginado) |
| GET | `/pagos/<id>` | admin | Obtener pago por ID |
| GET | `/pagos/cuidador/<id>` | admin | Pagos por cuidador (paginado) |
| POST | `/pagos/` | admin | Crear pago |
| PUT | `/pagos/<id>` | admin | Actualizar pago |
| DELETE | `/pagos/<id>` | admin | Eliminar pago |
| PUT | `/pagos/<id>/confirmar` | admin | Confirmar pago |

**Crear pago:**
```bash
curl -X POST http://localhost:5000/pagos/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"monto": 50000, "metodo": "transferencia", "cuidador_id": 1}'
```

Respuesta:
```json
{
  "id": 1,
  "monto": 50000,
  "fechaPago": null,
  "metodo": "transferencia",
  "confirmado": false,
  "cuidadorId": 1
}
```

Validaciones: `monto` debe ser mayor a 0. El `cuidador_id` debe existir en la base de datos.

**Confirmar pago:**
```bash
curl -X PUT http://localhost:5000/pagos/1/confirmar \
  -H "Authorization: Bearer <token>"
```

Al confirmar, se marca `confirmado: true` y se asigna la fecha actual como `fecha_pago` (solo si no tenía una fecha previa).

---

### Documentos

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/documentos/cuidador/<id>` | admin, cuidador | Subir documento |
| GET | `/documentos/cuidador/<id>` | admin, cuidador | Listar documentos (paginado) |
| DELETE | `/documentos/<id>` | admin | Eliminar documento |

Un cuidador solo puede subir y ver sus propios documentos.

**Subir documento:**
```bash
curl -X POST http://localhost:5000/documentos/cuidador/1 \
  -H "Authorization: Bearer <token>" \
  -F "archivo=@cedula.pdf" \
  -F "tipo_documento=cedula"
```

Respuesta:
```json
{
  "id": 1,
  "nombreArchivo": "cuidador_1_cedula_cedula.pdf",
  "tipoDocumento": "cedula",
  "rutaArchivo": "/uploads/cuidador_1_cedula_cedula.pdf",
  "fechaSubida": "2026-02-16 14:30:00",
  "cuidadorId": 1
}
```

Tipos válidos: `cedula`, `certificado`, `antecedentes`. Extensiones permitidas: `pdf`, `png`, `jpg`, `jpeg`. Tamaño máximo: 5 MB.

---

### Reportes

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/reportes/resumen` | admin | Resumen general (totales) |
| GET | `/reportes/cuidadores` | admin | Detalle por cuidador |
| GET | `/reportes/pagos` | admin | Resumen de pagos |
| GET | `/reportes/guardias?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` | admin | Guardias por rango de fecha |

**Resumen general:**
```bash
curl http://localhost:5000/reportes/resumen \
  -H "Authorization: Bearer <token>"
```

Respuesta:
```json
{
  "total_usuarios": 8,
  "total_cuidadores": 3,
  "total_pacientes": 2,
  "total_guardias": 10,
  "total_pagos": 5
}
```

**Guardias por fecha:**
```bash
curl "http://localhost:5000/reportes/guardias?desde=2026-01-01&hasta=2026-12-31" \
  -H "Authorization: Bearer <token>"
```

---

## Arquitectura

```
backend-flask/
├── app/
│   ├── __init__.py          # App factory
│   ├── extensions.py        # db, migrate, cors, bcrypt, jwt
│   ├── models/              # Modelos de base de datos
│   │   ├── usuario.py
│   │   ├── cuidador.py
│   │   ├── paciente.py
│   │   ├── guardia.py
│   │   ├── pago.py
│   │   └── documento.py
│   ├── services/            # Lógica de negocio
│   │   ├── usuario_service.py
│   │   ├── cuidador_service.py
│   │   ├── paciente_service.py
│   │   ├── guardia_service.py
│   │   ├── pago_service.py
│   │   ├── documento_service.py
│   │   └── reporte_service.py
│   ├── routes/              # Endpoints HTTP
│   │   ├── auth_routes.py
│   │   ├── usuario_routes.py
│   │   ├── cuidador_routes.py
│   │   ├── paciente_routes.py
│   │   ├── guardia_routes.py
│   │   ├── pago_routes.py
│   │   ├── documento_routes.py
│   │   └── reporte_routes.py
│   └── utils/
│       └── permisos.py      # Decorador de permisos por rol
├── migrations/              # Migraciones de BD
├── uploads/                 # Archivos subidos (no se sube al repo)
├── config.py                # Configuración
├── run.py                   # Punto de entrada
├── requirements.txt         # Dependencias
└── .env                     # Variables de entorno (no se sube al repo)
```

### Flujo de una petición

```
Request HTTP → Route (auth + permisos) → Service (validaciones + lógica) → Model (BD) → Response JSON
```

1. La **ruta** recibe la petición, verifica el JWT y los permisos del rol
2. El **service** ejecuta la lógica de negocio y validaciones
3. El **modelo** accede a la base de datos
4. Se devuelve la respuesta en JSON

---

## Seguridad

- Contraseñas hasheadas con **bcrypt**
- Autenticación con **JWT** (tokens expiran en 15 minutos)
- Logout invalida el token (blacklist en memoria)
- Permisos por rol con decorador `@rol_requerido()`
- Validación de propiedad (cuidadores solo acceden a sus propios datos)
- Solo admins pueden crear otros admins
- Validación de roles, datos positivos y existencia de IDs en BD
- `debug=True` solo se activa si `FLASK_ENV=development`
