CuidadorApp - Guía de arranque total + explicación técnica

============================================================
0) Arranque total (1 comando)
============================================================

Desde la raíz del repo:

PowerShell:
.
\scripts\start-all.ps1

Qué hace start-all.ps1:
1. Valida rutas backend/frontend.
2. Crea backend-flask/.env (si no existe) con SQLite local para demo.
3. Crea backend-flask/.venv si no existe.
4. Instala dependencias Python.
5. Ejecuta migraciones SQL.
6. Ejecuta seed de usuarios y datos de prueba.
7. Crea frontend/.env.local (si no existe) apuntando al backend.
8. Instala dependencias frontend.
9. Levanta backend y frontend en terminales separadas.

Para detener ambos:
.
\scripts\stop-all.ps1


============================================================
1) Backend: qué debes saber
============================================================

Stack backend:
- Flask + Flask-SQLAlchemy + Alembic + JWT.

Arquitectura backend (resumen):
- app/routes: endpoints REST (auth, usuarios, cuidadores, pacientes, guardias, pagos, documentos, reportes).
- app/services: lógica de negocio y validaciones.
- app/models: modelos SQLAlchemy (tablas SQL).
- app/extensions: init de db, migrate, bcrypt, jwt.

Autenticación:
- Login en /auth/login devuelve token JWT.
- Frontend lo guarda y lo envía en Authorization: Bearer <token>.

Roles:
- admin
- cuidador
- familia

Reglas de acceso importantes:
- admin: CRUD completo principal.
- familia: acceso a pacientes y consulta de guardias por paciente.
- cuidador: acceso a guardias propias y documentos.


============================================================
2) Base de datos SQL usada
============================================================

Por diseño del proyecto:
- El backend está pensado para PostgreSQL (ver .env.example y README).

En esta configuración local:
- Se usa SQLite para demo rápida:
  DATABASE_URL=sqlite:///cuidadorapp.db

Qué cambia entre SQLite y PostgreSQL:
- Modelo y migraciones son los mismos.
- Solo cambia la cadena DATABASE_URL.

Para pasar a PostgreSQL:
1. Edita backend-flask/.env
2. Reemplaza DATABASE_URL por:
   postgresql://usuario:password@localhost:5432/cuidadorapp
3. Ejecuta migraciones y seed otra vez.


============================================================
3) Qué es el seed
============================================================

Archivo:
- backend-flask/scripts/seed_test_users.py

Definición:
- Seed = script para poblar la base con datos iniciales de prueba.

Qué crea/actualiza el seed:
- Usuario admin
- Usuario cuidador
- Usuario familia
- Perfil de cuidador asociado
- Paciente asociado
- 1 guardia demo
- 1 pago demo

Importante:
- Es idempotente: puedes ejecutarlo varias veces sin duplicar todo.

Credenciales de prueba:
- admin@cuidadorapp.com / Admin123!
- cuidador@cuidadorapp.com / Cuidador123!
- familia@cuidadorapp.com / Familia123!


============================================================
4) Frontend: cómo se construyó
============================================================

Stack frontend:
- React + Vite + React Router + Axios + Tailwind.

Cómo está organizado:
- src/components/common: UI reutilizable (Button, Card, Input, Sidebar, etc.).
- src/components/layouts: layout por rol (AdminLayout, CaregiverLayout, FamilyLayout).
- src/pages: pantallas por rol.
- src/services/api.js: cliente Axios y servicios por recurso.

Decisiones de construcción:
1. Router por rol en App.jsx.
2. Sidebar por rol con ruta activa.
3. Páginas con estados consistentes:
   - loading
   - error
   - empty
4. CRUD admin conectado a backend:
   - pacientes
   - cuidadores
   - guardias
   - pagos
5. Login real contra backend con JWT y redirección por rol.


============================================================
5) Flujo recomendado de demo
============================================================

1. Ejecutar .\scripts\start-all.ps1
2. Abrir frontend (http://127.0.0.1:5173)
3. Login admin
4. Probar CRUD:
   - /admin/pacientes
   - /admin/cuidadores
   - /admin/guardias
   - /admin/pagos
5. Confirmar pago y revisar /admin/reportes


============================================================
6) Si algo falla
============================================================

Backend no levanta:
- Revisa backend-flask/.env
- Verifica migraciones: python -m flask db upgrade

Frontend no conecta:
- Revisa frontend/.env.local
- Debe tener VITE_API_BASE_URL=http://127.0.0.1:5000

Error de credenciales:
- Reejecuta seed:
  python scripts\seed_test_users.py
