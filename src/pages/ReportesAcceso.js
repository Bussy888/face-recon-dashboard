import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2'; // Importamos Pie para el gráfico de pastel
import { format, isValid } from 'date-fns';  // Para formatear las fechas y verificar su validez
import 'chart.js/auto';
import './Home.css';

const ReportesAcceso = () => {
  const [resumen, setResumen] = useState({ total_socios: 0, total_invitados: 0 });
  const [visitas, setVisitas] = useState([]);
  const [ingresosHoy, setIngresosHoy] = useState({ socios: 0, invitados: 0 }); // Para los ingresos hoy
  const [pagosMes, setPagosMes] = useState([]);
  const [pagosTipoSocio, setPagosTipoSocio] = useState([]);
  const [pagosMesPorTipoSocio, setPagosMesPorTipoSocio] = useState({}); // Nueva variable de estado
  const navigate = useNavigate();

  // Función para elegir colores para cada tipo de socio
  const getColorForTipoSocio = (tipo_socio) => {
    switch (tipo_socio) {
      case 'Activo Presente':
        return '#007bff';
      case 'Activo Ausente':
        return '#28a745';
      case 'Emérito':
        return '#ffc107';
      case 'Especial':
        return '#6610f2';
      case 'Diplomático':
        return '#dc3545';
      case 'Corporativo':
        return '#17a2b8';
      default:
        return '#000000'; // Color predeterminado
    }
  };

  // Cargar Resumen de Accesos
  const cargarResumen = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reportesAcceso/resumen');
      setResumen(res.data);
    } catch (error) {
      console.error('Error al cargar el resumen:', error);
    }
  };

  // Cargar Visitas por Día
  const cargarVisitas = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reportesAcceso/visitas?periodo=dia'); // Siempre "dia"
      setVisitas(res.data);
    } catch (error) {
      console.error('Error al cargar visitas:', error);
      alert('Hubo un error al cargar los datos de visitas. Por favor, inténtalo de nuevo.');
    }
  };

  // Cargar Ingresos de Hoy
  const cargarIngresosHoy = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reportesAcceso/ingresosHoy');
      setIngresosHoy({
        socios: Number(res.data.ingresos_socios),
        invitados: Number(res.data.ingresos_invitados),
      });
    } catch (error) {
      console.error('Error al cargar los ingresos de hoy:', error);
    }
  };

  // Cargar Pagos por Mes
  const cargarPagosMes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reportesAcceso/pagosPorMes');
      setPagosMes(res.data);

      // Agrupar pagos por tipo de socio
      const pagosPorTipo = {};
      res.data.forEach(pago => {
        const { tipo_socio, mes, año, cantidad_pagos } = pago;
        const mesAño = `${mes}/${año}`; // Formato "mes/año"

        if (!pagosPorTipo[mesAño]) {
          pagosPorTipo[mesAño] = {}; // Inicializar mes/año
        }

        // Acumular los pagos por tipo de socio
        pagosPorTipo[mesAño][tipo_socio] = cantidad_pagos;
      });

      setPagosMesPorTipoSocio(pagosPorTipo); // Actualizar el estado
    } catch (error) {
      console.error('Error al cargar pagos por mes:', error);
    }
  };

  // Cargar Pagos por Tipo de Socio
  const cargarPagosTipoSocio = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reportesAcceso/pagosPorTipoSocio');
      setPagosTipoSocio(res.data);
    } catch (error) {
      console.error('Error al cargar pagos por tipo de socio:', error);
    }
  };

  // Exportar Accesos a Excel
  const exportarExcel = () => {
    window.open('http://localhost:5000/api/reportesAcceso/exportar', '_blank');
  };

  // Exportar Pagos a Excel
  const exportarPagosExcel = () => {
    window.open('http://localhost:5000/api/reportesAcceso/exportarPagos', '_blank');
  };

  useEffect(() => {
    cargarResumen();
    cargarVisitas();
    cargarIngresosHoy();
    cargarPagosMes();
    cargarPagosTipoSocio();
  }, []);

  // Obtener el año actual de forma dinámica
  const currentYear = new Date().getFullYear();

  // Formatear la fecha
  const formatFecha = (fecha) => {
    if (!fecha || !isValid(new Date(fecha))) return ''; // Si no hay fecha o es inválida, retornar vacío
    return format(new Date(fecha), 'dd/MM/yyyy'); // Día, mes y año
  };

  // Datos para el gráfico de ingresos por día (línea)
  const chartData = {
    labels: visitas.length ? visitas.map(v => formatFecha(v.periodo)) : [],
    datasets: [
      {
        label: 'Socios',
        data: visitas.length ? visitas.map(v => v.ingresos_socios) : [],
        borderColor: '#007bff',
        backgroundColor: 'transparent',
      },
      {
        label: 'Invitados',
        data: visitas.length ? visitas.map(v => v.ingresos_invitados) : [],
        borderColor: '#28a745',
        backgroundColor: 'transparent',
      },
    ],
  };

  // Datos para el gráfico de pastel (ingresos hoy)
  const pieChartData = {
    labels: ['Socios', 'Invitados'],
    datasets: [
      {
        data: [ingresosHoy.socios, ingresosHoy.invitados],
        backgroundColor: ['#007bff', '#28a745'],
        borderColor: ['#007bff', '#28a745'],
        borderWidth: 1,
      },
    ],
  };

 // Datos para el gráfico de pagos por mes
