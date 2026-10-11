import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import QuizAttempt from "../models/QuizAttempt.js";
import mongoose from "mongoose";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await QuizResult.deleteMany({});
    await QuizAttempt.deleteMany({});
    console.log("Cleared existing users, quizzes, attempts, and results.");

    // Create Admin User
    const admin = await User.create({
      name: "Quiz Administrator",
      email: "admin@quizapp.com",
      password: "Admin@12345",
      role: "admin",
    });
    console.log("Created Admin account: admin@quizapp.com / Admin@12345");

    // Create Student Users
    const user1 = await User.create({
      name: "Rahul Sharma",
      email: "rahul@quizapp.com",
      password: "User@12345",
      role: "user",
    });

    const user2 = await User.create({
      name: "Priya Patel",
      email: "priya@quizapp.com",
      password: "User@12345",
      role: "user",
    });

    const user3 = await User.create({
      name: "Aman Verma",
      email: "aman@quizapp.com",
      password: "User@12345",
      role: "user",
    });
    console.log("Created Sample User accounts: rahul@quizapp.com, priya@quizapp.com, aman@quizapp.com");

    // Create Sample Quizzes
    const mernQuiz = await Quiz.create({
      title: "MERN Stack Fundamentals",
      description: "Master MongoDB, Express.js, React.js, and Node.js concepts.",
      quizCode: "MERN4821",
      duration: 10, // 10 minutes
      category: "Web Development",
      difficulty: "medium",
      createdBy: admin._id,
      questions: [
        {
          question: "Which database is used as the document store in the MERN stack?",
          options: ["MySQL", "MongoDB", "PostgreSQL", "Oracle"],
          correctAnswer: 1,
          marks: 1,
          explanation: "MongoDB is the NoSQL document database used in the MERN stack.",
        },
        {
          question: "What is Express.js primarily used for in MERN?",
          options: [
            "Relational Database Management",
            "Backend Web Application Framework for Node.js",
            "Frontend UI Component Library",
            "Machine Learning Modeling",
          ],
          correctAnswer: 1,
          marks: 1,
          explanation: "Express.js is a minimal and flexible Node.js web application framework providing routing and middleware.",
        },
        {
          question: "Which React hook is used to manage side effects in functional components?",
          options: ["useState", "useMemo", "useEffect", "useCallback"],
          correctAnswer: 2,
          marks: 1,
          explanation: "useEffect is used to run side effects like API fetching, timers, and subscriptions.",
        },
        {
          question: "What does JWT stand for in web authentication?",
          options: [
            "Java Web Tool",
            "JSON Web Token",
            "JavaScript Wide Transmission",
            "Joined Web Technique",
          ],
          correctAnswer: 1,
          marks: 1,
          explanation: "JWT stands for JSON Web Token, commonly used for stateless authorization.",
        },
        {
          question: "Which method in Mongoose is used to populate referenced documents from another collection?",
          options: ["join()", "link()", "populate()", "merge()"],
          correctAnswer: 2,
          marks: 1,
          explanation: "Mongoose's populate() lets you reference documents in other collections.",
        },
      ],
    });

    const jsQuiz = await Quiz.create({
      title: "JavaScript Core & ES6+",
      description: "Test your modern JavaScript foundations including closures, async/await, and prototypes.",
      quizCode: "JSES6101",
      duration: 8,
      category: "Programming",
      difficulty: "easy",
      createdBy: admin._id,
      questions: [
        {
          question: "Which keyword declares a block-scoped variable that cannot be reassigned?",
          options: ["var", "let", "const", "def"],
          correctAnswer: 2,
          marks: 1,
          explanation: "const creates a block-scoped variable whose binding cannot be reassigned.",
        },
        {
          question: "What does Promise.all() do?",
          options: [
            "Runs promises sequentially",
            "Waits for all promises to resolve or any to reject",
            "Returns only the fastest promise",
            "Cancels pending promises",
          ],
          correctAnswer: 1,
          marks: 1,
          explanation: "Promise.all fulfills when all input promises fulfill, or rejects when any rejects.",
        },
        {
          question: "What is the output of typeof null in JavaScript?",
          options: ["'null'", "'undefined'", "'object'", "'boolean'"],
          correctAnswer: 2,
          marks: 1,
          explanation: "In JavaScript, typeof null returns 'object' due to a legacy design quirk.",
        },
        {
          question: "Which array method creates a new array with all elements that pass a test?",
          options: ["map()", "filter()", "forEach()", "reduce()"],
          correctAnswer: 1,
          marks: 1,
          explanation: "Array.prototype.filter() returns elements satisfying the predicate function.",
        },
      ],
    });

    console.log("Created Quizzes: MERN4821, JSES6101");

    // Add sample results for leaderboard demonstration
    // Rahul: 5/5, timeTaken: 180s (3m 00s)
    await QuizResult.create({
      user: user1._id,
      quiz: mernQuiz._id,
      score: 5,
      totalMarks: 5,
      percentage: 100,
      totalQuestions: 5,
      correctAnswers: 5,
      incorrectAnswers: 0,
      unanswered: 0,
      timeTaken: 180,
      submittedAt: new Date(Date.now() - 3600000),
      answers: [],
    });

    // Priya: 5/5, timeTaken: 215s (3m 35s)
    await QuizResult.create({
      user: user2._id,
      quiz: mernQuiz._id,
      score: 5,
      totalMarks: 5,
      percentage: 100,
      totalQuestions: 5,
      correctAnswers: 5,
      incorrectAnswers: 0,
      unanswered: 0,
      timeTaken: 215,
      submittedAt: new Date(Date.now() - 1800000),
      answers: [],
    });

    // Aman: 4/5, timeTaken: 240s (4m 00s)
    await QuizResult.create({
      user: user3._id,
      quiz: mernQuiz._id,
      score: 4,
      totalMarks: 5,
      percentage: 80,
      totalQuestions: 5,
      correctAnswers: 4,
      incorrectAnswers: 1,
      unanswered: 0,
      timeTaken: 240,
      submittedAt: new Date(Date.now() - 900000),
      answers: [],
    });

    console.log("Seeded sample quiz results and leaderboard entries successfully!");
    console.log("\n=========================================");
    console.log("DEFAULT CREDENTIALS FOR TESTING:");
    console.log("Admin: admin@quizapp.com / Admin@12345");
    console.log("User:  rahul@quizapp.com / User@12345");
    console.log("Quiz Code: MERN4821");
    console.log("=========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
