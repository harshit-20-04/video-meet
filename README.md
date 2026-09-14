# VideoMeet – Real-Time Video Conferencing Platform

##  Overview
Developed a full-stack real-time video conferencing web application that enables users to join
and host video meetings with seamless audio/video communication. This project leverages WebRTC for
peer-to-peer media streaming and Socket.io for real-time signaling between clients and server, ensuring
efficient connection setup and interaction.

##  Features
- User authentication and authorization
- Real-time functionality
- Responsive and modern UI
- API integration
- Scalable and modular architecture

## Tech Stack
**Frontend:**
- React.js
- Material UI

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB (or your database)

**Other Tools:**
- Socket.io (if used)
- Axios
- Git & GitHub

##  Folder Structure
```
project-root/
│
├── frontend/                 # Vite + React frontend
│   ├── node_modules/
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
├── backend/                  # Node.js + Express backend
│   ├── controllers/          # Logic
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── schemas/              # Validation schemas
│   ├── node_modules/
│   ├── .env
│   ├── .gitignore
│   ├── app.js                # Express app setup
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

##  Installation
Follow these steps to run the project locally:

### 1️ Clone the repository
```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2️ Install dependencies

#### Frontend
```
cd client
npm install
```

#### Backend
```
cd server
npm install
```

### 3️ Setup environment variables
Create a `.env` file in the backend directory and add the following:
```
PORT=8000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
```

### 4️ Run the application

#### Backend
```
npm start
```

#### Frontend
```
npm start
```

The app will run on:
```
Frontend: http://localhost:5173
Backend: http://localhost:8000
```

##  Environment Variables
| Variable | Description |
|----------|------------|
| PORT | Server port |
| MONGO_URI | MongoDB connection |
| JWT_SECRET | Authentication secret |


##  Deployment
You can deploy the project using:
- AWS EC2
- Docker
- GitHub Actions CI/CD

## Contributing
Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Push and create a pull request


## 👨‍💻 Author
**Harshit Sharma**

👋Full Stack Developer passionate about creating scalable and user-friendly web applications.

💼 Skilled in MERN Stack, REST APIs, and modern front-end development.

📫 Reach me at: 05harshit.sharma2004@gmail.com

🔗 GitHub: [harshit-20-04](https://github.com/harshit-20-04)

💼 LinkedIn: [Harshit Sharma](https://www.linkedin.com/in/harshit-sharma-ac8896/)

---

⭐ If you like this project, give it a star on GitHub!

