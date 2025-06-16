import React, { useEffect, useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { obtenerRolPorId, actualizarRol } from '../services/rolService';
import { obtenerPermisos } from '../services/permisosService';


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
// --- EditarRol Component ---
export const EditarRol = () => {
  const { id_rol } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({
    nombre_rol: "",
    descripcion: "",
    permisos: [],
  });
  const [allPermisos, setAllPermisos] = useState([]);

  useEffect(() => {
    const cargarRol = async () => {
      try {
        const response = await obtenerRolPorId(id_rol);
        const rolData = response;
        setInitialValues({
          nombre_rol: rolData.nombre_rol,
          descripcion: rolData.descripcion,
          permisos: Array.isArray(rolData.permisos)
            ? rolData.permisos
            : rolData.permisos.split(",").map((p) => p.trim()),
        });
      } catch (error) {
        console.error("Error al cargar el rol:", error);
      }
    };

    const cargarPermisos = async () => {
      try {
        const response = await obtenerPermisos();
        if (Array.isArray(response.permisos)) {
          setAllPermisos(response.permisos);
        } else {
          console.error("La respuesta no tiene un array de permisos");
        }
      } catch (error) {
        console.error("Error al cargar los permisos:", error);
      }
    };

    cargarRol();
    cargarPermisos();
  }, [id_rol]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await actualizarRol(id_rol, values);
      navigate("/gestion-roles");
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
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
        Editar Rol
      </Typography>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RolSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
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
              <Typography variant="h6" color="primary">
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
                color="primary"
                type="submit"
                disabled={isSubmitting}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};
export default EditarRol;
