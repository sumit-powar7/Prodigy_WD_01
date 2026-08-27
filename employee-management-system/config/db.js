import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no MONGODB_URI is provided or if standard localhost connection fails, fallback to MongoMemoryServer
    if (!mongoUri) {
      console.log('⚡ MONGODB_URI not set. Launching MongoMemoryServer for instant zero-config setup...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`✅ In-Memory MongoDB running at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);

    // Seed initial data if database is empty
    await seedInitialData();
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Switching to in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Connected successfully at: ${memoryUri}`);

      await seedInitialData();
    } catch (memError) {
      console.error(`❌ MongoDB Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

async function seedInitialData() {
  try {
    const Admin = mongoose.model('Admin');
    const Employee = mongoose.model('Employee');

    // Check if admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await Admin.create({
        email: 'admin@company.com',
        password: hashedPassword,
        name: 'Super Admin',
      });
      console.log('👤 Default Admin created: email: admin@company.com | password: Admin@123');
    }

    // Check if employees exist
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      const initialEmployees = [
        {
          employeeId: 'EMP-1001',
          firstName: 'Alex',
          lastName: 'Morgan',
          email: 'alex.morgan@company.com',
          position: 'Senior Full Stack Engineer',
          department: 'Engineering',
          salary: 115000,
          dateOfJoining: new Date('2022-03-15'),
        },
        {
          employeeId: 'EMP-1002',
          firstName: 'Sophia',
          lastName: 'Chen',
          email: 'sophia.chen@company.com',
          position: 'Product Designer',
          department: 'Design',
          salary: 92000,
          dateOfJoining: new Date('2023-01-10'),
        },
        {
          employeeId: 'EMP-1003',
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'marcus.vance@company.com',
          position: 'Engineering Manager',
          department: 'Engineering',
          salary: 145000,
          dateOfJoining: new Date('2021-06-01'),
        },
        {
          employeeId: 'EMP-1004',
          firstName: 'Elena',
          lastName: 'Rostova',
          email: 'elena.rostova@company.com',
          position: 'HR Business Partner',
          department: 'Human Resources',
          salary: 78000,
          dateOfJoining: new Date('2023-08-20'),
        },
        {
          employeeId: 'EMP-1005',
          firstName: 'David',
          lastName: 'Kim',
          email: 'david.kim@company.com',
          position: 'Data Analyst',
          department: 'Analytics',
          salary: 85000,
          dateOfJoining: new Date('2024-02-01'),
        },
      ];

      await Employee.insertMany(initialEmployees);
      console.log('📊 Seeded 5 initial employee records into database.');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}
