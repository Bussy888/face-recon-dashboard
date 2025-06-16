import React, { useEffect } from 'react';
import { Routes } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import PrivateRoutes from './routes/PrivateRoutes';
import { useUserStore } from './store/useUserStore';
import { CircularProgress, Box } from '@mui/material';

const App = () => {
  const initializeUser = useUserStore((state) => state.initializeUser);
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    const unsubscribe = initializeUser();
    return () => unsubscribe && unsubscribe();
  }, [initializeUser]);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {AuthRoutes}
      {PrivateRoutes}
    </Routes>
  );
};

export default App;
