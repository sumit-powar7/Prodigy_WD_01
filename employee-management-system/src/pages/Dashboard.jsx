import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import EmployeeFormModal from '../components/EmployeeFormModal';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Calendar,
  X,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  // Delete Confirm Modal State
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch employees from Backend API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedDepartment && selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load employee records.');
      }

      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Fetch employees error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, selectedDepartment, sortBy, sortOrder]);

  // Derived Analytics Metrics
  const metrics = useMemo(() => {
    const total = employees.length;
    const totalPayroll = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);
    const avgSalary = total > 0 ? Math.round(totalPayroll / total) : 0;
    const depts = new Set(employees.map((e) => e.department)).size;

    return { total, totalPayroll, avgSalary, depts };
  }, [employees]);

  // Department list for dropdown
  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);
    return ['All', ...depts];
  }, [employees]);

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/employees/${employeeToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete employee.');
      }

      setEmployees((prev) => prev.filter((e) => e._id !== employeeToDelete._id));
      showToast(`Employee "${employeeToDelete.firstName} ${employeeToDelete.lastName}" removed successfully.`);
      setEmployeeToDelete(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleEmployeeSaved = (savedEmp, actionType) => {
    fetchEmployees();
    showToast(
      actionType === 'created'
        ? `Employee "${savedEmp.firstName} ${savedEmp.lastName}" created successfully.`
        : `Employee "${savedEmp.firstName} ${savedEmp.lastName}" details updated.`
    );
  };

  // Helper badge color per department
  const getDeptColor = (dept) => {
    const map = {
      Engineering: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      Design: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'Human Resources': 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      Marketing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      Sales: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      Finance: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      Analytics: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      Operations: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    };
    return map[dept] || 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-bounce ${
              toast.type === 'error'
                ? 'bg-red-950 border-red-800 text-red-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-400" />
              Employee Directory & Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage company personnel, view payroll metrics, and maintain up-to-date staff records.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchEmployees}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Refresh Employee Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Staff</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">{metrics.total}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active registered employees</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Payroll</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">
              ${metrics.totalPayroll.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Combined annual salary sum</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Salary</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">
              ${metrics.avgSalary.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Mean annual compensation</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Departments</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">{metrics.depts}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active functional divisions</p>
          </div>
        </div>

        {/* Filters and Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, position, ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Dropdown & Sorting Options */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Department Filter */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium hidden sm:inline">Dept:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-slate-100">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Field */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="createdAt" className="bg-slate-900 text-slate-100">Date Added</option>
                <option value="firstName" className="bg-slate-900 text-slate-100">First Name</option>
                <option value="lastName" className="bg-slate-900 text-slate-100">Last Name</option>
                <option value="employeeId" className="bg-slate-900 text-slate-100">Employee ID</option>
                <option value="salary" className="bg-slate-900 text-slate-100">Salary</option>
                <option value="dateOfJoining" className="bg-slate-900 text-slate-100">Joining Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="ml-1 text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300"
                title="Toggle Sort Order"
              >
                {sortOrder}
              </button>
            </div>
          </div>
        </div>

        {/* Employees Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {error && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-xs text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchEmployees} className="underline font-bold">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs font-medium">Loading employee records...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No employees found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedDepartment !== 'All'
                  ? 'No records match your search query or department filter.'
                  : 'Your database has no registered employees. Click "Add Employee" to create one.'}
              </p>
              {(searchQuery || selectedDepartment !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('All');
                  }}
                  className="mt-4 px-3 py-1.5 bg-slate-800 text-indigo-400 text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Employee</th>
                    <th className="py-3.5 px-4">Employee ID</th>
                    <th className="py-3.5 px-4">Department & Position</th>
                    <th className="py-3.5 px-4">Salary</th>
                    <th className="py-3.5 px-4">Date Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Name & Email */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-xs border border-slate-700 shrink-0">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                          {emp.employeeId}
                        </span>
                      </td>

                      {/* Dept & Position */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDeptColor(
                              emp.department
                            )}`}
                          >
                            {emp.department}
                          </span>
                          <p className="text-slate-300 text-xs">{emp.position}</p>
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        ${Number(emp.salary).toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">/ yr</span>
                      </td>

                      {/* Date Joined */}
                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {emp.dateOfJoining
                          ? new Date(emp.dateOfJoining).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEmployeeToDelete(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeToEdit={employeeToEdit}
        onEmployeeSaved={handleEmployeeSaved}
      />

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-100">Delete Employee Record</h3>
            <p className="text-xs text-slate-400 text-center mt-2">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-200">
                {employeeToDelete.firstName} {employeeToDelete.lastName}
              </strong>{' '}
              ({employeeToDelete.employeeId})? This action cannot be undone.
            </p>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEmployeeToDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition-colors shadow-lg shadow-red-600/20"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
