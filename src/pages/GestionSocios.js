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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import {
  fetchSocios as fetchSociosApi,
  eliminarSocio as eliminarSocioApi,
} from '../services/socioService';

const GestionSocios = () => {
  const [socios, setSocios] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [socioToDelete, setSocioToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    try {
      const res = await fetchSociosApi();
      setSocios(res);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
    }
  };

  const eliminarSocio = async (codigo) => {
    try {
      console.log("Eliminando socio con código:", codigo);
      await eliminarSocioApi(codigo);
      fetchSocios();
    } catch (error) {
      console.error("Error al eliminar socio:", error);
      alert("Ocurrió un error al eliminar el socio.");
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

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
  };

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
            {socios.map((socio) => (
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

      {/* Modal de confirmación */}
      <Modal
        open={showPopup}
        onClose={handleCancelDelete}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
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
    </Container>
  );
};

export default GestionSocios;
