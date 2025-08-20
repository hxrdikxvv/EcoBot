const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const session = require("express-session");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// ===== Sessions =====
app.use(
  session({
    secret: "ecobot-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ===== File upload =====
const upload = multer({ storage: multer.memoryStorage() });

// ===== Gemini client =====
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===== Users storage =====
const USERS_FILE = "./users.json";
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ===== Home route =====
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// ===== Signup =====
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

  const users = loadUsers();
  if (users.find((u) => u.email === email)) return res.status(400).json({ success: false, message: "User already exists!" });

  const newUser = { name, email, password, ecopoints: 0 };
  users.push(newUser);
  saveUsers(users);

  req.session.user = newUser;
  res.json({ success: true, message: "Signup successful!", user: newUser });
});

// ===== Login =====
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

  req.session.user = user;
  res.json({ success: true, message: "Login successful!", user });
});

// ===== Logout =====
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true, message: "Logged out successfully" }));
});

// ===== Add EcoPoints (manual API) =====
app.post("/add-points", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });

  const users = loadUsers();
  const user = users.find((u) => u.email === req.session.user.email);
  if (user) {
    user.ecopoints += 10;
    req.session.user.ecopoints = user.ecopoints;
    saveUsers(users);
  }

  res.json({ ecopoints: req.session.user.ecopoints });
});

// ===== EcoBot Text Chat =====
app.post("/converse", async (req, res) => {
  try {
    const message = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
You are EcoBot, a friendly and helpful AI assistant focused on eco-friendly guidance.

Your areas of expertise include:
- Waste management, segregation, recycling techniques, and composting
- Sustainability, green living practices, carbon footprint reduction, and renewable energy
- Ecosystems, biodiversity, conservation, wildlife protection, and natural resource management

Rules:
1. Always start by greeting the user politely.
2. Ask the user how you can assist them or if they have a specific eco-related question.
3. Only answer questions related to the areas of expertise listed above.
4. If the user asks something unrelated to eco-friendly topics, politely respond:
   "I'm sorry, I can only answer eco-related questions."

Behavior:
- Provide concise, practical, and encouraging guidance.
- Whenever possible, suggest actionable steps users can take toward sustainability.
- Maintain a friendly and approachable tone throughout the conversation.


`;

    const result = await model.generateContent([systemPrompt, message]);
    const reply = result.response.text().trim();
    res.json({ role: "assistant", content: reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

// ===== Image Classification =====
app.post("/classify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const base64Image = req.file.buffer.toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are EcoBot, an AI eco-classifier.

Task:
1. Analyze the uploaded image and identify the main object clearly.
2. Classify it into ONE of the following categories: Biodegradable, Non-biodegradable, or Recyclable.
3. Provide a clear 4-5 line explanation in **plain text only** (no asterisks, underscores, or special formatting), including:
   - Why it belongs to that category
   - How it is usually treated in waste management
   - Its effects on nature or the environment if disposed improperly
4. End your response by politely asking the user if they need further eco-friendly guidance or help with another item.

Be concise, friendly, and informative. Do not use any Markdown or special characters in your response.
`;


    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64Image, mimeType: req.file.mimetype } },
    ]);

    const reply = result.response.text().trim();

    if (req.session.user) {
      const users = loadUsers();
      const user = users.find((u) => u.email === req.session.user.email);
      if (user) {
        user.ecopoints += 10;
        req.session.user.ecopoints = user.ecopoints;
        saveUsers(users);
      }
    }

    res.json({ category: reply, ecopoints: req.session.user?.ecopoints || 0 });
  } catch (err) {
    console.error("Gemini Vision API error:", err);
    res.status(500).json({ error: "Image classification failed" });
  }
});

// ===== Start Server =====
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));

















//OG code
/*
const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// ===== Home route =====
app.get("/", (req, res) => {
  res.render("index");
});

// ===== File upload config =====
const upload = multer({ storage: multer.memoryStorage() });

// ===== Gemini client =====
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ========= TEXT CHAT (EcoBot) =========
app.post("/converse", async (req, res) => {
  try {
    const message = req.body.message;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // EcoBot system prompt
    const systemPrompt = `
You are **EcoBot**, a helpful assistant that ONLY answers questions related to:
- nature & ecosystems
- biodiversity & biosystems
- waste types, waste classification (biodegradable / non-biodegradable / recyclable), and proper handling/disposal
- sustainability practices, recycling, composting, circular economy

Rules:
- If a user asks something unrelated, reply: "I'm sorry, I can only answer eco-related questions."
- Be concise, practical, and accurate. Use plain language.
- When giving guidance, offer 2–4 concrete steps or best practices.
- If classification is requested (bio / non-bio / recyclable), state the category first, then a one-line reason.
- If uncertain, say what you’d need to know to be confident (e.g., material type, local rules).

Format:
- Keep responses short paragraphs or brief bullet points.
- Avoid emojis unless the user uses them first.
`;

    // Generate response
    const result = await model.generateContent([systemPrompt, message]);
    const reply = result.response.text().trim();

    res.json({ role: "assistant", content: reply });
    console.log("User:", message);
    console.log("EcoBot:", reply);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

// ========= IMAGE CLASSIFICATION =========
app.post("/classify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const base64Image = req.file.buffer.toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are EcoBot, an AI eco-classifier.

Task:
1) Inspect the uploaded image and identify the main visible object.
2) Classify it into EXACTLY ONE of:
   - Biodegradable
   - Non-biodegradable
   - Recyclable

Response format (STRICT):
- First line: the category only (exactly one of the three).
- Second line (optional, max 1–2 sentences): a clear reason and a proper handling tip (e.g., recycle bin type, composting, or safe disposal).
- If the item is ambiguous, say what info is missing (e.g., material type), then give the best likely category.

Scope guard:
- If the image is not related to nature, ecosystems, biosystems, waste, or sustainability, reply: "I'm sorry, I can only classify eco-related items."

Keep the answer concise and user-friendly.
`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: base64Image,
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const reply = result.response.text().trim();

    res.json({ category: reply });
    console.log("Image classified as:", reply);
  } catch (err) {
    console.error("Gemini Vision API error:", err);
    res.status(500).json({ error: "Image classification failed" });
  }
});

// ========= Start server =========
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

*/