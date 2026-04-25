# 📋 Resume AI Generator — Complete Project Summary

> **Stack:** MongoDB · Express.js · React (Vite) · Node.js  
> **AI Engine:** Google Gemini 2.5 Flash (`@google/generative-ai`)  
> **Last Documented:** April 16, 2026

---

## 🗂️ Project Structure

```
Resume_AI_GEN/
├── client/                          ← React (Vite) Frontend
│   └── src/
│       ├── App.jsx                  ← Root router
│       ├── main.jsx                 ← Entry point (ReactDOM + Redux Provider)
│       ├── index.css                ← Global styles
│       ├── app/
│       │   ├── store.js             ← Redux store
│       │   └── features/
│       │       └── authSlice.js     ← Auth state management
│       ├── configs/
│       │   └── api.js               ← Axios instance (base URL)
│       ├── pages/
│       │   ├── Home.jsx             ← Landing page
│       │   ├── Layout.jsx           ← Protected app shell (Navbar + Outlet)
│       │   ├── Dashboard.jsx        ← Resume list, create, upload
│       │   ├── ResumeBuilder.jsx    ← Main editor + AI Analysis tab
│       │   └── Preview.jsx          ← Public resume view
│       └── components/
│           ├── Navbar.jsx
│           ├── Loader.jsx
│           ├── PersonalInfoForm.jsx
│           ├── ProfessionalSummaryForm.jsx
│           ├── ExperienceForm.jsx        ← "Enhance With AI" per bullet
│           ├── EducationForm.jsx
│           ├── ProjectForm.jsx
│           ├── SkillsForm.jsx
│           ├── CertificationForm.jsx
│           ├── ResumePreview.jsx         ← Live resume renderer
│           ├── TemplateSelector.jsx
│           ├── ColorPicker.jsx
│           ├── ATSScoreDashboard.jsx     ← [NEW] ATS score ring + breakdown
│           ├── JobDescriptionInput.jsx   ← [NEW] JD keyword extractor
│           ├── ResumeMatchAnalysis.jsx   ← [NEW] Match % ring + skill chips
│           ├── ResumeAISuggestions.jsx   ← [NEW] AI suggestions panel
│           ├── OptimizeResumeButton.jsx  ← [NEW] Full AI rewrite + diff modal
│           ├── AI/
│           │   ├── CoverLetterDisplay.jsx    ← [NEW] 3-tone cover letter generator
│           │   └── InterviewPrepModule.jsx   ← [NEW] Technical/Behavioral Q&A
│           ├── Collaboration/
│           │   └── ShareModal.jsx            ← [NEW] Public toggle + collaborator invite
│           ├── Dashboard/
│           │   └── ScoreHistoryGraph.jsx     ← [NEW] ATS score timeline (Recharts)
│           └── home/
│               ├── Hero.jsx
│               ├── Features.jsx
│               ├── Testimonials.jsx
│               ├── CallToAction.jsx
│               ├── Footer.jsx
│               ├── Banner.jsx
│               └── Title.jsx
│
└── server/                          ← Express.js Backend
    ├── server.js                    ← Entry point, route mounting
    ├── .env                         ← MONGO_URI, JWT_SECRET, GEMINI_API_KEY, ImageKit keys
    ├── configs/
    │   ├── db.js                    ← Mongoose connection
    │   ├── ai.js                    ← GoogleGenerativeAI instance
    │   ├── imageKit.js              ← ImageKit SDK init
    │   └── multer.js                ← Multer (file upload config)
    ├── middlewares/
    │   └── authMiddleware.js        ← JWT protect guard
    ├── models/
    │   ├── User.js                  ← name, email, password (bcrypt)
    │   └── Resume.js                ← Full resume schema (see below)
    ├── routes/
    │   ├── userRoutes.js
    │   ├── resumeRoutes.js
    │   ├── aiRoutes.js
    │   ├── atsRoutes.js
    │   ├── shareRoutes.js
    │   └── exportRoutes.js
    └── controllers/
        ├── userController.js
        ├── resumeController.js
        ├── aiController.js
        ├── atsController.js
        ├── shareController.js
        └── exportController.js
```

---

## 🗄️ MongoDB Schemas

