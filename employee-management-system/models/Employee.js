import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary must be a positive number'],
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Include virtuals in JSON output
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;
