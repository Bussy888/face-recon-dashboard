import { Route } from 'react-router-dom';
import Login from '../pages/Login';

const AuthRoutes = [
  <Route key="login" path="/login" element={<Login />} />,
];

export default AuthRoutes;
