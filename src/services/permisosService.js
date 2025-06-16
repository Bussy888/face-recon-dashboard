// src/services/permisosService.js
import jsonServerInstance from "../api/jsonInstance";

export const obtenerPermisos = async () => {
  const res = await jsonServerInstance.get("/permisos");
  return res.data.permisos;
};

export const obtenerPermisosPorRol = async (rolId) => {
  const res = await jsonServerInstance.get(`/permisos/${rolId}`);
  return res.data.permisos;
};