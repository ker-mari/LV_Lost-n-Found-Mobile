Based on the repository provided, here is a professional `README.md` file tailored for the **LV_Lost-n-Found-Mobile** project. This documentation focuses on the application's core functionality, technical stack, and security features.

---

# LV Lost N Found Mobile

A dedicated mobile application designed for the **La Verdad** community to streamline the process of reporting and retrieving lost items. This application provides a centralized platform for students and staff to post found items, search for lost belongings, and securely manage claims.

## 🚀 Features

* **PIN-Based Authentication**: Secure access for administrative functions and user verification using a custom numeric PIN system.
* **Item Reporting**: Users can easily upload details of found items, including descriptions and categories.
* **Admin Dashboard**: Dedicated management interface for administrators to handle modals, verify claims, and manage the database.
* **Search & Filter**: Intuitive UI to help users quickly find items based on specific criteria.
* **Mobile-First Design**: Optimized for accessibility and ease of use in a campus environment.

## 🛠️ Technical Stack

* **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
* **Language**: JavaScript / ES6+
* **UI Components**: Custom-designed modular components including specialized PIN screens and administrative modals.
* **Version Control**: Git & GitHub

## 📂 Project Structure

```text
├── assets/             # Images and icons used in the app
├── components/         # Reusable UI components (Modals, Buttons, etc.)
├── screens/            # Main application screens (PinScreen, Home, Admin, etc.)
├── navigation/         # React Navigation configurations
├── App.js              # Main entry point
└── package.json        # Dependencies and scripts
```

## ⚙️ Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ker-mari/LV_Lost-n-Found-Mobile.git
    cd LV_Lost-n-Found-Mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Start the development server**:
    ```bash
    npx expo start
    ```

4.  **Run on mobile**:
    Scan the QR code using the **Expo Go** app (Android) or the Camera app (iOS).

## 🔒 Security

The application utilizes a secure **PIN-based authentication** system for sensitive administrative actions. This ensures that only authorized personnel can manage reported items and verify user claims within the La Verdad campus system.

## 📄 License

This project is developed for academic and community purposes within the La Verdad Christian College Information Systems department.
