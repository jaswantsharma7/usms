/**
 * USMS Full Seed Script — node src/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User        = require('./models/User');
const Student     = require('./models/Student');
const Faculty     = require('./models/Faculty');
const Course      = require('./models/Course');
const Enrollment  = require('./models/Enrollment');
const Grade       = require('./models/Grade');
const Timetable   = require('./models/Timetable');
const Attendance  = require('./models/Attendance');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/usms';
const ACADEMIC_YEAR = '2024-2025';

const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick  = (a)  => a[rand(0,a.length-1)];
const slug  = (s)  => s.toLowerCase().replace(/\s+/g,'');

function calcGrade(t){
  if(t>=95)return{grade:'A+',gp:4.0};if(t>=90)return{grade:'A',gp:4.0};
  if(t>=85)return{grade:'A-',gp:3.7};if(t>=80)return{grade:'B+',gp:3.3};
  if(t>=75)return{grade:'B',gp:3.0};if(t>=70)return{grade:'B-',gp:2.7};
  if(t>=65)return{grade:'C+',gp:2.3};if(t>=60)return{grade:'C',gp:2.0};
  if(t>=55)return{grade:'C-',gp:1.7};if(t>=50)return{grade:'D+',gp:1.3};
  if(t>=45)return{grade:'D',gp:1.0};return{grade:'F',gp:0.0};
}

function pastClassDates(n=60){
  const dates=[];let d=new Date();
  while(dates.length<n){d=new Date(d.getTime()-86400000);if(d.getDay()!==0&&d.getDay()!==6)dates.push(new Date(d));}
  return dates.reverse();
}

const DEPARTMENTS=['Computer Science','Electrical Engineering','Mechanical Engineering','Business Administration','Mathematics'];
const DEPT_COURSES={
  'Computer Science':[
    {title:'Data Structures & Algorithms',code:'CS201',credits:4,sem:3},
    {title:'Operating Systems',code:'CS301',credits:4,sem:5},
    {title:'Database Management Systems',code:'CS302',credits:3,sem:5},
    {title:'Computer Networks',code:'CS401',credits:3,sem:7},
    {title:'Machine Learning',code:'CS501',credits:4,sem:7},
    {title:'Web Development',code:'CS203',credits:3,sem:3},
    {title:'Software Engineering',code:'CS303',credits:3,sem:5},
    {title:'Artificial Intelligence',code:'CS502',credits:4,sem:7},
    {title:'Cloud Computing',code:'CS601',credits:3,sem:8},
    {title:'Cybersecurity Fundamentals',code:'CS602',credits:3,sem:8},
  ],
  'Electrical Engineering':[
    {title:'Circuit Theory',code:'EE101',credits:4,sem:1},
    {title:'Signals & Systems',code:'EE201',credits:4,sem:3},
    {title:'Digital Electronics',code:'EE202',credits:3,sem:3},
    {title:'Power Systems',code:'EE301',credits:4,sem:5},
    {title:'Control Systems',code:'EE302',credits:4,sem:5},
    {title:'Electromagnetic Theory',code:'EE303',credits:3,sem:5},
    {title:'Microprocessors',code:'EE401',credits:3,sem:7},
    {title:'VLSI Design',code:'EE501',credits:3,sem:7},
    {title:'Renewable Energy Systems',code:'EE601',credits:3,sem:8},
    {title:'Embedded Systems',code:'EE602',credits:3,sem:8},
  ],
  'Mechanical Engineering':[
    {title:'Engineering Mechanics',code:'ME101',credits:4,sem:1},
    {title:'Thermodynamics',code:'ME201',credits:4,sem:3},
    {title:'Fluid Mechanics',code:'ME202',credits:4,sem:3},
    {title:'Manufacturing Processes',code:'ME301',credits:3,sem:5},
    {title:'Machine Design',code:'ME302',credits:4,sem:5},
    {title:'Heat Transfer',code:'ME303',credits:3,sem:5},
    {title:'CAD/CAM',code:'ME401',credits:3,sem:7},
    {title:'Robotics & Automation',code:'ME501',credits:3,sem:7},
    {title:'Industrial Engineering',code:'ME601',credits:3,sem:8},
    {title:'Automotive Engineering',code:'ME602',credits:3,sem:8},
  ],
  'Business Administration':[
    {title:'Principles of Management',code:'BA101',credits:3,sem:1},
    {title:'Financial Accounting',code:'BA201',credits:3,sem:3},
    {title:'Marketing Management',code:'BA202',credits:3,sem:3},
    {title:'Human Resource Management',code:'BA301',credits:3,sem:5},
    {title:'Business Analytics',code:'BA302',credits:3,sem:5},
    {title:'Corporate Finance',code:'BA303',credits:4,sem:5},
    {title:'Strategic Management',code:'BA401',credits:3,sem:7},
    {title:'Entrepreneurship',code:'BA501',credits:3,sem:7},
    {title:'Supply Chain Management',code:'BA601',credits:3,sem:8},
    {title:'International Business',code:'BA602',credits:3,sem:8},
  ],
  'Mathematics':[
    {title:'Calculus I',code:'MA101',credits:4,sem:1},
    {title:'Calculus II',code:'MA102',credits:4,sem:2},
    {title:'Linear Algebra',code:'MA201',credits:4,sem:3},
    {title:'Differential Equations',code:'MA202',credits:3,sem:3},
    {title:'Probability & Statistics',code:'MA301',credits:3,sem:5},
    {title:'Numerical Methods',code:'MA302',credits:3,sem:5},
    {title:'Abstract Algebra',code:'MA401',credits:4,sem:7},
    {title:'Real Analysis',code:'MA402',credits:4,sem:7},
    {title:'Complex Analysis',code:'MA501',credits:3,sem:8},
    {title:'Topology',code:'MA601',credits:3,sem:8},
  ],
};
const DEPT_SPEC={
  'Computer Science':['Algorithms','Networking','AI/ML','Systems','Security'],
  'Electrical Engineering':['Power','Signal Processing','VLSI','Control','Embedded'],
  'Mechanical Engineering':['Thermodynamics','Fluid Dynamics','Manufacturing','Robotics','CAD'],
  'Business Administration':['Finance','Marketing','HR','Strategy','Analytics'],
  'Mathematics':['Algebra','Analysis','Statistics','Topology','Numerical Methods'],
};
const DESIGNATIONS=['Assistant Professor','Associate Professor','Professor','Senior Lecturer'];
const PROGRAMS={'Computer Science':'B.Tech','Electrical Engineering':'B.Tech','Mechanical Engineering':'B.Tech','Business Administration':'MBA','Mathematics':'B.Sc'};
const BATCHES={'B.Tech':['2021-2025','2022-2026','2023-2027','2024-2028'],'MBA':['2022-2024','2023-2025','2024-2026'],'B.Sc':['2022-2025','2023-2026','2024-2027']};
const FN=['Aarav','Aisha','Arjun','Ananya','Rahul','Priya','Rohit','Sneha','Vikram','Kavya','Karan','Divya','Nikhil','Pooja','Sanjay','Meera','Ravi','Nisha','Amit','Sunita','Deepak','Rekha','Suresh','Geeta','Manish','Sonia','Arun','Neha','Vijay','Asha','Gaurav','Swati','Ajay','Ritu','Vinod','Shilpa','Rakesh','Poonam','Harish','Seema','Sachin','Usha','Bharat','Sarita','Mukesh','Vandana','Alok','Shweta','Pankaj','Anita','Tarun','Mamta','Girish','Kavita','Hemant','Sapna','Satish','Jyoti','Naresh','Manju','Vishal','Reena','Manoj','Radha','Kuldeep','Pushpa','Sanjeev','Lata','Preeti','Kapil'];
const LN=['Sharma','Verma','Gupta','Singh','Kumar','Patel','Mehta','Joshi','Yadav','Mishra','Tiwari','Pandey','Dubey','Chauhan','Rao','Reddy','Nair','Menon','Iyer','Bhat','Desai','Shah','Modi','Kapoor','Malhotra','Khanna','Arora','Chopra','Sethi','Bose'];
const CITIES=['Delhi','Mumbai','Pune','Bangalore','Hyderabad','Chennai','Kolkata','Jaipur','Lucknow','Bhopal'];
const STATES=['Uttar Pradesh','Maharashtra','Karnataka','Tamil Nadu','West Bengal','Rajasthan','Delhi','Gujarat'];
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday'];
const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SLOTS=[{s:'08:00',e:'09:00'},{s:'09:00',e:'10:00'},{s:'10:00',e:'11:00'},{s:'11:00',e:'12:00'},{s:'13:00',e:'14:00'},{s:'14:00',e:'15:00'},{s:'15:00',e:'16:00'},{s:'16:00',e:'17:00'}];
const ROOMS=['A101','A102','A103','B201','B202','B203','C301','C302','C303','LAB1','LAB2','LAB3'];

let nc=0;
function nextName(){const f=FN[nc%FN.length];const l=LN[Math.floor(nc/FN.length)%LN.length];nc++;return`${f} ${l}`;}

async function seed(){
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  await Promise.all([User,Student,Faculty,Course,Enrollment,Grade,Timetable,Attendance,Notification].map(M=>M.deleteMany({})));
  console.log('Cleared');

  // Admin
  await User.create({name:'Admin User',email:'admin@usms.com',password:'Admin@123',role:'admin',isActive:true});
  console.log('Admin: admin@usms.com / Admin@123');

  // Faculty (50)
  console.log('Creating faculty...');
  const allFaculty=[];
  let fc=1;
  for(const dept of DEPARTMENTS){
    for(let i=0;i<10;i++){
      const name=nextName();
      const uDoc=await User.create({name,email:`${slug(name.split(' ')[0])}.f${fc}@usms.com`,password:'Faculty@123',role:'faculty',isActive:true});
      const fDoc=await Faculty.create({
        userId:uDoc._id,facultyId:`FAC${String(fc).padStart(4,'0')}`,department:dept,
        designation:pick(DESIGNATIONS),specialization:[pick(DEPT_SPEC[dept])],
        qualification:pick(['Ph.D','M.Tech','M.Sc','MBA']),experience:rand(2,25),
        joinDate:new Date(2010+rand(0,12),rand(0,11),rand(1,28)),
        gender:pick(['male','female']),phone:`9${rand(100000000,999999999)}`,status:'active',
      });
      allFaculty.push({fDoc,uDoc,dept});fc++;
    }
  }
  console.log(`${allFaculty.length} faculty done`);

  // Courses (50)
  console.log('Creating courses...');
  const allCourses=[];let fp=0;
  for(const dept of DEPARTMENTS){
    for(const cd of DEPT_COURSES[dept]){
      const{fDoc,uDoc}=allFaculty[fp];
      const nSlots=rand(2,3);const usedDays=new Set();const schedule=[];
      while(schedule.length<nSlots){
        const day=pick(DAYS);if(usedDays.has(day))continue;
        usedDays.add(day);const sl=pick(SLOTS);
        schedule.push({day,startTime:sl.s,endTime:sl.e,room:pick(ROOMS)});
      }
      const course=await Course.create({
        ...cd,department:dept,
        description:`${dept} course covering ${cd.title} fundamentals and advanced topics.`,
        maxStudents:45,faculty:fDoc._id,status:'active',schedule,
      });
      await Faculty.findByIdAndUpdate(fDoc._id,{$push:{assignedCourses:course._id}});
      allCourses.push({course,fDoc,uDoc});fp++;
    }
  }
  console.log(`${allCourses.length} courses done`);

  // Students (200)
  console.log('Creating students...');
  const allStudents=[];let sc=1;
  for(const dept of DEPARTMENTS){
    const prog=PROGRAMS[dept];const bList=BATCHES[prog];
    for(let i=0;i<40;i++){
      const name=nextName();
      const uDoc=await User.create({name,email:`${slug(name.split(' ')[0])}.s${sc}@usms.com`,password:'Student@123',role:'student',isActive:true});
      const sem=rand(1,8);const batch=pick(bList);
      const sDoc=await Student.create({
        userId:uDoc._id,studentId:`STU${String(sc).padStart(5,'0')}`,
        department:dept,program:prog,semester:sem,batch,
        enrollmentYear:parseInt(batch.split('-')[0]),
        gender:pick(['male','female']),
        dateOfBirth:new Date(2000+rand(0,5),rand(0,11),rand(1,28)),
        phone:`8${rand(100000000,999999999)}`,
        address:{city:pick(CITIES),state:pick(STATES),country:'India'},
        guardian:{name:nextName(),relation:pick(['Father','Mother','Guardian']),phone:`7${rand(100000000,999999999)}`},
        status:'active',cgpa:0,totalCredits:0,
      });
      allStudents.push({sDoc,uDoc,dept});sc++;
    }
  }
  console.log(`${allStudents.length} students done`);

  // Timetable
  console.log('Creating timetable...');
  const ttEntries=[];
  for(const{course,fDoc}of allCourses){
    for(const sl of course.schedule){
      ttEntries.push({course:course._id,faculty:fDoc._id,day:sl.day,startTime:sl.startTime,endTime:sl.endTime,room:sl.room,department:course.department,semester:course.semester,academicYear:ACADEMIC_YEAR});
    }
  }
  await Timetable.insertMany(ttEntries);
  console.log(`${ttEntries.length} timetable slots done`);

  // Enrollments + Grades + Attendance
  console.log('Creating enrollments, grades, attendance (slow)...');
  const classDates=pastClassDates(60);
  let te=0,tg=0,ta=0;

  for(const{course,fDoc,uDoc:fUser}of allCourses){
    const same=allStudents.filter(s=>s.dept===course.department).sort(()=>Math.random()-0.5);
    const other=allStudents.filter(s=>s.dept!==course.department).sort(()=>Math.random()-0.5);
    const cohort=[...same,...other].slice(0,40);

    const eDocs=cohort.map(({sDoc})=>({student:sDoc._id,course:course._id,semester:course.semester,academicYear:ACADEMIC_YEAR,status:'active',enrolledAt:new Date(Date.now()-rand(30,90)*86400000)}));
    let inserted=[];
    try{inserted=await Enrollment.insertMany(eDocs,{ordered:false});}catch(e){inserted=e.insertedDocs||[];}
    te+=inserted.length;

    const gDocs=[];const aDocs=[];
    const scheduleDays=new Set(course.schedule.map(s=>s.day));

    for(const enr of inserted){
      const internal=rand(50,100),midterm=rand(50,100),final_=rand(50,100);
      const total=Math.round(internal*0.2+midterm*0.3+final_*0.5);
      const{grade,gp}=calcGrade(total);
      gDocs.push({student:enr.student,course:course._id,enrollment:enr._id,internal,midterm,final:final_,total,grade,gradePoints:gp,semester:course.semester,academicYear:ACADEMIC_YEAR,isPublished:true,gradedBy:fUser._id});

      for(const date of classDates){
        if(!scheduleDays.has(DAY_NAMES[date.getDay()]))continue;
        const r=rand(1,10);
        aDocs.push({student:enr.student,course:course._id,date,status:r<=1?'absent':r<=2?'late':'present',markedBy:fUser._id});
      }
    }

    try{await Grade.insertMany(gDocs,{ordered:false});tg+=gDocs.length;}catch(e){tg+=(e.insertedDocs||[]).length;}
    for(let i=0;i<aDocs.length;i+=500){
      const chunk=aDocs.slice(i,i+500);
      try{await Attendance.insertMany(chunk,{ordered:false});ta+=chunk.length;}catch(e){ta+=(e.insertedDocs||[]).length;}
    }
  }
  console.log(`${te} enrollments, ${tg} grades, ${ta} attendance records`);

  // Update CGPAs
  console.log('Updating CGPAs...');
  for(const{sDoc}of allStudents){
    const grades=await Grade.find({student:sDoc._id,isPublished:true}).populate('course','credits');
    if(!grades.length)continue;
    let tp=0,tc=0;
    for(const g of grades){const cr=g.course?.credits||3;tp+=g.gradePoints*cr;tc+=cr;}
    await Student.findByIdAndUpdate(sDoc._id,{cgpa:tc?parseFloat((tp/tc).toFixed(2)):0,totalCredits:tc});
  }

  console.log(`
╔═══════════════════════════════════════════════╗
║           SEED COMPLETE ✅                    ║
╠═══════════════════════════════════════════════╣
║  admin@usms.com       → Admin@123             ║
║  <name>.fN@usms.com   → Faculty@123           ║
║  <name>.sN@usms.com   → Student@123           ║
╠═══════════════════════════════════════════════╣
║  5 Departments  │ 50 Courses │ 50 Faculty      ║
║  200 Students   │ ~2000 Enrollments            ║
║  ~2000 Grades   │ ~60k Attendance records      ║
╚═══════════════════════════════════════════════╝`);

  await mongoose.disconnect();
}

seed().catch(e=>{console.error(e);process.exit(1);});