<div align="center">
  <h1>☕ Cafe POS — Frontend Application</h1>
  <p><strong>Modern, blazing-fast, and responsive Point of Sale client for Cashiers and Cafe Administrators.</strong></p>
  <p>Engineered with <strong>React 19</strong>, <strong>Vite</strong>, <strong>Tailwind CSS v4</strong>, <strong>Redux Toolkit</strong>, and <strong>React Router v7</strong>.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8.x_Beta-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
    <img src="https://img.shields.io/badge/React_Router-v7.x-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
    <img src="https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js" />
  </p>
</div>

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Tech Stack & Dependencies](#-tech-stack--dependencies)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Application Routing](#-application-routing)
- [State Management & Contexts](#-state-management--contexts)
- [Project Directory Structure](#-project-directory-structure)
- [Available npm Scripts](#-available-npm-scripts)

---

## 🖥️ Overview & Architecture

The **Cafe POS Frontend** delivers an intuitive user experience split across two primary workflows:

1. **Cashier POS Interface:** A fast checkout screen tailored for counter service. Cashiers can browse categorised menu items, choose beverage sizes (e.g. S, M, L), manage the cart with automatic tax and discount calculations, generate dynamic Bakong KHQR payment codes, and preview/print customer invoices.
2. **Admin & Superadmin Management Portal:** An administrative workspace offering interactive sales analytics dashboards, menu management (products, categories, sizes), cashier management, audit histories, Excel exports, and global store settings.

The client is built using an Axios network layer equipped with automatic Bearer token injection, global loading spinners, and graceful server error fallbacks.

---

## ✨ Key Features

- **⚡ Fast POS Selling Workflow:**
  - Real-time product search and quick category switching.
  - Multi-size variant selection with instant price updates.
  - Redux-powered cart management (item additions, quantity increments, removals, clear cart).
  - Automated calculation of subtotal, configurable tax, and conditional discounts.
- **💳 Bakong KHQR Payment Modal:**
  - On-screen KHQR QR code rendering using `qrcode.react`.
  - Automatic status polling to detect when the customer completes payment in their mobile banking app.
- **🧾 Instant Invoice & Receipt Preview:**
  - Modal receipt display with shop branding, tax/discount breakdown, cashier information, and Wi-Fi credentials.
  - Direct print and receipt generation workflow.
- **📊 Interactive Analytics Dashboard:**
  - Visual metrics powered by **Chart.js** & **React-Chartjs-2** (revenue, order counts, daily/monthly revenue trends, top-selling items).
- **📋 DataTables & Excel Reports:**
  - Searchable, sortable, paginated tables for orders, products, categories, sizes, and staff.
  - Direct spreadsheet generation using **ExcelJS**, **XLSX**, and **File-Saver**.
- **🔒 Protected Routes & Role Authentication:**
  - Seamless redirection based on user role (`cashier`, `admin`, `superadmin`).
  - Auth token and role persistence with secure cookies.
- **🌐 Network Interceptors & Error Shield:**
  - Global loading overlay during asynchronous API requests.
  - Dedicated full-screen modal interceptor if the backend server becomes unreachable.

---

## 🛠️ Tech Stack & Dependencies

| Category | Library | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) | Component-based UI library |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Next-generation frontend tooling & lightning-fast HMR |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) | Utility-first modern CSS framework |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux` | Centralized POS cart & order state |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side role-protected routing |
| **HTTP Client** | [Axios](https://axios-http.com/) | Promise-based HTTP client with request/response interceptors |
| **Alerts & Modals** | [SweetAlert2](https://sweetalert2.github.io/) | Interactive feedback dialogs and confirmation prompts |
| **Data Visualization** | [Chart.js](https://www.chartjs.org/) + `react-chartjs-2` | Interactive charts for sales and product analytics |
| **Tables & Reporting** | `datatables.net`, `exceljs`, `xlsx`, `file-saver` | Data grid display and client-side Excel exports |
| **Icons** | [Font Awesome](https://fontawesome.com/) (`@fortawesome/react-fontawesome`) | Scalable vector icon set |
| **QR Code** | `qrcode.react` | Dynamic Bakong KHQR code generator |

---

## 📋 Prerequisites

Ensure you have the following installed locally:

- **Node.js:** `v18.0.0` or higher (`v20.x+` recommended)
- **Package Manager:** `npm` (bundled with Node) or `yarn` / `pnpm`
- **Backend API:** The Laravel backend server running (by default on `http://127.0.0.1:8000`)

---

## 🚀 Installation & Setup

### 1. Navigate to the Frontend Directory
```bash
cd Frontend
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create your local environment file:
```bash
cp .env.example .env
```

Open `.env` and point to your active Backend API URL:
```env
API_TARGET=http://127.0.0.1:8000
VITE_API_BASE=/api
```
*(Alternatively, configure `VITE_API_BASE_URL=http://127.0.0.1:8000/api`)*

### 4. Start the Local Development Server
```bash
npm run dev
```
Vite will launch the application and open your browser at: **`http://localhost:3000`**

### 5. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
To test and preview the production build locally:
```bash
npm run preview
```

---

## ⚙️ Environment Configuration

The application reads backend connection settings through Vite's environment system:

| Variable | Default / Example | Description |
| :--- | :--- | :--- |
| `API_TARGET` | `http://127.0.0.1:8000` | Host URL where the Laravel Backend API is running |
| `VITE_API_BASE` | `/api` | Base API route prefix configured in Laravel |
| `VITE_API_BASE_URL` | *(Optional override)* | Full direct base URL (overrides target + base path) |

---

## 🧭 Application Routing

All routes are protected by role-based authorization guards:

```text
/ (Root)
└── /login                          Public login page
└── /admin                          Admin layout (Requires 'admin' or 'superadmin' role)
    ├── /admin                      Dashboard KPI overview & charts
    ├── /admin/pos                  Admin-side POS selling interface
    ├── /admin/orders               Order management & status updates
    ├── /admin/products             Product listing, creation, and editing
    ├── /admin/categories           Category management
    ├── /admin/sizes                Cup / portion sizes management
    ├── /admin/cashiers             Cashier staff accounts management
    ├── /admin/admins               Admin account management (Superadmin only)
    ├── /admin/reports/sales        Sales analytics & Excel report download
    ├── /admin/reports/products     Product performance reports
    └── /admin/settings             Global store settings & taxes (Superadmin only)
└── /cashier                        Cashier layout (Requires 'cashier' role)
    ├── /cashier                    Primary Cashier POS terminal
    └── /cashier/history            Personal order history & receipts
```

---

## 🧠 State Management & Contexts

### 1. Redux Toolkit (`src/redux/`)
- **`orderSlice.js`:** Manages the POS cart state, active line items, item size selection, quantity increments/decrements, item removal, and subtotal calculations.

### 2. React Contexts (`src/context/`)
- **`AuthContext.jsx`:** Stores authenticated user profile details, role, and handles session signout.
- **`LoadingContext.jsx`:** Controls the synchronized global loading overlay whenever asynchronous Axios API requests are in flight.
- **`ServerErrorContext.jsx`:** Intercepts `5xx` / network failure responses from Axios and displays a reconnect modal.

---

## 📂 Project Directory Structure

```text
Frontend/
├── public/                    # Static assets & favicon
├── src/
│   ├── api/                   # Axios API service modules
│   │   ├── adminApi.js
│   │   ├── authApi.js
│   │   ├── axios.js           # Central Axios instance with interceptors
│   │   ├── cashierApi.js
│   │   ├── categoryApi.js
│   │   ├── dashboardApi.js
│   │   ├── orderApi.js
│   │   ├── productApi.js
│   │   ├── reportApi.js
│   │   ├── settingApi.js
│   │   └── sizeApi.js
│   ├── assets/                # Images, brand logos, and icons
│   ├── components/
│   │   ├── admins/            # Admin UI modules (forms, summary cards)
│   │   ├── cashiers/          # POS interface modules (OrderList, ProductCard)
│   │   └── common/            # Shared UI (DataTable, InvoiceModal, KHQRPaymentModal, GlobalLoading)
│   ├── context/               # AuthContext, LoadingContext, ServerErrorContext
│   ├── data/                  # Sidebar navigation configuration & router definitions
│   │   ├── Router.jsx         # React Router v7 route declarations
│   │   └── Sidebar.js         # Admin navigation menus
│   ├── layouts/               # AdminLayout, CashierLayout
│   ├── pages/                 # Route page components
│   │   ├── admins/            # Dashboard, POS, Products, Categories, Orders, Reports, Settings
│   │   ├── auth/              # Login page
│   │   └── cashiers/          # Cashier POS, Order History
│   ├── redux/                 # Redux Toolkit store & slices (orderSlice)
│   ├── routes/                # ProtectedRoute and AppRoute wrappers
│   ├── utils/                 # Cookie helpers, currency & date formatters
│   ├── App.jsx                # Main application component
│   ├── index.css              # Global styles & Tailwind CSS v4 entry
│   └── main.jsx               # React DOM entry point
├── package.json               # Node dependencies and project scripts
├── vite.config.js             # Vite configuration (port 3000, plugins)
└── .env.example               # Environment variables template
```

---

## 📜 Available npm Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Vite development server on `http://localhost:3000` with hot-module replacement |
| `npm run build` | Compiles and optimizes assets into the `dist/` directory for production |
| `npm run preview` | Locally serves the production `dist/` bundle to test performance before deploying |
| `npm run lint` | Analyzes code for quality and style errors using ESLint |
