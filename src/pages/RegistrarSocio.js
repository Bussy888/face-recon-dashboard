import { useRef, useState, useEffect } from 'react';
import {
  crearSocio as crearSocioApi,
  obtenerTiposSocio,
} from '../services/socioService';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import CapturaRostro from '../components/CapturaRostro';
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

const RegistrarSocio = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [rostroDescriptor, setRostroDescriptor] = useState(null);
  const [tiposSocio, setTiposSocio] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // "success" | "error"

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await obtenerTiposSocio();
        setTiposSocio(data.nombre_tipo ? [data] : data);
      } catch (error) {
        console.error('Error al cargar tipos de socio:', error);
        setSnackbarMessage('Error al cargar tipos de socio');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchTipos();
  }, []);

  const validationSchema = Yup.object({
    codigo: Yup.string().required('El carnet de identidad es obligatorio'),
    nombre: Yup.string().required('El nombre es obligatorio'),
    apellido: Yup.string().required('El apellido es obligatorio'),
    correo: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
    fecha_nacimiento: Yup.date().required('La fecha de nacimiento es obligatoria'),
    tipo_socio: Yup.string().required('El tipo de socio es obligatorio'),
  });

  const handleSubmit = async (values) => {
    if (!rostroDescriptor) {
      setSnackbarMessage('Por favor capture el rostro antes de registrar.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const socioConRostro = {
        ...values,
        face_descriptor: rostroDescriptor,
      };
      await crearSocioApi(socioConRostro);
      setSnackbarMessage('Socio registrado exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => navigate('/gestion-estudiante'), 1500);
    } catch (error) {
      console.error('Error registrando socio:', error);
      setSnackbarMessage('Error registrando socio: ' + (error.response?.message || error.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={8} p={4} borderRadius={2} boxShadow={3} bgcolor="white">
      <Typography variant="h4" align="center" gutterBottom>
        Registrar Nuevo Estudiante
      </Typography>

      <Formik
        initialValues={{
          codigo: '',
          nombre: '',
          apellido: '',
          correo: '',
          fecha_nacimiento: '',
          tipo_socio: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, touched, errors }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12}}>
                <Field as={TextField} label="Carnet de Identidad" fullWidth name="codigo"
                  error={touched.codigo && Boolean(errors.codigo)}
                  helperText={touched.codigo && errors.codigo} required />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field as={TextField} label="Nombre" fullWidth name="nombre"
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field as={TextField} label="Apellido" fullWidth name="apellido"
                  error={touched.apellido && Boolean(errors.apellido)}
                  helperText={touched.apellido && errors.apellido} required />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Field as={TextField} label="Correo" type="email" fullWidth name="correo"
                  error={touched.correo && Boolean(errors.correo)}
                  helperText={touched.correo && errors.correo} required />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Field as={TextField} label="Fecha de Nacimiento" type="date" fullWidth name="fecha_nacimiento"
                  InputLabelProps={{ shrink: true }}
                  error={touched.fecha_nacimiento && Boolean(errors.fecha_nacimiento)}
                  helperText={touched.fecha_nacimiento && errors.fecha_nacimiento} required />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required error={touched.tipo_socio && Boolean(errors.tipo_socio)}>
                  <InputLabel>Carrera</InputLabel>
                  <Select
                    name="tipo_socio"
                    value={values.tipo_socio}
                    onChange={(e) => setFieldValue('tipo_socio', e.target.value)}
                    label="Carrera"
                  >
                    <MenuItem value=""><em>Seleccione una carrera</em></MenuItem>
                    {tiposSocio.map((tipo) => (
                      <MenuItem key={tipo.id_tipo } value={tipo.id_tipo }>
                        {tipo.nombre_tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{touched.tipo_socio && errors.tipo_socio}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CapturaRostro onCapture={({ image, descriptor }) => {
                  setRostroDescriptor(descriptor);
                }} />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Button variant="contained" color="error" onClick={() => navigate('/gestion-estudiante')}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained" color="success">
                    Registrar
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <canvas ref={canvasRef} className="hidden" style={{ display: 'none' }} />
          </Form>
        )}
      </Formik>

      {/* Snackbar de notificaciones */}
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

export default RegistrarSocio;
