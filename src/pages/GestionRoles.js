// src/pages/GestionRoles.jsx
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Box,
    Modal,
    TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
    obtenerEmpleados,
    eliminarEmpleado as eliminarEmpleadoApi
} from '../services/empleadoService';

import {
    obtenerRoles,
    eliminarRol as eliminarRolApi
} from '../services/rolService';

import {
    obtenerCarreras,
    crearCarrera,
    eliminarCarrera
} from '../services/tipoSocioService';

const GestionRoles = () => {
    const [empleados, setEmpleados] = useState([]);
    const [roles, setRoles] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const [showCarreraModal, setShowCarreraModal] = useState(false);
    const [nuevaCarrera, setNuevaCarrera] = useState({ nombre_tipo: '', descripcion: '' });

    const navigate = useNavigate();

    const nombresPermisos = {
        "gestion-socios": "Gestión de Estudiantes",
        "gestion-cuotas": "Gestión de Mensualidades",
        "gestion-eventos": "Gestión de Eventos",
        "gestion-roles": "Gestión de Roles",
        "gestion-asistencia": "Gestión de Asistencia"
    };

    useEffect(() => {
        cargarEmpleados();
        cargarRoles();
        cargarCarreras();
    }, []);

    const cargarEmpleados = async () => {
        try {
            const res = await obtenerEmpleados();
            setEmpleados(res);
        } catch (err) {
            console.error('Error al cargar empleados:', err);
        }
    };

    const cargarRoles = async () => {
        try {
            const res = await obtenerRoles();
            setRoles(res);
        } catch (err) {
            console.error('Error al cargar roles:', err);
        }
    };

    const cargarCarreras = async () => {
        try {
            const res = await obtenerCarreras();
            setCarreras(res);
        } catch (err) {
            console.error('Error al cargar carreras:', err);
        }
    };

    const eliminarEmpleado = async (id) => {
        try {
            await eliminarEmpleadoApi(id);
            cargarEmpleados();
        } catch (err) {
            console.error('Error al eliminar empleado:', err);
        }
    };

    const eliminarRol = async (id) => {
        try {
            await eliminarRolApi(id);
            cargarRoles();
        } catch (err) {
            console.error('Error al eliminar rol:', err);
        }
    };

    const handleDeleteClick = (id, type) => {
        setItemToDelete(id);
        setTypeToDelete(type);
        setShowPopup(true);
    };

    const handleConfirmDelete = async () => {
        if (typeToDelete === 'empleado') {
            await eliminarEmpleado(itemToDelete);
            await cargarEmpleados();
        }
        else if (typeToDelete === 'rol') {
            await eliminarRol(itemToDelete);
            await cargarRoles();
        }

        else if (typeToDelete === 'carrera') {
            await eliminarCarrera(itemToDelete)
            await cargarCarreras();
        };

        setShowPopup(false);
        setItemToDelete(null);
        setTypeToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowPopup(false);
        setItemToDelete(null);
        setTypeToDelete(null);
    };

    const handleCrearCarrera = async () => {
        try {
            await crearCarrera(nuevaCarrera);
            setNuevaCarrera({ nombre: '', descripcion: '' });
            setShowCarreraModal(false);
            cargarCarreras();
        } catch (err) {
            console.error('Error al crear carrera:', err);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 4 }}>
                Gestión de Roles, Empleados y Carreras
            </Typography>

            <Box display="flex" justifyContent="flex-end" gap={2} mb={3}>
                <Button variant="contained" color="primary" onClick={() => navigate('/agregar-empleado')}>
                    Agregar Empleado
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate('/crear-rol')}>
                    Crear Rol
                </Button>
                <Button variant="contained" color="primary" onClick={() => setShowCarreraModal(true)}>
                    Añadir Carrera
                </Button>
            </Box>

            {/* Tabla de Empleados */}
            <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
                <Typography variant="h6">Empleados</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre Completo</TableCell>
                            <TableCell>Correo</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {empleados.map(emp => (
                            <TableRow key={emp.id_empleado}>
                                <TableCell>{emp.nombre} {emp.apellido}</TableCell>
                                <TableCell>{emp.correo}</TableCell>
                                <TableCell>{emp.rol}</TableCell>
                                <TableCell>
                                    <EditIcon
                                        sx={{ cursor: 'pointer', mr: 1 }}
                                        color="primary"
                                        onClick={() => navigate(`/editar-empleado/${emp.correo}`)}
                                    />
                                    <DeleteIcon
                                        sx={{ cursor: 'pointer' }}
                                        color="error"
                                        onClick={() => handleDeleteClick(emp.id_empleado, 'empleado')}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Tabla de Roles */}
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">Roles</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Rol</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Permisos</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map(rol => (
                            <TableRow key={rol.id_rol}>
                                <TableCell>{rol.nombre_rol}</TableCell>
                                <TableCell>{rol.descripcion}</TableCell>
                                <TableCell>
                                    {(Array.isArray(rol.permisos)
                                        ? rol.permisos
                                        : typeof rol.permisos === "string"
                                            ? rol.permisos.split(',').map(p => p.trim())
                                            : []
                                    ).map(p => nombresPermisos[p] || p).join(', ') || "Sin permisos"}
                                </TableCell>
                                <TableCell>
                                    <EditIcon
                                        sx={{ cursor: 'pointer', mr: 1 }}
                                        color="primary"
                                        onClick={() => navigate(`/editar-rol/${rol.id_rol}`)}
                                    />
                                    <DeleteIcon
                                        sx={{ cursor: 'pointer' }}
                                        color="error"
                                        onClick={() => handleDeleteClick(rol.id_rol, 'rol')}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Tabla de Carreras */}
            <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
                <Typography variant="h6">Carreras</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {carreras.map(carrera => (
                            <TableRow key={carrera.id_tipo}>
                                <TableCell>{carrera.nombre_tipo}</TableCell>
                                <TableCell>{carrera.descripcion}</TableCell>
                                <TableCell>
                                    <DeleteIcon
                                        sx={{ cursor: 'pointer' }}
                                        color="error"
                                        onClick={() => handleDeleteClick(carrera.id_tipo, 'carrera')}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </Paper>

            {/* Modal Confirmación */}
            <Modal open={showPopup} onClose={handleCancelDelete} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 24, maxWidth: 400, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        ¿Estás seguro que deseas eliminar este {typeToDelete}?
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button variant="contained" color="error" onClick={handleCancelDelete}>Cancelar</Button>
                        <Button variant="contained" color="success" onClick={handleConfirmDelete}>Aceptar</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal Crear Carrera */}
            <Modal open={showCarreraModal} onClose={() => setShowCarreraModal(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 24, maxWidth: 500, width: '100%' }}>
                    <Typography variant="h6">Añadir Carrera</Typography>
                    <TextField
                        label="Nombre"
                        fullWidth
                        margin="normal"
                        value={nuevaCarrera.nombre_tipo}
                        onChange={(e) => setNuevaCarrera({ ...nuevaCarrera, nombre_tipo: e.target.value })}
                    />
                    <TextField
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={nuevaCarrera.descripcion}
                        onChange={(e) => setNuevaCarrera({ ...nuevaCarrera, descripcion: e.target.value })}
                    />
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button variant="contained" onClick={() => setShowCarreraModal(false)}>Cancelar</Button>
                        <Button variant="contained" color="success" onClick={handleCrearCarrera}>Guardar</Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
};

export default GestionRoles;
