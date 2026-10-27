# StaffSync – Modern Human Resource Management Solution

StaffSync is an enterprise-grade, web-based Human Resource Management System (HRMS) built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It simplifies, standardizes, and automates employee operations, attendance tracking, leave requests, announcements, and training programs across the entire organization.

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
StaffSync supports three distinct user roles with strict authorization:
- **HR / Admin**:
  - Full employee lifecycle management (Create, Read, Update, Delete staff records).
  - Organization-wide attendance monitoring and manual status logging.
  - Approve or reject leave applications across all departments.
  - Broadcast official company announcements with priority badges.
  - Schedule and manage corporate training programs and workshops.
- **Manager**:
  - Department and team directory oversight.
  - Real-time team attendance visibility.
  - Review, approve, or reject department leave requests with administrative comments.
  - Schedule department-specific learning and development sessions.
  - View all organizational announcements.
- **Employee**:
  - Personal profile management and contact updates.
  - One-click daily attendance marking (Check-in and Check-out with automatic Late detection after 9:30 AM).
  - Leave application submission with balance tracking (Casual, Sick, Annual).
  - Real-time leave status monitoring.
  - Browse upcoming training workshops.
  - Read company announcements.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js 19, JavaScript (ES6+), React Router DOM, Bootstrap 5, Bootstrap Icons, Axios |
| **Backend** | Node.js, Express.js, REST APIs, JWT (`jsonwebtoken`), `bcryptjs`, CORS, `dotenv` |
| **Database** | MongoDB, Mongoose ODM (includes embedded `mongodb-memory-server` for zero-config evaluation) |
| **Styling** | Bootstrap 5, Custom CSS variables, Plus Jakarta Sans & JetBrains Mono typography |

---

## 🏗️ Architecture & Directory Structure

```text
StaffSync/
├── backend/
│   ├── config/
│   │   ├── db.js             # Mongoose connection with embedded fallback
│   │   └── seed.js           # Idempotent demo data seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── leaveController.js
│   │   ├── attendanceController.js
│   │   ├── announcementController.js
│   │   └── trainingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT token verification
│   │   └── roleMiddleware.js # Role permission gatekeeper
│   ├── models/
│   │   ├── User.js
│   │   ├── Leave.js
│   │   ├── Attendance.js
│   │   ├── Announcement.js
│   │   └── Training.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── trainingRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── StatCard.jsx
│       │   └── Loading.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Employees.jsx
│       │   ├── EmployeeProfile.jsx
│       │   ├── Leaves.jsx
│       │   ├── Attendance.jsx
│       │   ├── Announcements.jsx
│       │   └── Training.jsx
│       ├── services/
│       │   └── api.js        # Centralized Axios client with JWT interceptor
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server.ts                 # Full-stack dev & production runner
├── README.md
└── .gitignore
```

---

## 🔑 Demo Credentials

For quick evaluation and testing, predefined demo accounts with pre-populated activity are available:

| Role | Email | Password | Department |
|---|---|---|---|
| **HR Admin** | `hr@staffsync.com` | `Admin@123` | Human Resources |
| **Manager** | `manager@staffsync.com` | `Manager@123` | Engineering |
| **Employee** | `employee@staffsync.com` | `Employee@123` | Engineering |

*Tip: On the Login screen, click any of the "Quick Demo Credentials" buttons to auto-fill the login form instantly!*

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Unified Full-Stack Run (Recommended)
Clone the repository and run:

```bash
# Install root dependencies
npm install

# Start full-stack server (runs Express API & Vite React App on port 3000)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

### 2. Standalone Backend Execution

```bash
cd backend
npm install
npm run dev
```

The backend server runs on `http://localhost:5000` with full REST APIs.

#### Backend Environment Variables (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/staffsync
JWT_SECRET=staffsync_jwt_secret_key_production_2026
```
*(Note: If `MONGO_URI` is not set or local MongoDB is not running, the application automatically boots an embedded MongoDB engine in memory so you can test immediately without any database setup!)*

---

### 3. Standalone Frontend Execution

```bash
cd frontend
npm install
npm run dev
```

The React frontend runs via Vite and communicates with the backend via Axios.

---

## 📡 REST API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new employee / user account
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET /api/auth/me` - Retrieve current logged-in user profile

### Employee Management (`/api/users`)
- `GET /api/users` - List employees (HR: all; Manager: team; Employee: peers)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create employee record (HR only)
- `PUT /api/users/:id` - Update profile (Self or HR)
- `DELETE /api/users/:id` - Remove employee & related records (HR only)

### Leave Management (`/api/leaves`)
- `GET /api/leaves` - List leave requests
- `POST /api/leaves` - Apply for leave (Casual, Sick, Annual, Emergency)
- `PUT /api/leaves/:id` - Approve or reject leave (HR & Manager)
- `DELETE /api/leaves/:id` - Cancel pending leave

### Attendance Management (`/api/attendance`)
- `GET /api/attendance` - Query attendance records (with optional `date` & `employeeId`)
- `POST /api/attendance` - Mark daily check-in / check-out
- `GET /api/attendance/:employeeId` - Attendance history for an employee

### Announcements (`/api/announcements`)
- `GET /api/announcements` - View organizational announcements
- `POST /api/announcements` - Publish announcement (HR only)
- `PUT /api/announcements/:id` - Edit announcement (HR only)
- `DELETE /api/announcements/:id` - Remove announcement (HR only)

### Training & Upskilling (`/api/training`)
- `GET /api/training` - View available training programs
- `POST /api/training` - Schedule training session (HR & Manager)
- `PUT /api/training/:id` - Update training details (HR & Manager)
- `DELETE /api/training/:id` - Delete training program (HR & Manager)

---

## 🔒 Security Best Practices
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (cost factor 10).
- **JWT Authorization**: All private routes protected by Bearer JWT headers with expiration.
- **Exclusion of Passwords**: Passwords explicitly excluded from response payloads (`select('-password')`).
- **Input Validation**: Mongoose schema validations for emails, dates, and required fields.

---

## 🔮 Future Improvements
- Automated payroll processing and payslip PDF generation.
- Biometric hardware integration / QR-code geolocation clock-in.
- Performance review and 360-degree appraisal cycles.
- Real-time Slack/Teams webhook notifications for leave approvals.

---

## 📄 License
StaffSync is open-source under the MIT License.
