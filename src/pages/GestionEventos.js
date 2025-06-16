import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, CircularProgress, Dialog, DialogActions, DialogTitle, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, Box } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon, Email as EmailIcon } from '@mui/icons-material';
import Paper from '@mui/material/Paper';
import { eliminarEventoApi, enviarCorreoApi, getEventosApi } from '../services/eventosService';

const GestionEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // "success" o "error"
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await getEventosApi();
      setEventos(res);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarEvento = async (id) => {
    try {
      await eliminarEventoApi(id);
      setSnackbarMessage('Evento eliminado exitosamente');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchEventos(); // Actualiza la lista de eventos después de eliminar
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      setSnackbarMessage('Error al eliminar el evento');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const enviarCorreo = async (evento) => {
    try {
      await enviarCorreoApi(evento);
      setSnackbarMessage(`Correo enviado para "${evento.nombre_evento}"`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      setSnackbarMessage('Error al enviar correo');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowPopup(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      eliminarEvento(itemToDelete);
    }
    setShowPopup(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
    setItemToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" fontWeight={'bold'} gutterBottom>
        Gestión de Eventos
      </Typography>

      {/* Crear Evento Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>

        <Button variant="contained" color="primary" onClick={() => navigate('/crear-evento')}>
          Crear Evento
        </Button>
      </Box>

      {/* Cargando Spinner */}
      {loading ? (
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventos.map((evento) => (
                <TableRow key={evento.id_evento}>
                  <TableCell>{formatFecha(evento.fecha_evento)}</TableCell>
                  <TableCell>{evento.nombre_evento}</TableCell>
                  <TableCell>{evento.descripcion_evento}</TableCell>
                  <TableCell>
                    <IconButton color="warning" onClick={() => enviarCorreo(evento)} title="Enviar correo">
                      <EmailIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => navigate(`/editar-evento/${evento.id_evento}`)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(evento.id_evento)} title="Eliminar">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Popup de confirmación de eliminación */}
      <Dialog open={showPopup} onClose={handleCancelDelete}>
        <DialogTitle>¿Estás seguro que quieres eliminar este evento?</DialogTitle>
        <DialogActions>
          <Button variant="contained" onClick={handleCancelDelete} color="error">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleConfirmDelete} color="success">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar notificaciones */}
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

export default GestionEventos;