### `User` Model — `server/models/User.js`

| Field      | Type   | Rules              |
|------------|--------|--------------------|
| `name`     | String | required           |
| `email`    | String | required, unique   |
| `password` | String | bcrypt hashed      |
| `comparePassword()` | method | bcrypt.compareSync |

---

### `Resume` Model — `server/models/Resume.js`

| Field                 | Type          | Default     | Notes                              |
|-----------------------|---------------|-------------|------------------------------------|
| `userId`              | ObjectId(ref: User) | —       | Owner                              |
| `title`               | String        | "Untitled Resume" | —                         |
| `public`              | Boolean       | `false`     | Toggle for public sharing          |
| `template`            | String        | `"classic"` | Template choice                    |
| `accent_color`        | String        | `"#3b82f6"` | Color theme                        |
| `professional_summary`| String        | `""`        | —                                  |
| `skills`              | `[String]`    | —           | Array of skill strings             |
| `personal_info`       | Object        | —           | name, email, phone, location, linkedin, github, website, image |
| `experience`          | `[Object]`    | —           | company, position, start_date, end_date, description, is_current |
| `project`             | `[Object]`    | —           | name, type, description, link      |
| `education`           | `[Object]`    | —           | institution, degree, field, graduation_date, gpa |
| `certification`       | `[Object]`    | —           | certificate_name, description, issuer, issue_date, credential_url |
| `score_history`       | `[Object]`    | —           | **[NEW]** `{score, date, jobTarget}` array |
| `collaborators`       | `[Object]`    | —           | **[NEW]** `{userId(ref:User), role: 'viewer' or 'editor'}` |

---

## 🔌 Server Entry Point — `server/server.js`

```
Line 5:  import userRouter    → mounted at /api/users
Line 6:  import resumeRouter  → mounted at /api/resumes
Line 7:  import aiRouter      → mounted at /api/ai
Line 8:  import atsRouter     → mounted at /api/ats
Line 9:  import shareRouter   → mounted at /api/share
Line 10: import exportRouter  → mounted at /api/export
```

---

## 🛣️ All API Routes — Exact Line Numbers

### User Routes — `server/routes/userRoutes.js`

| Line | Method | Endpoint             | Controller       | Auth     |
|------|--------|----------------------|------------------|----------|
| 12   | POST   | `/api/users/register` | `registerUser`  | None     |
| 13   | POST   | `/api/users/login`   | `loginUser`      | None     |
| 14   | GET    | `/api/users/data`    | `getUserById`    | JWT      |
| 15   | GET    | `/api/users/resumes` | `getUserResumes` | JWT      |

### Resume Routes — `server/routes/resumeRoutes.js`

| Line | Method | Endpoint                       | Controller          | Auth   |
|------|--------|--------------------------------|---------------------|--------|
| 14   | POST   | `/api/resumes/create`          | `createResume`      | JWT    |
| 15   | PUT    | `/api/resumes/update`          | `updateResume`      | JWT + Multer |
| 16   | DELETE | `/api/resumes/delete/:resumeId`| `deleteResume`      | JWT    |
| 17   | GET    | `/api/resumes/get/:resumeId`   | `getResumeById`     | JWT    |
| 18   | GET    | `/api/resumes/public/:resumeId`| `getPublicResumeById` | None |

### AI Routes — `server/routes/aiRoutes.js` [ALL NEW]

| Line | Method | Endpoint                          | Controller                   | Auth   |
|------|--------|-----------------------------------|------------------------------|--------|
| 14   | POST   | `/api/ai/enhance-pro-sum`         | `enhanceProfessionalSummary` | JWT    |
| 15   | POST   | `/api/ai/enhance-job-desc`        | `enhanceJobDescription`      | JWT    |
| 16   | POST   | `/api/ai/upload-resume`           | `uploadResume`               | JWT    |
| 17   | POST   | `/api/ai/cover-letter`            | `generateCoverLetter`        | JWT    |
| 18   | POST   | `/api/ai/interview-questions`     | `generateInterviewQuestions` | JWT    |
| 19   | POST   | `/api/ai/smart-bullet`            | `generateSmartBullet`        | JWT    |

