// src/services/rolService.js
import jsonServerInstance from "../api/jsonInstance";

export const obtenerRoles = async () => {
  const res = await jsonServerInstance.get("/roles");
  return res.data;
};

export const crearRol = async (rol) => {
  const res = await jsonServerInstance.post("/roles", rol);
  return res.data;
};

export const eliminarRol = async (id) => {
   await jsonServerInstance.delete(`/roles/${id}`);
};

export const obtenerRolPorId = async (id) => {
  const res = await jsonServerInstance.get(`/roles/${id}`);
  return res.data;
};

export const actualizarRol = async (id, datos) => {
  await jsonServerInstance.put(`/roles/${id}`, datos);
  
};
