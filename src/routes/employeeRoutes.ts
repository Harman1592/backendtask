import { Router } from 'express';
import { employeeController } from '@controllers/employeeController.js';
import { validate } from '@middleware/validation.js';
import { z } from 'zod';

const router = Router();

const CreateEmployeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.string().uuid(),
  position: z.string().min(1),
  joinDate: z.string().datetime(),
});

const UpdateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  departmentId: z.string().uuid().optional(),
});

router.post('/', validate(CreateEmployeeSchema), employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);
router.get('/search', employeeController.searchEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.get('/department/:departmentId', employeeController.getEmployeesByDepartment);
router.put('/:id', validate(UpdateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