### ATS Routes — `server/routes/atsRoutes.js` [ALL NEW]

| Line | Method | Endpoint                             | Controller           | Auth   |
|------|--------|--------------------------------------|----------------------|--------|
| 13   | POST   | `/api/ats/analyze-resume`            | `analyzeResume`      | JWT    |
| 14   | POST   | `/api/ats/analyze-job-description`   | `analyzeJobDescription` | JWT |
| 15   | POST   | `/api/ats/resume-match`              | `resumeMatch`        | JWT    |
| 16   | POST   | `/api/ats/semantic-match`            | `semanticMatch`      | JWT    |
| 17   | POST   | `/api/ats/optimize-resume`           | `optimizeResume`     | JWT    |

### Share Routes — `server/routes/shareRoutes.js` [NEW]

| Line | Method | Endpoint                              | Controller           | Auth   |
|------|--------|---------------------------------------|----------------------|--------|
| 7    | POST   | `/api/share/:resumeId`                | `generateShareLink`  | JWT    |
| 8    | POST   | `/api/share/:resumeId/collaborators`  | `addCollaborator`    | JWT    |

### Export Routes — `server/routes/exportRoutes.js` [NEW]

| Line | Method | Endpoint                     | Controller   | Auth   |
|------|--------|------------------------------|--------------|--------|
| 7    | GET    | `/api/export/docx/:resumeId` | `exportDocx` | JWT    |

---

## 🔒 Auth Middleware — `server/middlewares/authMiddleware.js`

```
Line 4:  Reads token from req.headers.authorization
Line 10: jwt.verify(token, process.env.JWT_SECRET)
Line 11: Sets req.userId = decoded.userId → passed to all controllers
```

All protected routes call `protect` before the controller.

---

## 🧠 AI Controllers — `server/controllers/aiController.js`

| Function | Line | What it does | Gemini Call |
|---|---|---|---|
| `enhanceProfessionalSummary` | L6 | Rewrites summary to be ATS-friendly (1-2 sentences) | `generateContent` |
| `enhanceJobDescription` | L29 | Rewrites job bullet to use action verbs | `generateContent` |
| `uploadResume` | L52 | Parses PDF text into structured JSON resume | `generateContent` (JSON mode) |
| `generateCoverLetter` | L128 | Returns 3 cover letters: Formal, Friendly, Confident | `generateContent` (JSON mode) |
| `generateInterviewQuestions` | L157 | Returns technical + behavioral Q&A from JD + missing skills | `generateContent` (JSON mode) |
| `generateSmartBullet` | L186 | Rewrites one weak bullet into strong ATS bullet | `generateContent` |

All use: `model: process.env.GEMINI_MODEL || "gemini-2.5-flash"` (L15, L38, L109, L145, L173, L195)

---

## 📊 ATS Controllers — `server/controllers/atsController.js`

| Function | Line | What it does | Method |
|---|---|---|---|
| `analyzeResume` | L84 | Scores resume 0-100 (5 categories) locally | Pure algorithm |
| `analyzeJobDescription` | L165 | Extracts skills/tools/responsibilities from JD | Gemini AI |
| `resumeMatch` | L199 | Compares resume keywords vs JD keywords → match % | Algorithm |
| `optimizeResume` | L253 | AI rewrites entire resume to match JD | Gemini AI (JSON) |
| `semanticMatch` | L292 | Cosine similarity via `text-embedding-004` | Gemini Embeddings |

### ATS Score Breakdown (analyzeResume – Lines 92–132)

| Category | Max | How scored |
|---|---|---|
| Keyword Relevance | 40 pts | Matches against TECH_KEYWORDS bank (L5-17) |
| Resume Structure | 20 pts | Has summary/experience/education/skills (L101-110) |
| Content Quality | 20 pts | Action verb density from ACTION_VERBS bank (L19-25) |
| Readability | 10 pts | Average sentence word count (L116-121) |
| Formatting | 10 pts | personal_info fields present (L124-130) |

---

## Export Controller — `server/controllers/exportController.js`

