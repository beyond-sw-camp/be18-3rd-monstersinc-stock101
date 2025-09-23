import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8080',
    timeout: 2000
})

apiClient.interceptors.request.use(

    (config) =>{
        return config;
    },
    (error) =>{
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    response=>response,

    error =>{
        return Promise.reject(error);
    }
);

export default apiClient;