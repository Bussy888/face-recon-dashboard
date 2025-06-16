import jsonServerInstance from "../api/jsonInstance";

export const getEventosApi = async () => {
  const res = await jsonServerInstance.get("/eventos");
  return res.data;
};

export const eliminarEventoApi = async (id) => {
  await jsonServerInstance.delete(`/eventos/${id}`);
};

export const crearEventoApi = async (evento) => {
  const res = await jsonServerInstance.post("/eventos", evento);
  return res.data;
};
export const actualizarEventoApi = async (id, datos) => {
  await jsonServerInstance.put(`/eventos/${id}`, datos);
};

export const enviarCorreoApi = async (evento) => {
  await jsonServerInstance.post("/eventos/enviar-correo", { evento });
};

export const getEventoIdApi = async (id) => {
  const res = await jsonServerInstance.get(`/eventos/${id}`);
  return res.data; // Retornamos solo los datos, no todo el response
};
