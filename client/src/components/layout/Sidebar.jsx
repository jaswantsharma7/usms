import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPendingCount } from '../../features/registrations/registrationSlice';
import {
  MdDashboard, MdPeople, MdSchool, MdBook, MdCalendarToday,
  MdAssignment, MdGrade, MdNotifications, MdPerson, MdClose, MdHowToReg,
} from 'react-icons/md';

const navItems = {
  admin: [
    { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/students', icon: MdPeople, label: 'Students' },
    { to: '/faculty', icon: MdSchool, label: 'Faculty' },
    { to: '/registrations', icon: MdHowToReg, label: 'Registrations', badge: true },
    { to: '/courses', icon: MdBook, label: 'Courses' },
    { to: '/attendance', icon: MdCalendarToday, label: 'Attendance' },
    { to: '/grades', icon: MdGrade, label: 'Grades' },
    { to: '/timetable', icon: MdAssignment, label: 'Timetable' },
    { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
    { to: '/profile', icon: MdPerson, label: 'Profile' },
  ],
  faculty: [
    { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/students', icon: MdPeople, label: 'Students' },
    { to: '/courses', icon: MdBook, label: 'My Courses' },
    { to: '/attendance/mark', icon: MdCalendarToday, label: 'Attendance' },
    { to: '/grades', icon: MdGrade, label: 'Grades' },
    { to: '/timetable', icon: MdAssignment, label: 'Timetable' },
    { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
    { to: '/profile', icon: MdPerson, label: 'Profile' },
  ],
  student: [
    { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/courses', icon: MdBook, label: 'Courses' },
    { to: '/attendance', icon: MdCalendarToday, label: 'Attendance' },
    { to: '/grades', icon: MdGrade, label: 'Grades' },
    { to: '/grades/transcript', icon: MdAssignment, label: 'Transcript' },
    { to: '/timetable', icon: MdAssignment, label: 'Timetable' },
    { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
    { to: '/profile', icon: MdPerson, label: 'Profile' },
  ],
};

const Sidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { pendingCount } = useSelector((s) => s.registrations);
  const items = navItems[user?.role] || navItems.student;

  useEffect(() => {
    if (user?.role === 'admin') dispatch(fetchPendingCount());
  }, [user?.role]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-primary-900 text-white
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-700">
          <div>
            <h1 className="text-lg font-bold tracking-wide">USMS</h1>
            <p className="text-xs text-primary-300">Student Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-primary-300 hover:text-white">
            <MdClose size={22} />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

