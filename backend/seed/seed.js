import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Quiz from "../models/Quiz.js";
import mongoose from "mongoose";

dotenv.config();

const quizzes = [
  {
    title: "World Geography Basics",
    category: "Geography",
    difficulty: "easy",
    description: "Test your knowledge of countries, capitals, and continents.",
    timePerQuestion: 20,
    questions: [
      {
        text: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctIndex: 2,
        explanation: "Canberra, not Sydney, has been the capital since 1913.",
      },
      {
        text: "Which is the longest river in the world?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correctIndex: 1,
        explanation: "The Nile is generally considered the longest river.",
      },
      {
        text: "Mount Kilimanjaro is located in which country?",
        options: ["Kenya", "Tanzania", "Uganda", "Ethiopia"],
        correctIndex: 1,
        explanation: "Kilimanjaro sits in northeastern Tanzania.",
      },
      {
        text: "Which desert is the largest in the world?",
        options: ["Sahara", "Gobi", "Antarctic", "Kalahari"],
        correctIndex: 2,
        explanation: "The Antarctic Polar Desert is the largest by area.",
      },
      {
        text: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanation: "The commonly taught model has seven continents.",
      },
    ],
  },
  {
    title: "Science & Nature",
    category: "Science",
    difficulty: "medium",
    description: "From atoms to ecosystems, how sharp is your science trivia?",
    timePerQuestion: 25,
    questions: [
      {
        text: "What gas do plants primarily absorb for photosynthesis?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctIndex: 1,
        explanation: "Plants absorb CO2 and release oxygen as a byproduct.",
      },
      {
        text: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
        correctIndex: 2,
        explanation: "Mitochondria generate ATP, the cell's energy currency.",
      },
      {
        text: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctIndex: 2,
        explanation: "Au comes from the Latin word 'aurum'.",
      },
      {
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctIndex: 1,
        explanation: "Iron oxide on its surface gives Mars its reddish color.",
      },
      {
        text: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Quartz", "Diamond", "Titanium"],
        correctIndex: 2,
        explanation: "Diamond ranks 10 on the Mohs hardness scale.",
      },
    ],
  },
  {
    title: "Pop Culture Rewind",
    category: "Entertainment",
    difficulty: "easy",
    description: "Movies, music, and moments everyone remembers.",
    timePerQuestion: 15,
    questions: [
      {
        text: "Which instrument has 88 keys?",
        options: ["Guitar", "Piano", "Violin", "Flute"],
        correctIndex: 1,
        explanation: "A standard piano keyboard has 88 keys.",
      },
      {
        text: "The Mona Lisa was painted by whom?",
        options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
        correctIndex: 2,
        explanation: "Leonardo da Vinci painted it in the early 1500s.",
      },
      {
        text: "Which streaming milestone does '1080p' refer to?",
        options: ["Frame rate", "Resolution", "Bitrate", "Aspect ratio"],
        correctIndex: 1,
        explanation: "1080p describes vertical pixel resolution.",
      },
      {
        text: "Which award show honors achievements in film?",
        options: ["Grammy", "Emmy", "Oscar", "Tony"],
        correctIndex: 2,
        explanation: "The Academy Awards, or Oscars, honor film.",
      },
      {
        text: "How many strings does a standard guitar have?",
        options: ["4", "5", "6", "7"],
        correctIndex: 2,
        explanation: "Standard acoustic and electric guitars have 6 strings.",
      },
    ],
  },
];

const run = async () => {
  await connectDB();
  await Quiz.deleteMany({});
  await Quiz.insertMany(quizzes);
  console.log(`Seeded ${quizzes.length} quizzes.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
