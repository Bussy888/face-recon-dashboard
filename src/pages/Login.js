import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { obtenerEmpleadoPorCorreo } from '../services/empleadoService';

const validationSchema = Yup.object({
  email: Yup.string().email('Correo inválido').required('Correo es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña es requerida'),
});

const Login = () => {
  const  setUser  = useUserStore( (state) => state.setUser );
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogin = async (values, { setSubmitting }) => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const response = await obtenerEmpleadoPorCorreo(user.email);
      setUser(response);
      localStorage.setItem('userData', JSON.stringify(response));
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      setFormError('El correo o la contraseña son incorrectos, por favor intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        backgroundColor: '#ffffff',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Form Container - 60% on md+ */}
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          flexBasis: { xs: '100%', md: '60%' },
          minHeight: { xs: '50vh', md: '100vh' },
          width: { xs: '100%', md: '60%' },
        }}
      >
        <img
          src="/logo-transmite-azul.png"
          alt="Logo"
          style={{
            width: isSmallScreen ? '60%' : '70%',
            marginBottom: 24,
            userSelect: 'none',
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Iniciar Sesión
        </Typography>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form style={{ width: '100%', maxWidth: 400 }}>
              <TextField
                fullWidth
                margin="normal"
                id="email"
                name="email"
                label="Correo electrónico"
                variant="outlined"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                autoComplete="email"
              />

              <TextField
                fullWidth
                margin="normal"
                id="password"
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {formError && (
                <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                  {formError}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(25, 118, 210, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(25, 118, 210, 0.7)',
                  },
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </Form>
          )}
        </Formik>
      </Container>

      {/* Background Image Container - 40% on md+ */}
      {!isSmallScreen && (
        <Box
          sx={{
            flexBasis: '40%',
            width: '40%',
            position: 'relative',
            backgroundColor: '#252525',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <img
            src="/pasillo2.jpg"
            alt="Imagen de fondo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.65,
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              userSelect: 'none',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Login;
