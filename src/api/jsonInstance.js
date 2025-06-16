import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL:", API_URL);

const jsonServerInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default jsonServerInstance;
