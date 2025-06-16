import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Modal,
  Typography,
  Paper,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { fetchCuotas, sociosPorPaginar, updateCuota } from '../services/cuotasService';

// Define the months
const meses = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
  'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
};

const GestionCuotas = () => {
  const [socios, setSocios] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modifiedSocios, setModifiedSocios] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const sociosPorPagina = 10;

  const inicio = (page - 1) * sociosPorPagina;
  const sociosPaginaActual = socios.slice(inicio, inicio + sociosPorPagina);

  const validationSchema = Yup.object({
    year: Yup.number().required('Seleccione un año'),
  });

  // Fetch socios data
  useEffect(() => {
    const fetchSocios = async () => {
      setLoading(true);
      try {
        const res = await fetchCuotas(year);
        const updatedSocios = res.cuotas.map(socio => {
          const cuotasActualizadas = Object.keys(socio.cuotas).reduce((acc, mes) => {
            acc[mes] = socio.cuotas[mes] === 1;
            return acc;
          }, {});
          return { ...socio, cuotas: cuotasActualizadas };
        });
        setSocios(updatedSocios);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocios();
  }, [year, showSuccessModal]);

  const handleYearChange = (e) => {
    setYear(e.target.value);
    setPage(1);
  };

  const handleCheckboxChange = (codigo_socio, mes, estado_pago) => {
    setModifiedSocios(prevState => {
      const updatedSocio = { ...prevState };
      if (!updatedSocio[codigo_socio]) {
        updatedSocio[codigo_socio] = {};
      }
      updatedSocio[codigo_socio][meses[mes]] = estado_pago;
      return updatedSocio;
    });
  };

  const handleSubmitChanges = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmitChanges = async () => {
  setShowConfirmModal(false);
  try {
    // Subir los cambios a la base de datos
    for (let codigo_socio in modifiedSocios) {
      for (let mes in modifiedSocios[codigo_socio]) {
        const estado_pago = modifiedSocios[codigo_socio][mes];
        await updateCuota(codigo_socio, mes, estado_pago, year);
      }
    }
    console.log("Estudiantes por paginar:", sociosPorPagina);
    // Después de los cambios, obtener los estudiantes actualizados con paginación
    const res = await sociosPorPaginar(year, page, sociosPorPagina);
    const updatedSocios = res.cuotas.map(socio => {
      const cuotasActualizadas = Object.keys(socio.cuotas).reduce((acc, mes) => {
        acc[mes] = socio.cuotas[mes] === 1;
        return acc;
      }, {});
      return { ...socio, cuotas: cuotasActualizadas };
    });

    // Actualizar el estado de los estudiantes
    setSocios(updatedSocios);
    setModifiedSocios({});

    // Mostrar el modal de éxito
    setShowSuccessModal(true);

  } catch (error) {
    console.error("Error al guardar los cambios:", error);
    alert('Hubo un error al guardar los cambios.');
  }
};




  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" fontWeight={'bold'} gutterBottom>
              Gestión de Mensualidades
            </Typography>
    
      <Formik
        initialValues={{ year }}
        validationSchema={validationSchema}
        onSubmit={() => {}}
      >
        {({ setFieldValue }) => (
          <Form>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={year}
                onChange={(e) => {
                  setFieldValue('year', e.target.value);
                  handleYearChange(e);
                }}
                label="Año"
              >
                {[...Array(5)].map((_, i) => {
                  const yearOption = new Date().getFullYear() + i;
                  return <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Form>
        )}
      </Formik>

      {/* Table displaying socios */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Estudiante</TableCell>
              {Object.keys(meses).map(mes => (
                <TableCell key={mes}>{mes.charAt(0).toUpperCase() + mes.slice(1)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan="14">Cargando...</TableCell></TableRow>
            ) : (
              sociosPaginaActual.map(socio => (
                <TableRow key={socio.codigo}>
                  <TableCell>{socio.codigo}</TableCell>
                  <TableCell>{socio.nombre}</TableCell>
                  {Object.keys(meses).map(mes => (
                    <TableCell key={mes}>
                      <Checkbox
                        checked={modifiedSocios[socio.codigo]?.[meses[mes]] !== undefined
                          ? modifiedSocios[socio.codigo][meses[mes]]
                          : socio.cuotas[mes]}
                        onChange={(e) => handleCheckboxChange(socio.codigo, mes, e.target.checked)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Submit Changes Button */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitChanges}
          disabled={loading || Object.keys(modifiedSocios).length === 0}
        >
          Subir Cambios
        </Button>
      </Box>

      {/* Pagination Buttons */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          disabled={loading}
        >
          Anterior
        </Button>
        <span style={{ margin: '0 10px' }}>Página {page}</span>
        <Button
          variant="outlined"
          onClick={() => setPage(page + 1)}
          disabled={loading}
        >
          Siguiente
        </Button>
      </Box>

      {/* Confirm Modal */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 3
        }}>
          <Typography variant="h6" gutterBottom>¿Estás seguro de que deseas guardar los cambios?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={confirmSubmitChanges}>Confirmar</Button>
          </Box>
        </Box>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 3
        }}>
          <Typography variant="h6" gutterBottom>¡Cambios guardados correctamente!</Typography>
          <Button variant="contained" color="primary" onClick={() => setShowSuccessModal(false)}>
            Cerrar
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default GestionCuotas;
