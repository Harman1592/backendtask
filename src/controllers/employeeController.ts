import { Request, Response } from 'express';
import { employeeService } from '@services/employeeService.js';
import { asyncHandler } from '@middleware/errorHandler.js';
import { sendSuccess, sendPaginated, sendError } from '@utils/response.js';
import type { CreateEmployeeDTO } from '../types/index.js';

export class EmployeeController {
  createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeeService.createEmployee(req.body as CreateEmployeeDTO);
    sendSuccess(res, employee, 201, 'Employee created successfully');
  });

  getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeeService.getEmployeeById(req.params.id);
    sendSuccess(res, employee, 200);
  });

  getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await employeeService.getAllEmployees(page, limit);
    sendPaginated(res, result.data, result.total, result.page, limit, 200);
  });

  getEmployeesByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const employees = await employeeService.getEmployeesByDepartment(req.params.departmentId);
    sendSuccess(res, employees, 200);
  });

  updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    sendSuccess(res, employee, 200, 'Employee updated successfully');
  });

  deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    await employeeService.deleteEmployee(req.params.id);
    sendSuccess(res, { message: 'Employee deleted successfully' }, 200);
  });

  searchEmployees = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
      sendError(res, 'Search query is required', 400);
      return;
    }

    const employees = await employeeService.searchEmployees(query);
    sendSuccess(res, employees, 200);
  });
}

export const employeeController = new EmployeeController();
