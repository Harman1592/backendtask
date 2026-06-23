import { Request, Response } from 'express';
import { leaveRequestService } from '@services/leaveRequestService.js';
import { asyncHandler } from '@middleware/errorHandler.js';
import { sendSuccess, sendPaginated, sendError } from '@utils/response.js';
import type { CreateLeaveRequestDTO } from '../types/index.js';

export class LeaveRequestController {
  createLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const leaveRequest = await leaveRequestService.createLeaveRequest(req.body as CreateLeaveRequestDTO);
    sendSuccess(res, leaveRequest, 201, 'Leave request created successfully');
  });

  getLeaveRequestById = asyncHandler(async (req: Request, res: Response) => {
    const leaveRequest = await leaveRequestService.getLeaveRequestById(req.params.id);
    sendSuccess(res, leaveRequest, 200);
  });

  getEmployeeLeaveRequests = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await leaveRequestService.getEmployeeLeaveRequests(req.params.employeeId, page, limit);
    sendPaginated(res, result.data, result.total, result.page, limit, 200);
  });

  getPendingApprovals = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await leaveRequestService.getPendingApprovals(page, limit);
    sendPaginated(res, result.data, result.total, result.page, limit, 200);
  });

  approveLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const { approverId } = req.body;
    if (!approverId) {
      sendError(res, 'Approver ID is required', 400);
      return;
    }

    const leaveRequest = await leaveRequestService.approveLeaveRequest(req.params.id, approverId);
    sendSuccess(res, leaveRequest, 200, 'Leave request approved successfully');
  });

  rejectLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    if (!reason) {
      sendError(res, 'Rejection reason is required', 400);
      return;
    }

    const leaveRequest = await leaveRequestService.rejectLeaveRequest(req.params.id, reason);
    sendSuccess(res, leaveRequest, 200, 'Leave request rejected successfully');
  });

  cancelLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
    const leaveRequest = await leaveRequestService.cancelLeaveRequest(req.params.id);
    sendSuccess(res, leaveRequest, 200, 'Leave request cancelled successfully');
  });

  getLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
    const balance = await leaveRequestService.getLeaveBalance(req.params.employeeId);
    sendSuccess(res, balance, 200);
  });

  getLeavesByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      sendError(res, 'startDate and endDate are required', 400);
      return;
    }

    const leaves = await leaveRequestService.getLeavesByDateRange(startDate as string, endDate as string);
    sendSuccess(res, leaves, 200);
  });
}

export const leaveRequestController = new LeaveRequestController();
