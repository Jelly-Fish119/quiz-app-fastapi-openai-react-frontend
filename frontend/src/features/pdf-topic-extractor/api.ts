import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api'
});

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append('pdf_file', file);
  const response = await api.post('/extract-topics/', formData);
  return response.data; // { page_1: ["topic1", "topic2"], ... }
};
