import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Stack } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { actualizarEventoApi, crearEventoApi, getEventoIdApi } from '../services/eventosService';

const CrearEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({
    nombre_evento: '',
    descripcion_evento: '',
    fecha_evento: ''
  });

  // Función para convertir fecha ISO a formato yyyy-mm-dd
  const convertirFecha = (fecha) => {
  const [año, mes, dia] = fecha.split('-');
  return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

  useEffect(() => {
    const cargarEvento = async () => {
      if (id) {
        try {
          const data = await getEventoIdApi(id); // ya es .data directamente
          const fechaConvertida = data.fecha_evento
            ? convertirFecha(data.fecha_evento)
            : '';
          setInitialValues({
            ...data,
            fecha_evento: fechaConvertida,
          });
        } catch (error) {
          console.error("Error al obtener el evento:", error);
        }
      }
    };

    cargarEvento();
  }, [id]);

  const validationSchema = Yup.object({
    nombre_evento: Yup.string().required('Este campo es obligatorio'),
    descripcion_evento: Yup.string().required('Este campo es obligatorio'),
    fecha_evento: Yup.date().required('Este campo es obligatorio')
  });

  const handleSubmit = async (values) => {
    const valoresAEnviar = {
      ...values,
      fecha_evento: values.fecha_evento + 'T12:00:00'
    };
    if (id) {
      actualizarEventoApi(id, valoresAEnviar);
    } else {
      crearEventoApi(valoresAEnviar);
    }
    navigate('/gestion-eventos');
  };

  return (
    <Box
      maxWidth={500}
      mx="auto"
      mt={8}
      p={4}
      borderRadius={2}
      boxShadow={3}
      bgcolor="white"
    >
      <Typography variant="h5" textAlign="center" mb={3}>
        {id ? 'Editar Evento' : 'Crear Evento'}
      </Typography>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          handleChange,
          handleBlur,
          touched,
          errors,
          isSubmitting
        }) => (
          <Form>
            <Stack spacing={3}>
              <TextField
                label="Nombre del Evento"
                name="nombre_evento"
                fullWidth
                value={values.nombre_evento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.nombre_evento && Boolean(errors.nombre_evento)}
                helperText={touched.nombre_evento && errors.nombre_evento}
              />

              <TextField
                label="Fecha del Evento"
                type="date"
                name="fecha_evento"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.fecha_evento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fecha_evento && Boolean(errors.fecha_evento)}
                helperText={touched.fecha_evento && errors.fecha_evento}
              />

              <TextField
                label="Descripción"
                name="descripcion_evento"
                fullWidth
                multiline
                rows={4}
                value={values.descripcion_evento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.descripcion_evento &&
                  Boolean(errors.descripcion_evento)
                }
                helperText={
                  touched.descripcion_evento && errors.descripcion_evento
                }
              />

              <Stack direction="row" justifyContent="space-between">
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => navigate('/gestion-eventos')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={isSubmitting}
                >
                  {id ? 'Guardar Cambios' : 'Crear Evento'}
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CrearEvento;