```
Line 1:  import from "docx" library (Document, Packer, Paragraph, TextRun...)
Line 7:  Resume.findById(resumeId)
Line 11: Authorization check: owner OR collaborator
Line 21: Builds Word Document with: Name, Contact, Summary, Experience, Projects, Education, Skills
Line 87: Packer.toBase64String(doc) → Buffer → sent as .docx download
```

---

## Share Controller — `server/controllers/shareController.js`

```
generateShareLink (Line 5):
  → Resume.findOneAndUpdate { public: isPublic }
  → Returns updated public status

addCollaborator (Line 27):
  → Finds resume by owner
  → Looks up user by email (Line 35)
  → Pushes { userId, role } to resume.collaborators (Line 44)
  → Roles: 'viewer' or 'editor'
```

---

## Client Routing — `client/src/App.jsx`

```
Line 46: /                          → Home page
Line 47: /app                       → Layout (protected shell)
Line 48:   /app (index)             → Dashboard
Line 49:   /app/builder/:resumeId   → ResumeBuilder
Line 52: /view/:resumeId            → Preview (public, no auth needed)
```

Auth check on mount (Lines 16–36): reads `token` from localStorage → `GET /api/users/data` → dispatches Redux `login` action.

---

## Pages — How They Work

### `Dashboard.jsx` — `client/src/pages/Dashboard.jsx`

| Feature | Lines | API Called |
|---|---|---|
| Load all resumes on mount | L127-129 | `GET /api/users/resumes` |
| Create new resume (modal) | L44-59 | `POST /api/resumes/create` |
| Upload PDF and parse with AI | L61-80 | `POST /api/ai/upload-resume` (uses `react-pdftotext` L16) |
| Delete resume | L109-125 | `DELETE /api/resumes/delete/:id` |
| Edit resume title | L82-107 | `PUT /api/resumes/update` |
| Navigate to builder | L55, L75, L168 | `navigate('/app/builder/:id')` |

---

### `ResumeBuilder.jsx` — `client/src/pages/ResumeBuilder.jsx`

Two-tab layout (Line 62): `activeTab = 'builder' or 'analysis'`

#### BUILDER TAB (Lines 212–370)

7 sections (L66–74): personal → summary → experience → education → projects → skills → certification

| Section | Component Rendered | Line |
|---|---|---|
| personal | PersonalInfoForm | L280 |
| summary | ProfessionalSummaryForm | L293 |
| experience | ExperienceForm | L305 |
| education | EducationForm | L316 |
| projects | ProjectForm | L327 |
| skills | SkillsForm | L338 |
| certification | CertificationForm | L349 |

Supporting features in Builder tab:
- TemplateSelector — L229 — changes `resumeData.template`
- ColorPicker — L235 — changes `resumeData.accent_color`
- Progress bar — L217–224 — `activeSectionIndex / (sections.length - 1)`
- `saveResume()` — L140 — `PUT /api/resumes/update` with FormData

#### ANALYSIS TAB (Lines 373–403)

Rendered when `activeTab === 'analysis'`:

| Component | Line | API it calls |
|---|---|---|
| ATSScoreDashboard | L375 | `POST /api/ats/analyze-resume` |
| ScoreHistoryGraph | L376 | reads `resumeData.score_history` — no API |
| JobDescriptionInput | L377 | `POST /api/ats/analyze-job-description` |
| ResumeMatchAnalysis | L380 | `POST /api/ats/resume-match` |
| ResumeAISuggestions | L384 | `POST /api/ats/analyze-resume` |
| OptimizeResumeButton | L385 | `POST /api/ats/optimize-resume` |
| CoverLetterDisplay | L395 | `POST /api/ai/cover-letter` |
| InterviewPrepModule | L396 | `POST /api/ai/interview-questions` |

CoverLetterDisplay and InterviewPrepModule only appear when `jobAnalysis?.jobDescription` is set (Line 393).

#### Right Panel (preview + export buttons) — Lines 406–450

| Feature | Line | How it works |
|---|---|---|
| Live preview | L409 | `ResumePreview data={resumeData}` |
| Toggle public | L425 | `PUT /api/resumes/update` with `{ public: !current }` |
| Share button | L416 | Opens ShareModal (only if `resumeData.public === true`) |
| Download DOCX | L437 | `GET /api/export/docx/:resumeId` (blob download) |
| Download PDF | L442 | `window.print()` |

