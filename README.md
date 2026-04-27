# 🚀 CodeSign – Unified Learning & Recruitment Platform


## 🔗 GitHub Repository
👉 [View Project on GitHub](https://github.com/Sudheer7993306131/CoDesign)

## 📌 Overview

**CodeSign** is a full-stack web application designed to unify the entire journey of a technology learner—from learning and mentorship to networking and job recruitment—into a single platform.

It eliminates the need to use multiple disconnected platforms by integrating:

* 📚 Course Learning
* 👨‍🏫 Mentorship
* 🌐 Community Interaction
* 🤝 Professional Networking
* 💼 Job Recruitment

---

## 🎯 Problem Statement

Modern learners face fragmentation:

* Multiple platforms for courses, mentors, networking, and jobs
* No continuity of data across platforms
* Lack of verified skills for recruiters
* Limited access to mentorship and community motivation

**CodeSign solves this by providing a unified ecosystem.**

---

## 🎯 Objectives

* Build a full-stack platform integrating learning, mentorship, and recruitment
* Implement secure role-based authentication (Learner, Mentor, Recruiter)
* Enable course enrollment, reviews, and ratings
* Provide mentorship request system
* Create a social learning feed
* Develop skill-based recruitment system

---

## 🛠️ Tech Stack (FARM Stack)

### 🔹 Frontend

* React.js
* React Router
* Axios
* CSS Modules

### 🔹 Backend

* FastAPI (Python)
* REST APIs
* JWT Authentication

### 🔹 Database

* MongoDB (Atlas)
* Motor (Async driver)

### 🔹 Media Storage

* Cloudinary (Images & Videos)

---

## 🏗️ System Architecture

CodeSign follows a **3-tier architecture**:

1. **Frontend (React SPA)**
2. **Backend (FastAPI APIs)**
3. **Database (MongoDB)**

* Cloudinary for media handling

---

## 🔐 Authentication System

* JWT-based authentication
* Role-based access control:

  * Learner
  * Mentor
  * Recruiter
* Password hashing using bcrypt

---

## 📦 Core Features

### 📚 Courses Module

* Browse courses with filters
* Enroll in courses
* Rate & review courses
* Track learning progress

---

### 👨‍🏫 Mentorship Module

* Mentor registration with profiles
* Send mentorship requests
* Accept/Reject system
* Track mentorship status

---

### 🌐 Explore Module (Social Feed)

* Share learning updates
* Like & comment on posts
* Community-driven engagement

---

### 🤝 Connect Feature

* Send connection requests
* Build professional network
* View connections

---

### 💼 Recruitment System

* Recruiters post jobs
* Learners apply
* Skill-based matching algorithm
* Ranked candidate list based on skills

---

## 🧠 Skill Matching Algorithm

* Compares:

  * Required job skills
  * User skills
* Calculates **match percentage**
* Helps recruiters shortlist candidates faster

---

## 🗄️ Database Design

### Collections:

* `users`
* `courses`
* `mentorships`
* `posts`
* `jobs`
* `connections`

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/codesign.git
cd codesign
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌟 Advantages

* ✅ Unified platform (Learning → Job)
* ✅ Role-based personalization
* ✅ Skill-based recruitment
* ✅ Scalable FARM stack
* ✅ Community-driven motivation

---

## ⚠️ Limitations

* ❌ No real-time chat/video
* ❌ Skills are self-declared
* ❌ No payment integration
* ❌ No content moderation
* ❌ Web-only (no mobile app)

---

## 🔮 Future Enhancements

* 💬 Real-time chat & video (WebSockets/WebRTC)
* 🤖 AI-based recommendations
* 🏅 Skill verification & certifications
* 💳 Payment gateway (Stripe/Razorpay)
* 📊 Advanced analytics dashboards
* 📱 Mobile application (React Native)

---

---

## 👨‍💻 Author

**J Sudheer**
B.Tech CSE
RGUKT RK Valley

---

## 📜 License

This project is for academic purposes.

---

## 🙌 Acknowledgement

Special thanks to:

* Project Guide: Mr. N. Satyanandaram
* RGUKT RK Valley Faculty
* Friends & Family for support

---

## 💡 Conclusion

CodeSign provides a **complete ecosystem** for learners, mentors, and recruiters by combining multiple services into one platform, reducing fragmentation and improving productivity.

---
