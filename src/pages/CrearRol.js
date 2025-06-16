
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { crearRol } from "../services/rolService";

const permisosDefault = [
  "gestion-socios",
  "gestion-cuotas",
  "gestion-eventos",
  "gestion-roles",
];
const permisoLabels = {
  "gestion-socios": "Gestión de Estudiantes",
  "gestion-cuotas": "Gestión de Cuotas",
  "gestion-eventos": "Gestión de Eventos",
  "gestion-roles": "Gestión de Roles",
};
// Schema Yup para validación
const RolSchema = Yup.object().shape({
  nombre_rol: Yup.string().required("El nombre del rol es requerido"),
  descripcion: Yup.string().required("La descripción es requerida"),
  permisos: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos un permiso"),
});

// --- CrearRol Component ---
export const CrearRol = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await crearRol(values);
      navigate("/gestion-roles");
    } catch (error) {
      console.error("Error al crear rol:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      maxWidth={700}
      mx="auto"
      p={3}
      bgcolor="background.paper"
      borderRadius={2}
      boxShadow={3}
      fontFamily="'Segoe UI', sans-serif"
    >
      <Typography variant="h5" textAlign="center" mb={3}>
        Crear Rol
      </Typography>

      <Formik
        initialValues={{
          nombre_rol: "",
          descripcion: "",
          permisos: [],
        }}
        validationSchema={RolSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, isSubmitting, setFieldValue, errors, touched }) => (
          <Form>
            <Field
              as={TextField}
              fullWidth
              label="Nombre del Rol"
              name="nombre_rol"
              variant="outlined"
              margin="normal"
              error={touched.nombre_rol && Boolean(errors.nombre_rol)}
              helperText={<ErrorMessage name="nombre_rol" />}
            />

            <Field
              as={TextField}
              fullWidth
              label="Descripción del Rol"
              name="descripcion"
              multiline
              rows={4}
              variant="outlined"
              margin="normal"
              error={touched.descripcion && Boolean(errors.descripcion)}
              helperText={<ErrorMessage name="descripcion" />}
            />

            <Box mt={3} mb={1}>
              <Typography variant="h6" >
                Seleccionar Permisos
              </Typography>
            </Box>

            <FormControl
              component="fieldset"
              error={touched.permisos && Boolean(errors.permisos)}
              variant="standard"
              sx={{ mb: 2, justifyContent: "center", alignItems: "center", display: "flex" }}
            >
              <FormGroup>
                {permisosDefault.map((permiso) => (
                  <FormControlLabel
                    key={permiso}
                    control={
                      <Checkbox
                        name="permisos"
                        value={permiso}
                        checked={values.permisos.includes(permiso)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue("permisos", [...values.permisos, permiso]);
                          } else {
                            setFieldValue(
                              "permisos",
                              values.permisos.filter((p) => p !== permiso)
                            );
                          }
                        }}
                      />
                    }
                    label={permisoLabels[permiso] || permiso}
                  />
                ))}
              </FormGroup>

              <FormHelperText>
                <ErrorMessage name="permisos" />
              </FormHelperText>
            </FormControl>

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="contained"
                color="error"
                onClick={() => navigate("/gestion-roles")}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="success"
                type="submit"
                disabled={isSubmitting}
              >
                Crear Rol
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default CrearRol;
