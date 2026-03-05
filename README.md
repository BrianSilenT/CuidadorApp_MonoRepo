# CuidadorApp - MonoRepo

## 📌 Descripción General
Este repositorio contiene el **MonoRepo** de CuidadorApp, una aplicación diseñada para PYMEs dedicadas al cuidado de pacientes.  
El objetivo es centralizar en un solo proyecto tanto el **frontend** como el **backend**, manteniendo la organización y facilitando el despliegue.

---

## 📂 Estructura del Proyecto
- **frontend/** → Aplicación web construida con React + Vite + Material UI.  
- **backend-flask/** → API construida con Flask (para demo) y preparada para migración a PostgreSQL.  

Cada carpeta incluye su propio **README.md** con instrucciones específicas de instalación, configuración y ejecución.

---

## 🚀 Cómo clonar el proyecto
```bash
git clone https://github.com/No-Country-simulation/CuidadorApp_MonoRepo.git
cd CuidadorApp_MonoRepo

Levantar el Frontend
- Cambia a la carpeta del frontend:
cd frontend
- 
cd frontend
- Instala dependencias:
npm install
- 
npm install
- Levanta el servidor de desarrollo:
npm run dev
- Accede en el navegador a:
http://localhost:3000
## Para más detalles, revisa el README del frontend
⚙️ Levantar el Backend
- Cambia a la carpeta del backend:
cd backend-flask
- Instala dependencias (ejemplo con pip):
pip install -r requirements.txt

Levanta el servidor:
flask run
El backend quedará disponible en:
http://localhost:5000
Para más detalles, revisa el README del backend
📌 Recomendación
Antes de trabajar con cualquiera de las partes, lee el README específico de cada carpeta (frontend y backend).
Allí encontrarás instrucciones más detalladas sobre configuración, variables de entorno, scripts de base de datos y despliegue.

📬 Estado del Proyecto
Actualmente en fase MVP, con funcionalidades principales listas para demo:
- Gestión de usuarios (Admin, Cuidador, Familia).
- Registro de actividades.
- Reportes de horas trabajadas.
- Flujo inicial de pagos.

📈 Objetivo
Facilitar la transición de procesos manuales (Excel, WhatsApp) hacia una aplicación digital que brinde eficiencia, transparencia y confiabilidad en la gestión de cuidadores y pacientes.



