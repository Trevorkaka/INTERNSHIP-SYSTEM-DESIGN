# Internship Management System

An enterprise-grade, role-based **Internship Management System** designed to streamline, digitize, and monitor the entire internship lifecycle. This full-stack system provides seamless cooperation, tracking, and performance assessments among **Students**, **Academic Supervisors**, **Workplace Supervisors**, and **System Administrators**.

---

## Table of Contents

1. [System Highlights & Key Features](#system-highlights--key-features)
2. [Interactive Guided Tours (React Joyride)](#interactive-guided-tours-react-joyride)
3. [Architectural Design & Data Flow](#architectural-design--data-flow)
4. [Tech Stack & Dependencies](#tech-stack--dependencies)
5. [Project Structure Mapping](#project-structure-mapping)
6. [Database Configuration (Dual-Database Support)](#database-configuration-dual-database-support)
7. [Installation & Getting Started Guide](#installation--getting-started-guide)
8. [Environment Variables (`.env`)](#environment-variables-env)
9. [API Reference (Django REST Framework)](#api-reference-django-rest-framework)
10. [Quality Assurance & Testing](#quality-assurance--testing)
11. [Contributing Guidelines](#contributing-guidelines)
12. [License](#license)
13. [Project Team (Group 20)](#project-team-group-20)

---

## System Highlights & Key Features

The platform digitizes traditional, error-prone paper logbooks, uncoordinated placements, and evaluation bottlenecks by introducing distinct, highly optimized panels:

### 1. Student Portal
* **Digital Logbook Logging:** Submit daily/weekly activity summaries, logged hours, key challenges, and solutions.
* **Progress Tracking:** Interactive charts and summaries detailing validated hours vs. required curriculum targets.
* **Performance Insights:** View real-time feedback, grading, and assessments left by workplace and academic supervisors.
* **Onboarding Guidance:** Built-in interactive tours teaching users where to submit log entries and check reports.

### 2. Academic Supervisor Portal
* **Assigned Student Roster:** Direct oversight of students placed in different organizations.
* **Log Review & Verification:** Access, read, and leave review assessments/comments on student weekly log submissions.
* **Midterm & Final Evaluations:** Input quantitative grades and qualitative comments using standard evaluation criteria.
* **Activity Stream:** Monitor student participation metrics via streamlined data tables.

### 3. Workplace Supervisor Portal
* **Day-to-day Supervision:** Instantly verify whether student interns logged accurate activity descriptions and hours.
* **Activity Log Grading:** Grade log entries and provide practical feedback straight from the workplace environment.
* **Evaluations Submission:** Direct, simplified evaluation forms mapped directly to student academic files.

### 4. Administrator Portal
* **User Lifecycle Management:** Manage and approve registrations of Students, Academic Supervisors, and Workplace Supervisors.
* **Internship Placement Desk:** Match students to companies/organizations with specific start/end dates.
* **Supervisor Allocation Matrix:** Assign appropriate workplace and academic supervisors to students.
* **Insightful Reports:** Access comprehensive overview statistics of running internships, feedback summaries, and system logs.

---

## Interactive Guided Tours (React Joyride)

To guarantee a frictionless user onboarding experience, the application includes interactive, role-aware guides built with **React Joyride**.

When a user logs in for the first time, a step-by-step UI tour activates automatically, highlighting core components based on their active role:
* **Students:** Guided through the *Dashboard Overview*, *Logbook section* (daily logs), *Attendance section*, *Reports*, and *Profile management*.
* **Academic Supervisors:** Guided through *Assigned Students roster*, *Evaluation sections*, and *Performance reports*.
* **Workplace Supervisors:** Guided through *Attendance verification panels*, *Performance assessment forms*, and *Workplace reports*.

---

## Architectural Design & Data Flow

### High-Level Component Architecture
```text
  ┌────────────────────────────────────────────────────────┐
  │                 React 19 Frontend (Vite)               │
  │   - Context API Auth      - Tailwind CSS UI Framework  │
  │   - React Router v7 Routing - React Joyride Tours      │
  └───────────────────────────┬────────────────────────────┘
                              │
                    HTTPS Requests (JSON / JWT)
                              │
                              v
  ┌────────────────────────────────────────────────────────┐
  │              Django REST Framework (DRF)               │
  │   - JWT Bearer Auth       - Modular Apps & ViewSets    │
  │   - Custom Permission Sets - DRF Auto-Routing          │
  └───────────────────────────┬────────────────────────────┘
                              │
                      Database Drivers
                              │
                              v
  ┌────────────────────────────────────────────────────────┐
  │                 Database Engine Layer                  │
  │   - SQLite (Dev fallback)  - PostgreSQL (Production)   │
  └────────────────────────────────────────────────────────┘
```

### Digital Logbook Workflow Flowchart
```text
[Student logs weekly activity] ──> [Workplace Supervisor Reviews]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [Approved & Assessed]                         [Needs Revision]
                       │                                           │
                       v                                           v
         [Academic Supervisor Evaluates]                  [Student Corrects Log]
```

---

## Tech Stack & Dependencies

### Frontend (SPA)
* **Core Library:** React 19.0.0
* **Build System:** Vite 8.0.4 & Rolldown
* **Routing:** React Router v7 (React Router DOM `^7.14.2`)
* **Styling & UI:** Tailwind CSS v4.0 (utilizing `@tailwindcss/vite` compiler directives), Lucide React Icons
* **API Client:** Axios `^1.15.0` with custom interceptors for Bearer token attachments and token refreshing
* **UX Onboarding:** React Joyride `^3.1.0`

### Backend (REST API)
* **Web Framework:** Django 6.0.5 (built on top of modern Python ASGI/WSGI standards)
* **API Toolkit:** Django REST Framework 3.17.1
* **Authentication:** SimpleJWT (JSON Web Token authentication `^5.5.1` with rotation & blacklisting support)
* **CORS Management:** Django CORS Headers `^4.9.0`
* **Configuration Management:** python-dotenv `^1.2.2`

### Database Options
* **Development (Quick Start):** SQLite (Local file database)
* **Production / Staging:** PostgreSQL 15+ (Enterprise-grade object-relational database)

---

## Project Structure Mapping

```text
INTERNSHIP-SYSTEM-DESIGN/
│
├── backend/                       # --- DJANGO REST BACKEND ---
│   ├── apps/                      # Modular Business Applications
│   │   ├── accounts/              # User models (CustomUser), Student/Supervisor profiles, Registration/Auth views
│   │   ├── common/                # Base utilities (Exceptions, base permissions, custom pagination, audit logger)
│   │   ├── core/                  # Static homepage assets, base views, utility scripts
│   │   ├── evaluations/           # Performance evaluations, rubric structures, evaluation criteria viewsets
│   │   ├── internship/            # Internship administration, forms, signal handlers, test structures
│   │   ├── logs/                  # Weekly Activity Logs, workflow transitions, and supervisor assessments
│   │   ├── notifications/         # Automated event notifications, triggers, and alerts
│   │   └── placements/            # Placement models and student-organization assignments
│   ├── config/                    # Core Configuration Directory
│   │   ├── settings.py            # Global settings (DB configurations, JWT configurations, third-party apps setup)
│   │   ├── urls.py                # Base routing directory registering API viewsets with DefaultRouter
│   │   ├── wsgi.py / asgi.py      # WSGI/ASGI application endpoints for production deployment
│   ├── static/                    # Backend static assets
│   ├── templates/                 # Server-rendered HTML templates (e.g., authentication pages and emails)
│   ├── manage.py                  # Django CLI administrative helper
│   ├── requirements.txt           # Python dependency file
│   └── .env                       # Environment local configuration (Ignored from git)
│
├── frontend/                      # --- REACT FRONTEND (SPA) ---
│   ├── public/                    # Raw static assets
│   ├── src/                       # Frontend source directory
│   │   ├── api/                   # Networking & API integrations
│   │   │   ├── client.ts          # Axios client with request & response JWT interceptors
│   │   │   └── services.ts        # Typed services representing all system REST endpoints
│   │   ├── assets/                # Visual components (logos, illustration sheets)
│   │   ├── components/            # Reusable React components
│   │   │   ├── Layout.tsx         # Sidebar/Dashboard layout with role-based navigation links
│   │   │   ├── OnboardingTour.tsx # React Joyride onboarding tours config
│   │   │   ├── auth/              # Auth-related form screens and components
│   │   │   ├── dashboards/        # Role dashboards (Student, Academic/Workplace Supervisor, Admin)
│   │   │   ├── Shared/            # Reusable UI cards, tables, notification bells
│   │   │   └── styles/            # CSS Modules specific to dashboards and layout sheets
│   │   ├── contexts/              # Global State Contexts
│   │   │   └── AuthContext.tsx    # React Auth Context (handles login, logout, refresh, token storage)
│   │   ├── pages/                 # Full Routing Page Components
│   │   │   ├── WelcomePage.tsx                 # Landing / Landing page
│   │   │   ├── LoginPage.tsx / SignupPage.tsx  # Interactive authentication entry screens
│   │   │   ├── EmailSentPage.tsx               # Confirm signup email sent layout
│   │   │   ├── VerifyEmailPage.tsx             # Validates student accounts via token parameters
│   │   │   ├── StudentActivityLogs.tsx         # Student log submissions & history list
│   │   │   ├── StudentPerformance.tsx          # Real-time grading panels for student review
│   │   │   ├── StudentEvaluations.tsx          # Final evaluations review panel
│   │   │   ├── AdminPlacements.tsx             # Placements administration console
│   │   │   └── AdminSupervisorAssignment.tsx  # Supervisor allocation matrix dashboard
│   │   ├── styles/                # CSS stylesheet stylesheets (Login, globals)
│   │   ├── App.tsx                # Main App Router (registers routes, protects with Role-based route guards)
│   │   ├── index.css              # Main index with Tailwind imports
│   │   └── main.tsx               # Entry point mounting React DOM to HTML body
│   ├── eslint.config.js           # ESLint React lint configurations
│   ├── index.html                 # Single page application base template
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tsconfig.json              # TypeScript workspace settings
│   └── vite.config.ts             # Vite development compilation config
│
└── README.md                      # Comprehensive project documentation (This file)
```

---

## Database Configuration (Dual-Database Support)

The Django backend comes pre-configured with **dual-database capabilities** to facilitate both local quick-starts and enterprise-grade multi-user environments.

By default, the system runs on **SQLite** to make setup effortless for testing. To toggle between **SQLite** and **PostgreSQL**, open `backend/config/settings.py` and modify the `DATABASES` dictionary.

### Database Setup: Option A — Local SQLite (Default / Quick Start)
No additional setup or database installation is required. Django automatically creates a `db.sqlite3` file inside the `backend/` directory upon executing database migrations.

### Database Setup: Option B — PostgreSQL (Recommended for Development/Production)
1. Ensure a PostgreSQL instance is running on your machine (default port `5432`).
2. Log into your PostgreSQL instance (via pgAdmin or terminal `psql` command line):
   ```sql
   -- Create a fresh database
   CREATE DATABASE internship_db;

   -- Create a dedicated application user
   CREATE USER internship_user WITH PASSWORD 'group20password';

   -- Configure correct encoding, transaction, and timezone attributes
   ALTER ROLE internship_user SET client_encoding TO 'utf8';
   ALTER ROLE internship_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE internship_user SET timezone TO 'UTC';

   -- Grant administrative access to database
   GRANT ALL PRIVILEGES ON DATABASE internship_db TO internship_user;
   ```
3. To enable PostgreSQL in Django, open `backend/config/settings.py`, and modify the database configurations as shown here:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': os.getenv('DB_NAME', 'internship_db'),
           'USER': os.getenv('DB_USER', 'internship_user'),
           'PASSWORD': os.getenv('DB_PASSWORD', 'group20password'),
           'HOST': os.getenv('DB_HOST', 'localhost'),
           'PORT': os.getenv('DB_PORT', '5432'),
       }
   }
   ```
4. Verify your configurations inside your `.env` file match your database credentials.

---

## Installation & Getting Started Guide

### Prerequisites
Before launching setup, install the following software suites:
* **Python 3.10 or higher**
* **Node.js v18 or higher** (bundled with `npm`)
* **Git** (for version control operations)

---

### 1. Backend Application Setup

#### 1. Navigate to the backend workspace:
```bash
cd backend
```

#### 2. Create an isolated virtual environment:
```bash
# Windows
python -m venv venv

# macOS / Linux
python3 -m venv venv
```

#### 3. Activate the virtual environment:
```bash
# Windows (Command Prompt)
venv\Scripts\activate

# Windows (PowerShell)
.\venv\Scripts\Project-activation.ps1 # Or venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

#### 4. Install dependency libraries:
```bash
pip install -r requirements.txt
```

#### 5. Configure local environments:
Create a `.env` file in the root of the `backend/` directory (see the [Environment Variables](#environment-variables-env) section below for exact parameters).

#### 6. Perform database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

#### 7. Create an administrative system superuser:
```bash
python manage.py createsuperuser
```
Follow the prompt commands to specify a username, email, and security password.

#### 8. Boot up the local Django server:
```bash
python manage.py runserver
```
The Django REST API backend will now serve requests under: **`http://127.0.0.1:8000`**

---

### 2. Frontend Application Setup

#### 1. Open a new terminal instance and navigate to the frontend workspace:
```bash
cd frontend
```

#### 2. Install all required npm packages:
```bash
npm install
```

#### 3. Run the Vite development compiler server:
```bash
npm run dev
```
The frontend interface compiles in milliseconds and starts running under: **`http://localhost:5173`**

---

## Environment Variables (`.env`)

To manage secure credentials safely, create a `.env` file within the `backend/` directory containing:

```env
# Django Core Configurations
SECRET_KEY=django-insecure-hjt1o9cdh1e(a^#v1tz)gzniggyxk8v9ozlwtpmjn5b*gb__7w
DEBUG=True

# Database Configuration (PostgreSQL setup parameters)
DB_NAME=internship_db
DB_USER=internship_user
DB_PASSWORD=group20password
DB_HOST=127.0.0.1
DB_PORT=5432
```

---

## API Reference (Django REST Framework)

All API requests must pass a JWT access token inside the HTTP header format: `Authorization: Bearer <your_access_token>`.

### Authentication Endpoints

| HTTP Method | Endpoint Route | Request Payload Details | Auth Requirement | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup/` | `{ username, email, password, first_name, last_name, role }` | Public | Register a new user with a specific workflow role |
| **POST** | `/api/auth/login/` | `{ username, password }` | Public | Log in to get standard JWT token pair (Access & Refresh) |
| **POST** | `/api/auth/refresh/` | `{ refresh: "<refresh_token>" }` | Public | Refresh expired JWT access token |
| **POST** | `/api/auth/logout/` | `{ refresh: "<refresh_token>" }` | Authenticated | Log out and blacklist current refresh token |

### Core Data API Routes

| HTTP Method | API End Route | Allowed Methods | Roles Permitted | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET / POST** | `/api/users/` | `GET`, `POST`, `PUT`, `DELETE` | Admin | Access list of authenticated custom users |
| **GET / POST** | `/api/students/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | All Users | Retrieve and manage student bio-data and metrics |
| **GET / POST** | `/api/academic-supervisors/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Admin / Supervisors | Manage academic instructors assigned to interns |
| **GET / POST** | `/api/workplace-supervisors/`| `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Admin / Supervisors | Manage company mentors assigned to interns |
| **GET / POST** | `/api/placements/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Admin | Assign students to organizations and track dates |
| **GET / POST** | `/api/weekly-logs/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Student / Supervisor | Register weekly student tasks and logbooks |
| **GET / POST** | `/api/assessments/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Supervisors | Rate, comment, and sign off weekly student logbooks |
| **GET / POST** | `/api/evaluations/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Supervisors / Admin | Create holistic performance assessment scorecards |
| **GET / POST** | `/api/evaluation-criteria/` | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` | Admin / Supervisors | Create standard rubric templates for performance scores |
| **GET / POST** | `/api/notifications/` | `GET`, `PUT`, `PATCH`, `DELETE` | All Users | Pull user-specific real-time in-app notifications |

---

## Quality Assurance & Testing

The system employs rigorous automated testing protocols to ensure stable endpoints, authentication guards, and data integrity.

### Running Backend Tests
Execute Django's unit testing suite covering models, permissions, views, and serialization:
```bash
cd backend
python manage.py test
```

### Running Frontend Linters
Validate code formatting, TypeScript types consistency, and standards compliance:
```bash
cd frontend
npm run lint
```

---

## Contributing Guidelines

We welcome contributions that improve the features, performance, or documentation of this Internship Management System!

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch** describing your work:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Commit your modifications** with clear, concise, and descriptive commit statements:
   ```bash
   git commit -m "feat: Add CSV exports for admin reports"
   ```
4. **Push the feature branch** to your fork:
   ```bash
   git push origin feature/amazing-new-feature
   ```
5. **Open a Pull Request** against the main repository branch, including a description of changes and test verifications.

---

## License

This software is licensed under the [MIT License](LICENSE). You are free to modify, distribute, and integrate this software within private or commercial configurations.

---

## Project Team (Group 20)

This system is developed and designed by **Group 20** as a collaborative Internship Management System project. If you have any suggestions, bug reports, or feature enhancements, please raise an issue or submit a pull request!

---
**Need Help?** If you experience setup difficulties, configuration errors, or find a bug, run the `/reportbug` slash command or feel free to contact the project developers.
