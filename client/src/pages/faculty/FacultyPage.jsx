import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchFaculty, fetchFacultyById, createFaculty, updateFaculty, deleteFaculty,
} from '../../features/faculty/facultySlice';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import {
  PageHeader, SearchBar, Badge, Pagination, LoadingScreen,
  ConfirmDialog, EmptyState, statusColor,
} from '../../components/common';

const DEPARTMENTS = ['Computer Science','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Business Administration','Mathematics','Physics','Chemistry','Biology'];

export const FacultyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { faculty, pagination, loading } = useSelector((s) => s.faculty);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchFaculty({ page, search, department: dept }));
  }, [page, search, dept]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteFaculty(deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Faculty"
        subtitle={`${pagination?.total ?? 0} total faculty`}
        action={user?.role === 'admin' && (
          <Link to="/faculty/new" className="btn-primary flex items-center gap-2">
            <MdAdd size={18} /> Add Faculty
          </Link>
        )}
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search faculty..." />
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} className="input-field max-w-[200px]">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <LoadingScreen /> : (
        <div className="card p-0 overflow-hidden">
          {faculty.length === 0 ? (
            <EmptyState title="No faculty found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="table-header">Faculty</th>
                    <th className="table-header">ID</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Designation</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faculty.map((f) => (
                    <tr key={f._id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
                            {f.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{f.userId?.name}</p>
                            <p className="text-xs text-gray-400">{f.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs">{f.facultyId}</td>
                      <td className="table-cell">{f.department}</td>
                      <td className="table-cell">{f.designation || '—'}</td>
                      <td className="table-cell"><Badge color={statusColor(f.status)}>{f.status}</Badge></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/faculty/${f._id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><MdVisibility size={16} /></button>
                          {user?.role === 'admin' && (
                            <>
                              <button onClick={() => navigate(`/faculty/${f._id}/edit`)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"><MdEdit size={16} /></button>
                              <button onClick={() => setDeleteId(f._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><MdDelete size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Faculty" message="This will permanently delete the faculty member and their account." />
    </div>
  );
};

export const FacultyDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { member, loading } = useSelector((s) => s.faculty);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchFacultyById(id)); }, [id]);

  if (loading || !member) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title="Faculty Profile" action={user?.role === 'admin' && <Link to={`/faculty/${id}/edit`} className="btn-primary">Edit</Link>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 text-3xl font-bold flex items-center justify-center mx-auto">
            {member.userId?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{member.userId?.name}</h2>
            <p className="text-gray-500 text-sm">{member.userId?.email}</p>
            <Badge color={statusColor(member.status)}>{member.status}</Badge>
          </div>
          <div className="border-t pt-3 space-y-2 text-sm text-left">
            {[['Faculty ID', member.facultyId], ['Department', member.department],
              ['Designation', member.designation||'—'], ['Qualification', member.qualification||'—'],
              ['Experience', member.experience ? `${member.experience} years` : '—'],
              ['Phone', member.phone||'—']].map(([l,v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-4">Assigned Courses</h3>
          {member.assignedCourses?.length === 0 ? (
            <p className="text-gray-400 text-sm">No courses assigned</p>
          ) : (
            <div className="space-y-2">
              {member.assignedCourses?.map(c => (
                <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.code} · {c.credits} credits</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const FacultyFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { member, loading } = useSelector((s) => s.faculty);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => { if (isEdit) dispatch(fetchFacultyById(id)); }, [id]);
  useEffect(() => {
    if (isEdit && member) {
      reset({ name: member.userId?.name, email: member.userId?.email, department: member.department,
        designation: member.designation, qualification: member.qualification, experience: member.experience, phone: member.phone, status: member.status });
    }
  }, [member, isEdit]);

  const onSubmit = async (data) => {
    const result = isEdit
      ? await dispatch(updateFaculty({ id, data }))
      : await dispatch(createFaculty(data));
    if (!result.error) navigate(isEdit ? `/faculty/${id}` : '/faculty');
  };

  if (isEdit && loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Faculty' : 'Add Faculty'} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('name', { required: 'Required' })} className="input-field" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email', { required: 'Required' })} type="email" className="input-field" disabled={isEdit} />
            </div>
            {!isEdit && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input {...register('password', { required: !isEdit && 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} type="password" className="input-field" />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select {...register('department', { required: 'Required' })} className="input-field">
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input {...register('designation')} className="input-field" placeholder="e.g. Assistant Professor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input {...register('qualification')} className="input-field" placeholder="e.g. PhD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input {...register('experience')} type="number" className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            )}
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

export default FacultyPage;
