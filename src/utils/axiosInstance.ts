import axios, { AxiosError } from 'axios';

const baseUrl = import.meta.env.VITE_BASEURL || 'http://localhost:3005';
console.log('baseurl:', baseUrl);
const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; details?: string }>) => {
    let msg = 'Something went wrong';

    if (error.response) {
      msg =
        error.response.data?.details ??
        error.response.data?.message ??
        error.message;

      console.error('API Error:', msg, error.response);
    } else if (error.request) {
      msg = 'No response from server. Please try again.';
      console.error('No response:', error.request);
    } else {
      msg = error.message || msg;
      console.error('Unexpected:', msg);
    }

    return Promise.reject({ message: msg, original: error });
  },
);

export default axiosInstance;
