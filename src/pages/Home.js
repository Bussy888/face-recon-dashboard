import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { format, isValid } from 'date-fns';
import {
  Box,
  Button,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Snackbar,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import {
  cargarVisitas as cargarVisitasApi,
  cargarIngresosHoy as cargarIngresosHoyApi,
  cargarPagosMes as cargarPagosMesApi,
  cargarPagosTipoSocio as cargarPagosTipoSocioApi,
  exportarExcel as exportarExcelApi,
  exportarPagosExcel as exportarPagosExcelApi,
} from '../services/reporteAccesoService';

// Registrar escalas y elementos para ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const Home = () => {
  const [visitas, setVisitas] = useState([]);
  const [ingresosHoy, setIngresosHoy] = useState([]);
  const [pagosMes, setPagosMes] = useState([]);
  const [pagosTipoSocio, setPagosTipoSocio] = useState([]);
  const [pagosMesPorTipoSocio, setPagosMesPorTipoSocio] = useState({});

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatFecha = (fecha) => {
    if (!fecha || !isValid(new Date(fecha))) return '';
    return format(new Date(fecha), 'dd/MM/yyyy');
  };

  const getColorForTipoSocio = (tipo_socio) => {
    switch (tipo_socio) {
      case 'Negocios Digitales':
        return '#dc3545';
      case 'Desarrollo Fullstack':
        return '#28a745';
      case 'Analitica Digital':
        return '#ffc107';
      default:
        return '#000000';
    }
  };

  const fechas = [...new Set(visitas.map(v => formatFecha(v.periodo)))];
  const tiposSocio = [...new Set(visitas.map(v => v.carrera))];
  const datasets = tiposSocio.map((tipo) => ({
    label: tipo,
    borderColor: getColorForTipoSocio(tipo),
    backgroundColor: 'transparent',
    data: fechas.map(fecha => {
      const visita = visitas.find(
        (v) => formatFecha(v.periodo) === fecha && v.carrera === tipo
      );
      return visita ? visita.ingresos_socios : 0;
    }),
  }));

  const cargarVisitas = async () => {
    try {
      const res = await cargarVisitasApi();
      setVisitas(res);
    } catch (error) {
      console.error('Error al cargar visitas:', error);
      showSnackbar('Error al cargar los datos de visitas.', 'error');
    }
  };

  const cargarIngresosHoy = async () => {
    try {
      const res = await cargarIngresosHoyApi();
      if (Array.isArray(res)) {
        setIngresosHoy(res);
      } else {
        setIngresosHoy([]);
        showSnackbar('Formato inesperado de ingresos de hoy.', 'error');
      }
    } catch (error) {
      console.error('Error al cargar los ingresos de hoy:', error);
      showSnackbar('Error al cargar los ingresos de hoy.', 'error');
    }
  };

  const cargarPagosMes = async () => {
    try {
      const res = await cargarPagosMesApi();
      setPagosMes(res);

      const pagosPorTipo = {};
      res.forEach((pago) => {
        const { tipo_socio, mes, año, cantidad_pagos } = pago;
        const mesAño = `${mes}/${año}`;
        if (!pagosPorTipo[mesAño]) pagosPorTipo[mesAño] = {};
        pagosPorTipo[mesAño][tipo_socio] = cantidad_pagos;
      });

      setPagosMesPorTipoSocio(pagosPorTipo);
    } catch (error) {
      console.error('Error al cargar pagos por mes:', error);
      showSnackbar('Error al cargar los pagos del mes.', 'error');
    }
  };

  const cargarPagosTipoSocio = async () => {
    try {
      const res = await cargarPagosTipoSocioApi();
      setPagosTipoSocio(res);
    } catch (error) {
      console.error('Error al cargar pagos por tipo de socio:', error);
      showSnackbar('Error al cargar los pagos por carrera.', 'error');
    }
  };

  const exportarExcel = async () => {
    try {
      await exportarExcelApi();
      showSnackbar('Excel de ingresos exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar ingresos:', error);
      showSnackbar('Error al exportar Excel de ingresos', 'error');
    }
  };

  const exportarPagosExcel = async () => {
    try {
      await exportarPagosExcelApi();
      showSnackbar('Excel de pagos exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar pagos:', error);
      showSnackbar('Error al exportar Excel de pagos', 'error');
    }
  };

  useEffect(() => {
    cargarVisitas();
    cargarIngresosHoy();
    cargarPagosMes();
    cargarPagosTipoSocio();
  }, []);

  const pieChartData = {
    labels: ingresosHoy.map(i => i.carrera),
    datasets: [
      {
        data: ingresosHoy.map(i => i.ingresos_socios),
        backgroundColor: ingresosHoy.map(i => getColorForTipoSocio(i.carrera)),
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  const chartData = {
    labels: fechas,
    datasets: datasets,
  };

  const allTiposSocio = [
    ...new Set(
      Object.values(pagosMesPorTipoSocio).flatMap(mesData => Object.keys(mesData))
    ),
  ];

  const pagosMesChart = {
    labels: Object.keys(pagosMesPorTipoSocio).sort((a, b) => {
      const [mesA, añoA] = a.split('/').map(Number);
      const [mesB, añoB] = b.split('/').map(Number);
      return añoA !== añoB ? añoA - añoB : mesA - mesB;
    }),
    datasets: allTiposSocio.map((tipo_socio) => ({
      label: tipo_socio,
      data: Object.keys(pagosMesPorTipoSocio)
        .sort((a, b) => {
          const [mesA, añoA] = a.split('/').map(Number);
          const [mesB, añoB] = b.split('/').map(Number);
          return añoA !== añoB ? añoA - añoB : mesA - mesB;
        })
        .map((mesAño) => pagosMesPorTipoSocio[mesAño]?.[tipo_socio] || 0),
      borderColor: getColorForTipoSocio(tipo_socio),
      backgroundColor: 'transparent',
    })),
  };

  const pagosTipoSocioChart = {
    labels: pagosTipoSocio.map((p) => p.tipo_socio),
    datasets: [
      {
        data: pagosTipoSocio.map((p) => p.cantidad),
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#6610f2', '#dc3545', '#17a2b8'],
      },
    ],
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1300, mx: 'auto' }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="column" gap={3}>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Historial de Ingresos Registrados
            </Typography>
            <Button variant="contained" color="primary" onClick={exportarExcel}>
              📥 Exportar Ingresos Excel
            </Button>
          </Paper>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución de Ingresos de Hoy
            </Typography>
            {ingresosHoy.length > 0 ? (
              <Box sx={{ width: '60%', maxWidth: 500, mx: 'auto' }}>
                <Pie data={pieChartData} />
              </Box>
            ) : (
              <Typography color="text.secondary">
                No hay suficientes datos para mostrar el gráfico de pastel.
              </Typography>
            )}
          </Paper>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Gráfico de Ingresos por Día (Visitas)
            </Typography>
            <Line data={chartData} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Explicación:</strong> El gráfico muestra el número de ingresos diarios de los estudiantes.
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} display="flex" flexDirection="column" gap={3}>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Pagos
            </Typography>
            <Button variant="contained" color="primary" onClick={exportarPagosExcel}>
              📥 Exportar Pagos Excel
            </Button>
          </Paper>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pagos por Carrera del Estudiante
            </Typography>
            {pagosTipoSocio.length > 0 ? (
              <Box sx={{ width: '60%', maxWidth: 500, mx: 'auto' }}>
                <Pie data={pagosTipoSocioChart} />
              </Box>
            ) : (
              <Typography color="text.secondary">No hay datos de pagos por Carrera del Estudiante.</Typography>
            )}
          </Paper>
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pagos por Mes y Carrera del Estudiante
            </Typography>
            {pagosMes.length > 0 ? (
              <Line data={pagosMesChart} />
            ) : (
              <Typography color="text.secondary">No hay datos de pagos por mes.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

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

export default Home;
