import jsonServerInstance from "../api/jsonInstance";

export const cargarResumen = async () => {
  const res = await jsonServerInstance.get(`/reportes-acceso/resumen`);
  return res.data;
};

export const cargarVisitas = async () => {
  const res = await jsonServerInstance.get(`/reportes-acceso/visitas?periodo=dia`);
  return res.data;
};
export const cargarIngresosHoy = async () => {
  const res = await jsonServerInstance.get(`/reportes-acceso/ingresosHoy`);
  return res.data;
};

export const cargarPagosMes = async () => {
  const res = await jsonServerInstance.get(`/reportes-acceso/pagosPorMes`);
  return res.data;
};

export const cargarPagosTipoSocio = async () => {
  const res = await jsonServerInstance.get(`/reportes-acceso/pagosPorTipoSocio`);
  return res.data;
};
const API_URL = process.env.REACT_APP_API_URL;

export const exportarExcel = () => {
  window.open(`${API_URL}/reportes-acceso/exportar`, '_blank');
};

export const exportarPagosExcel = () => {
  window.open(`${API_URL}/reportes-acceso/exportarPagos`, '_blank');
};
