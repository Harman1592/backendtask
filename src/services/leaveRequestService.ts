import { leaveRequestRepository } from '@repositories/leaveRequestRepository.js';
import { employeeRepository } from '@repositories/employeeRepository.js';
import type { LeaveRequest, CreateLeaveRequestDTO, UpdateLeaveRequestDTO, LeaveBalance } from '../types/index.js';
import { LeaveStatus, LeaveType } from '../types/index.js';
import { ValidationError, ConflictError, NotFoundError } from '@utils/errors.js';
import { calculateBusinessDays, stringToDate } from '@utils/date.js';

export class LeaveRequestService {
  async createLeaveRequest(data: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    // Verify employee exists
    await employeeRepository.findById(data.employeeId);

    // Validate dates
    const startDate = stringToDate(data.startDate);
    const endDate = stringToDate(data.endDate);

    if (startDate > endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new ValidationError('Cannot create leave request for past dates');
    }

    // Check for conflicting leaves
    const conflicting = await leaveRequestRepository.findConflictingLeaves(
      data.employeeId,
      data.startDate,
      data.endDate
    );

    if (conflicting.length > 0) {
      throw new ConflictError('Employee already has a leave request during this period');
    }

    return leaveRequestRepository.create(data);
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    return leaveRequestRepository.findById(id);
  }

  async getEmployeeLeaveRequests(
    employeeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: LeaveRequest[]; total: number; page: number; pages: number }> {
    // Verify employee exists
    await employeeRepository.findById(employeeId);

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const offset = (page - 1) * limit;
    const { data, total } = await leaveRequestRepository.findByEmployeeId(employeeId, limit, offset);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getPendingApprovals(page: number = 1, limit: number = 10): Promise<{ data: LeaveRequest[]; total: number; page: number; pages: number }> {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const offset = (page - 1) * limit;
    const { data, total } = await leaveRequestRepository.findPendingApprovals(limit, offset);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async approveLeaveRequest(id: string, approverEmployeeId: string): Promise<LeaveRequest> {
    const leaveRequest = await leaveRequestRepository.findById(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ValidationError(`Cannot approve a ${leaveRequest.status} leave request`);
    }

    return leaveRequestRepository.update(id, {
      status: LeaveStatus.APPROVED,
      approvedBy: approverEmployeeId,
      approvalDate: new Date().toISOString(),
    });
  }

  async rejectLeaveRequest(id: string, reason: string): Promise<LeaveRequest> {
    const leaveRequest = await leaveRequestRepository.findById(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ValidationError(`Cannot reject a ${leaveRequest.status} leave request`);
    }

    if (!reason.trim()) {
      throw new ValidationError('Rejection reason is required');
    }

    return leaveRequestRepository.update(id, {
      status: LeaveStatus.REJECTED,
      rejectionReason: reason,
    });
  }

  async cancelLeaveRequest(id: string): Promise<LeaveRequest> {
    const leaveRequest = await leaveRequestRepository.findById(id);

    if (leaveRequest.status === LeaveStatus.REJECTED || leaveRequest.status === LeaveStatus.CANCELLED) {
      throw new ValidationError(`Cannot cancel a ${leaveRequest.status} leave request`);
    }

    return leaveRequestRepository.update(id, {
      status: LeaveStatus.CANCELLED,
    });
  }

  async getLeaveBalance(employeeId: string): Promise<LeaveBalance[]> {
    // Verify employee exists
    await employeeRepository.findById(employeeId);

    const leaveBalances: LeaveBalance[] = [];
    const leaveTypes = Object.values(LeaveType);

    // Get all approved leaves for this employee
    const approvedLeaves = await leaveRequestRepository.findByStatus(LeaveStatus.APPROVED);
    const employeeLeaves = approvedLeaves.data.filter(leave => leave.employeeId === employeeId);

    for (const type of leaveTypes) {
      const leaves = employeeLeaves.filter(leave => leave.leaveType === type);

      let usedDays = 0;
      for (const leave of leaves) {
        const start = stringToDate(leave.startDate);
        const end = stringToDate(leave.endDate);
        usedDays += calculateBusinessDays(start, end);
      }

      const totalDays = this.getDefaultLeaveDays(type);
      const remainingDays = totalDays - usedDays;

      leaveBalances.push({
        employeeId,
        leaveType: type,
        totalDays,
        usedDays,
        remainingDays: Math.max(0, remainingDays),
      });
    }

    return leaveBalances;
  }

  private getDefaultLeaveDays(type: LeaveType): number {
    const defaults: Record<LeaveType, number> = {
      [LeaveType.SICK]: 12,
      [LeaveType.VACATION]: 20,
      [LeaveType.PERSONAL]: 5,
      [LeaveType.UNPAID]: 0,
      [LeaveType.MATERNITY]: 90,
      [LeaveType.PATERNITY]: 10,
    };

    return defaults[type];
  }

  async getLeavesByDateRange(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    return leaveRequestRepository.getLeavesByDateRange(startDate, endDate);
  }
}

export const leaveRequestService = new LeaveRequestService();
