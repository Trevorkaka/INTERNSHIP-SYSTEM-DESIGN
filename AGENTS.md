# ILES System - AI Agent Instructions

**Project**: ILES (Internship Linking and Engagement System) – A full-stack web application for managing internship placements, students, and supervisors.

## Architecture

### Tech Stack
- **Backend**: Django 6.0.4+, Django REST Framework 3.17.1+, Python 3.14+, SQLite
- **Frontend**: React 19.2.4, Vite 8, Axios, ESLint
- **Dependency Management**: Python Poetry, npm

### Folder Structure
```
project/
├── backend/                 # Django application
│   ├── config/             # Django settings, URLs, WSGI/ASGI
│   ├── core/               # Core app (Student model, views, templates)
│   ├── internship/         # Internship app (User roles, forms, serializers)
│   ├── templates/          # HTML templates
│   ├── static/             # Static assets
│   ├── db.sqlite3          # SQLite development database
│   ├── manage.py           # Django CLI
│   └── pyproject.toml      # Python dependencies
├── frontend/               # React + Vite application
│   ├── src/                # React components, styles
│   ├── public/             # Static public assets
│   ├── index.html          # Entry HTML
│   ├── vite.config.js      # Vite configuration
│   ├── package.json        # npm dependencies
│   └── eslint.config.js    # ESLint rules
├── Djangoproject/          # Duplicate/old Django folder (may be legacy)
└── New.html                # Standalone HTML file
```

## Key Patterns & Conventions

### Backend

#### User Model (internship/models.py)
- Custom `User` model extends `AbstractUser`
- **Role-based system** with four roles:
  - `'student'`: Student user
  - `'academic_supervisor'`: University supervisor
  - `'workplace_supervisor'`: Workplace supervisor
  - `'admin'`: Administrator
- Helper properties: `is_student`, `is_academic_supervisor`, `is_workplace_supervisor`, `is_admin`
- Usage: Always check user role before granting access or showing UI elements

#### Student Model
- Located in both `core/models.py` and `internship/models.py` (may have duplicates)
- Fields: `user`, `registration_number`, `course`, `year_of_study`, `academic_supervisor`, `work_place_supervisor`
- Links to User model with ForeignKey relationships

#### URL Routing
- Main URLs in `config/urls.py`
- Pattern: Apps expose their URLs via `include()` (e.g., `path('', include('internship.urls'))`)
- Common endpoints: `/students/`, `/add/`, `/admin/`

#### Django Apps
- **internship**: User management, permissions, serializers, forms, signals
- **core**: Student views, templates, basic models

### Frontend

#### React + Vite Setup
- Built with modern React 19 and Vite for fast HMR
- Uses **Axios** for HTTP requests to backend API
- Entry point: `src/main.jsx`
- Build command: `npm run build`
- Dev server: `npm run dev` (default: http://localhost:5173)

#### Development & Linting
- ESLint configured for code quality
- Lint check: `npm run lint`
- React Compiler enabled (may impact dev/build performance)
- Babel configuration with React compiler plugin

## Running the Application

### Backend (Django)
```bash
cd backend
poetry install                    # Install dependencies
python manage.py migrate          # Apply migrations
python manage.py runserver        # Start dev server (default: http://localhost:8000)
python manage.py createsuperuser  # Create admin user
```

### Frontend (React + Vite)
```bash
cd frontend
npm install                       # Install dependencies
npm run dev                       # Start dev server (default: http://localhost:5173)
npm run build                     # Build for production
npm run lint                      # Check code quality
```

## Important Notes

### Database
- SQLite database at `backend/db.sqlite3` (dev only)
- Migrations stored in `core/migrations/` and `internship/migrations/`
- Always run migrations after model changes: `python manage.py migrate`

### API Communication
- Frontend uses Axios to communicate with Django backend
- Backend should expose REST API endpoints via DRF serializers
- CORS may need configuration if frontend/backend are on different origins

### Duplicates & Technical Debt
- `Djangoproject/` folder appears to be legacy/duplicate – clarify with team if it can be removed
- Student model exists in both `core/` and `internship/` apps – consolidate if possible
- Some URL patterns may overlap (see `config/urls.py` for routing review)

## When Making Changes

### Backend Changes
1. **Add new API endpoint**: Create view in app → add serializer (DRF) → update app's `urls.py` → include in `config/urls.py`
2. **Modify User model**: Update `internship/models.py` → run migrations → update authentication logic
3. **Add form**: Create in `internship/forms.py` or `core/forms.py` → use in views
4. **Permissions**: Check `internship/permissions.py` before granting access

### Frontend Changes
1. **Add component**: Create in `src/` → import in `App.jsx` or parent component
2. **API calls**: Use Axios, handle role-based UI rendering based on user role
3. **Styling**: Use `.css` files in `src/` (e.g., `App.css`)
4. **Linting**: Run `npm run lint` before committing

## Conventions for Agents

- **Role checks**: Always verify user role before exposing features (`user.is_student`, etc.)
- **Django migrations**: After ANY model change, create and run migrations
- **DRF serializers**: Use for API responses (consistency with existing code)
- **Frontend API integration**: Use Axios with proper error handling and loading states
- **Database**: Use SQLite for dev; no production settings yet
- **File paths**: Use relative imports; maintain app-level organization
