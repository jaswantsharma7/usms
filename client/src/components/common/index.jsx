// Spinner
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-primary-600 border-t-transparent rounded-full animate-spin`} />
  );
};

// LoadingScreen
export const LoadingScreen = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// Badge
export const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`badge ${colors[color]}`}>{children}</span>
  );
};

// StatCard
export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

// PageHeader
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Modal
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ConfirmDialog
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">
        {loading ? 'Processing...' : confirmText}
      </button>
    </div>
  </Modal>
);

// Pagination
export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-gray-500">Page {page} of {pages}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary py-1 px-3 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="btn-secondary py-1 px-3 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// SearchBar
export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="input-field max-w-xs"
  />
);

// EmptyState
export const EmptyState = ({ title, description, action }) => (
  <div className="text-center py-12">
    <p className="text-gray-400 text-4xl mb-3">📭</p>
    <h3 className="text-gray-700 font-medium">{title}</h3>
    {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// StatusBadge helper
export const statusColor = (status) => {
  const map = {
    active: 'green', inactive: 'gray', completed: 'blue',
    dropped: 'red', graduated: 'purple', suspended: 'red',
    present: 'green', absent: 'red', late: 'yellow',
    on_leave: 'yellow',
  };
  return map[status] || 'gray';
};
