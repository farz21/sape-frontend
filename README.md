# Frontend — S.A.P.E. (Aplicación Web)

Interfaz web desarrollada con **React**, **Vite**, **React Router DOM**, **Zustand** y **Tailwind CSS**, diseñada para consumir la API del backend de **S.A.P.E.** en `http://localhost:3000`.

## Requisitos previos

* **Node.js**
* **npm** 
* **Backend de S.A.P.E.** en ejecución en `http://localhost:3000`

## Instalación

1. Abrí una terminal en la carpeta del frontend e instalá las dependencias:
   ```bash
   npm install
   ```

2. Si el proyecto utiliza variables de entorno (por ejemplo `VITE_API_URL`), configurá el archivo correspondiente antes de iniciar.

## Ejecución

* **Servidor de desarrollo:**
  ```bash
  npm run dev
  ```

* **Compilación para producción:**
  ```bash
  npm run build
  ```

## Funcionalidades principales en la interfaz

* **Acceso y registro:** inicio de sesión con manejo de sesión y registro de cuenta.
* **Panel de administración:** gestión de empleados (alta, edición con selección de departamento y puesto, ficha histórica y baja), evaluaciones con semáforo, seguimiento de check-ins/alertas de fatiga, metas y comparativas/duelos con IA.
* **Panel de empleado:** consulta de perfil, evaluaciones, metas, planes de acción, notificaciones y registro de check-ins.