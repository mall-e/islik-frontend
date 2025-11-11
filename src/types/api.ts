export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Unit {
  id: number;
  code: string;
  name: string;
  department: Department;
  address?: string;
  district?: string;
  city?: string;
  active: boolean;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  identityNumber: string;
  manager?: Employee;
  baseSalary: number;
  hourlyRate: number;
  overtimeMultiplier?: number;
  position: string;
  role?: string;
  level?: number;
  unit: Unit;
}

export interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  identityNumber: string;
  position: string;
  role?: string;
  level?: number;
  baseSalary: number;
  hourlyRate: number;
  overtimeMultiplier?: number;
  unitId: number;
  userId?: number | null;
  managerId?: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface TimeEntry {
  id?: number;
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  overtimeHours?: number;
}

export interface SalaryCalculation {
  employeeId: number;
  period: string;
  baseSalary: number;
  regularHours: number;
  overtimeHours: number;
  overtimePay: number;
  totalSalary: number;
}