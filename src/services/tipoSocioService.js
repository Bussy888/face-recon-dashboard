import jsonServerInstance from "../api/jsonInstance";

// Obtener todos los tipos de socio
export const obtenerCarreras  = async () => {
  const res = await jsonServerInstance.get('/tipos-socio');
  return res.data;
};

// Crear un nuevo tipo de socio
export const crearCarrera  = async (tipoSocio) => {
  const res = await jsonServerInstance.post('/tipos-socio', tipoSocio);
  return res.data;
};

// Eliminar un tipo de socio por ID
export const eliminarCarrera  = async (id) => {
    console.log(id);
  await jsonServerInstance.delete(`/tipos-socio/${id}`);
};

// Actualizar un tipo de socio por ID
export const actualizarTipoSocio = async (id, tipoSocio) => {
  const res = await jsonServerInstance.put(`/tipos-socio/${id}`, tipoSocio);
  return res.data;
};
