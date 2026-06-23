import { Request, Response } from 'express';
import { departmentService } from '@services/departmentService.js';
import { asyncHandler } from '@middleware/errorHandler.js';
import { sendSuccess, sendPaginated, sendError } from '@utils/response.js';

export class DepartmentController {
  createDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
      sendError(res, 'Department name is required', 400);
      return;
    }

    const department = await departmentService.createDepartment(name, description);
    sendSuccess(res, department, 201, 'Department created successfully');
  });

  getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.getDepartmentById(req.params.id);
    sendSuccess(res, department, 200);
  });

  getAllDepartments = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await departmentService.getAllDepartments(page, limit);
    sendPaginated(res, result.data, result.total, result.page, limit, 200);
  });

  updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const department = await departmentService.updateDepartment(req.params.id, name, description);
    sendSuccess(res, department, 200, 'Department updated successfully');
  });

  deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    await departmentService.deleteDepartment(req.params.id);
    sendSuccess(res, { message: 'Department deleted successfully' }, 200);
  });
}

export const departmentController = new DepartmentController();
