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
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { obtenerRoles } from '../services/rolService';
import { crearEmpleado as crearEmpleadoApi } from '../services/empleadoService';

const AgregarEmpleado = () => {
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
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
    cargarRoles();
  }, []);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      repetirContrasena: '',
      rol: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required('El nombre es obligatorio'),
      apellido: Yup.string().required('El apellido es obligatorio'),
      correo: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
      contrasena: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es obligatoria'),
      repetirContrasena: Yup.string()
        .oneOf([Yup.ref('contrasena')], 'Las contraseñas no coinciden')
        .required('Debe repetir la contraseña'),
      rol: Yup.string().required('Seleccione un rol'),
    }),
    onSubmit: async (values) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.correo, values.contrasena);
    const user = userCredential.user;

    const rolSeleccionado = roles.find(r => r.id_rol === values.rol);
    const nombreRol = rolSeleccionado ? rolSeleccionado.nombre_rol : '';

    const nuevoEmpleado = {
      google_id: user.uid,
      nombre: `${values.nombre}`,
      apellido: `${values.apellido}`,
      correo: values.correo,
      rol: nombreRol, // <- Esto es lo que espera el backend
    };

    await crearEmpleadoApi(nuevoEmpleado);
    navigate('/gestion-roles');
  } catch (error) {
    console.error('Error al agregar empleado:', error);
  }
}


  });

  return (
    <Box maxWidth="600px" mx="auto" p={4} boxShadow={3} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" gutterBottom align="center">
        Agregar Empleado
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              onBlur={formik.handleBlur} // <-- IMPORTANTE
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
              onBlur={formik.handleBlur} // <-- IMPORTANTE
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
              onBlur={formik.handleBlur} // <-- IMPORTANTE
              value={formik.values.correo}
              onChange={formik.handleChange}
              error={formik.touched.correo && Boolean(formik.errors.correo)}
              helperText={formik.touched.correo && formik.errors.correo}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Contraseña"
              name="contrasena"
              onBlur={formik.handleBlur} // <-- IMPORTANTE
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={formik.values.contrasena}
              onChange={formik.handleChange}
              error={formik.touched.contrasena && Boolean(formik.errors.contrasena)}
              helperText={formik.touched.contrasena && formik.errors.contrasena}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Repetir Contraseña"
              name="repetirContrasena"
              onBlur={formik.handleBlur} // <-- IMPORTANTE
              type={showRepeatPassword ? 'text' : 'password'}
              fullWidth
              value={formik.values.repetirContrasena}
              onChange={formik.handleChange}
              error={formik.touched.repetirContrasena && Boolean(formik.errors.repetirContrasena)}
              helperText={formik.touched.repetirContrasena && formik.errors.repetirContrasena}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowRepeatPassword(!showRepeatPassword)} edge="end">
                      {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
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
              onBlur={formik.handleBlur} // <-- IMPORTANTE
              fullWidth
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
              Registrar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AgregarEmpleado;