---

## Component Connection Map

```
ResumeBuilder.jsx
├── [state] resumeData ─────────────────────────────────────────────────────────
│   ├── passed to → PersonalInfoForm  (updates personal_info)
│   ├── passed to → ProfessionalSummaryForm  (updates professional_summary)
│   ├── passed to → ExperienceForm    (updates experience[])
│   ├── passed to → EducationForm     (updates education[])
│   ├── passed to → ProjectForm       (updates project[])
│   ├── passed to → SkillsForm        (updates skills[])
│   ├── passed to → CertificationForm (updates certification[])
│   ├── passed to → ResumePreview     (renders live preview)
│   ├── passed to → ATSScoreDashboard (analyzes resume against ATS rules)
│   ├── passed to → ResumeMatchAnalysis (compares vs job description)
│   ├── passed to → ResumeAISuggestions (gets AI improvement tips)
│   ├── passed to → OptimizeResumeButton (rewrites resume with AI)
│   └── passed to → CoverLetterDisplay  (used to generate cover letter)
│
├── [state] jobAnalysis ────────────────────────────────────────────────────────
│   ├── set by → JobDescriptionInput.onAnalyze callback (line 378)
│   ├── .jobDescription → passed to ResumeMatchAnalysis (line 382)
│   ├── .jobDescription → passed to OptimizeResumeButton (line 387)
│   └── triggers → CoverLetterDisplay + InterviewPrepModule visibility (line 393)
│
├── [state] showShareModal → ShareModal resumeId isPublic onClose onUpdate
│
└── [onOptimized callback] → OptimizeResumeButton calls back with new resume
    └── setResumeData(prev => ({ ...prev, ...optimized }))  line 388–390
```

---

## Data Flow Diagram

```
USER
 └─► Dashboard.jsx
      ├─ createResume()  ──► POST /api/resumes/create ──► MongoDB Resume.create()
      ├─ uploadResume()  ──► POST /api/ai/upload-resume
      │                        └─ pdfToText() → Gemini → JSON → Resume.create()
      └─ navigate /app/builder/:id
              └─► ResumeBuilder.jsx
                   ├─ loadExistingResume() → GET /api/resumes/get/:id
                   │
                   ├─ [BUILDER TAB] User fills forms → resumeData state updates
                   │   ├─ ExperienceForm → "Enhance With AI"
                   │   │     └─ POST /api/ai/smart-bullet → Gemini → rewrites bullet
                   │   └─ saveResume() → PUT /api/resumes/update
                   │         ├─ Multer → ImageKit upload (if photo)
                   │         └─ Resume.findOneAndUpdate()
                   │
                   ├─ [ANALYSIS TAB]
                   │   ├─ ATSScoreDashboard → POST /api/ats/analyze-resume (algorithm)
                   │   ├─ ScoreHistoryGraph → reads resumeData.score_history
                   │   ├─ JobDescriptionInput → POST /api/ats/analyze-job-description (Gemini)
                   │   │       └─ sets jobAnalysis state in ResumeBuilder
                   │   ├─ ResumeMatchAnalysis → POST /api/ats/resume-match (algorithm)
                   │   ├─ ResumeAISuggestions → POST /api/ats/analyze-resume
                   │   ├─ OptimizeResumeButton → POST /api/ats/optimize-resume (Gemini)
                   │   │       └─ diff modal → onOptimized() → merges into resumeData
                   │   ├─ CoverLetterDisplay → POST /api/ai/cover-letter (Gemini, 3 tones)
                   │   └─ InterviewPrepModule → POST /api/ai/interview-questions (Gemini)
                   │
                   ├─ [SHARE] shareButton → ShareModal
                   │   ├─ togglePublic() → POST /api/share/:resumeId
                   │   └─ addCollaborator() → POST /api/share/:resumeId/collaborators
                   │
                   └─ [EXPORT]
                       ├─ downloadDocx() → GET /api/export/docx/:id → .docx blob
                       └─ downloadResume() → window.print() → PDF
```

---

## Feature Classification

### Existing Features (original build)

