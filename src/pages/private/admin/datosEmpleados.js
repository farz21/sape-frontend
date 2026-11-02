export const empleados = [
  { id: '1', nombre: 'Sofia Martinez', puesto: 'Analista de Personas', equipo: 'People Analytics', actividad: 'al-dia', avance: 92, ultimaActividad: 'Hoy, 09:20', tareas: '11 de 12 actividades completadas' },
  { id: '2', nombre: 'Mateo Palacios', puesto: 'Desarrollador Frontend', equipo: 'Tecnologia', actividad: 'atencion', avance: 68, ultimaActividad: 'Ayer, 16:45', tareas: '7 de 10 actividades completadas' },
  { id: '3', nombre: 'Valentina Romero', puesto: 'Coordinadora de Ventas', equipo: 'Comercial', actividad: 'al-dia', avance: 86, ultimaActividad: 'Hoy, 10:05', tareas: '6 de 7 actividades completadas' },
  { id: '4', nombre: 'Tomas Aranda', puesto: 'Disenador UX', equipo: 'Producto', actividad: 'retraso', avance: 35, ultimaActividad: 'Hace 4 dias', tareas: '3 de 9 actividades completadas' },
  { id: '5', nombre: 'Camila Fernandez', puesto: 'Analista Contable', equipo: 'Administracion', actividad: 'al-dia', avance: 100, ultimaActividad: 'Hoy, 08:50', tareas: '8 de 8 actividades completadas' },
];

export const estadoActividad = {
  'al-dia': { etiqueta: 'Al dia', color: 'bg-emerald-100 text-emerald-800', punto: 'bg-emerald-500' },
  atencion: { etiqueta: 'Requiere atencion', color: 'bg-amber-100 text-amber-800', punto: 'bg-amber-500' },
  retraso: { etiqueta: 'Con retraso', color: 'bg-rose-100 text-rose-800', punto: 'bg-rose-500' },
};
