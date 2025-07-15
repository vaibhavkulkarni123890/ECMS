# Event & Content Management System (ECMS)

A platform built using Django to manage events and digital content. Provides role-based login and organized dashboards for better user experience.

---

## 🔧 Tech Stack

- **Framework:** Django (Python)
- **Database:** SQLite
- **Frontend:** HTML, CSS, Bootstrap
- **Deployment:** Localhost / PythonAnywhere / Heroku

---

## ✨ Features

- Secure login system with admin and participant roles
- Event creation, registration, and content upload
- Dashboard view of registered events and uploaded files
- Clean, responsive interface using Bootstrap

---

## 📂 Folder Structure

```
ecms/
├── ecms_project/      # Main Django project
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── events/            # Custom app for event handling
├── templates/         # HTML templates
└── static/            # Static files
```

---

## 🚀 Getting Started

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python manage.py migrate
python manage.py runserver
```

---
