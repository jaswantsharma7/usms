const PendingApprovalBanner = ({ title = 'Profile Pending Approval', compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
        <span className="text-xl">⏳</span>
        <div>
          <p className="font-medium text-amber-800">Your profile is awaiting admin approval</p>
          <p className="text-amber-600 text-xs">Contact your university admin to get activated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">⏳</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-sm mb-4">
        Your account has been created, but your profile hasn't been approved by an administrator yet.
        Data will appear here once your account is activated.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-sm w-full">
        <p className="text-blue-800 text-sm font-medium mb-2">What to do next?</p>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>Contact your university admin or department office</li>
          <li>Provide your registered email to get your profile linked</li>
          <li>Come back once your profile has been activated</li>
        </ul>
      </div>
    </div>
  );
};

export default PendingApprovalBanner;