const pagosMesChart = {
  labels: Object.keys(pagosMesPorTipoSocio)
    .sort((a, b) => {
      // Ordenar los meses de manera ascendente: enero (1) - diciembre (12)
      const [mesA, añoA] = a.split('/').map(num => parseInt(num));  // Mes/Año de "a"
      const [mesB, añoB] = b.split('/').map(num => parseInt(num));  // Mes/Año de "b"
      if (añoA !== añoB) return añoA - añoB;  // Primero por año
      return mesA - mesB;  // Luego por mes
    }),
  datasets: Object.keys(pagosMesPorTipoSocio[Object.keys(pagosMesPorTipoSocio)[0]] || {}).map(tipo_socio => {
    return {
      label: tipo_socio,
      data: Object.keys(pagosMesPorTipoSocio).sort((a, b) => {
        const [mesA, añoA] = a.split('/').map(num => parseInt(num));
        const [mesB, añoB] = b.split('/').map(num => parseInt(num));
        if (añoA !== añoB) return añoA - añoB;
        return mesA - mesB;
      }).map(mesAño => pagosMesPorTipoSocio[mesAño][tipo_socio] || 0),
      borderColor: getColorForTipoSocio(tipo_socio),
      backgroundColor: 'transparent',
    };
  }),
};


  // Datos para el gráfico de pastel (pagos por tipo de socio)
  const pagosTipoSocioChart = {
    labels: pagosTipoSocio.map(p => p.tipo_socio), // Etiquetas con los tipos de socio
    datasets: [
      {
        data: pagosTipoSocio.map(p => p.cantidad), // Datos con la cantidad de pagos por tipo de socio
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#6610f2', '#dc3545', '#17a2b8'], // Colores para cada tipo de socio
        hoverBackgroundColor: ['#0056b3', '#218838', '#e0a800', '#520f9f', '#c82333', '#138496'], // Colores al hacer hover
      },
    ],
  };

  // Verifica que tienes los datos correctamente cargados
  useEffect(() => {
    console.log(pagosTipoSocio); // Revisa qué datos estás recibiendo en el hook
  }, [pagosTipoSocio]);

  return (
    <div>
      <h2>Reportes de Acceso</h2>
      <div className="reporte-container">
  
        {/* Columna de Accesos */}
        <div className="reporte-columna reporte-columna-left">
  
          <div className="reporte-box">
            <h3>Accesos</h3>
            <div className="reporte-filtros">
              <button className="btn-exportar" onClick={exportarExcel}>📥 Exportar Accesos Excel</button>
            </div>
          </div>
  
          <div className="reporte-box">
            <h3>Resumen de Accesos</h3>
            <div className="reporte-resumen">
              <div><strong>Total Socios:</strong> {resumen.total_socios}</div>
              <div><strong>Total Invitados:</strong> {resumen.total_invitados}</div>
            </div>
          </div>
  
          <div className="reporte-box">
            <h3>Ingresos Registrados Hoy</h3>
            <div><strong>Socios:</strong> {ingresosHoy.socios}</div>
            <div><strong>Invitados:</strong> {ingresosHoy.invitados}</div>
  
            {ingresosHoy.socios > 0 || ingresosHoy.invitados > 0 ? (
              <div className="reporte-pie-chart">
                <h4>Distribución de Ingresos de Hoy</h4>
                <Pie data={pieChartData} options={{ responsive: false }} height={250} width={250} />
              </div>
            ) : (
              <p>No hay suficientes datos para mostrar el gráfico de pastel.</p>
            )}
          </div>
  
          <div className="reporte-box">
            <h3>Gráfico de Ingresos por Día</h3>
            <Line data={chartData} />
            <p><strong>Explicación:</strong> El gráfico muestra el número de ingresos diarios de socios e invitados.</p>
          </div>
  
          <div className="reporte-filtros">
            <button className="btn-cancelar" onClick={() => navigate('/')}>Volver</button>
          </div>
  
        </div>
  
        {/* Columna de Pagos */}
        <div className="reporte-columna reporte-columna-right">
  
          <div className="reporte-box">
            <h3>Pagos</h3>
            <div className="reporte-filtros">
              <button className="btn-exportar" onClick={exportarPagosExcel}>📥 Exportar Pagos Excel</button>
            </div>
          </div>
  
          <div className="reporte-box">
            <h3>Pagos de Cuotas por Mes</h3>
            <Line data={pagosMesChart} />
            <p><strong>Explicación:</strong> Pagos de cuotas agrupados por tipo de socio y mes.</p>
          </div>
  
          <div className="reporte-box">
            <h3>Distribución de Pagos por Tipo de Socio</h3>
            <Pie data={pagosTipoSocioChart} options={{ responsive: false }} height={250} width={250} />
            <p><strong>Explicación:</strong> Distribución de pagos por tipo de socio.</p>
          </div>
  
        </div>
  
      </div>
    </div>
  );
  
};

export default ReportesAcceso;
