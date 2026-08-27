import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    name: {
      type: String,
      default: 'Administrator',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation error when model is imported multiple times
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;
