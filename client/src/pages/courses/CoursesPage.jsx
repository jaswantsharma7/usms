import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchCourses, fetchCourseById, createCourse, updateCourse,
  deleteCourse, assignFacultyToCourse,
} from '../../features/courses/courseSlice';
import { fetchFaculty } from '../../features/faculty/facultySlice';
import { enrollInCourse } from '../../features/enrollment/enrollmentSlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdPersonAdd } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination, LoadingScreen,
  ConfirmDialog, EmptyState, Modal, statusColor,
} from '../../components/common';

const DEPARTMENTS = ['Computer Science','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Business Administration','Mathematics','Physics','Chemistry','Biology'];

export const CoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, pagination, loading } = useSelector((s) => s.courses);
  const { user, profileLinked } = useSelector((s) => s.auth);
  const { myProfileNotFound } = useSelector((s) => s.students);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [enrollId, setEnrollId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showNotRegistered, setShowNotRegistered] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchCourses({ page, search, department: dept }));
  }, [page, search, dept]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // No longer call fetchMyStudentProfile — profileLinked comes from authSlice via /auth/me
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteCourse(deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  const handleEnroll = async () => {
    if (!myProfile) return;
    setEnrolling(true);
    await dispatch(enrollInCourse({ studentId: myProfile._id, courseId: enrollId }));
    setEnrolling(false);
    setEnrollId(null);
  };

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle={`${pagination?.total ?? 0} courses`}
        action={user?.role === 'admin' && (
          <Link to="/courses/new" className="btn-primary flex items-center gap-2">
            <MdAdd size={18} /> Add Course
          </Link>
        )}
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search courses..." />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} className="input-field max-w-[200px]">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <LoadingScreen /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-full"><EmptyState title="No courses found" /></div>
          ) : courses.map(c => (
            <div key={c._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{c.code}</p>
                </div>
                <Badge color="blue">{c.credits} cr</Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3">{c.department}</p>
              <p className="text-xs text-gray-400">
                Faculty: {c.faculty?.userId?.name || <span className="italic">Unassigned</span>}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <Badge color={statusColor(c.status)}>{c.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/courses/${c._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <MdVisibility size={16} />
                  </button>
                  {user?.role === 'student' && c.status === 'active' && (
                    <button onClick={() => (profileLinked === false) ? setShowNotRegistered(true) : setEnrollId(c._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Enroll">
                      <MdPersonAdd size={16} />
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => navigate(`/courses/${c._id}/edit`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><MdEdit size={16} /></button>
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><MdDelete size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Course" message="Are you sure you want to delete this course?" />
      <ConfirmDialog open={!!enrollId} onClose={() => setEnrollId(null)} onConfirm={handleEnroll} loading={enrolling} title="Enroll in Course" message="Confirm enrollment in this course?" confirmText="Enroll" />

      <Modal open={showNotRegistered} onClose={() => setShowNotRegistered(false)} title="Account Not Yet Activated" size="sm">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⏳</span>
          </div>
          <div>
            <p className="text-gray-700 font-medium mb-2">Your student profile is pending admin approval</p>
            <p className="text-gray-500 text-sm">
              You have successfully registered, but your account has not yet been added to the student database by an administrator.
              You will be able to enroll in courses once your profile is activated.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
            <p className="text-blue-800 text-xs font-medium mb-1">What to do next?</p>
            <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
              <li>Contact your university admin or department office</li>
              <li>Provide your registered email to get your profile linked</li>
              <li>Try enrolling again after your profile is activated</li>
            </ul>
          </div>
          <button onClick={() => setShowNotRegistered(false)} className="btn-primary w-full">Got it</button>
        </div>
      </Modal>
    </div>
  );
};

export const CourseDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { course, loading } = useSelector((s) => s.courses);
  const { faculty } = useSelector((s) => s.faculty);
  const { user } = useSelector((s) => s.auth);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    dispatch(fetchCourseById(id));
    if (user?.role === 'admin') dispatch(fetchFaculty({ limit: 100 }));
  }, [id]);

  const handleAssign = async () => {
    if (!selectedFaculty) return;
    setAssigning(true);
    await dispatch(assignFacultyToCourse({ id, facultyId: selectedFaculty }));
    dispatch(fetchCourseById(id));
    setAssigning(false);
    setAssignModal(false);
  };

  if (loading || !course) return <LoadingScreen />;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <PageHeader
        title={course.title}
        subtitle={`${course.code} · ${course.department}`}
        action={
          <div className="flex gap-2">
            {user?.role === 'admin' && (
              <>
                <button onClick={() => setAssignModal(true)} className="btn-secondary">Assign Faculty</button>
                <Link to={`/courses/${id}/edit`} className="btn-primary">Edit</Link>
              </>
            )}
            {user?.role === 'faculty' && (
              <Link to={`/grades/course/${id}`} className="btn-primary">Manage Grades</Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-800">Course Details</h3>
          {[['Code', course.code], ['Credits', course.credits], ['Department', course.department],
            ['Semester', course.semester || '—'], ['Max Students', course.maxStudents],
            ['Status', course.status], ['Faculty', course.faculty?.userId?.name || 'Unassigned']].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span className="text-gray-500">{l}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
          {course.description && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{course.description}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Schedule</h3>
          {course.schedule?.length > 0 ? (
            <div className="space-y-2">
              {course.schedule.map((slot, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-primary-700 w-24">{slot.day}</span>
                  <span className="text-sm text-gray-600">{slot.startTime} – {slot.endTime}</span>
                  {slot.room && <span className="text-xs text-gray-400">Room: {slot.room}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No schedule set</p>
          )}
        </div>
      </div>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Faculty">
        <div className="space-y-4">
          <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} className="input-field">
            <option value="">Select faculty member</option>
            {faculty.map(f => (
              <option key={f._id} value={f._id}>{f.userId?.name} — {f.department}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAssignModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAssign} disabled={assigning || !selectedFaculty} className="btn-primary">
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const CourseFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { course, loading } = useSelector((s) => s.courses);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => { if (isEdit) dispatch(fetchCourseById(id)); }, [id]);
  useEffect(() => {
    if (isEdit && course) reset({ title: course.title, code: course.code, description: course.description,
      department: course.department, credits: course.credits, semester: course.semester,
      maxStudents: course.maxStudents, status: course.status });
  }, [course, isEdit]);

  const onSubmit = async (data) => {
    const result = isEdit
      ? await dispatch(updateCourse({ id, data }))
      : await dispatch(createCourse(data));
    if (!result.error) navigate('/courses');
  };

  if (isEdit && loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Course' : 'Create Course'} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input {...register('title', { required: 'Required' })} className="input-field" placeholder="e.g. Data Structures and Algorithms" />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
              <input {...register('code', { required: 'Required' })} className="input-field" placeholder="e.g. CS301" />
              {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
              <input {...register('credits', { required: 'Required', min: 1, max: 6 })} type="number" className="input-field" min="1" max="6" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select {...register('department', { required: 'Required' })} className="input-field">
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select {...register('semester')} className="input-field">
                <option value="">Any</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
              <input {...register('maxStudents')} type="number" className="input-field" defaultValue={60} />
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} className="input-field" rows={3} placeholder="Course description..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CoursesPage;
