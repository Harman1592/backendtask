import { Router } from 'express';
import { leaveRequestController } from '@controllers/leaveRequestController.js';
import { validate } from '@middleware/validation.js';
import { z } from 'zod';
import { LeaveType } from '../types/index.js';

const router = Router();

const CreateLeaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  leaveType: z.nativeEnum(LeaveType),
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
});

const ApproveLeaveSchema = z.object({
  approverId: z.string().uuid(),
});

const RejectLeaveSchema = z.object({
  reason: z.string().min(1),
});

router.post('/', validate(CreateLeaveRequestSchema), leaveRequestController.createLeaveRequest);
router.get('/pending', leaveRequestController.getPendingApprovals);
router.get('/date-range', leaveRequestController.getLeavesByDateRange);
router.get('/balance/:employeeId', leaveRequestController.getLeaveBalance);
router.get('/employee/:employeeId', leaveRequestController.getEmployeeLeaveRequests);
router.get('/:id', leaveRequestController.getLeaveRequestById);
router.post('/:id/approve', validate(ApproveLeaveSchema), leaveRequestController.approveLeaveRequest);
router.post('/:id/reject', validate(RejectLeaveSchema), leaveRequestController.rejectLeaveRequest);
router.post('/:id/cancel', leaveRequestController.cancelLeaveRequest);

export default router;