| Feature | Location |
|---|---|
| User register/login with JWT | `userController.js` L1–60 |
| bcrypt password hashing | `User.js` L13–15 |
| Create / delete / update / get resume | `resumeController.js` |
| Photo upload with ImageKit (face-crop, bg-remove) | `resumeController.js` L95–108 |
| Live resume preview | `ResumePreview.jsx` |
| Resume public/private toggle | `ResumeBuilder.jsx` L93–112 |
| Template selector | `TemplateSelector.jsx` |
| Accent color picker | `ColorPicker.jsx` |
| All 7 form sections | PersonalInfoForm, ExperienceForm, etc. |
| Dashboard with resume cards | `Dashboard.jsx` |
| Upload existing PDF resume (AI parse) | `Dashboard.jsx` L61-80, `aiController.js` L52 |
| Enhance professional summary (AI) | `ProfessionalSummaryForm`, `aiController.js` L6 |
| Enhance job description (AI) | `ExperienceForm`, `aiController.js` L29 |
| Home page with landing sections | `home/` components |
| Redux auth state | `authSlice.js`, `store.js` |

---

### New Features (added in upgrade session)

| Feature | Component(s) | Route(s) | Line References |
|---|---|---|---|
| ATS Score Dashboard (0-100, 5-category breakdown) | `ATSScoreDashboard.jsx` | `POST /api/ats/analyze-resume` | controller L84–162 |
| ATS Score History Graph (Recharts timeline) | `Dashboard/ScoreHistoryGraph.jsx` | reads `score_history` from schema | schema L59–65 |
| Job Description Analyzer (extracts skills/tools/responsibilities) | `JobDescriptionInput.jsx` | `POST /api/ats/analyze-job-description` | controller L165–196 |
| Resume Match Analysis (keyword overlap % ring) | `ResumeMatchAnalysis.jsx` | `POST /api/ats/resume-match` | controller L199–250 |
| Semantic Match (text-embedding-004 cosine similarity) | backend only | `POST /api/ats/semantic-match` | controller L292–350 |
| AI Resume Optimizer (full rewrite + before/after diff) | `OptimizeResumeButton.jsx` | `POST /api/ats/optimize-resume` | controller L253–289 |
| Smart Bullet Enhancer (per-experience rewrite) | `ExperienceForm.jsx` L34–52 | `POST /api/ai/smart-bullet` | controller L186–204 |
| Cover Letter Generator (3 tones: Formal/Friendly/Confident) | `AI/CoverLetterDisplay.jsx` | `POST /api/ai/cover-letter` | controller L128–154 |
| Interview Prep Module (technical + behavioral Q&A) | `AI/InterviewPrepModule.jsx` | `POST /api/ai/interview-questions` | controller L157–183 |
| Collaboration System (viewer/editor roles via email) | `Collaboration/ShareModal.jsx` | `POST /api/share/:id/collaborators` | shareController L27–51 |
| Share Link Generator (toggle public + copy URL) | `Collaboration/ShareModal.jsx` | `POST /api/share/:id` | shareController L5–24 |
| DOCX Export (full Word document download) | `ResumeBuilder.jsx` L122-138 | `GET /api/export/docx/:id` | exportController L4–94 |
| Analysis Tab (dual-tab builder/analysis) | `ResumeBuilder.jsx` L62, L181–204 | — | builder lines 181–403 |
| `score_history` schema field | `Resume.js` L59–65 | — | model L59 |
| `collaborators` schema field | `Resume.js` L66–71 | — | model L66 |

---

## Key Dependencies

### Server (`server/package.json`)

| Package | Version | Purpose |
|---|---|---|
| `@google/generative-ai` | ^0.24.1 | Gemini AI (all AI/ATS features) |
| `express` | ^5.1.0 | HTTP server |
| `mongoose` | ^8.19.2 | MongoDB ODM |
| `jsonwebtoken` | ^9.0.2 | JWT auth |
| `bcrypt` | ^6.0.0 | Password hashing |
| `multer` | ^2.0.2 | File upload handling |
| `@imagekit/nodejs` | ^7.1.1 | Photo upload and transformation |
| `docx` | ^9.6.1 | [NEW] DOCX file generation |
| `cors` | ^2.8.5 | CORS headers |
| `dotenv` | ^17.2.3 | Environment variables |

