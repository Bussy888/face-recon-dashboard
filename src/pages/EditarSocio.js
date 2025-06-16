import React, { useState, useEffect } from 'react';
import {
  cargarSocio as cargarSocioApi,
  actualizarSocio as actualizarSocioApi,
} from '../services/socioService';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Box,
  FormHelperText,
} from '@mui/material';
import CapturaRostro from '../components/CapturaRostro';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Página para editar un socio
 * 
 * @returns Componente JSX
 */
/*******  58b1a933-a5fa-4d0f-90a6-1f53ad4ca7c3  *******/const EditarSocio = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [socio, setSocio] = useState({
    codigo: '',
    nombre: '',
    apellido: '',
    correo: '',
    fecha_nacimiento: '',
    tipo_socio: '',
  });

  const [rostroDescriptor, setRostroDescriptor] = useState(null);

  const tiposSocio = [
    'Negocios Digitales',
    'Desarrollo Fullstack',
    'Analitica Digital',
  ];

  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellido: Yup.string().required('El apellido es obligatorio'),
    correo: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
    fecha_nacimiento: Yup.date().required('La fecha de nacimiento es obligatoria'),
    tipo_socio: Yup.string().required('La carrera es obligatoria'),
  });

  const cargarSocio = async () => {
    try {
      const response = await cargarSocioApi(codigo);
      const fechaFormateada = response.fecha_nacimiento
        ? new Date(response.fecha_nacimiento).toISOString().split('T')[0]
        : '';
      setSocio({
        ...response,
        fecha_nacimiento: fechaFormateada,
      });
    } catch (error) {
      console.error('Error al cargar los datos del socio:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const socioActualizado = {
        ...values,
        ...(rostroDescriptor && { face_descriptor: rostroDescriptor }),
      };
      await actualizarSocioApi(codigo, socioActualizado);
      alert('Estudiante actualizado exitosamente.');
      navigate('/gestion-socios');
    } catch (error) {
      console.error('Error actualizando estudiante:', error);
      alert('Error actualizando estudiante: ' + (error.response?.message || error.message));
    }
  };

  useEffect(() => {
    cargarSocio();
  }, [codigo]);

  return (
    <Box maxWidth={600} mx="auto" mt={8} p={4} borderRadius={2} boxShadow={3} bgcolor="white">
      <Typography variant="h4" align="center" gutterBottom>
        Editar Estudiante
      </Typography>

      <Formik
        enableReinitialize
        initialValues={socio}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, touched, errors }) => (
          <Form>
            <Grid container spacing={2}>
              {/* CI */}
              <Grid size={{ xs: 12 }}>
                <Field
                  as={TextField}
                  label="Carnet de Identidad"
                  fullWidth
                  name="codigo"
                  disabled
                  required
                />
              </Grid>

              {/* Nombre y Apellido */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  as={TextField}
                  label="Nombre"
                  name="nombre"
                  fullWidth
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  as={TextField}
                  label="Apellido"
                  name="apellido"
                  fullWidth
                  error={touched.apellido && Boolean(errors.apellido)}
                  helperText={touched.apellido && errors.apellido}
                  required
                />
              </Grid>

              {/* Correo */}
              <Grid size={{ xs: 12 }}>
                <Field
                  as={TextField}
                  label="Correo"
                  name="correo"
                  fullWidth
                  type="email"
                  error={touched.correo && Boolean(errors.correo)}
                  helperText={touched.correo && errors.correo}
                  required
                />
              </Grid>

              {/* Fecha de Nacimiento y Tipo */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  as={TextField}
                  label="Fecha de Nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={touched.fecha_nacimiento && Boolean(errors.fecha_nacimiento)}
                  helperText={touched.fecha_nacimiento && errors.fecha_nacimiento}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  required
                  error={touched.tipo_socio && Boolean(errors.tipo_socio)}
                >
                  <InputLabel>Carrera</InputLabel>
                  <Select
                    name="tipo_socio"
                    value={values.tipo_socio}
                    onChange={(e) => setFieldValue('tipo_socio', e.target.value)}
                    label="Carrera"
                  >
                    <MenuItem value=""><em>Seleccione una carrera</em></MenuItem>
                    {tiposSocio.map((tipo, index) => (
                      <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.tipo_socio && errors.tipo_socio}</FormHelperText>
                </FormControl>
              </Grid>

              {/* Captura Facial */}
              <Grid size={{ xs: 12 }}>
                <CapturaRostro
                  onCapture={({ image, descriptor }) => setRostroDescriptor(descriptor)}
                />
              </Grid>

              {/* Botones */}
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button variant="contained" color="error" onClick={() => navigate('/gestion-socios')}>
                    Cancelar
                  </Button>
                  <Button variant="contained" color="success" type="submit">
                    Actualizar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default EditarSocio;
