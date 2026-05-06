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

export default CoursesPage;