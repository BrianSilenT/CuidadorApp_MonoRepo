CuidadorApp - Guía de arranque y uso

============================================================
0) Arranque total (1 comando)
============================================================

Desde la raíz del repo en PowerShell:
.\scripts\start-all.ps1

Para detener ambos:
.\scripts\stop-all.ps1

============================================================
1) Credenciales de prueba y Accesos
============================================================

La aplicación cuenta con 3 tipos de usuarios. Usa estas credenciales para probar cada panel:

| Rol | URL de Login | Email | Contraseña |
|-----|--------------|-------|------------|
| **Admin** | `http://localhost:3000/admin/login` | `admin@cuidadorapp.com` | `admin123` |
| **Cuidador** | `http://localhost:3000/caregiver/login` | `cuidador@cuidadorapp.com` | `cuidador123` |
| **Familia** | `http://localhost:3000/family/login` | `familia@cuidadorapp.com` | `familia123` |

*Nota: La ruta del admin es oculta y no aparece en la página principal.*

============================================================
2) Backend (Flask)
============================================================

- **Stack:** Flask + Flask-SQLAlchemy + Alembic + JWT.
- **Base de datos:** SQLite por defecto para desarrollo local (configurable a PostgreSQL en `.env`).
- **Autenticación:** JWT (JSON Web Token).
- **Permisos:** Sincronizados para que los 3 roles puedan consultar la información necesaria (cuidadores, pacientes, guardias, pagos).

============================================================
3) Frontend (React/Vite)
============================================================

- **Stack:** React + Vite + React Router + Axios + Tailwind.
- **Estructura:**
  - `src/components`: UI reutilizable y layouts por rol.
  - `src/pages`: Pantallas separadas por rol (`admin`, `caregiver`, `family`).
  - `src/services/api.js`: Cliente Axios para consumir el backend.

============================================================
4) Solución de problemas
============================================================

- **Backend no levanta:** Revisa `backend-flask/.env` y ejecuta migraciones (`flask db upgrade`).
- **Frontend no conecta:** Revisa `frontend/.env.local` (`VITE_API_BASE_URL=http://127.0.0.1:5000`).
- **Error de credenciales:** Reejecuta el seed de la base de datos: `python backend-flask/seed.py`
