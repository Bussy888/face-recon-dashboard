import jsonServerInstance from "../api/jsonInstance";

export const fetchSocios = async () => {
  const res = await jsonServerInstance.get(`/socios/get-users`);
  return res.data.users;
};

export const eliminarSocio = async (codigo) => {
  await jsonServerInstance.delete(`/socios/delete-socio/${codigo}`);
};

export const cargarSocio = async (codigo) => {
  const res = await jsonServerInstance.get(`/socios/get-socio/${codigo}`);
  return res.data;
};

export const actualizarSocio = async (codigo, values) => {
  await jsonServerInstance.put(`/socios/update-socio/${codigo}`, values);
};
export const crearSocio = async (socio) => {
  const res = await jsonServerInstance.post(`/socios/register-socio`, socio);
  return res.data;
};
