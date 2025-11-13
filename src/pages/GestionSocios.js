import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Typography,
  IconButton,
  TextField,
  Snackbar,
} from '@mui/material';
import { Edit, Delete, Close as CloseIcon } from '@mui/icons-material';
import {
  fetchSocios as fetchSociosApi,
  eliminarSocio as eliminarSocioApi,
} from '../services/socioService';

const GestionSocios = () => {
  const [socios, setSocios] = useState([]);
  const [filteredSocios, setFilteredSocios] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [socioToDelete, setSocioToDelete] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const sociosPorPagina = 10;
  const navigate = useNavigate();

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // "success" o "error"

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    try {
      const res = await fetchSociosApi();
      setSocios(res);
      setFilteredSocios(res);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      setSnackbarMessage('Error al cargar estudiantes');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const eliminarSocio = async (codigo) => {
    try {
      await eliminarSocioApi(codigo);
      setSnackbarMessage('Estudiante eliminado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchSocios();
    } catch (error) {
      console.error("Error al eliminar socio:", error);
      setSnackbarMessage('Error al eliminar el estudiante');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = (codigo) => {
    setSocioToDelete(codigo);
    setShowPopup(true);
  };

  const handleConfirmDelete = () => {
    eliminarSocio(socioToDelete);
    setShowPopup(false);
    setSocioToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setSocioToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
  };

  const handleFilterChange = (e) => {
    const text = e.target.value;
    setFilterText(text);

    const filtered = socios.filter(
      (socio) =>
        socio.codigo.toString().includes(text) ||
        `${socio.nombre} ${socio.apellido}`.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredSocios(filtered);
    setPage(1);
  };

  const sociosPaginaActual = filteredSocios.slice(
    (page - 1) * sociosPorPagina,
    page * sociosPorPagina
  );

  return (
    <Container maxWidth="lg" sx={{ padding: 4 }}>
      <Typography variant="h4" fontWeight={'bold'} align="center" gutterBottom>
        Gestión de Estudiantes
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/registrar-estudiante')}
        >
          Registrar Estudiante
        </Button>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TextField
          label="Buscar por Código o Nombre"
          variant="outlined"
          fullWidth
          value={filterText}
          onChange={handleFilterChange}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Carnet de Identidad</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Carrera</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sociosPaginaActual.map((socio) => (
              <TableRow key={socio.codigo}>
                <TableCell>{socio.codigo}</TableCell>
                <TableCell>{`${socio.nombre} ${socio.apellido}`}</TableCell>
                <TableCell>{socio.tipoSocio}</TableCell>
                <TableCell>{socio.correo}</TableCell>
                <TableCell>{formatFecha(socio.fechaNacimiento)}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/editar-estudiante/${socio.codigo}`)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(socio.codigo)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <span style={{ margin: '0 10px' }}>Página {page}</span>
        <Button
          variant="outlined"
          onClick={() => setPage(page + 1)}
          disabled={page * sociosPorPagina >= filteredSocios.length}
        >
          Siguiente
        </Button>
      </Box>

      <Modal
        open={showPopup}
        onClose={handleCancelDelete}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 400,
            width: '100%',
          }}
        >
          <Typography variant="h6" gutterBottom>
            ¿Estás seguro que quieres eliminar este socio?
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Aceptar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar para notificaciones */}
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
    </Container>
  );
};

export default GestionSocios;
