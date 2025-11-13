// GestionCuotas.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Modal,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Checkbox,
  Divider
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { fetchCuotas, updateCuota } from '../services/cuotasService';
import { LineAxisOutlined } from '@mui/icons-material';

const meses = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
  'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
};

const monthNames = Object.keys(meses);

const GestionCuotas = () => {
  const [socios, setSocios] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const sociosPorPagina = 10;
  const [modifiedSocios, setModifiedSocios] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successSummary, setSuccessSummary] = useState([]);

  const currentMonth = new Date().getMonth() + 1;

  const validationSchema = Yup.object({
    year: Yup.number().required('Seleccione un año'),
  });

  useEffect(() => {
    const fetchSocios = async () => {
      try {
        const res = await fetchCuotas(year);
        const updated = res.cuotas.map(socio => {
          const cuotasBooleans = {};
          for (const mes in socio.cuotas) {
            cuotasBooleans[mes] = socio.cuotas[mes] === 1;
          }
          return { ...socio, cuotas: cuotasBooleans };
        });
        setSocios(updated);
      } catch (error) {
        console.error("Error al cargar cuotas:", error);
      }
    };
    fetchSocios();
  }, [year, showConfirmModal]);

  const filteredSocios = socios.filter(socio =>
    socio.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
    socio.codigo.toString().includes(filterText)
  );

  const sociosPaginaActual = filteredSocios.slice((page - 1) * sociosPorPagina, page * sociosPorPagina);

  const handleCheckboxChange = (codigo, mes, checked) => {
    setModifiedSocios(prev => {
      const updated = { ...prev };
      if (!updated[codigo]) updated[codigo] = {};
      updated[codigo][meses[mes]] = checked;
      return updated;
    });
  };

  const findLastPaidMonth = (cuotas) => {
    const mesesPagados = Object.entries(cuotas)
      .filter(([_, pagado]) => pagado)
      .map(([mes]) => meses[mes]);
    return Math.max(0, ...mesesPagados);
  };

  const getLastThreePaidMonths = (cuotas) => {
    return Object.entries(cuotas)
      .filter(([_, pagado]) => pagado)
      .map(([mes]) => mes)
      .slice(-3);
  };

  const getUnpaidMessage = (cuotas) => {
    const entries = Object.entries(cuotas);
    for (let i = 0; i < entries.length; i++) {
      const [mes, pagado] = entries[i];
      if (!pagado && meses[mes] <= currentMonth) {
        const posterioresPagados = entries.slice(i + 1).some(([_, val]) => val);
        if (!posterioresPagados) return `Mes pendiente: ${mes}`;
      }
    }
    return null;
  };

  const handleSubmitChanges = () => {
    const summary = [];
    for (const codigo in modifiedSocios) {
      for (const mesNum in modifiedSocios[codigo]) {
        const estado = modifiedSocios[codigo][mesNum];
        const mesNombre = Object.keys(meses).find(m => meses[m] == mesNum);
        summary.push({ codigo, mes: mesNombre, estado });
      }
    }
    setSuccessSummary(summary);
    setShowConfirmModal(true);
  };

  const confirmSubmitChanges = async () => {
    try {
      for (const item of successSummary) {
        await updateCuota(item.codigo, meses[item.mes], item.estado, year);
      }
      setModifiedSocios({});
    } catch (err) {
      console.error("Error al guardar cuotas:", err);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const Row = ({ socio }) => {
    const [open, setOpen] = useState(false);
    const lastPaid = findLastPaidMonth(socio.cuotas);
    const unpaidMsg = getUnpaidMessage(socio.cuotas);
    const ultimosPagos = getLastThreePaidMonths(socio.cuotas);

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton size="small" onClick={() => setOpen(o => !o)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{socio.codigo}</TableCell>
          <TableCell>{socio.nombre}</TableCell>
          <TableCell>
            {unpaidMsg && (
              <Typography variant="body2" color="error">{unpaidMsg}</Typography>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0 }}>
            <Collapse in={open}>
              <Box sx={{ m: 3, marginX: 10 }} onClick={(e) => e.stopPropagation()}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Últimos meses pagados: {ultimosPagos.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                </Typography>
                <Divider />
                <Typography variant="subtitle1" fontWeight={"bold"}>Mensualidades</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                  {monthNames.slice(lastPaid).map(mes => (
                    <Box key={mes} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography align="center">{mes.charAt(0).toUpperCase() + mes.slice(1)}</Typography>
                      <Checkbox
                        checked={modifiedSocios[socio.codigo]?.[meses[mes]] ?? socio.cuotas[mes]}
                        onChange={(e) => handleCheckboxChange(socio.codigo, mes, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Gestión de Cuotas
      </Typography>

      <Formik initialValues={{ year }} validationSchema={validationSchema} onSubmit={() => { }}>
        {({ setFieldValue }) => (
          <Form>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={year}
                label="Año"
                onChange={(e) => {
                  setFieldValue('year', e.target.value);
                  setYear(e.target.value);
                  setPage(1);
                }}
              >
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() + i;
                  return <MenuItem key={y} value={y}>{y}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Form>
        )}
      </Formik>

      <TextField
        fullWidth
        label="Buscar por código o nombre"
        sx={{ mb: 2 }}
        value={filterText}
        onChange={(e) => {
          setFilterText(e.target.value);
          setPage(1);
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Aviso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sociosPaginaActual.map(socio => (
              <Row key={socio.codigo} socio={socio} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box textAlign="center" mt={2}>
        <Button
          variant="outlined"
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          sx={{ mr: 1 }}
        >Anterior</Button>
        <Typography display="inline" mx={1}>Página {page}</Typography>
        <Button
          variant="outlined"
          onClick={() => setPage(prev => prev + 1)}
          disabled={page * sociosPorPagina >= filteredSocios.length}
        >Siguiente</Button>
      </Box>

      <Box textAlign="center" mt={2}>
        <Button
          variant="contained"
          onClick={handleSubmitChanges}
          disabled={Object.keys(modifiedSocios).length === 0}
        >
          Subir Cambios
        </Button>
      </Box>

      {/* Modal Confirmación y Resumen */}
      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 24, width: 400 }}>
          <Typography variant="h6" gutterBottom>¿Estás seguro de que deseas guardar los siguientes cambios?</Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
            {successSummary.map((item, i) => (
              <Typography key={i}>{`Socio ${item.codigo} - ${item.mes}: ${item.estado ? '✔️' : '❌'}`}</Typography>
            ))}
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
            <Button variant="contained" onClick={confirmSubmitChanges}>Confirmar</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default GestionCuotas;
