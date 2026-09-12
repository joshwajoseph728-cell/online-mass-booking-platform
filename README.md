# OUR LADY OF DOLOURS – MASS INTENTION & CHURCH MANAGEMENT PORTAL

A production-quality, responsive Catholic Parish Web Portal and Church Management Platform built with **Vite, Vanilla Modular JavaScript, Cloud Firestore, Firebase Authentication, Razorpay, and jsPDF**.

Dedicated to **Our Lady of Dolours (Mater Dolorosa)**, this platform serves as an official parish website and an online Mass Intention Booking and Altar Prayer Management system for parishioners, clergy, and administrators.

---

## 🌟 Key Features

### 1. Official Public Parish Portal
- **Hero & Sanctuary**: Stained glass and high altar visual styling with quick booking CTAs.
- **Interactive Mass Schedule**: Filter weekday and Sunday liturgies with language (English, Malayalam, Latin) and celebrant tags.
- **About Parish & Clergy**: Parish history (Est. 1896), Vicar messages, and full clergy directory.
- **Online Offerings & Tithes**: Support church restoration, charity funds, and altar sponsorships with Razorpay checkout.
- **Parish Office & Sacraments**: Contact secretariat, emergency sick calls line, and confession timings.

### 2. Multi-Step Mass Intention Booking Wizard
- **Step 1: Intention Type & Names**: Select from *Departed Soul*, *Thanksgiving*, *Special Intention*, or *Healing Prayer*; list names to pray for and optional remembrance notes.
- **Step 2: Date & Available Mass Time**: Dynamic selection of active Mass schedules directly from Firestore with capacity limits.
- **Step 3: Parishioner Contact & Stipend**: Full Name, Phone, Email, and offering amounts (₹100, ₹250, ₹500, ₹1000, or Custom).
- **Step 4: Review & Payment**: Transparent review summary and Razorpay checkout modal with HMAC signature verification.
- **Step 5: Booking Confirmation**: Unique Booking ID generation (`OLDD-2026-000123`), instant **Download PDF Receipt**, Print option, and notification dispatch.

### 3. Parishioner / Member Dashboard
- **Overview Metrics**: Total Bookings, Upcoming Masses, Pending Requests, and Completed Masses.
- **My Bookings**: Search, filter by status, and view details.
- **Receipts Vault**: Official digitally signed PDF receipts with parish seal.
- **Notification Center**: Real-time alerts for booking approvals, schedule reminders, and offering receipts.
- **Profile Settings**: Update household details, mobile number, and parish family unit.

### 4. Priest & Clergy Dashboard
- **Today's Altar Prayer List**: Automatically retrieves approved intentions for the current date and groups them by Mass time (e.g. `07:00 AM MASS`) and liturgical categories:
  - `✝️ DEPARTED SOULS`
  - `✨ THANKSGIVING`
  - `🕊️ HEALING PRAYER`
  - `🕯️ SPECIAL INTENTION`
- **Altar PDF & Print Actions**: Generate printable Altar Prayer Sheets formatted for the altar lectern.
- **Approval Workflow**: Approve or reject requests with pastoral notes.
- **Mark Mass Completed**: Complete intentions for a Mass time to archive records.
- **Liturgical Calendar**: Interactive month calendar with daily intention counts.

### 5. Admin & Web Manager Portal
- **Analytics & Charts**: SVG Monthly booking volume and Intention type distribution charts.
- **Manage Users**: Role assignments (`member`, `priest`, `admin`) and account activation.
- **Manage Priests**: Clergy directory, designations, and contact details.
- **Manage Mass Schedules**: Create/Edit Mass times, language, capacity, and assigned celebrants.
- **Master Bookings & Payments**: Global search, filter, status overrides, and CSV exports.
- **Reports**: Generate and export parish reports in CSV / printable format.
- **Parish Settings**: Update church coordinates, emergency numbers, and booking rules.

---

## 🎨 Design System & Accessibility

