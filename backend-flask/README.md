# CuidadorApp - Backend Flask

API REST para gestionar una PYME de acompañantes/cuidadores de pacientes.

## Funcionalidades

- Gestión de usuarios (admin, cuidador, familia)
- ABM de cuidadores y pacientes
- Registro de guardias (turnos) con horas trabajadas e informes
- Gestión de pagos a cuidadores

## Requisitos

- Python 3.10+
- PostgreSQL 12+

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/johansantallana/CuidadorApp_MonoRepo.git
cd CuidadorApp_MonoRepo/backend-flask
```

### 2. Crear entorno virtual

```bash
python -m venv venv
```

### 3. Activar entorno virtual

**Windows (PowerShell):**
```bash
venv\Scripts\activate
```

**Windows (CMD):**
```bash
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

## Configuración

### 1. Crear archivo `.env`

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

### 2. Editar `.env`

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/cuidadorapp
FLASK_APP=run.py
FLASK_ENV=development
```

## Base de datos

### 1. Crear la base de datos en PostgreSQL

```sql
CREATE DATABASE cuidadorapp;
```

### 2. Ejecutar migraciones

```bash
flask db upgrade
```

Esto crea todas las tablas necesarias.

## Ejecutar el servidor

```bash
python run.py
```

El servidor arranca en `http://localhost:5000`

## Endpoints

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios/` | Listar todos los usuarios |
| GET | `/usuarios/<id>` | Obtener usuario por ID |
| POST | `/usuarios/` | Crear usuario |
| PUT | `/usuarios/<id>` | Actualizar usuario |
| DELETE | `/usuarios/<id>` | Eliminar usuario |

**Crear usuario:**
```json
{
  "email": "admin@example.com",
  "password": "123456",
  "rol": "admin"
}
```

### Cuidadores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cuidadores/` | Listar todos los cuidadores |
| GET | `/cuidadores/<id>` | Obtener cuidador por ID |
| POST | `/cuidadores/` | Crear cuidador |
| PUT | `/cuidadores/<id>` | Actualizar cuidador |
| DELETE | `/cuidadores/<id>` | Eliminar cuidador |

**Crear cuidador:**
```json
{
  "nombre": "Juan Pérez",
  "documento": "12345678",
  "telefono": "555-1234"
}
```

### Pacientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/pacientes/` | Listar todos los pacientes |
| GET | `/pacientes/<id>` | Obtener paciente por ID |
| POST | `/pacientes/` | Crear paciente |
| PUT | `/pacientes/<id>` | Actualizar paciente |
| DELETE | `/pacientes/<id>` | Eliminar paciente |

**Crear paciente:**
```json
{
  "nombre": "María García",
  "direccion": "Calle 123",
  "contacto_familia": "555-9999"
}
```

### Guardias

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/guardias/` | Listar todas las guardias |
| GET | `/guardias/<id>` | Obtener guardia por ID |
| GET | `/guardias/cuidador/<id>` | Guardias por cuidador |
| GET | `/guardias/paciente/<id>` | Guardias por paciente |
| GET | `/guardias/horas/cuidador/<id>` | Total horas por cuidador |
| GET | `/guardias/horas/cuidador/<id>/paciente/<id>` | Horas por cuidador y paciente |
| POST | `/guardias/` | Crear guardia |
| PUT | `/guardias/<id>` | Actualizar guardia |
| DELETE | `/guardias/<id>` | Eliminar guardia |

**Crear guardia:**
```json
{
  "fecha": "2024-01-15",
  "horas_trabajadas": 8,
  "informe": "Paciente estable",
  "cuidador_id": 1,
  "paciente_id": 1
}
```

### Pagos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/pagos/` | Listar todos los pagos |
| GET | `/pagos/<id>` | Obtener pago por ID |
| GET | `/pagos/cuidador/<id>` | Pagos por cuidador |
| POST | `/pagos/` | Crear pago |
| PUT | `/pagos/<id>` | Actualizar pago |
| DELETE | `/pagos/<id>` | Eliminar pago |
| PUT | `/pagos/<id>/confirmar` | Confirmar pago |

**Crear pago:**
```json
{
  "monto": 50000,
  "metodo": "MercadoPago",
  "cuidador_id": 1
}
```

## Arquitectura

```
backend-flask/
├── app/
│   ├── __init__.py       # App factory
│   ├── extensions.py     # Instancias de db, migrate, cors
│   ├── models/           # Modelos de base de datos
│   │   ├── usuario.py
│   │   ├── cuidador.py
│   │   ├── paciente.py
│   │   ├── guardia.py
│   │   └── pago.py
│   ├── services/         # Lógica de negocio
│   │   ├── usuario_service.py
│   │   ├── cuidador_service.py
│   │   ├── paciente_service.py
│   │   ├── guardia_service.py
│   │   └── pago_service.py
│   └── routes/           # Endpoints HTTP
│       ├── usuario_routes.py
│       ├── cuidador_routes.py
│       ├── paciente_routes.py
│       ├── guardia_routes.py
│       └── pago_routes.py
├── migrations/           # Migraciones de BD
├── config.py             # Configuración
├── run.py                # Punto de entrada
├── requirements.txt      # Dependencias
└── .env                  # Variables de entorno (no se sube)
```

### Flujo de una petición

```
Request HTTP
     ↓
   Route (recibe petición, valida formato)
     ↓
   Service (lógica de negocio, validaciones)
     ↓
   Model (acceso a base de datos)
     ↓
   Response JSON
```

## Modelo de datos

```
Usuario (1) ──── (1) Cuidador (1) ──── (N) Guardia (N) ──── (1) Paciente
                        │
                        └──── (N) Pago
```

- **Usuario**: login con email, password y rol
- **Cuidador**: datos del trabajador, vinculado a usuario
- **Paciente**: datos del paciente, vinculado a usuario (familia)
- **Guardia**: registro de turno (fecha, horas, informe)
- **Pago**: pago al cuidador (monto, método, confirmación)
