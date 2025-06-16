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
    Modal
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { obtenerEmpleados, eliminarEmpleado as eliminarEmpleadoApi } from '../services/empleadoService';
import { obtenerRoles, eliminarRol as eliminarRolApi } from '../services/rolService';


const GestionRoles = () => {
    const [empleados, setEmpleados] = useState([]);
    const [roles, setRoles] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [typeToDelete, setTypeToDelete] = useState(null);
    const navigate = useNavigate();
    const nombresPermisos = {
        "gestion-socios": "Gestión de Estudiantes",
        "gestion-cuotas": "Gestión de Cuotas",
        "gestion-eventos": "Gestión de Eventos",
        "gestion-roles": "Gestión de Roles"
    };


    useEffect(() => {
        cargarEmpleados();
        cargarRoles();
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

    const handleConfirmDelete = () => {
        if (typeToDelete === 'empleado') eliminarEmpleado(itemToDelete);
        else if (typeToDelete === 'rol') eliminarRol(itemToDelete);

        setShowPopup(false);
        setItemToDelete(null);
        setTypeToDelete(null);
    };

    const handleCancelDelete = () => {
        setShowPopup(false);
        setItemToDelete(null);
        setTypeToDelete(null);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 4 }} gutterBottom>
                Gestión de Roles y Empleados
            </Typography>

            <Box display="flex" justifyContent="flex-end" gap={2} mb={3}>
                <Button variant="contained" color="primary" onClick={() => navigate('/agregar-empleado')}>
                    Agregar Empleado
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate('/crear-rol')}>
                    Crear Rol
                </Button>
            </Box>

            {/* Tabla de Empleados */}
            <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Empleados
                </Typography>
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
                        {empleados.map((emp) => (
                            <TableRow key={emp.id_empleado}>
                                <TableCell>{emp.nombre} {emp.apellido}</TableCell>
                                <TableCell>{emp.correo}</TableCell>
                                <TableCell>{emp.rol}</TableCell>
                                <TableCell>
                                    <EditIcon
                                        className="icono-accion"
                                        color="primary"
                                        sx={{ cursor: 'pointer', marginRight: 1 }}
                                        onClick={() => navigate(`/editar-empleado/${emp.correo}`)}
                                    />
                                    <DeleteIcon
                                        className="icono-accion"
                                        color="error"
                                        sx={{ cursor: 'pointer' }}
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
                <Typography variant="h6" gutterBottom>
                    Roles
                </Typography>
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
                        {roles.map((rol) => (
                            <TableRow key={rol.id_rol}>
                                <TableCell>{rol.nombre_rol}</TableCell>
                                <TableCell>{rol.descripcion}</TableCell>
                                <TableCell>
                                    {(() => {
                                        const permisosArray = Array.isArray(rol.permisos)
                                            ? rol.permisos
                                            : typeof rol.permisos === "string"
                                                ? rol.permisos.split(",").map(p => p.trim())
                                                : [];

                                        return permisosArray.length > 0
                                            ? permisosArray.map(p => nombresPermisos[p] || p).join(", ")
                                            : "Sin permisos";
                                    })()}
                                </TableCell>



                                <TableCell>
                                    <EditIcon
                                        className="icono-accion"
                                        color="primary"
                                        sx={{ cursor: 'pointer', marginRight: 1 }}
                                        onClick={() => navigate(`/editar-rol/${rol.id_rol}`)}
                                    />
                                    <DeleteIcon
                                        className="icono-accion"
                                        color="error"
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => handleDeleteClick(rol.id_rol, 'rol')}
                                    />

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialogo de confirmación */}
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
                        ¿Estás seguro que quieres eliminar este {typeToDelete === 'empleado' ? 'empleado' : 'rol'}?
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button variant="contained" color="error" onClick={handleCancelDelete}>
                            Cancelar
                        </Button>
                        <Button variant="contained" color="success" onClick={handleConfirmDelete}>
                            Aceptar
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </Container>
    );
};

export default GestionRoles;