### Client (key packages)

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `@reduxjs/toolkit` + `react-redux` | Auth state management |
| `axios` (via `configs/api.js`) | HTTP requests |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | All icons |
| `recharts` | [NEW] Score history line chart |
| `date-fns` | [NEW] Date formatting in ScoreHistoryGraph |
| `react-pdftotext` | PDF text extraction before upload |

---

## Environment Variables (`server/.env`)

```
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<secret key for token signing>
GEMINI_API_KEY=<Google AI Studio API key>
GEMINI_MODEL=gemini-2.5-flash  (optional, falls back to gemini-2.5-flash)
IMAGKIT_PUBLIC_KEY=<ImageKit public key>
IMAGKIT_PRIVATE_KEY=<ImageKit private key>
IMAGKIT_URL_ENDPOINT=<ImageKit endpoint URL>
PORT=3000
```

---

## Frontend State Architecture

```
Redux Store (store.js)
└── auth slice (authSlice.js)
    ├── token        ← stored in localStorage, read on every API call
    ├── user         ← { name, email, _id }
    └── isLoading    ← controls auth loading state

Local React State (per component)
├── resumeData    ← ResumeBuilder.jsx (entire resume object)
├── jobAnalysis   ← ResumeBuilder.jsx (JD analysis result)
├── activeTab     ← ResumeBuilder.jsx ('builder' or 'analysis')
├── activeSectionIndex ← controls which form section is visible
└── showShareModal ← triggers ShareModal visibility
```

---

## Key Connection Points (Line-Level)

### How JobDescriptionInput triggers everything downstream

```
JobDescriptionInput.jsx line 24:
  onAnalyze && onAnalyze({ jobDescription, ...data })
        ↓
ResumeBuilder.jsx line 378:
  onAnalyze={(result) => setJobAnalysis(result)}
        ↓
  line 382: jobDescription={jobAnalysis?.jobDescription || null}
  → fed into ResumeMatchAnalysis

  line 387: jobDescription={jobAnalysis?.jobDescription || null}
  → fed into OptimizeResumeButton

  line 393: {jobAnalysis?.jobDescription && ( ...
  → unlocks CoverLetterDisplay and InterviewPrepModule
```

### How OptimizeResumeButton merges back into resume

```
OptimizeResumeButton.jsx line 59-63:
  const handleAccept = () => {
    onOptimized && onOptimized(optimizedResume)  ← calls callback
  }
        ↓
ResumeBuilder.jsx lines 388-390:
  onOptimized={(optimized) => {
    setResumeData((prev) => ({ ...prev, ...optimized }))
    toast.success("Resume optimized! Remember to save your changes.")
  }}
```

### How ShareModal talks to the backend

```
ShareModal.jsx line 19:
  await api.post(`/api/share/${resumeId}`, { isPublic: !currentIsPublic })
        ↓
shareRoutes.js line 7:
  shareRouter.post("/:resumeId", protect, generateShareLink)
        ↓
shareController.js line 10-14:
  Resume.findOneAndUpdate({ _id: resumeId, userId: req.userId }, { public: isPublic })
```

### How ExperienceForm calls Smart Bullet AI

```
ExperienceForm.jsx line 41-44:
  const { data } = await api.post(
    "/api/ai/smart-bullet",
    { bulletPoint: experience.description },
    { headers: { Authorization: token } }
  )
        ↓
aiRoutes.js line 19:
  aiRouter.post("/smart-bullet", protect, generateSmartBullet)
        ↓
aiController.js line 186-203:
  Gemini rewrites bullet → returns { rewritten: "..." }
        ↓
ExperienceForm.jsx line 46:
  updateExperience(index, "description", data.rewritten)
```

---

## Summary Statistics

| Category | Count |
|---|---|
| Total API endpoints | 18 |
| AI-powered endpoints | 11 |
| Algorithm-based endpoints | 4 |
| React pages | 6 |
| React components (total) | 28 |
| New components added | 10 |
| MongoDB models | 2 |
| New schema fields added | 2 (score_history, collaborators) |
| Gemini model functions | 9 |
| Server dependencies | 10 |

---

*Generated automatically by code analysis — April 16, 2026*