- **Light Mode**: Pristine Cream (`#FDFBF7`), Pure White (`#FFFFFF`), Marian Blue (`#1E3A8A`), and Liturgical Gold (`#D4AF37`).
- **Dark Mode**: Deep Nocturne Navy (`#0A0F1D`), Elevated Slate (`#131B2E`), and Radiant Gold (`#E6CA65`).
- **Theme Persistence**: Automatic `localStorage` saving.
- **Typography**: Sacred headings in `Cinzel` & `Playfair Display`, UI text in `Plus Jakarta Sans`.
- **Responsive**: Desktop sidebar, tablet collapsible drawer, and mobile card layouts.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd "mass  booking platform"

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Firebase and Razorpay credentials in `.env`:
```env
# Firebase Client SDK
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> **Note**: The application features a **Parish Seed Engine**. If Firebase or Razorpay keys are not yet configured, the platform runs in full **Demo / Sandbox Mode** with pre-seeded parish data, live booking wizards, simulated payment verifications, and PDF generation.

### 4. Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```
Production output is created in `dist/`.

---

## 👥 Demo Logins for Quick Testing

You can click any of the 1-click demo login buttons on `/login` or use the role switcher in the dashboard sidebar:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Parishioner** | Joseph Fernandez | `member@ourladyofdolours.org` | *Any password* |
| **Parish Priest** | Rev. Fr. Joseph Thomas | `priest@ourladyofdolours.org` | *Any password* |
| **Administrator** | Dr. Augustine Dias | `admin@ourladyofdolours.org` | *Any password* |

---

## 🔒 Security & Cloud Deployment

### Firestore Security Rules
Production security rules with role-based access control are defined in `firestore.rules`:
```bash
# Deploy firestore rules via Firebase CLI
firebase deploy --only firestore:rules
```

### Vercel Deployment
The project is pre-configured for Vercel with `vercel.json`:
1. Connect your repository to Vercel.
2. Set Build Command: `npm run build`.
3. Set Output Directory: `dist`.
4. Add environment variables in Vercel Project Settings.
5. Deploy!

---

## 📁 Project Structure

```
├── api/                               # Vercel Serverless API routes
│   └── razorpay/
│       ├── create-order.js            # Razorpay Order creation
│       └── verify-payment.js          # Cryptographic HMAC verification
├── public/
│   ├── favicon.svg                    # Parish Marian Crest
│   └── ...
├── src/
│   ├── assets/styles/
│   │   ├── main.css                   # CSS tokens, light/dark themes
│   │   ├── components.css             # Buttons, cards, modals, tables, badges
│   │   ├── public.css                 # Public parish pages styling
│   │   ├── dashboard.css              # Role-based dashboard styling
│   │   └── booking.css                # Multi-step booking wizard styling
│   ├── components/
│   │   ├── Navbar.js                  # Responsive header & theme toggle
│   │   ├── Footer.js                  # Parish footer & timetable
│   │   ├── DashboardLayout.js         # Role-based sidebar & topbar
│   │   └── Charts.js                  # Pure SVG analytics charts
│   ├── config/
│   │   ├── constants.js               # Enums, intention types, statuses
│   │   └── firebase.js                # Firebase App, Auth, Firestore init
│   ├── data/
│   │   └── seedData.js                # Initial parish seed data
│   ├── pages/
│   │   ├── public/                    # Home, About, Booking, Schedule, Offerings, Contact, Auth
│   │   ├── member/                    # Dashboard, Bookings, Receipts, Notifications, Profile
│   │   ├── priest/                    # Overview, Today's Prayers, Intentions, Calendar, Profile
│   │   └── admin/                     # Analytics, Users, Priests, Schedules, Bookings, Payments, Reports, Settings
│   ├── services/
│   │   ├── authService.js             # Auth & role session manager
│   │   ├── firestoreService.js        # Firestore CRUD & seed sync
│   │   ├── bookingService.js          # Mass booking workflow & grouper
│   │   ├── paymentService.js          # Razorpay integration & sandbox
│   │   ├── pdfService.js              # jsPDF official receipts & altar lists
│   │   └── notificationService.js     # Toast and in-app alerts
│   ├── utils/
│   │   ├── dateUtils.js               # Liturgical date helpers
│   │   ├── formatters.js              # Currency, unique ID generator
│   │   └── validators.js              # Input validation
│   ├── router.js                      # SPA router with route guards
│   └── main.js                        # App bootstrapping
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 📜 License
Official Parish Web Application for **Our Lady of Dolours Church**. Designed with reverence and built for reliable parish administration.
