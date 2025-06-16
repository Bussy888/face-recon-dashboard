import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getAuth, updatePassword } from 'firebase/auth';
import { obtenerEmpleadoPorCorreo, actualizarEmpleado } from '../services/empleadoService';
import { obtenerRoles } from '../services/rolService';


const EditarEmpleado = () => {
  const { correo } = useParams();
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const response = await obtenerRoles();
        setRoles(response);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    };

    const cargarEmpleado = async () => {
      try {
        const response = await obtenerEmpleadoPorCorreo(correo);
        const empleado = response;
        formik.setValues({
          nombre: empleado.nombre || '',
          apellido: empleado.apellido || '',
          correo: empleado.correo || '',
          contrasena: '',
          rol: empleado.rol_id || '',
        });
      } catch (error) {
        console.error('Error al cargar empleado:', error);
      }
    };

    cargarRoles();
    if (correo) cargarEmpleado();
  }, [correo]);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      rol: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required('El nombre es obligatorio'),
      apellido: Yup.string().required('El apellido es obligatorio'),
      correo: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
      contrasena: Yup.string()
        .min(6, 'Mínimo 6 caracteres')
        .notRequired()
        .nullable(),
      rol: Yup.string().required('Seleccione un rol'),
    }),
    onSubmit: async (values) => {
      try {
        const updatedEmpleado = {
          nombre: values.nombre,
          apellido: values.apellido,
          correo: values.correo,
          rol_id: values.rol,
        };

        // Actualizar datos sin contraseña en la base local
        await actualizarEmpleado(values.correo, updatedEmpleado);

        // Si cambió la contraseña, actualizar en Firebase
        if (values.contrasena) {
          const user = auth.currentUser;
          if (user && user.email === values.correo) {
            await updatePassword(user, values.contrasena);
          } else {
            console.warn('Usuario no autenticado o correo no coincide para cambiar contraseña.');
          }
        }

        navigate('/gestion-roles');
      } catch (error) {
        console.error('Error al editar empleado:', error);
      }
    },
  });

  return (
    <Box maxWidth="600px" mx="auto" p={4} boxShadow={3} borderRadius={2} bgcolor="#fff">
      < Typography variant="h5" textAlign="center" mb={3}>
        Editar Empleado
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              onBlur={formik.handleBlur}
              value={formik.values.nombre}
              onChange={formik.handleChange}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Apellido"
              name="apellido"
              fullWidth
              onBlur={formik.handleBlur}
              value={formik.values.apellido}
              onChange={formik.handleChange}
              error={formik.touched.apellido && Boolean(formik.errors.apellido)}
              helperText={formik.touched.apellido && formik.errors.apellido}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Correo"
              name="correo"
              type="email"
              fullWidth
              onBlur={formik.handleBlur}
              value={formik.values.correo}
              onChange={formik.handleChange}
              error={formik.touched.correo && Boolean(formik.errors.correo)}
              helperText={formik.touched.correo && formik.errors.correo}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Nueva Contraseña (opcional)"
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              onBlur={formik.handleBlur}
              value={formik.values.contrasena}
              onChange={formik.handleChange}
              error={formik.touched.contrasena && Boolean(formik.errors.contrasena)}
              helperText={formik.touched.contrasena && formik.errors.contrasena}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              label="Rol"
              name="rol"
              fullWidth
              onBlur={formik.handleBlur}
              value={formik.values.rol}
              onChange={formik.handleChange}
              error={formik.touched.rol && Boolean(formik.errors.rol)}
              helperText={formik.touched.rol && formik.errors.rol}
            >
              <MenuItem value="">Seleccionar Rol</MenuItem>
              {roles.map((rol) => (
                <MenuItem key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre_rol}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }} display="flex" justifyContent="space-between">
            <Button variant="contained" color="error" onClick={() => navigate('/gestion-roles')} sx={{ paddingX: 5, paddingY: 1 }}>
              Cancelar
            </Button>
            <Button variant="contained" color="success" type="submit" sx={{ paddingX: 5, paddingY: 1 }}>
              Guardar Cambios
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default EditarEmpleado;
