<div align="center">
  <h1>☕ Cafe POS System ☕</h1>
  <p>A modern, full-stack Point of Sale (POS) system for Cafes, offering a premium and elegant experience for both cashiers and administrators. Built with a robust Laravel backend and a responsive ReactJS frontend to help cafe owners manage products, sales, and analytics effortlessly.</p>
</div>

---

## Table of Contents 📑

- [About The Project 📖](#about-the-project-)
- [Tools & Technologies 🛠️](#tools--technologies-️)
- [Getting Started 🚀](#getting-started-)
  - [Prerequisites ✅](#prerequisites-)
  - [Installation 💾](#installation-)
- [Folder Structure 📂](#folder-structure-)
- [Usage 🧑‍💻](#usage-)
- [Contributors 🤝](#contributors-)
- [Contact 📬](#contact-)
- [Acknowledgements 🙏](#acknowledgements-)

---

## About The Project 📖

This project is a comprehensive Cafe POS system designed to handle daily cafe operations efficiently. It separates functionality into three main roles: Superadmins, Admins, and Cashiers, ensuring secure and focused workflows.

**Key features of this system:**

- **Role-Based Access Control:** Distinct workflows for Superadmins (System Settings, Admin Management and include admin workflow), Admins (Analytics, Reports, Cashier Management), and Cashiers (Order processing).
- **Bakong KHQR Integration:** Built-in support for generating QR payments via Bakong.
- **Telegram Receipts:** Automatically generates and sends receipt images to a Telegram channel upon checkout.
- **Advanced Reporting:** Export detailed Sales and Product analytics directly to Excel files.
- **Product Management:** Full control over Categories, Products, and Sizes.
- **Dynamic Settings:** Configure tax rates, discounts, and store information dynamically without touching the code.
- **Modern UI:** Clean, responsive, and intuitive interface built with TailwindCSS.

---

## Tools & Technologies 🛠️

- **Frontend:** ReactJS, TailwindCSS, FontAwesome, Axios, React Router, SweetAlert2, Vite
- **Backend:** Laravel 12, PHP, MySQL, Maatwebsite/Excel
- **Integrations:** Telegram Bot API, Bakong KHQR, Cloudinary (Image Storage)

---

## Getting Started 🚀

Follow these steps to run the Cafe POS System locally for development or testing.

### Prerequisites ✅

- PHP 8.2+ and Composer
- Node.js (version 18+ recommended)
- MySQL / MariaDB Server
- `npm` or `yarn`

### Installation 💾

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ang-Kimsor/Cafe-POS.git
   cd Cafe-POS
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```

   _Configure your `.env` file with your Database credentials, Telegram Bot Token, Telegram User ID, Telegram Group ID, Bakong Account ID, and Cloudinary API URL._

   ```bash
   php artisan serve
   ```

3. **Frontend Setup**

   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to the localhost URL provided by Vite (usually `http://localhost:3000` or `http://localhost:5173`) to see the app running.

---

## Folder Structure 📂

Here is the high-level folder structure:

```text
├── /Backend                   # Laravel 12 API Source Code
│   ├── /app
│   │   ├── /Exports           # Maatwebsite Excel exports
│   │   ├── /Http/Controllers  # API logic (AdminController, ProductController, etc.)
│   │   ├── /Models            # Eloquent ORM models
│   │   └── /Services          # TelegramService, etc.
│   ├── /database
│   │   ├── /migrations        # Database schema definitions
│   │   └── /seeders           # Initial data seeders (SettingSeeder, DatabaseSeeder)
│   ├── /routes
│   │   └── api.php            # Main API endpoint definitions
│   ├── /storage               # Application logs and uploaded files
│   └── .env                   # Environment configuration (DB, Telegram, Cloudinary)
│
├── /Frontend                  # ReactJS + Vite UI Source Code
│   ├── /src
│   │   ├── /api               # Axios instances and API call endpoints
│   │   ├── /assets            # Static media and fonts
│   │   ├── /components
│   │   │   ├── /admins        # Admin-specific UI (KPI cards, forms)
│   │   │   ├── /cashiers      # POS-specific UI (OrderList, ProductCard)
│   │   │   └── /common        # Shared components (DataTable, Modals, KHQR)
│   │   ├── /pages
│   │   │   ├── /admins        # Management pages (Products, Cashiers, Settings, Reports)
│   │   │   ├── /cashiers      # Main POS Interface and Order History
│   │   │   └── /auth          # Authentication pages
│   │   ├── /redux             # Global state management
│   │   ├── /utils             # Helper functions (date and currency formatters)
│   │   ├── App.jsx            # Application routing setup
│   │   └── main.jsx           # Vite entry point
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # TailwindCSS design system
│
└── README.md                  # Project documentation
```

---

## Usage 🧑‍💻

- **Cashier View:** Process new orders, select items and sizes, select payment methods (Cash or QR), and view daily order history.
- **Admin View:** Monitor daily revenue through the dashboard KPIs, generate Excel reports for sales and products, manage cashiers, and update the cafe's menu.
- **Superadmin View:** Full access to all Admin features, plus the ability to manage Admin accounts and configure global system settings (taxes, discounts, etc.).

---

## Contributors 🤝

Contributions are welcome! Feel free to fork the repo, create feature branches, and submit pull requests. Please open issues for bugs or feature requests.

<a href="https://github.com/Ang-Kimsor/Cafe-POS/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Ang-Kimsor/Cafe-POS" />
</a>

---

## Contact 📬

**Ang Kimsor**

- Telegram - [angkimsor@gmail.com](mailto:angkimsor@gmail.com)
- Call Me ☎️ +85587932289
- Project Link: [https://github.com/Ang-Kimsor/Cafe-POS](https://github.com/Ang-Kimsor/Cafe-POS)

---

## Acknowledgements 🙏

- Thanks to the ReactJS and Laravel communities for the powerful tools and support.
- TailwindCSS for the utility-first styling system.
- Shields.io for awesome badges.
- Icons from Font Awesome.
- Special thanks to friends, mentors, or contributors who provided feedback or assistance.
