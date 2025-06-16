// src/services/empleadoService.js
import jsonServerInstance from "../api/jsonInstance";

export const crearEmpleado = async (empleado) => {
  await jsonServerInstance.post("/empleado/agregarEmpleado", empleado);

};

export const obtenerEmpleados = async () => {
  const res = await jsonServerInstance.get("/empleado");
  return res.data;
};

export const obtenerEmpleadoPorCorreo = async (correo) => {
  const res = await jsonServerInstance.get(`/empleado/${correo}`);
  return res.data;
};

export const actualizarEmpleado = async (correo, datos) => {
  await jsonServerInstance.put(`/empleado/${correo}`, datos);
  
};

export const eliminarEmpleado = async (correo) => {
  await jsonServerInstance.delete(`/empleado/${correo}`);

};
