/**
 * USMS Seed Script
 * Run: node src/seed.js
 * Creates: 1 admin, 2 faculty, 5 students, 4 courses
 */

require('dotenv').config();
const mongoose = require('mongoose');


const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/usms';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    Course.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  

  // ── Admin ────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@usms.com',
    password: 'Admin@123',
    role: 'admin',
    isActive: true,
  });
  console.log('Admin created  →  admin@usms.com / Admin@123');

  // ── Faculty ──────────────────────────────────────────────
  const facultyData = [
    { name: 'Dr. Sarah Khan',   email: 'sarah@usms.com',   dept: 'Computer Science',       spec: 'Machine Learning' },
    { name: 'Prof. James Lee',  email: 'james@usms.com',   dept: 'Electrical Engineering', spec: 'Power Systems' },
  ];

  const facultyUsers = await Promise.all(
    facultyData.map((f) =>
      User.create({ name: f.name, email: f.email, password: 'Faculty@123', role: 'faculty', isActive: true })
    )
  );

  const year = new Date().getFullYear().toString().slice(-2);
  await Promise.all(
    facultyUsers.map((u, i) =>
      Faculty.create({
        userId: u._id,
        facultyId: `FAC${year}${String(i + 1).padStart(4, '0')}`,
        department: facultyData[i].dept,
        specialization: facultyData[i].spec,
        designation: 'Assistant Professor',
        joiningDate: new Date('2020-07-01'),
      })
    )
  );
  console.log('Faculty created → sarah@usms.com / james@usms.com  (pw: Faculty@123)');

  // ── Students ─────────────────────────────────────────────
  const studentData = [
    { name: 'Alice Sharma',  email: 'alice@usms.com',  dept: 'Computer Science',       sem: 3, program: 'B.Tech', batch: '2023-2027', gender: 'female' },
    { name: 'Bob Mehta',     email: 'bob@usms.com',    dept: 'Computer Science',       sem: 3, program: 'B.Tech', batch: '2023-2027', gender: 'male'   },
    { name: 'Carol Singh',   email: 'carol@usms.com',  dept: 'Electrical Engineering', sem: 1, program: 'B.Tech', batch: '2025-2029', gender: 'female' },
    { name: 'David Patel',   email: 'david@usms.com',  dept: 'Business Administration',sem: 5, program: 'MBA',    batch: '2022-2024', gender: 'male'   },
    { name: 'Eva Rodrigues', email: 'eva@usms.com',    dept: 'Mathematics',            sem: 2, program: 'B.Sc',   batch: '2024-2027', gender: 'female' },
  ];

  const studentUsers = await Promise.all(
    studentData.map((s) =>
      User.create({ name: s.name, email: s.email, password: 'Student@123', role: 'student', isActive: true })
    )
  );

  await Promise.all(
    studentUsers.map((u, i) =>
      Student.create({
        userId: u._id,
        studentId: `STU${year}${String(i + 1).padStart(4, '0')}`,
        department: studentData[i].dept,
        semester: studentData[i].sem,
        program: studentData[i].program,
        batch: studentData[i].batch,
        gender: studentData[i].gender,
        status: 'active',
      })
    )
  );
  console.log('Students created → alice/bob/carol/david/eva @usms.com  (pw: Student@123)');

  // ── Courses ──────────────────────────────────────────────
  const faculty = await Faculty.find().populate('userId');
  const cs  = faculty.find((f) => f.department === 'Computer Science');
  const ee  = faculty.find((f) => f.department === 'Electrical Engineering');

  await Course.insertMany([
    {
      title: 'Data Structures & Algorithms',
      code: 'CS201',
      department: 'Computer Science',
      credits: 4,
      semester: 3,
      description: 'Fundamental data structures and algorithm design.',
      facultyId: cs?._id,
      maxStudents: 60,
      status: 'active',
    },
    {
      title: 'Machine Learning',
      code: 'CS401',
      department: 'Computer Science',
      credits: 3,
      semester: 5,
      description: 'Supervised, unsupervised and reinforcement learning.',
      facultyId: cs?._id,
      maxStudents: 45,
      status: 'active',
    },
    {
      title: 'Circuit Theory',
      code: 'EE101',
      department: 'Electrical Engineering',
      credits: 4,
      semester: 1,
      description: 'Fundamentals of electrical circuits.',
      facultyId: ee?._id,
      maxStudents: 60,
      status: 'active',
    },
    {
      title: 'Calculus I',
      code: 'MA101',
      department: 'Mathematics',
      credits: 3,
      semester: 1,
      description: 'Limits, derivatives and integrals.',
      maxStudents: 80,
      status: 'active',
    },
  ]);
  console.log('Courses created → CS201, CS401, EE101, MA101');

  console.log('\n✅ Seed complete.\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@usms.com   / Admin@123');
  console.log('  Faculty: sarah@usms.com   / Faculty@123');
  console.log('  Student: alice@usms.com   / Student@123');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
