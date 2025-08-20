# EcoBot 🌱 Chat Webpage

## ✅ Problem Statement
Managing waste, understanding eco-friendly practices, and identifying biodegradable, non-biodegradable, and recyclable items is challenging for many users. People often lack quick guidance on sustainable living and proper waste disposal methods.

**EcoBot** addresses this problem by providing an interactive platform where users can ask eco-related questions or upload images of items to instantly learn their category and get sustainability guidance.

---

## ✅ Current Progress Status
- **Frontend:** Fully developed with responsive design, chat interface, and image upload functionality. ✅
- **Backend:** Node.js & Express server is set up and working for text chat and image classification. ✅
- **Pending / To Be Implemented:**  
  - User authentication: signup/login features.  
  - EcoPoints system to reward users for sustainable actions and a leaderboard.  
  - Deployment to a live server (e.g., Vercel/Heroku).  
  - Optimization for large image uploads and handling Gemini API quota limits.  
  - Gamification through EcoPoints for interacting and learning.  

---

## ✅ How the Prototype Solves the Problem
1. Users can **ask eco-related questions** in natural language and receive AI-powered guidance.
2. Users can **upload images** of objects, and EcoBot classifies them into:
   - Biodegradable
   - Non-biodegradable
   - Recyclable
3. The bot provides **practical tips** for proper disposal and sustainability practices.
4. Planned: Users will earn **EcoPoints** for interacting, gamifying eco-friendly actions.  

---

## ✅ Technologies / Tools Used
- **Frontend:** HTML, CSS, JavaScript, EJS templating
- **Backend:** Node.js, Express.js
- **AI & API:** Google Generative AI (Gemini API) for text & image classification
- **File Upload:** Multer
- **Session Management:** express-session (to be used after login/signup is implemented)
- **Version Control:** Git & GitHub
- **Styling:** Poppins & Montserrat fonts, custom CSS

---

## ✅ Prototype Screenshots

**Chat Interface:**
![Chat Interface](./screenshots/chat-interface.png)


**Image Upload & Classification:**
![Image Classification](./screenshots/image-classification.png)

---

## ✅ How to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecobot-chat.git
   cd ecobot-chat
