import axios from 'axios';
import { Department, Unit, Employee, EmployeeCreateRequest, LoginRequest, AuthResponse, TimeEntry, SalaryCalculation } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('=== API REQUEST INTERCEPTOR ===');
  console.log('URL:', config.url);
  console.log('Token from localStorage:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set:', config.headers.Authorization);
  } else {
    console.log('No token found, request without auth');
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE SUCCESS ===');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return response;
  },
  (error) => {
    console.log('=== API RESPONSE ERROR ===');
    console.log('URL:', error.config?.url);
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.message);
    console.log('Error response data:', error.response?.data);

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - removing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export const departmentAPI = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get('/department/all');
    return response.data;
  },

  create: async (department: Omit<Department, 'id'>): Promise<Department> => {
    const response = await api.post('/department/create', department);
    return response.data;
  },

  update: async (id: number, department: Omit<Department, 'id'>): Promise<Department> => {
    const response = await api.put(`/department/${id}`, department);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/department/${id}`);
  },
};

export const unitAPI = {
  getAll: async (): Promise<Unit[]> => {
    const response = await api.get('/unit/all');
    return response.data;
  },

  getByDepartment: async (departmentId: number): Promise<Unit[]> => {
    const response = await api.get(`/unit/department/${departmentId}`);
    return response.data;
  },

  create: async (unit: Omit<Unit, 'id'>): Promise<Unit> => {
    const response = await api.post('/unit/create', unit);
    return response.data;
  },

  update: async (id: number, unit: Omit<Unit, 'id'>): Promise<Unit> => {
    const response = await api.put(`/unit/${id}`, unit);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/unit/${id}`);
  },
};

export const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employee/all');
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/employee/${id}`);
    return response.data;
  },

  getByUnit: async (unitId: number): Promise<Employee[]> => {
    const response = await api.get(`/employee/unit/${unitId}`);
    return response.data;
  },

  create: async (employee: EmployeeCreateRequest): Promise<Employee> => {
    const response = await api.post('/employee/create', employee);
    return response.data;
  },

  update: async (id: number, employee: EmployeeCreateRequest): Promise<Employee> => {
    const response = await api.put(`/employee/${id}`, employee);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employee/${id}`);
  },

  transferUnit: async (employeeId: number, newUnitId: number): Promise<Employee> => {
    const response = await api.put(`/employee/${employeeId}/transfer`, { unitId: newUnitId });
    return response.data;
  },
};

export const timeTrackingAPI = {
  getTimeEntries: async (employeeId: number, startDate: string, endDate: string): Promise<TimeEntry[]> => {
    const response = await api.get(`/time-tracking/employee/${employeeId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  createTimeEntry: async (timeEntry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> => {
    const response = await api.post('/time-tracking', timeEntry);
    return response.data;
  },

  updateTimeEntry: async (id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await api.put(`/time-tracking/${id}`, timeEntry);
    return response.data;
  },

  deleteTimeEntry: async (id: number): Promise<void> => {
    await api.delete(`/time-tracking/${id}`);
  },
};

export const salaryAPI = {
  calculateSalary: async (employeeId: number, period: string): Promise<SalaryCalculation> => {
    const response = await api.post('/salary/calculate', { employeeId, period });
    return response.data;
  },

  getSalaryHistory: async (employeeId: number): Promise<SalaryCalculation[]> => {
    const response = await api.get(`/salary/history/${employeeId}`);
    return response.data;
  },

  calculateUnitSalaries: async (unitId: number, period: string): Promise<SalaryCalculation[]> => {
    const response = await api.post('/salary/calculate-unit', { unitId, period });
    return response.data;
  },
};

export default api;