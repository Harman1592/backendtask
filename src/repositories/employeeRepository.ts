import { supabaseClient } from '@config/database.js';
import type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from '../types/index.js';
import { NotFoundError, ConflictError } from '@utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export class EmployeeRepository {
  private table = 'employees';

  async create(data: CreateEmployeeDTO): Promise<Employee> {
    const { data: employee, error } = await supabaseClient
      .from(this.table)
      .insert({
        id: uuidv4(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        throw new ConflictError('Employee with this email already exists');
      }
      throw error;
    }

    return employee;
  }

  async findById(id: string): Promise<Employee> {
    const { data: employee, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !employee) {
      throw new NotFoundError('Employee');
    }

    return employee;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const { data: employee } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('email', email)
      .single();

    return employee || null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ data: Employee[]; total: number }> {
    const { data, error, count } = await supabaseClient
      .from(this.table)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findByDepartment(departmentId: string): Promise<Employee[]> {
    const { data: employees, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('departmentId', departmentId)
      .order('firstName');

    if (error) throw error;

    return employees || [];
  }

  async update(id: string, data: UpdateEmployeeDTO): Promise<Employee> {
    const { data: employee, error } = await supabaseClient
      .from(this.table)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundError('Employee');
    }

    return employee;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundError('Employee');
    }
  }

  async search(query: string): Promise<Employee[]> {
    const { data: employees, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .or(`firstName.ilike.%${query}%, lastName.ilike.%${query}%, email.ilike.%${query}%`)
      .order('firstName');

    if (error) throw error;

    return employees || [];
  }
}

export const employeeRepository = new EmployeeRepository();
