import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import Training from '../models/Training.js';

export const seedDemoData = async () => {
  try {
    const hrEmail = 'hr@staffsync.com';
    const managerEmail = 'manager@staffsync.com';
    const employeeEmail = 'employee@staffsync.com';

    // Check if HR already exists
    let hrUser = await User.findOne({ email: hrEmail });
    if (!hrUser) {
      hrUser = await User.create({
        name: 'Eleanor Vance',
        email: hrEmail,
        password: 'Admin@123',
        role: 'HR',
        department: 'Human Resources',
        phone: '+1 (555) 234-5678',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      });
      console.log('[Seed] HR account created:', hrEmail);
    }

    let managerUser = await User.findOne({ email: managerEmail });
    if (!managerUser) {
      managerUser = await User.create({
        name: 'Marcus Holloway',
        email: managerEmail,
        password: 'Manager@123',
        role: 'Manager',
        department: 'Engineering',
        phone: '+1 (555) 345-6789',
        profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
      });
      console.log('[Seed] Manager account created:', managerEmail);
    }

    let employeeUser = await User.findOne({ email: employeeEmail });
    if (!employeeUser) {
      employeeUser = await User.create({
        name: 'Sophia Patel',
        email: employeeEmail,
        password: 'Employee@123',
        role: 'Employee',
        department: 'Engineering',
        phone: '+1 (555) 456-7890',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
      });
      console.log('[Seed] Employee account created:', employeeEmail);
    }

    // Additional sample team members if not present
    const additionalEmployees = [
      {
        name: 'David Miller',
        email: 'david.m@staffsync.com',
        password: 'Employee@123',
        role: 'Employee',
        department: 'Engineering',
        phone: '+1 (555) 567-8901',
      },
      {
        name: 'Aisha Al-Mansoor',
        email: 'aisha.m@staffsync.com',
        password: 'Employee@123',
        role: 'Employee',
        department: 'Human Resources',
        phone: '+1 (555) 678-9012',
      },
      {
        name: 'Lucas Rossi',
        email: 'lucas.r@staffsync.com',
        password: 'Manager@123',
        role: 'Manager',
        department: 'Design & Marketing',
        phone: '+1 (555) 789-0123',
      },
    ];

    for (const emp of additionalEmployees) {
      const exists = await User.findOne({ email: emp.email });
      if (!exists) {
        await User.create(emp);
      }
    }

    // Seed Announcements if none
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create([
        {
          title: 'Company Holiday: Upcoming Long Weekend',
          description: 'Our global headquarters will remain closed on Monday, November 2nd, for Fall Resilience Day. Please schedule client handovers accordingly.',
          priority: 'Important',
          createdBy: hrUser._id,
          date: new Date('2026-10-27T09:00:00Z'),
        },
        {
          title: 'Annual Benefits Enrollment Window Open',
          description: 'The 2027 health and wellness package selection portal is now open. All team members must review coverage by November 15.',
          priority: 'Normal',
          createdBy: hrUser._id,
          date: new Date('2026-10-25T14:30:00Z'),
        },
        {
          title: 'IT Infrastructure Maintenance & SSO Upgrade',
          description: 'Mandatory network maintenance this Saturday between 02:00 UTC and 06:00 UTC. VPN access may briefly disconnect.',
          priority: 'Urgent',
          createdBy: hrUser._id,
          date: new Date('2026-10-26T11:00:00Z'),
        },
      ]);
      console.log('[Seed] Sample announcements created');
    }

    // Seed Training programs if none
    const trainingCount = await Training.countDocuments();
    if (trainingCount === 0) {
      await Training.create([
        {
          title: 'React 19 & Full-Stack Modern Web Patterns',
          description: 'Master server components, action state transitions, and responsive web interface design with clean architecture.',
          trainer: 'Johnathan Smith',
          date: new Date('2026-11-15T10:00:00Z'),
          duration: '3 Days',
          department: 'Engineering',
          status: 'Upcoming',
          createdBy: managerUser._id,
        },
        {
          title: 'HR Compliance, DE&I & Workplace Culture 2027',
          description: 'Comprehensive workshop on legal compliance, equitable hiring frameworks, and modern workplace policies.',
          trainer: 'Eleanor Vance',
          date: new Date('2026-11-05T09:00:00Z'),
          duration: '1 Day',
          department: 'Human Resources',
          status: 'Upcoming',
          createdBy: hrUser._id,
        },
        {
          title: 'Engineering Leadership & Agile Coaching',
          description: 'Advanced mentoring for senior engineers transitioning to tech leads and engineering management.',
          trainer: 'Marcus Holloway',
          date: new Date('2026-11-20T13:00:00Z'),
          duration: '2 Weeks',
          department: 'Engineering',
          status: 'Upcoming',
          createdBy: managerUser._id,
        },
      ]);
      console.log('[Seed] Sample training programs created');
    }

    // Seed Leaves if none
    const leaveCount = await Leave.countDocuments();
    if (leaveCount === 0) {
      await Leave.create([
        {
          employee: employeeUser._id,
          leaveType: 'Annual Leave',
          startDate: new Date('2026-11-10'),
          endDate: new Date('2026-11-14'),
          reason: 'Scheduled family vacation and personal rest.',
          status: 'Pending',
          appliedAt: new Date('2026-10-26'),
        },
        {
          employee: employeeUser._id,
          leaveType: 'Sick Leave',
          startDate: new Date('2026-10-14'),
          endDate: new Date('2026-10-15'),
          reason: 'Severe seasonal flu and medical consultation.',
          status: 'Approved',
          appliedAt: new Date('2026-10-14'),
          approvedBy: managerUser._id,
        },
        {
          employee: managerUser._id,
          leaveType: 'Casual Leave',
          startDate: new Date('2026-11-02'),
          endDate: new Date('2026-11-02'),
          reason: 'Personal administrative errands.',
          status: 'Approved',
          appliedAt: new Date('2026-10-24'),
          approvedBy: hrUser._id,
        },
      ]);
      console.log('[Seed] Sample leaves created');
    }

    // Seed Attendance for today and past days if none
    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      await Attendance.create([
        {
          employee: employeeUser._id,
          date: todayStr,
          checkIn: '09:14 AM',
          checkOut: '',
          status: 'Present',
          workHours: 'In Progress',
        },
        {
          employee: managerUser._id,
          date: todayStr,
          checkIn: '08:55 AM',
          checkOut: '',
          status: 'Present',
          workHours: 'In Progress',
        },
        {
          employee: hrUser._id,
          date: todayStr,
          checkIn: '09:05 AM',
          checkOut: '',
          status: 'Present',
          workHours: 'In Progress',
        },
      ]);
      console.log('[Seed] Sample attendance records created');
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
};
