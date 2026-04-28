const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const getDashboard = asyncHandler(async (req, res) => {
  let data;
  if (req.user.role === 'admin') {
    data = await dashboardService.getAdminDashboard();
  } else if (req.user.role === 'faculty') {
    const faculty = await Faculty.findOne({ userId: req.user._id });
    data = await dashboardService.getFacultyDashboard(faculty._id);
  } else {
    const student = await Student.findOne({ userId: req.user._id });
    data = await dashboardService.getStudentDashboard(student._id);
  }
  res.status(200).json(new ApiResponse(200, data, 'Dashboard fetched'));
});

module.exports = { getDashboard };
