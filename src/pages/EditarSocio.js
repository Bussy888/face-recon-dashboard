import React, { useState, useEffect } from 'react';
import {
  cargarSocio as cargarSocioApi,
  actualizarSocio as actualizarSocioApi,
  obtenerTiposSocio,
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
  Snackbar,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import CapturaRostro from '../components/CapturaRostro';

const EditarSocio = () => {
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
  const [tiposSocio, setTiposSocio] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
      console.log('response:', response); // <-- Agregado para debug
      setSocio({
        ...response,
        fecha_nacimiento: fechaFormateada,
        tipo_socio: response.tipo_socio || '', // <-- Solo el valor, ya es el id
      });
    } catch (error) {
      console.error('Error al cargar los datos del socio:', error);
    }
  };

  const cargarTiposSocio = async () => {
    try {
      const data = await obtenerTiposSocio();
      setTiposSocio(data.nombre_tipo ? [data] : data);
    } catch (error) {
      console.error('Error al cargar tipos de socio:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Valores del formulario:', values); // <-- Agregado para debug
      const socioActualizado = {
        ...values,
        ...(rostroDescriptor && { face_descriptor: rostroDescriptor }),
      };
      await actualizarSocioApi(codigo, socioActualizado);
      setSnackbarMessage('Estudiante actualizado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/gestion-estudiante'), 1500); // redirige con retraso
    } catch (error) {
      console.error('Error actualizando estudiante:', error);
      setSnackbarMessage('Error actualizando estudiante: ' + (error.response?.message || error.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    cargarSocio();
    cargarTiposSocio();
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
                    {tiposSocio.map((tipo) => {
                      console.log('tipo:', tipo); // <-- Agregado para debug
                      return (
                        <MenuItem key={tipo.id_tipo} value={tipo.id_tipo}>
                          {tipo.nombre_tipo}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText>{touched.tipo_socio && errors.tipo_socio}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CapturaRostro
                  onCapture={({ image, descriptor }) => setRostroDescriptor(descriptor)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button variant="contained" color="error" onClick={() => navigate('/gestion-estudiante')}>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        ContentProps={{
          style: {
            backgroundColor: snackbarSeverity === 'error' ? '#f44336' : '#4caf50',
            color: 'white',
          },
        }}
      />
    </Box>
  );
};

export default EditarSocio;
