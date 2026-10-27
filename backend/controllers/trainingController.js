import Training from '../models/Training.js';

// @desc    Get all training programs
// @route   GET /api/training
// @access  Private (All authenticated)
export const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate('createdBy', 'name email role')
      .sort({ date: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error) {
    console.error('[GetTrainings Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch training programs',
    });
  }
};

// @desc    Create a training program
// @route   POST /api/training
// @access  Private (HR, Manager)
export const createTraining = async (req, res) => {
  try {
    const { title, description, trainer, date, duration, department, status } = req.body;

    if (!title || !description || !trainer || !date || !duration || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, trainer, date, duration, and department',
      });
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      date,
      duration,
      department,
      status: status || 'Upcoming',
      createdBy: req.user._id,
    });

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Training program scheduled successfully',
      training: populated,
    });
  } catch (error) {
    console.error('[CreateTraining Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create training program',
    });
  }
};

// @desc    Update a training program
// @route   PUT /api/training/:id
// @access  Private (HR, Manager)
export const updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    const { title, description, trainer, date, duration, department, status } = req.body;

    if (title) training.title = title;
    if (description) training.description = description;
    if (trainer) training.trainer = trainer;
    if (date) training.date = date;
    if (duration) training.duration = duration;
    if (department) training.department = department;
    if (status) training.status = status;

    await training.save();

    const populated = await Training.findById(training._id)
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Training program updated successfully',
      training: populated,
    });
  } catch (error) {
    console.error('[UpdateTraining Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update training program',
    });
  }
};

// @desc    Delete a training program
// @route   DELETE /api/training/:id
// @access  Private (HR, Manager)
export const deleteTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({
        success: false,
        message: 'Training program not found',
      });
    }

    await Training.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Training program deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteTraining Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete training program',
    });
  }
};
