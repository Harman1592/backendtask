import { supabaseClient } from '@config/database.js';
import type { LeaveRequest, CreateLeaveRequestDTO, UpdateLeaveRequestDTO } from '../types/index.js';
import { LeaveStatus } from '../types/index.js';
import { NotFoundError, ConflictError } from '@utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export class LeaveRequestRepository {
  private table = 'leave_requests';

  async create(data: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    const { data: leaveRequest, error } = await supabaseClient
      .from(this.table)
      .insert({
        id: uuidv4(),
        status: LeaveStatus.PENDING,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('conflict')) {
        throw new ConflictError('Leave request already exists for this period');
      }
      throw error;
    }

    return leaveRequest;
  }

  async findById(id: string): Promise<LeaveRequest> {
    const { data: leaveRequest, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !leaveRequest) {
      throw new NotFoundError('Leave request');
    }

    return leaveRequest;
  }

  async findByEmployeeId(employeeId: string, limit: number = 50, offset: number = 0): Promise<{ data: LeaveRequest[]; total: number }> {
    const { data, error, count } = await supabaseClient
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('employeeId', employeeId)
      .range(offset, offset + limit - 1)
      .order('startDate', { ascending: false });

    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findByStatus(status: LeaveStatus, limit: number = 50, offset: number = 0): Promise<{ data: LeaveRequest[]; total: number }> {
    const { data, error, count } = await supabaseClient
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('status', status)
      .range(offset, offset + limit - 1)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findPendingApprovals(limit: number = 50, offset: number = 0): Promise<{ data: LeaveRequest[]; total: number }> {
    const { data, error, count } = await supabaseClient
      .from(this.table)
      .select('*', { count: 'exact' })
      .eq('status', LeaveStatus.PENDING)
      .range(offset, offset + limit - 1)
      .order('createdAt', { ascending: true });

    if (error) throw error;

    return { data: data || [], total: count || 0 };
  }

  async findConflictingLeaves(employeeId: string, startDate: string, endDate: string): Promise<LeaveRequest[]> {
    const { data: leaveRequests, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('employeeId', employeeId)
      .neq('status', LeaveStatus.REJECTED)
      .neq('status', LeaveStatus.CANCELLED)
      .gte('endDate', startDate)
      .lte('startDate', endDate);

    if (error) throw error;

    return leaveRequests || [];
  }

  async update(id: string, data: UpdateLeaveRequestDTO): Promise<LeaveRequest> {
    const { data: leaveRequest, error } = await supabaseClient
      .from(this.table)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundError('Leave request');
    }

    return leaveRequest;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundError('Leave request');
    }
  }

  async getLeavesByDateRange(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    const { data: leaveRequests, error } = await supabaseClient
      .from(this.table)
      .select('*')
      .eq('status', LeaveStatus.APPROVED)
      .gte('startDate', startDate)
      .lte('endDate', endDate)
      .order('startDate', { ascending: true });

    if (error) throw error;

    return leaveRequests || [];
  }
}

export const leaveRequestRepository = new LeaveRequestRepository();
