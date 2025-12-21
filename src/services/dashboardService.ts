import api from './api';
import { Dashboard } from '../types';

export const dashboardService = {
  // Obter dados consolidados do dashboard
  obter: async (): Promise<Dashboard> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};






