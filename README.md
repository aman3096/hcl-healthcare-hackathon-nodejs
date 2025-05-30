# 🏥 Healthcare Staff Scheduler & Attendance Tracker

A lightweight full-stack MVP web application designed for hospitals and clinics to manage staff shifts, track attendance, and improve operational efficiency. Built with React, Tailwind CSS, Node.js, PostgreSQL, and RESTful APIs.

---

## 📌 Key Features

- 👤 Secure Admin Login
- 👥 Staff Management (Doctors, Nurses, Technicians)
- 📆 Shift Scheduler (Morning, Afternoon, Night)
- 🗓️ Daily & Weekly Shift Views
- ✅ Attendance Tracking with Status & Remarks
- 🔍 Search & Filter by Staff, Role, Shift
- ⚠️ Shift Conflict Alerts (Double Booking Prevention)

---

## 🧱 Tech Stack

| Layer      | Tech                 |
|------------|----------------------|
| Frontend   | React + Context API + Tailwind CSS |
| Backend    | Node.js + Express    |
| Database   | PostgreSQL           |
| APIs       | REST                 |
| DevOps     | GitHub CI/CD, Cloud Deployment |

---

## 🗂️ MVP Pages

- `/login` – Admin login with email & password
- `/staff` – Manage staff list: add, edit, search, sort
- `/shifts` – Create and list shifts with filters
- `/assignments` – Assign staff to shift slots with validation
- `/schedule` – Visual weekly or daily schedule with status indicators
- `/attendance` – Mark attendance (present/absent) with remarks

---

## 🧩 Component Design (Frontend)

```plaintext
<App>
 ├─ <AuthProvider>
 │   └─ <Router>
 │       ├─ <LoginPage>
 │       ├─ <ProtectedRoute>
 │       │   ├─ <Navbar> – Links: Staff, Shifts, Schedule, Attendance
 │       │   └─ <PageContainer>
 │       │       ├─ <StaffPage>
 │       │       ├─ <ShiftPage>
 │       │       ├─ <AssignmentPage>
 │       │       ├─ <SchedulePage>
 │       │       └─ <AttendancePage>


# Clone the repo
git clone https://github.com/your-org/healthcare-scheduler.git

# Install client & server deps
cd client && npm install
cd ../server && npm install

# Run frontend & backend concurrently
npm run dev

## 🗃️ Database Schema (PostgreSQL)

```sql
-- Admins
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL -- hashed
);

-- Staff
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  contact VARCHAR(20)
);

-- Shifts
CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'night');

CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type shift_type NOT NULL,
  capacity INT NOT NULL,
  UNIQUE(date, type)
);

-- Assignments
CREATE TABLE shift_assignments (
  id SERIAL PRIMARY KEY,
  shift_id INT REFERENCES shifts(id) ON DELETE CASCADE,
  staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
  UNIQUE(shift_id, staff_id)
);

-- Attendance
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES shift_assignments(id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL, -- 'present' or 'absent'
  remarks TEXT
);

## 📡 REST API Endpoints

| Method | Endpoint                                      | Description                     |
|--------|-----------------------------------------------|---------------------------------|
| POST   | `/api/auth/login`                             | Admin login                     |
| GET    | `/api/staff`                                  | List staff                      |
| POST   | `/api/staff`                                  | Add staff                       |
| GET    | `/api/shifts`                                 | List shifts                     |
| POST   | `/api/shifts`                                 | Create shift                    |
| POST   | `/api/shifts/:id/assignments`                 | Assign staff to shift           |
| GET    | `/api/shifts/:id/assignments`                 | View assigned staff             |
| POST   | `/api/attendance`                             | Mark attendance                 |
| GET    | `/api/alerts/conflicts?weekOf=YYYY-MM-DD`     | Weekly shift conflict alerts    |

## ✅ Compliance & Security

- ✅ JWT Authentication & HTTPS
- ✅ Server-side validation & error handling
- ✅ Data encryption in transit (TLS)
- ✅ Logging (without PII)
- ✅ Basic HIPAA-oriented structure

---

## 🚀 Quick Start (for Dev)

```bash
# Clone the repo
git clone https://github.com/your-org/healthcare-scheduler.git

# Install client & server dependencies
cd client && npm install
cd ../server && npm install

# Run frontend & backend concurrently
npm run dev
