import { employeeRepository } from '@repositories/employeeRepository.js';
import type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from '../types/index.js';
import { ValidationError } from '@utils/errors.js';

export class EmployeeService {
  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate names are not empty
    if (!data.firstName.trim() || !data.lastName.trim()) {
      throw new ValidationError('First name and last name are required');
    }

    return employeeRepository.create(data);
  }

  async getEmployeeById(id: string): Promise<Employee> {
    return employeeRepository.findById(id);
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    return employeeRepository.findByEmail(email);
  }

  async getAllEmployees(page: number = 1, limit: number = 10): Promise<{ data: Employee[]; total: number; page: number; pages: number }> {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const offset = (page - 1) * limit;
    const { data, total } = await employeeRepository.findAll(limit, offset);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getEmployeesByDepartment(departmentId: string): Promise<Employee[]> {
    return employeeRepository.findByDepartment(departmentId);
  }

  async updateEmployee(id: string, data: UpdateEmployeeDTO): Promise<Employee> {
    // Get existing employee to verify it exists
    await employeeRepository.findById(id);

    // Validate if firstName/lastName are provided
    if (data.firstName !== undefined && !data.firstName.trim()) {
      throw new ValidationError('First name cannot be empty');
    }
    if (data.lastName !== undefined && !data.lastName.trim()) {
      throw new ValidationError('Last name cannot be empty');
    }

    return employeeRepository.update(id, data);
  }

  async deleteEmployee(id: string): Promise<void> {
    // Verify employee exists
    await employeeRepository.findById(id);
    return employeeRepository.delete(id);
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    if (!query.trim()) {
      throw new ValidationError('Search query cannot be empty');
    }

    return employeeRepository.search(query);
  }
}

export const employeeService = new EmployeeService();
