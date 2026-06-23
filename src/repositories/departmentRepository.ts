import { supabaseClient } from '@config/database.js';
import type { Department } from '../types/index.js';
import { NotFoundError, ConflictError } from '@utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export class DepartmentRepository {
  private table = 'departments';

  async create(name: string, description?: string): Promise<Department> {
    const { data: department, error } = await supabaseClient
      .from(this.table)
      .insert({
        id: uuidv4(),
        name,
        description: description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        throw new ConflictError('Department with this name already exists');
      }
      throw error;
    }

    return department;
  }

  async findById(id: string): Promise<Department> {
    const { data: department, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !department) {
      throw new NotFoundError('Department');
    }

    return department;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<{ data: Department[]; total: number }> {
    const { data, error, count } = await supabaseClient
      .from(this.table)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name');

    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async update(id: string, name?: string, description?: string): Promise<Department> {
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;

    const { data: department, error } = await supabaseClient
      .from(this.table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundError('Department');
    }

    return department;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundError('Department');
    }
  }
}

export const departmentRepository = new DepartmentRepository();
