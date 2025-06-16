import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Box, Button, Typography } from '@mui/material';

const CapturaRostro = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [pendingStart, setPendingStart] = useState(false); // para esperar al render
const [streamRef, setStreamRef] = useState(null);
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
    }
  };

  loadModels();

}, []);




  // Activar cámara (cuando el video esté renderizado)
 useEffect(() => {
  if (isCameraActive && videoRef.current && pendingStart) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStreamRef(stream); // Guardar referencia para limpieza futura
        setPendingStart(false);
      })
      .catch((err) => {
        console.error('No se pudo acceder a la cámara', err);
        alert('No se pudo acceder a la cámara.');
        setIsCameraActive(false);
        setPendingStart(false);
      });
  }
}, [isCameraActive, pendingStart]);


useEffect(() => {
  return () => {
    console.log('Cleanup ejecutado');
    if (streamRef instanceof MediaStream) {
      streamRef.getTracks().forEach((track) => track.stop());
      console.log('Cámara detenida correctamente');
    } else {
      console.log('streamRef no era MediaStream:', streamRef);
    }
  };
}, [streamRef]);

  const iniciarCamara = () => {
    setIsCameraActive(true);
    setPendingStart(true); // esperar que el video se monte
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
    } else {
      alert('No se detectó ningún rostro.');
    }
  };

  const volverACapturar = () => {
    setImageSrc(null);
    iniciarCamara(); // esto activará cámara y esperará render con useEffect
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
    </Box>
  );
};

export default CapturaRostro;
