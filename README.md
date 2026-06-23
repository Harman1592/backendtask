# Employee Leave Management System

A production-ready Employee Leave Management System built with TypeScript, Node.js, Express, and Supabase. This system provides comprehensive leave management capabilities with a clean, layered architecture.

## Features

- **Employee Management**: Create, update, and manage employee records
- **Leave Request Management**: Submit, approve, reject, and cancel leave requests
- **Department Management**: Organize employees by departments
- **Leave Balance Tracking**: Track leave balances by type (sick, vacation, personal, etc.)
- **Conflict Detection**: Automatically detects overlapping leave requests
- **Business Days Calculation**: Calculates leave duration in business days
- **Approval Workflow**: Multi-level approval system for leave requests
- **Date Range Queries**: Get approved leaves for specific date ranges
- **Search & Filtering**: Search employees and filter leave requests by status

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod
- **UUID**: uuid

## Project Structure

```
src/
├── config/              # Configuration management
│   ├── index.ts        # Main config
│   └── database.ts     # Database setup
├── controllers/        # Request handlers
│   ├── employeeController.ts
│   ├── leaveRequestController.ts
│   └── departmentController.ts
├── services/           # Business logic
│   ├── employeeService.ts
│   ├── leaveRequestService.ts
│   └── departmentService.ts
├── repositories/       # Data access layer
│   ├── employeeRepository.ts
│   ├── leaveRequestRepository.ts
│   └── departmentRepository.ts
├── routes/             # API routes
│   ├── employeeRoutes.ts
│   ├── leaveRequestRoutes.ts
│   ├── departmentRoutes.ts
│   └── index.ts
├── middleware/         # Express middleware
│   ├── errorHandler.ts
│   └── validation.ts
├── types/              # TypeScript types & schemas
│   └── index.ts
├── utils/              # Utility functions
│   ├── errors.ts
│   ├── response.ts
│   ├── logger.ts
│   └── date.ts
└── index.ts            # Application entry point
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account with a PostgreSQL database

### Setup Steps

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Create database tables** in Supabase:

   ```sql
   -- Departments table
   CREATE TABLE departments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL UNIQUE,
     description TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Employees table
   CREATE TABLE employees (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email VARCHAR(255) NOT NULL UNIQUE,
     first_name VARCHAR(255) NOT NULL,
     last_name VARCHAR(255) NOT NULL,
     department_id UUID REFERENCES departments(id),
     position VARCHAR(255) NOT NULL,
     join_date DATE NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Leave requests table
   CREATE TABLE leave_requests (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     employee_id UUID REFERENCES employees(id) NOT NULL,
     leave_type VARCHAR(50) NOT NULL,
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     reason TEXT,
     status VARCHAR(20) DEFAULT 'pending',
     approved_by UUID REFERENCES employees(id),
     approval_date TIMESTAMPTZ,
     rejection_reason TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Indexes
   CREATE INDEX idx_employees_department ON employees(department_id);
   CREATE INDEX idx_leaves_employee ON leave_requests(employee_id);
   CREATE INDEX idx_leaves_status ON leave_requests(status);
   CREATE INDEX idx_leaves_dates ON leave_requests(start_date, end_date);
   ```

## API Endpoints

### Employees

- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees` - List all employees (paginated)
- `GET /api/v1/employees/:id` - Get employee by ID
- `GET /api/v1/employees/department/:departmentId` - Get employees by department
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee
- `GET /api/v1/employees/search?q=query` - Search employees

### Leave Requests

- `POST /api/v1/leaves` - Create leave request
- `GET /api/v1/leaves` - List leave requests (paginated)
- `GET /api/v1/leaves/:id` - Get leave request by ID
- `GET /api/v1/leaves/employee/:employeeId` - Get employee's leave requests
- `GET /api/v1/leaves/balance/:employeeId` - Get leave balance
- `GET /api/v1/leaves/pending` - Get pending approvals
- `GET /api/v1/leaves/date-range?startDate=2024-01-01&endDate=2024-01-31` - Get leaves by date range
- `POST /api/v1/leaves/:id/approve` - Approve leave request
- `POST /api/v1/leaves/:id/reject` - Reject leave request
- `POST /api/v1/leaves/:id/cancel` - Cancel leave request

### Departments

- `POST /api/v1/departments` - Create department
- `GET /api/v1/departments` - List all departments
- `GET /api/v1/departments/:id` - Get department by ID
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department

### Health Check

- `GET /health` - Server health check

## Running the Application

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Error Handling

The application includes comprehensive error handling:

- `ValidationError` - 400 Bad Request
- `NotFoundError` - 404 Not Found
- `UnauthorizedError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden
- `ConflictError` - 409 Conflict

All errors are returned in a consistent JSON format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## Leave Types

- `sick` - 12 days/year
- `vacation` - 20 days/year
- `personal` - 5 days/year
- `unpaid` - Unlimited (but requires approval)
- `maternity` - 90 days
- `paternity` - 10 days

## Leave Status

- `pending` - Awaiting approval
- `approved` - Leave approved
- `rejected` - Leave rejected
- `cancelled` - Leave cancelled by employee

## Best Practices Implemented

✅ **Layered Architecture** - Separation of concerns with controllers, services, and repositories
✅ **Type Safety** - Full TypeScript with strict mode enabled
✅ **Input Validation** - Zod schemas for request validation
✅ **Error Handling** - Comprehensive error handling with custom error classes
✅ **Path Aliases** - Clean imports using `@` aliases
✅ **Async/Await** - Proper async handling with try-catch wrapping
✅ **Logging** - Structured logging with different log levels
✅ **Database Indexing** - Optimized queries with proper indexes
✅ **CORS** - Configurable CORS support
✅ **Environment Configuration** - Secure environment variable handling

## Development

### Code Style

- ESLint for code quality
- Prettier for code formatting
- TypeScript strict mode for type safety

### Database Optimization

- Proper indexing on frequently queried columns
- Efficient pagination implementation
- Date range queries optimized for leave calculations

## Troubleshooting

### Port Already in Use
```bash
lsof -i :3000  # Find process on port 3000
kill -9 <PID>  # Kill the process
```

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check internet connection
- Ensure Supabase project is active

### Database Table Not Found
- Run the SQL setup commands in Supabase SQL editor
- Verify table names match configuration

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
