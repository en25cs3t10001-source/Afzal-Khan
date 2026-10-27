import Announcement from '../models/Announcement.js';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated)
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email role')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error('[GetAnnouncements Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
    });
  }
};

// @desc    Create announcement (HR only)
// @route   POST /api/announcements
// @access  Private (HR)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for the announcement',
      });
    }

    const announcement = await Announcement.create({
      title,
      description,
      priority: priority || 'Normal',
      createdBy: req.user._id,
      date: new Date(),
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated,
    });
  } catch (error) {
    console.error('[CreateAnnouncement Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create announcement',
    });
  }
};

// @desc    Update announcement (HR only)
// @route   PUT /api/announcements/:id
// @access  Private (HR)
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    const { title, description, priority } = req.body;
    if (title) announcement.title = title;
    if (description) announcement.description = description;
    if (priority) announcement.priority = priority;

    await announcement.save();

    const populated = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated,
    });
  } catch (error) {
    console.error('[UpdateAnnouncement Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
    });
  }
};

// @desc    Delete announcement (HR only)
// @route   DELETE /api/announcements/:id
// @access  Private (HR)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteAnnouncement Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
    });
  }
};
