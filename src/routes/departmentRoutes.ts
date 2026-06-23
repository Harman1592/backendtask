import { Router } from 'express';
import { departmentController } from '@controllers/departmentController.js';
import { validate } from '@middleware/validation.js';
import { z } from 'zod';

const router = Router();

const CreateDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const UpdateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

router.post('/', validate(CreateDepartmentSchema), departmentController.createDepartment);
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.put('/:id', validate(UpdateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

export default router;
