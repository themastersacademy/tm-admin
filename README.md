📚 LMS Project

A scalable Learning Management System (LMS) built with Next.js 14 (App Router), DynamoDB, and AWS S3, deployed on Vercel.

🚀 Features

User & Admin Dashboards

Course Management

Exam Scheduling & Practice Tests

Video Streaming via Bunny.net

Resource Uploads & S3 Storage

DynamoDB Single-Table Design

Serverless Architecture (Vercel Functions)

🛠️ Tech Stack

Frontend: Next.js 14 (App Router)

Backend: AWS DynamoDB, AWS S3

Authentication: JWT-based authentication

Video Streaming: Bunny.net

Hosting: Vercel

📦 Installation & Setup

1. Clone the repository

git clone https://github.com/yourusername/lms-project.git
cd lms-project

2. Install dependencies

npm install

3. Configure environment variables

Create a .env.local file and add the following:

AWS_REGION=us-east-1
AWS_DB_NAME=your-dynamodb-name
AWS_BUCKET_NAME=your-s3-bucket
AWS_BANK_PATH=uploads/
VERCEL_TOKEN=your-vercel-token

4. Start the development server

npm run dev

📡 API Endpoints

Authentication

Method

Endpoint

Description

POST

/api/auth/login

User Login

POST

/api/auth/signup

User Signup

Goals & Resources

Method

Endpoint

Description

POST

/api/goals

Create a new goal

GET

/api/goals

Fetch all goals

POST

/api/resources

Upload a resource (S3)

POST

/api/verify-upload

Verify file & update isUploaded

Courses & Exams

Method

Endpoint

Description

POST

/api/courses

Create a new course

GET

/api/courses

Get all courses

POST

/api/exams

Create a new exam

GET

/api/exams

Get all exams

📜 Project Structure

lms-project/
│── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── exams/
│   │   ├── goals/
│   │   ├── resources/
│── lib/
│   ├── dynamodb.js
│   ├── s3.js
│── utils/
│   ├── verifyFile.js
│   ├── createFile.js
│── .env.local
│── package.json
│── README.md

🎯 Roadmap



🤝 Contributing

Fork the repo

Create a new branch (feature-name)

Commit your changes

Push to your branch

Open a Pull Request 🚀

📄 License

MIT License © 2025 INCRIX

🌟 Acknowledgments

Built with ❤️ by Avinash & the INCRIX team.

