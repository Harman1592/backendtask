import { departmentRepository } from '@repositories/departmentRepository.js';
import type { Department } from '../types/index.js';
import { ValidationError } from '@utils/errors.js';

export class DepartmentService {
  async createDepartment(name: string, description?: string): Promise<Department> {
    if (!name.trim()) {
      throw new ValidationError('Department name is required');
    }

    return departmentRepository.create(name, description);
  }

  async getDepartmentById(id: string): Promise<Department> {
    return departmentRepository.findById(id);
  }

  async getAllDepartments(page: number = 1, limit: number = 50): Promise<{ data: Department[]; total: number; page: number; pages: number }> {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 50;

    const offset = (page - 1) * limit;
    const { data, total } = await departmentRepository.findAll(limit, offset);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateDepartment(id: string, name?: string, description?: string): Promise<Department> {
    // Verify department exists
    await departmentRepository.findById(id);

    if (name !== undefined && !name.trim()) {
      throw new ValidationError('Department name cannot be empty');
    }

    return departmentRepository.update(id, name, description);
  }

  async deleteDepartment(id: string): Promise<void> {
    // Verify department exists
    await departmentRepository.findById(id);
    return departmentRepository.delete(id);
  }
}

export const departmentService = new DepartmentService();
