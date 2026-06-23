import { z } from 'zod';

// Enums
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum LeaveType {
  SICK = 'sick',
  VACATION = 'vacation',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
}

// Zod Schemas
export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.string().uuid(),
  position: z.string(),
  joinDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LeaveRequestSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  leaveType: z.nativeEnum(LeaveType),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
  status: z.nativeEnum(LeaveStatus).default(LeaveStatus.PENDING),
  approvedBy: z.string().uuid().nullable(),
  approvalDate: z.string().datetime().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Types
export type Employee = z.infer<typeof EmployeeSchema>;
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;
export type Department = z.infer<typeof DepartmentSchema>;

// Request/Response Types
export interface CreateEmployeeDTO {
  email: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  position: string;
  joinDate: string;
}

export interface UpdateEmployeeDTO {
  firstName?: string;
  lastName?: string;
  position?: string;
  departmentId?: string;
}

export interface CreateLeaveRequestDTO {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestDTO {
  status?: LeaveStatus;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  employeeId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
