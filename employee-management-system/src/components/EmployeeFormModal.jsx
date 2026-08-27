import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Loader2, DollarSign, Calendar, Mail, Briefcase, Building, Hash, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Human Resources',
  'Marketing',
  'Sales',
  'Finance',
  'Analytics',
  'Operations',
  'Legal',
];

const EmployeeFormModal = ({ isOpen, onClose, employeeToEdit, onEmployeeSaved }) => {
  const isEdit = !!employeeToEdit;

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: 'Engineering',
    salary: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
  });

  const [customDepartment, setCustomDepartment] = useState('');
  const [showCustomDept, setShowCustomDept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employeeToEdit) {
      const formattedDate = employeeToEdit.dateOfJoining
        ? new Date(employeeToEdit.dateOfJoining).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const isKnownDept = DEPARTMENTS.includes(employeeToEdit.department);

      setFormData({
        employeeId: employeeToEdit.employeeId || '',
        firstName: employeeToEdit.firstName || '',
        lastName: employeeToEdit.lastName || '',
        email: employeeToEdit.email || '',
        position: employeeToEdit.position || '',
        department: isKnownDept ? employeeToEdit.department : 'Other',
        salary: employeeToEdit.salary !== undefined ? employeeToEdit.salary : '',
        dateOfJoining: formattedDate,
      });

      if (!isKnownDept && employeeToEdit.department) {
        setShowCustomDept(true);
        setCustomDepartment(employeeToEdit.department);
      } else {
        setShowCustomDept(false);
        setCustomDepartment('');
      }
    } else {
      // Auto-generate a fresh random Employee ID for convenience e.g. EMP-1084
      const randomId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        employeeId: randomId,
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: 'Engineering',
        salary: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
      });
      setShowCustomDept(false);
      setCustomDepartment('');
    }
    setError(null);
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department') {
      if (value === 'Other') {
        setShowCustomDept(true);
      } else {
        setShowCustomDept(false);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalDepartment = showCustomDept ? customDepartment.trim() : formData.department;

    // Front-end Validations
    if (!formData.employeeId.trim()) return setError('Employee ID is required.');
    if (!formData.firstName.trim()) return setError('First Name is required.');
    if (!formData.lastName.trim()) return setError('Last Name is required.');
    if (!formData.email.trim()) return setError('Email address is required.');
    if (!formData.position.trim()) return setError('Position title is required.');
    if (!finalDepartment) return setError('Department is required.');
    if (!formData.salary || isNaN(formData.salary) || Number(formData.salary) < 0) {
      return setError('Salary must be a positive number.');
    }
    if (!formData.dateOfJoining) return setError('Date of joining is required.');

    setLoading(true);

    try {
      const payload = {
        ...formData,
        department: finalDepartment,
        salary: Number(formData.salary),
      };

      const url = isEdit ? `/api/employees/${employeeToEdit._id}` : '/api/employees';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save employee record.');
      }

      onEmployeeSaved(data.employee, isEdit ? 'updated' : 'created');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              {isEdit ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isEdit ? 'Edit Employee Details' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update existing employee information in database' : 'Register a new employee into the system'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employee ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="employeeId"
                  required
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP-1001"
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@company.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Position / Job Title <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="Other">Other (Specify Custom...)</option>
                </select>
              </div>
            </div>

            {/* Custom Department input if "Other" selected */}
            {showCustomDept && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specify Custom Department Name
                </label>
                <input
                  type="text"
                  required
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  placeholder="e.g. Quality Assurance"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Annual Salary ($ USD) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="salary"
                  min="0"
                  step="1000"
                  required
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="85000"
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Joining <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="dateOfJoining"
                  required
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Update Employee' : 'Save Employee'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
