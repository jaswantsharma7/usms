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

export default CourseFormPage;