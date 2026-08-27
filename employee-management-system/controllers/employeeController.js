import Employee from '../models/Employee.js';

/**
 * @desc Get all employees with optional search & filter
 * @route GET /api/employees
 * @access Private (Admin)
 */
export const getAllEmployees = async (req, res) => {
  try {
    const { search, department, sortBy, sortOrder } = req.query;

    let query = {};

    // Search filter across name, email, employeeId, position, department
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { position: searchRegex },
        { department: searchRegex },
      ];
    }

    // Department filter
    if (department && department !== 'All') {
      query.department = department;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default newest first
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const employees = await Employee.find(query).sort(sortOptions);

    // Get unique list of departments for frontend filter dropdowns
    const allDepartments = await Employee.distinct('department');

    res.status(200).json({
      success: true,
      count: employees.length,
      departments: allDepartments,
      employees,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees from database.',
    });
  }
};

/**
 * @desc Get single employee by ID
 * @route GET /api/employees/:id
 * @access Private (Admin)
 */
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Search by _id or employeeId
    let employee = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(id);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee details.',
    });
  }
};

/**
 * @desc Create new employee
 * @route POST /api/employees
 * @access Private (Admin)
 */
export const createEmployee = async (req, res) => {
  try {
    const { employeeId, firstName, lastName, email, position, department, salary, dateOfJoining } = req.body;

    // Input Validation
    if (!employeeId || !firstName || !lastName || !email || !position || !department || salary === undefined || !dateOfJoining) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (employeeId, firstName, lastName, email, position, department, salary, dateOfJoining).',
      });
    }

    if (isNaN(Number(salary)) || Number(salary) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Salary must be a valid positive number.',
      });
    }

    // Check duplicate employeeId
    const existingId = await Employee.findOne({ employeeId: employeeId.trim() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID "${employeeId}" already exists. Please use a unique Employee ID.`,
      });
    }

    // Check duplicate email
    const existingEmail = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `An employee with email "${email}" already exists.`,
      });
    }

    const newEmployee = await Employee.create({
      employeeId: employeeId.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      position: position.trim(),
      department: department.trim(),
      salary: Number(salary),
      dateOfJoining: new Date(dateOfJoining),
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      employee: newEmployee,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create employee.',
    });
  }
};

/**
 * @desc Update existing employee
 * @route PUT /api/employees/:id
 * @access Private (Admin)
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, firstName, lastName, email, position, department, salary, dateOfJoining } = req.body;

    let employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    // Check unique employeeId collision with other employees
    if (employeeId && employeeId !== employee.employeeId) {
      const duplicateId = await Employee.findOne({ employeeId: employeeId.trim(), _id: { $ne: id } });
      if (duplicateId) {
        return res.status(400).json({
          success: false,
          message: `Employee ID "${employeeId}" is already assigned to another employee.`,
        });
      }
      employee.employeeId = employeeId.trim();
    }

    // Check unique email collision with other employees
    if (email && email.toLowerCase() !== employee.email) {
      const duplicateEmail = await Employee.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: `Email "${email}" is already in use by another employee.`,
        });
      }
      employee.email = email.toLowerCase().trim();
    }

    if (firstName) employee.firstName = firstName.trim();
    if (lastName) employee.lastName = lastName.trim();
    if (position) employee.position = position.trim();
    if (department) employee.department = department.trim();
    if (salary !== undefined) {
      if (isNaN(Number(salary)) || Number(salary) < 0) {
        return res.status(400).json({ success: false, message: 'Salary must be a positive number.' });
      }
      employee.salary = Number(salary);
    }
    if (dateOfJoining) employee.dateOfJoining = new Date(dateOfJoining);

    const updatedEmployee = await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee details updated successfully.',
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update employee details.',
    });
  }
};

/**
 * @desc Delete employee
 * @route DELETE /api/employees/:id
 * @access Private (Admin)
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Employee "${employee.firstName} ${employee.lastName}" (ID: ${employee.employeeId}) has been deleted.`,
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee record.',
    });
  }
};
