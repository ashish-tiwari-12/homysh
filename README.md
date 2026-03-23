# homysh - Find your perfect stay 🏡

homysh is a full-stack web application built using the MERN stack (Node.js, Express, MongoDB, EJS) inspired by major booking platforms. It allows users to discover, book, and list unique properties around the world.

## ✨ Features
- **User Authentication**: Secure Sign Up and Log In using bcrypt for hashed passwords. Sessions are managed using MongoDB store.
- **Roles**: Support for two user types: 'Guest' and 'Host'.
- **Host Dashboard**: Hosts can seamlessly add, edit, or delete their listings with built-in image upload functionality (Multer).
- **Favorites & Bookings**: Guests can favorite homes, view details, and manage their bookings.
- **Premium UI/UX**: The entire front-end uses beautifully styled, responsive Tailwind CSS integrated via EJS templates.
- **Email & OTP System**: Complete Nodemailer integration. Includes automatic welcome emails upon registration, and a secure 3-step OTP-based "Forgot Password" flow with rate limiting and expiration.

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Frontend:** EJS, Tailwind CSS
- **Authentication:** Express-Session, bcryptjs
- **Utilities:** Multer (File uploads), Nodemailer (Emails), Node Crypto (OTP generation), Express Validator.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/homysh.git
   cd homysh
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   DB_PATH=mongodb+srv://<username>:<password>@cluster.mongodb.net/homysh?retryWrites=true&w=majority
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   *Note: `npm start` automatically boots up the robust backend and re-compiles your Tailwind configurations dynamically!*

5. Open your browser and navigate to `http://localhost:3003`
