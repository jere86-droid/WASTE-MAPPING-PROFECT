# 🗺️ WasteMap - Community Waste Management Platform

A full-stack MERN application for reporting and managing waste disposal issues in local communities.

![WasteMap](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Features

### User Features
- 🔐 User authentication with email verification
- 🗺️ Interactive map with waste report markers
- 📍 Click-to-report waste issues
- 📸 Upload up to 3 images per report
- 🎯 Filter reports by waste type and status
- 👍 Upvote reports to increase visibility
- 📊 Personal dashboard with report history
- 🔔 Real-time email notifications
- ✏️ Edit/delete pending reports

### Admin Features
- 📊 Comprehensive dashboard with analytics
- 📈 Visual charts (Pie, Bar charts)
- 🔄 Update report status (Pending → In Progress → Resolved)
- 📝 Add admin notes to reports
- 👥 User management
- 📥 Export reports to CSV
- 📢 Send announcements to all users
- ⚡ Real-time notifications via Socket.io

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time updates
- **Axios** - API calls
- **React Toastify** - Notifications

### Backend
- **Node.js & Express** - Server
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Socket.io** - WebSocket connections
- **Multer** - File uploads

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Cloudinary account
- Email service (Gmail)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=WasteMap <noreply@wastemap.com>
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

4. Start backend:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start frontend:
```bash
npm run dev
```

5. Open browser at `http://localhost:5173`

## 📸 Screenshots

### User Interface
- Interactive map with waste markers
- Report submission form
- Personal dashboard
- Report details with image gallery

### Admin Panel
- Analytics dashboard
- Report management
- User management
- Data export

## 🔑 Creating an Admin User

After registering, update your user in MongoDB:

**Option 1: MongoDB Compass**
1. Open the `users` collection
2. Find your user
3. Change `role: "user"` to `role: "admin"`

**Option 2: MongoDB Shell**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## 🚀 Deployment

### Backend (Render)

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables from `.env`
6. Deploy

### Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
4. Add environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_SOCKET_URL`: Your backend URL
5. Deploy

### Database (MongoDB Atlas)

1. Create account on [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for all)
5. Get connection string
6. Update `MONGO_URI` in backend

## 📁 Project Structure

```
wastemap/
├── backend/
│   ├── config/          # Database & services config
│   ├── controllers/     # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handling
│   ├── utils/           # Helper functions
│   ├── socket/          # Socket.io handlers
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── utils/       # Helper functions
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets
│
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Reports
- `GET /api/reports` - Get all reports (with filters)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create report (auth)
- `PUT /api/reports/:id` - Update report (auth)
- `DELETE /api/reports/:id` - Delete report (auth)
- `POST /api/reports/:id/upvote` - Upvote report (auth)
- `GET /api/reports/user/my-reports` - Get user's reports (auth)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (admin)
- `PUT /api/admin/reports/:id/status` - Update status (admin)
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/users/:id` - Get user details (admin)
- `POST /api/admin/announcements` - Send announcement (admin)
- `GET /api/admin/reports/export` - Export CSV (admin)

### Notifications
- `GET /api/notifications` - Get user notifications (auth)
- `PUT /api/notifications/:id/read` - Mark as read (auth)
- `PUT /api/notifications/mark-all-read` - Mark all read (auth)
- `DELETE /api/notifications/:id` - Delete notification (auth)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

JEREMY MUTUNGA - mutungajeremy84@gmail.com

## 🙏 Acknowledgments

- [Leaflet](https://leafletjs.com/) - Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database hosting

## 📞 Support

For support, email mutungajeremy84@gmail.com or open an issue on GitHub.

---

Made with ❤️ using MERN Stack