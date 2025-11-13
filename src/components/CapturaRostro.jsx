import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Box, Button, Typography, Snackbar, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CapturaRostro = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [pendingStart, setPendingStart] = useState(false);
  const [streamRef, setStreamRef] = useState(null);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' o 'error'

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const detenerCamara = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      } catch (err) {
        console.error('Error cargando modelos:', err);
        showSnackbar('Error al cargar los modelos de reconocimiento facial.', 'error');
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && pendingStart) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setStreamRef(stream);
          setPendingStart(false);
        })
        .catch((err) => {
          console.error('No se pudo acceder a la cámara', err);
          showSnackbar('No se pudo acceder a la cámara.', 'error');
          setIsCameraActive(false);
          setPendingStart(false);
        });
    }
  }, [isCameraActive, pendingStart]);

  useEffect(() => {
    return () => {
      if (streamRef instanceof MediaStream) {
        streamRef.getTracks().forEach((track) => track.stop());
      }
    };
  }, [streamRef]);

  const iniciarCamara = () => {
    setIsCameraActive(true);
    setPendingStart(true);
  };

  const capturarRostro = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const image = canvas.toDataURL('image/png');
      setImageSrc(image);
      detenerCamara();
      setIsCameraActive(false);

      const descriptor = Array.from(detection.descriptor);
      onCapture({ image, descriptor });

      showSnackbar('Rostro capturado con éxito.', 'success');
    } else {
      showSnackbar('No se detectó ningún rostro.', 'error');
    }
  };

  const volverACapturar = () => {
    setImageSrc(null);
    iniciarCamara();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>Captura Facial</Typography>
      {!imageSrc ? (
        <>
          {isCameraActive ? (
            <>
              <video ref={videoRef} autoPlay muted style={{ width: '100%', borderRadius: 8 }} />
              <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={capturarRostro}>
                Capturar Rostro
              </Button>
            </>
          ) : (
            <Button fullWidth variant="outlined" onClick={iniciarCamara}>
              Activar Cámara
            </Button>
          )}
        </>
      ) : (
        <>
          <img src={imageSrc} alt="Rostro" style={{ width: '100%', borderRadius: 8 }} />
          <Button fullWidth variant="outlined" sx={{ mt: 1 }} color="warning" onClick={volverACapturar}>
            Volver a Capturar
          </Button>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        ContentProps={{
          style: {
            backgroundColor: snackbarSeverity === 'error' ? '#f44336' : '#4caf50',
            color: 'white',
          },
        }}
      />
    </Box>
  );
};

export default CapturaRostro;
