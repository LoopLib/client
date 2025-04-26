# LoopLib - Frontend

This is the frontend application for **LoopLib**, a platform designed for musicians and producers to upload, analyze, discover, and manage audio loops more intelligently. Built with **React.js**, the frontend provides a dynamic, user-friendly interface for interacting with the backend API, cloud storage, and authentication services.

---

## 📦 Features

- **User Authentication**: Secure sign-up and login via Firebase Authentication.
- **Audio Upload**: Drag-and-drop interface for uploading audio loops.
- **Audio Analysis**: Real-time BPM, key, genre, and instrument detection after upload.
- **Audio Library**: Browse, search, and filter loops by genre, BPM, key, and instruments.
- **Profile Management**: Update personal details, upload a profile picture, and view personal upload statistics.
- **Waveform Visualization**: Visual preview of uploaded audio files.
- **Responsive Design**: Optimized for desktop, tablet, and mobile viewing.

---

## 🛠️ Installation

### Clone the Repository:
```bash
git clone https://github.com/LoopLib/client.git
cd client
```

### Install Dependencies:
```bash
npm install
```

### Configure Environment Variables:
Create a `.env` file at the root of the project and add your Firebase project credentials:

```ini
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Start the Development Server:
```bash
npm start
```
The app will run locally at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
src/
├── authentication/        // Login, Register, and Firebase auth logic
├── edit/                  // Editing loop metadata
├── home/                  // Home page and landing components
├── loading/               // Loading spinners and fallback components
├── profile/               // Profile page, image upload, stats
├── structure/             // Layout structure (navbar, footer, wrappers)
├── upload/                // Upload form and Analyze page
├── user-library/          // User's personal audio loop library
├── App.js                 // Main component and route definitions
├── App.test.js            // Frontend test suite
├── FileContext.js         // React context for shared file state
├── firebaseConfig.js      // Firebase initialization and config
├── index.js               // React DOM entry point
├── index.css              // Global styles
├── logo.svg               // App logo asset
├── reportWebVitals.js     // Performance metrics (optional)
├── setupTests.js          // Jest testing setup

```

---

## 🧪 Testing

Frontend unit and integration testing is implemented using **Jest** and **React Testing Library**.

### To run tests:
```bash
npm test
```

### Example tested components:
- Register form input validation
- Profile picture upload section
- Audio library card rendering

---

## 📋 Future Improvements

- Multi-language support (i18n)
- Real-time notifications after file processing
- Dark mode theme toggle
- Progressive Web App (PWA) features for offline access

---

## 🤝 Acknowledgments

- Firebase for authentication and cloud services
- AWS S3 for storage
- React Community and Create-React-App project for the boilerplate
- Librosa and TensorFlow communities for enabling audio ML research
