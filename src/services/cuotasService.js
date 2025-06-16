import jsonServerInstance from "../api/jsonInstance";

export const fetchCuotas = async (year) => {
  const res = await jsonServerInstance.get(`/socios/get-cuotas?year=${year}&page=1&limit=1000`);
  return res.data;
};

export const updateCuota = async (codigo_socio, mes, estado_pago, year) => {
  await jsonServerInstance.put(`/socios/update-cuota`, { codigo_socio, mes, estado_pago, year });

};

export const sociosPorPaginar = async (year, page, sociosPorPagina) => {
  const res = await jsonServerInstance.get(`/socios/get-cuotas?year=${year}&page=${page}&limit=${sociosPorPagina}`);
  return res;
};