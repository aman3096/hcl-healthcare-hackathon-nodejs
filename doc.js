1. Front-end Design (React + Context API + Tailwind)
1.1 Pages & Routes

    /login

        Admin login form (email + password)

    /staff

        List/Add/Edit staff members

    /shifts

        Create shifts (date, type, capacity)

        Filter by date

    /assignments

        Assign staff → shift slots

        Prevent double-booking

    /schedule

        Daily/weekly calendar view

        Color-coded by shift type

    /attendance

        Mark Present/Absent + remarks


2. Database Schema (PostgreSQL)

-- Admins
CREATE TABLE admins (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,  -- hashed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff
CREATE TABLE staff (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  role         VARCHAR(50)  NOT NULL, -- doctor, nurse, technician
  contact      VARCHAR(20),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TYPE shift_type AS ENUM ('morning','afternoon','night');
CREATE TABLE shifts (
  id           SERIAL PRIMARY KEY,
  date         DATE     NOT NULL,
  type         shift_type NOT NULL,
  capacity     INT      NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, type)
);

-- Assignments (which staff on which shift)
CREATE TABLE shift_assignments (
  id           SERIAL PRIMARY KEY,
  shift_id     INT REFERENCES shifts(id) ON DELETE CASCADE,
  staff_id     INT REFERENCES staff(id) ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_id, staff_id)
);

-- Attendance
CREATE TABLE attendance (
  id               SERIAL PRIMARY KEY,
  assignment_id    INT REFERENCES shift_assignments(id) ON DELETE CASCADE,
  status           VARCHAR(10)    NOT NULL, -- 'present','absent'
  remarks          TEXT,
  marked_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id)
);

3. REST API enpoints
| Method               | Path                                      | Description                             | Body / Query                          |
| -------------------- | ----------------------------------------- | --------------------------------------- | ------------------------------------- |
| **Auth**             |                                           |                                         |                                       |
| `POST`               | `/api/auth/login`                         | Admin login → returns JWT               | `{ email, password }`                 |
| **Staff**            |                                           |                                         |                                       |
| `GET`                | `/api/staff`                              | List all staff (filter: `?role=&name=`) | N/A                                   |
| `POST`               | `/api/staff`                              | Add a new staff                         | `{ name, role, contact }`             |
| `PUT`                | `/api/staff/:id`                          | Update staff details                    | `{ name?, role?, contact? }`          |
| `DELETE`             | `/api/staff/:id`                          | Remove staff                            | N/A                                   |
| **Shifts**           |                                           |                                         |                                       |
| `GET`                | `/api/shifts`                             | List shifts (filter: `?date=&type=`)    | N/A                                   |
| `POST`               | `/api/shifts`                             | Create a shift                          | `{ date, type, capacity }`            |
| `PUT`                | `/api/shifts/:id`                         | Update shift (e.g., capacity)           | `{ capacity? }`                       |
| **Assignments**      |                                           |                                         |                                       |
| `GET`                | `/api/shifts/:id/assignments`             | List assignments for one shift          | N/A                                   |
| `POST`               | `/api/shifts/:id/assignments`             | Assign staff to shift                   | `{ staff_ids: [1,2,3] }`              |
| **Attendance**       |                                           |                                         |                                       |
| `GET`                | `/api/attendance?date=&shiftId=`          | List attendance records                 | N/A                                   |
| `POST`               | `/api/attendance`                         | Mark attendance                         | `{ assignment_id, status, remarks? }` |
| **Reports / Alerts** |                                           |                                         |                                       |
| `GET`                | `/api/alerts/conflicts?weekOf=YYYY-MM-DD` | Weekly shift-conflict summary           | N/A                                   |


HIPAA-Lite & Security Considerations

    Authentication: JWT with HTTPS everywhere.

    Authorization: Only admin role permitted to all endpoints.

    Data Encryption: TLS in transit; at-rest encryption on PostgreSQL side if required.

    Logging & Error Handling: Centralized middleware to catch, log (avoid PII in logs), and return standardized error payloads.

