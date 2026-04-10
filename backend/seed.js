/**
 * seed.js — EduPlatform Database Seeder
 *
 * Creates TWO collections in MongoDB:
 *   • courses  — all 18 courses
 *   • users    — 1 demo user with courses + progress embedded inside
 *
 * Usage:
 *   cd backend
 *   npm run seed      (or: node seed.js)
 *
 * Running again wipes and re-seeds cleanly.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const Course   = require("./models/Course");
const User     = require("./models/User");
const Admin    = require("./models/Admin");

function createSections(courseTitle) {
  return [
    {
      title: "Introduction & Setup",
      lectures: [
        {
          title: "Course Overview",
          type: "video",
          duration: "12 min",
          content: `A quick tour of ${courseTitle} and what you will build.`,
          materials: [
            {
              title: "Overview Video",
              type: "video",
              url: "https://www.youtube.com/watch?v=8mAITcNt710",
              note: "Watch the intro lesson before starting.",
            },
            {
              title: "Course Notes PDF",
              type: "pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              note: "Download the lesson notes for revision.",
            },
          ],
        },
        {
          title: "Environment Setup",
          type: "article",
          duration: "8 min",
          content: "Install the required tools, dependencies, and editor extensions.",
          materials: [
            {
              title: "Setup Slides PPT",
              type: "ppt",
              url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx",
              note: "Use these slides while setting up your workspace.",
            },
            {
              title: "Setup Checklist PDF",
              type: "pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              note: "Checklist for required tools and installation steps.",
            },
          ],
        },
      ],
    },
    {
      title: "Core Concepts Deep Dive",
      lectures: [
        {
          title: "Main Concepts",
          type: "video",
          duration: "18 min",
          content: "Understand the core ideas that drive the course workflow and examples.",
          materials: [
            {
              title: "Concept Lecture Video",
              type: "video",
              url: "https://www.youtube.com/watch?v=4MZN7b4Hj10",
              note: "Rewatch while taking notes.",
            },
            {
              title: "Concept Diagram PDF",
              type: "pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              note: "A printable revision sheet.",
            },
          ],
        },
        {
          title: "Mini Quiz",
          type: "quiz",
          duration: "5 min",
          content: "Check your understanding before moving on to hands-on practice.",
          materials: [
            {
              title: "Quiz Review Slides",
              type: "ppt",
              url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx",
              note: "Review before attempting the quiz again.",
            },
          ],
        },
      ],
    },
    {
      title: "Hands-on Projects",
      lectures: [
        {
          title: "Build Along Project",
          type: "video",
          duration: "22 min",
          content: "Follow a practical walkthrough and apply the lesson in a real example."
        },
        {
          title: "Downloadable Notes",
          type: "file",
          duration: "3 min",
          content: "Reference notes and files you can keep for revision.",
        },
      ],
    },
  ];
}

// ── 18 Courses ────────────────────────────────────────────────────
const COURSES = [
  {
    id: 1, title: "React Basics",
    description: "Learn the fundamentals of React — components, props, state, and hooks — by building real projects from scratch.",
    instructor: "John Doe", instructorAvatar: "https://i.pravatar.cc/150?img=11",
    category: "Frontend", difficulty: "Beginner", duration: "6h 20m",
    rating: "4.9", students: "2.4k", price: 0,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
  },
  {
    id: 2, title: "Advanced React & Redux",
    description: "Master advanced patterns including Redux Toolkit, custom hooks, performance optimisation, and scalable app architecture.",
    instructor: "John Doe", instructorAvatar: "https://i.pravatar.cc/150?img=11",
    category: "Frontend", difficulty: "Advanced", duration: "11h 15m",
    rating: "4.8", students: "1.6k", price: 1299,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
  },
  {
    id: 3, title: "CSS Mastery",
    description: "Go beyond the basics — Grid, Flexbox, custom properties, animations, and responsive design techniques used by pros.",
    instructor: "Sara Kim", instructorAvatar: "https://i.pravatar.cc/150?img=47",
    category: "Frontend", difficulty: "Intermediate", duration: "5h 10m",
    rating: "4.6", students: "900", price: 799,
    thumbnail: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80",
  },
  {
    id: 4, title: "Tailwind CSS from Scratch",
    description: "Build beautiful, responsive UIs at lightning speed using Tailwind's utility-first approach and modern design system.",
    instructor: "Sara Kim", instructorAvatar: "https://i.pravatar.cc/150?img=47",
    category: "Frontend", difficulty: "Beginner", duration: "4h 40m",
    rating: "4.7", students: "1.3k", price: 0,
    thumbnail: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=600&q=80",
  },
  {
    id: 5, title: "JavaScript Advanced",
    description: "Deep-dive into closures, prototypes, the event loop, async patterns, and design principles every JS engineer must know.",
    instructor: "Alice Smith", instructorAvatar: "https://i.pravatar.cc/150?img=32",
    category: "JavaScript", difficulty: "Advanced", duration: "9h 45m",
    rating: "4.8", students: "1.8k", price: 1499,
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80",
  },
  {
    id: 6, title: "TypeScript in Depth",
    description: "Add type safety to your JavaScript projects — generics, utility types, decorators, and full-stack TypeScript workflows.",
    instructor: "Alice Smith", instructorAvatar: "https://i.pravatar.cc/150?img=32",
    category: "JavaScript", difficulty: "Advanced", duration: "8h 00m",
    rating: "4.9", students: "750", price: 1199,
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80",
  },
  {
    id: 7, title: "JavaScript for Beginners",
    description: "Start your coding journey with JavaScript — variables, functions, DOM manipulation, and your first interactive web pages.",
    instructor: "Mark Evans", instructorAvatar: "https://i.pravatar.cc/150?img=53",
    category: "JavaScript", difficulty: "Beginner", duration: "5h 30m",
    rating: "4.7", students: "3.2k", price: 0,
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80",
  },
  {
    id: 8, title: "Web Development Bootcamp",
    description: "A complete end-to-end bootcamp covering HTML, CSS, JavaScript, Node.js, and databases — zero to deployed in one course.",
    instructor: "David Lee", instructorAvatar: "https://i.pravatar.cc/150?img=15",
    category: "Full Stack", difficulty: "Intermediate", duration: "18h 00m",
    rating: "4.7", students: "3.1k", price: 2499,
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80",
  },
  {
    id: 9, title: "MERN Stack Masterclass",
    description: "Build and deploy production-ready apps with MongoDB, Express, React, and Node. Includes auth, REST APIs, and deployment.",
    instructor: "David Lee", instructorAvatar: "https://i.pravatar.cc/150?img=15",
    category: "Full Stack", difficulty: "Advanced", duration: "22h 30m",
    rating: "4.9", students: "2.0k", price: 2999,
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
  },
  {
    id: 10, title: "Next.js & Full Stack Dev",
    description: "Master Next.js App Router, server components, API routes, and Prisma ORM to ship fast, SEO-friendly full-stack apps.",
    instructor: "Priya Mehta", instructorAvatar: "https://i.pravatar.cc/150?img=44",
    category: "Full Stack", difficulty: "Intermediate", duration: "14h 00m",
    rating: "4.8", students: "1.4k", price: 1999,
    thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&q=80",
  },
  {
    id: 11, title: "Node.js Fundamentals",
    description: "Understand the Node.js runtime, modules, file system, streams, and how to build your first server-side applications.",
    instructor: "Mark Evans", instructorAvatar: "https://i.pravatar.cc/150?img=53",
    category: "Backend", difficulty: "Beginner", duration: "7h 30m",
    rating: "4.7", students: "1.1k", price: 0,
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
  },
  {
    id: 12, title: "REST APIs with Express",
    description: "Design and build robust REST APIs with Express — routing, middleware, authentication, error handling, and testing.",
    instructor: "Mark Evans", instructorAvatar: "https://i.pravatar.cc/150?img=53",
    category: "Backend", difficulty: "Intermediate", duration: "8h 45m",
    rating: "4.6", students: "870", price: 999,
    thumbnail: "https://images.unsplash.com/photo-1623282033815-40b05d96c903?w=600&q=80",
  },
  {
    id: 13, title: "Django for Python Developers",
    description: "Build production-ready web apps with Django — models, views, templates, authentication, and REST Framework APIs.",
    instructor: "Rohan Verma", instructorAvatar: "https://i.pravatar.cc/150?img=68",
    category: "Backend", difficulty: "Intermediate", duration: "10h 20m",
    rating: "4.7", students: "680", price: 1099,
    thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80",
  },
  {
    id: 14, title: "SQL & PostgreSQL Essentials",
    description: "Learn relational database design, complex queries, joins, indexes, and how to use PostgreSQL in real-world applications.",
    instructor: "Rohan Verma", instructorAvatar: "https://i.pravatar.cc/150?img=68",
    category: "Database", difficulty: "Beginner", duration: "6h 00m",
    rating: "4.6", students: "950", price: 0,
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80",
  },
  {
    id: 15, title: "MongoDB Complete Guide",
    description: "Master NoSQL database design with MongoDB — documents, aggregation pipelines, indexing, and Mongoose integration.",
    instructor: "Alice Smith", instructorAvatar: "https://i.pravatar.cc/150?img=32",
    category: "Database", difficulty: "Intermediate", duration: "7h 50m",
    rating: "4.7", students: "820", price: 899,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  {
    id: 16, title: "Git & GitHub for Developers",
    description: "Version control from zero to hero — branching strategies, pull requests, GitHub Actions CI/CD, and team workflows.",
    instructor: "Sara Kim", instructorAvatar: "https://i.pravatar.cc/150?img=47",
    category: "DevOps", difficulty: "Beginner", duration: "3h 30m",
    rating: "4.8", students: "4.1k", price: 0,
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&q=80",
  },
  {
    id: 17, title: "Docker & Kubernetes Essentials",
    description: "Containerise apps with Docker and orchestrate them with Kubernetes — deployments, services, Helm charts, and CI/CD pipelines.",
    instructor: "Priya Mehta", instructorAvatar: "https://i.pravatar.cc/150?img=44",
    category: "DevOps", difficulty: "Advanced", duration: "12h 10m",
    rating: "4.8", students: "1.0k", price: 1799,
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335a?w=600&q=80",
  },
  {
    id: 18, title: "Data Structures & Algorithms",
    description: "Crack technical interviews and level up your problem-solving with arrays, trees, graphs, dynamic programming, and more.",
    instructor: "Rohan Verma", instructorAvatar: "https://i.pravatar.cc/150?img=68",
    category: "DSA", difficulty: "Advanced", duration: "20h 00m",
    rating: "4.9", students: "2.7k", price: 2199,
    thumbnail: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&q=80",
  },
].map((course) => ({
  ...course,
  sections: createSections(course.title),
}));

// ── Demo user ─────────────────────────────────────────────────────
const DEMO = {
  name:     "Demo User",
          ,
          materials: [
          content: "Follow a practical walkthrough and apply the lesson in a real example.",
              type: "video",
              url: "https://www.youtube.com/watch?v=8mAITcNt710",
              note: "Build the project while watching.",
            },
            {
              title: "Project Handout PDF",
              type: "pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              note: "Reference while coding the project.",
            },
          ],
  email:    "demo@eduplatform.dev",
  password: "Demo@1234",
  initials: "DU",
  bio:      "Frontend developer passionate about building beautiful UIs.",
  location: "Ahmedabad, India",
  website:  "demo.eduplatform.dev",
          materials: [
            {
              title: "Download Slides PPT",
              type: "ppt",
              url: "https://file-examples.com/wp-content/uploads/2018/10/file-example_PPTX_500kB.pptx",
              note: "Use these slides for quick revision.",
            },
            {
              title: "Notes PDF",
              type: "pdf",
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              note: "Printable lecture notes.",
            },
          ],
  // courses[] embedded — courseId + progress live right here
  courses: [
    { courseId: 1, progress: 100, enrolledAt: new Date("2026-01-10") },
    { courseId: 2, progress: 35,  enrolledAt: new Date("2026-02-01") },
    { courseId: 3, progress: 10,  enrolledAt: new Date("2026-03-15") },
  ],
};

// ── Demo Admin ─────────────────────────────────────────────────────
const ADMIN = {
  name: "Admin User",
  email: "admin@eduplatform.com",
  password: "Anish1234",
  role: "superadmin",
};

// ── Run seed ──────────────────────────────────────────────────────
async function seed() {
  try {
    console.log("\n🌱  EduPlatform Seeder starting…");
    console.log("    Connecting to:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓   MongoDB connected\n");

    // Wipe
    await Course.deleteMany({});
    await User.deleteMany({});
    await Admin.deleteMany({});
    console.log("✓   Cleared existing data");

    // Seed courses
    await Course.insertMany(COURSES);
    console.log(`✓   Seeded ${COURSES.length} courses  →  'courses' collection`);

    // Seed demo user (with courses + progress embedded)
    const hashed = await bcrypt.hash(DEMO.password, 12);
    const user   = await User.create({ ...DEMO, password: hashed });
    console.log(`✓   Seeded demo user         →  'users' collection`);
    console.log(`    _id: ${user._id}`);

    // Seed admin user
    const adminHashed = await bcrypt.hash(ADMIN.password, 12);
    const admin = await Admin.create({ ...ADMIN, password: adminHashed });
    console.log(`✓   Seeded admin user         →  'admins' collection`);
    console.log(`    _id: ${admin._id}`);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  ✅  Seed complete!");
    console.log("  Collections created: courses, users, admins");
    console.log("  (No enrollment collection — progress lives in users)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Demo login:");
    console.log(`    Email   : ${DEMO.email}`);
    console.log(`    Password: ${DEMO.password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Admin login:");
    console.log(`    Email   : ${ADMIN.email}`);
    console.log(`    Password: ${ADMIN.password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("✗  Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("    MongoDB disconnected.\n");
  }
}

seed();