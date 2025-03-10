import axios from 'axios';

const baseURL = '/api/';

const AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    }
});

export default AxiosInstance;