// import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { getAuth } from 'firebase/auth';
// import { auth } from './firebase';  // Asegúrate de que el archivo firebase.js esté configurado

// // Crear el contexto
// const UserContext = createContext();

// // Crear el proveedor del contexto
// const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // Función para obtener los datos del usuario desde la API
//   const fetchUserData = async (email) => {
//     try {
//       const response = await axios.get(`http://localhost:5000/api/empleado/${email}`);
//       console.log('Datos del usuario obtenidos desde la API:', response.data);
//       setUser(response.data);
//       localStorage.setItem('userData', JSON.stringify(response.data)); // Guardar en localStorage
//     } catch (error) {
//       console.error('Error al obtener datos del usuario:', error);
//     }
//   };

//   useEffect(() => {
//     const storedUser = localStorage.getItem('userData'); // Recuperar desde localStorage
//     if (storedUser) {
//       setUser(JSON.parse(storedUser)); // Establecer el usuario desde localStorage si existe
//     }

//     const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
//       if (firebaseUser) {
//         if (!storedUser) {
//           fetchUserData(firebaseUser.email); // Solo llamar a fetchUserData si no hay usuario almacenado
//         } else {
//           setUser(JSON.parse(storedUser));  // Establecer usuario desde localStorage
//         }
//       } else {
//         setUser(null);
//       }
//     });

//     return () => unsubscribe(); // Limpiar la suscripción al desmontar
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export { UserContext, UserProvider };
