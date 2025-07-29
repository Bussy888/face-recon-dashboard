import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchUltimasEntradas, getSocioPorCodigo, registrarEntradaManual } from '../services/socioService';

const GestionAsistencia = () => {
  const [ultimasEntradas, setUltimasEntradas] = useState([]);
  const [socioEncontrado, setSocioEncontrado] = useState(null);
  const [codigoBuscado, setCodigoBuscado] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    obtenerUltimasEntradas();
  }, []);

  const obtenerUltimasEntradas = async () => {
    try {
      const data = await fetchUltimasEntradas();
      setUltimasEntradas(data);
    } catch (error) {
      console.error('Error al obtener entradas:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      codigo_socio: '',
      fecha: '',
      hora: '',
    },
    validationSchema: Yup.object({
      codigo_socio: Yup.string().required('Campo requerido'),
      fecha: Yup.string().required('Campo requerido'),
      hora: Yup.string().required('Campo requerido'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await registrarEntradaManual(values);
        alert('Entrada registrada correctamente');
        resetForm();
        setSocioEncontrado(null);
        setOpenDialog(false);
        obtenerUltimasEntradas();
      } catch (error) {
        console.error('Error al registrar entrada:', error);
        alert('Hubo un error al registrar la entrada');
      }
    },
  });

  const buscarSocio = async (codigo) => {
    try {
      const data = await getSocioPorCodigo(codigo);
      setSocioEncontrado(data);
    } catch (error) {
      setSocioEncontrado(null);
    }
  };

  const handleCodigoChange = (e) => {
    const codigo = e.target.value;
    formik.setFieldValue('codigo_socio', codigo);
    setCodigoBuscado(codigo);

    if (codigo.length >= 3) {
      buscarSocio(codigo);
    } else {
      setSocioEncontrado(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Gestión de Asistencia
      </Typography>

      {/* Botón para abrir el formulario en diálogo */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Añadir entrada manual
        </Button>
      </Box>

      {/* Tabla con últimas 10 entradas */}
      <Typography variant="h6" gutterBottom>
        Últimas 10 Entradas Registradas
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Carrera</TableCell>
              <TableCell>Fecha y Hora</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ultimasEntradas.map((entrada) => (
              <TableRow key={entrada.id_entrada}>
                <TableCell>{entrada.codigo}</TableCell>
                <TableCell>{entrada.nombre} {entrada.apellido}</TableCell>
                <TableCell>{entrada.tipo_socio}</TableCell>
                <TableCell>{new Date(entrada.fecha_ingreso).toLocaleString('es-BO')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo con el formulario */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registrar Entrada Manual</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit}>

            <Grid container spacing={2} mt={1}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Código del estudiante"
                  name="codigo_socio"
                  value={codigoBuscado}
                  onChange={handleCodigoChange}
                  fullWidth
                  error={formik.touched.codigo_socio && Boolean(formik.errors.codigo_socio)}
                  helperText={formik.touched.codigo_socio && formik.errors.codigo_socio}
                />
              </Grid>

              {socioEncontrado && (
                <Grid size={{ xs: 12 }} >
                  <Box p={2} border="1px solid #ccc" borderRadius={2}>
                    <Typography><strong>Nombre:</strong> {socioEncontrado.nombre} {socioEncontrado.apellido}</Typography>
                    <Typography><strong>Carrera:</strong> {socioEncontrado.tipo_socio}</Typography>
                    <Typography><strong>Correo:</strong> {socioEncontrado.correo}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  type="date"
                  label="Fecha"
                  name="fecha"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={formik.values.fecha}
                  onChange={formik.handleChange}
                  error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                  helperText={formik.touched.fecha && formik.errors.fecha}
                />
              </Grid>

              <Grid size={{  xs: 12, sm: 6  }}>
                <TextField
                  type="time"
                  label="Hora"
                  name="hora"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={formik.values.hora}
                  onChange={formik.handleChange}
                  error={formik.touched.hora && Boolean(formik.errors.hora)}
                  helperText={formik.touched.hora && formik.errors.hora}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
  variant="outline"
  onClick={() => {
    formik.resetForm();
    setOpenDialog(false); // cierra el modal
       // limpia todos los campos
  }}
>
  Cancelar
</Button>

          <Button onClick={formik.handleSubmit} variant="contained">Registrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionAsistencia;
