import ai from "../configs/ai.js";

// ─── Common keyword / action verb banks ──────────────────────────────────────

const TECH_KEYWORDS = [
  "javascript","typescript","python","java","c++","c#","go","rust","kotlin","swift",
  "react","angular","vue","next.js","node.js","express","django","flask","spring","laravel",
  "html","css","tailwind","bootstrap","sass","graphql","rest","api","json","xml",
  "sql","mysql","postgresql","mongodb","redis","firebase","dynamodb","elasticsearch",
  "aws","azure","gcp","docker","kubernetes","ci/cd","jenkins","github actions","terraform",
  "git","linux","bash","shell","agile","scrum","jira","figma","photoshop",
  "machine learning","deep learning","tensorflow","pytorch","nlp","computer vision",
  "data analysis","pandas","numpy","scikit-learn","tableau","power bi","excel",
  "android","ios","flutter","react native","restful","microservices","serverless",
  "devops","cloud","security","oauth","jwt","graphql","webpack","vite","testing",
  "jest","selenium","cypress","mocha","chai","unit testing","integration testing",
];

const ACTION_VERBS = [
  "developed","designed","built","created","implemented","led","managed","improved",
  "optimized","architected","engineered","delivered","launched","collaborated","coordinated",
  "analyzed","researched","solved","increased","decreased","reduced","achieved","generated",
  "automated","integrated","deployed","maintained","migrated","refactored","debugged",
  "mentored","trained","reviewed","published","presented","established","streamlined",
];

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","is","was","are","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","that","this",
  "these","those","they","their","them","we","our","you","your","it","its","he",
  "she","his","her","as","if","not","no","so","up","out","about","into","than",
  "then","when","where","which","who","how","all","any","both","each","few","more",
  "most","other","some","such","each","must","required","preferred","experience",
  "strong","excellent","good","great","ability","skills","knowledge","understanding",
  "looking","seeking","join","team","role","position","candidate","years","year",
  "minimum","plus","equivalent","degree","bachelor","master","phd","etc","i.e",
]);

// ─── Helper functions ─────────────────────────────────────────────────────────

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\-/\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

const extractResumeText = (resumeData) => {
  const parts = [];
  if (resumeData.professional_summary) parts.push(resumeData.professional_summary);
  (resumeData.skills || resumeData.skill || []).forEach((s) => parts.push(typeof s === "string" ? s : s.name || ""));
  (resumeData.experience || []).forEach((e) => {
    if (e.description) parts.push(e.description);
    if (e.position) parts.push(e.position);
  });
  (resumeData.education || []).forEach((e) => {
    if (e.degree) parts.push(e.degree);
    if (e.field) parts.push(e.field);
  });
  (resumeData.project || []).forEach((p) => {
    if (p.description) parts.push(p.description);
    if (p.name) parts.push(p.name);
  });
  (resumeData.certification || []).forEach((c) => {
    if (c.name) parts.push(c.name);
  });
  return parts.join(" ").toLowerCase();
};

const extractKeywordsFromText = (text) => {
  const tokens = tokenize(text);
  // Also capture bigrams for compound tech terms
  const bigrams = tokens
    .map((t, i) => (tokens[i + 1] ? `${t} ${tokens[i + 1]}` : null))
    .filter(Boolean);
  const combined = [...tokens, ...bigrams];
  return [...new Set(combined.filter((t) => !STOP_WORDS.has(t) && t.length > 2))];
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/ats/analyze-resume
export const analyzeResume = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) return res.status(400).json({ message: "Missing resumeData" });

    const resumeText = extractResumeText(resumeData);
    const resumeTokens = new Set(tokenize(resumeText));

    // 1. Keyword Relevance (40 pts)
    const matchedKeywords = TECH_KEYWORDS.filter((kw) =>
      resumeText.includes(kw)
    );
    const missedKeywords = TECH_KEYWORDS.filter(
      (kw) => !resumeText.includes(kw)
    ).slice(0, 30);
    const keywordScore = Math.min(40, Math.round((matchedKeywords.length / 20) * 40));

    // 2. Resume Structure (20 pts)
    let structureScore = 0;
    const hasSummary = !!(resumeData.professional_summary && resumeData.professional_summary.trim().length > 20);
    const hasExperience = !!(resumeData.experience && resumeData.experience.length > 0);
    const hasEducation = !!(resumeData.education && resumeData.education.length > 0);
    const hasSkills = !!((resumeData.skills || resumeData.skill || []).length > 0);
    if (hasSummary) structureScore += 5;
    if (hasExperience) structureScore += 7;
    if (hasEducation) structureScore += 4;
    if (hasSkills) structureScore += 4;

    // 3. Content Quality — action verb density (20 pts)
    const verbsFound = ACTION_VERBS.filter((v) => resumeText.includes(v));
    const contentScore = Math.min(20, Math.round((verbsFound.length / 8) * 20));

    // 4. Readability (10 pts) — sentence length heuristic
    const sentences = resumeText.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const avgLen = sentences.length
      ? sentences.reduce((a, s) => a + s.trim().split(/\s+/).length, 0) / sentences.length
      : 30;
    const readabilityScore = avgLen <= 20 ? 10 : avgLen <= 30 ? 7 : 4;

    // 5. Formatting (10 pts)
    let formattingScore = 0;
    const pi = resumeData.personal_info || {};
    if (pi.full_name) formattingScore += 2;
    if (pi.email) formattingScore += 2;
    if (pi.phone) formattingScore += 2;
    if (pi.linkedin || pi.github || pi.website) formattingScore += 2;
    if (pi.image) formattingScore += 2;

    const totalScore = keywordScore + structureScore + contentScore + readabilityScore + formattingScore;

    const suggestions = [];
    if (!hasSummary) suggestions.push("Add a professional summary to improve recruiter first impression.");
    if (!hasExperience) suggestions.push("Add work experience entries with detailed bullet points.");
    if (!hasEducation) suggestions.push("Include your educational background.");
    if (!hasSkills) suggestions.push("Add a dedicated skills section with relevant technologies.");
    if (verbsFound.length < 4) suggestions.push("Use strong action verbs (e.g. 'Developed', 'Led', 'Optimized') in experience descriptions.");
    if (keywordScore < 20) suggestions.push("Add more industry-relevant keywords and technologies to your resume.");
    if (!pi.linkedin) suggestions.push("Add your LinkedIn profile URL for better visibility.");
    if (avgLen > 25) suggestions.push("Keep bullet points concise — aim for under 20 words per sentence.");
    if (resumeData.experience && resumeData.experience.some((e) => !e.description || e.description.length < 50))
      suggestions.push("Expand experience descriptions with measurable achievements (e.g. 'Reduced load time by 40%').");

    return res.status(200).json({
      score: totalScore,
      breakdown: {
        keywordRelevance: keywordScore,
        resumeStructure: structureScore,
        contentQuality: contentScore,
        readability: readabilityScore,
        formatting: formattingScore,
      },
      matchedKeywords: matchedKeywords.slice(0, 20),
      missedKeywords: missedKeywords.slice(0, 15),
      suggestions,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/ats/analyze-job-description
export const analyzeJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Missing jobDescription" });

    const text = jobDescription.toLowerCase();
    const tokens = extractKeywordsFromText(text);

    // Skills: tokens that match known tech keywords
    const skills = TECH_KEYWORDS.filter((kw) => text.includes(kw));

    // Tools: multi-word or version-specific tool names
    const toolPatterns = [
      "react","angular","vue","next.js","node.js","docker","kubernetes","aws","azure","gcp",
      "mongodb","postgresql","mysql","redis","elasticsearch","tensorflow","pytorch",
      "git","jenkins","github","gitlab","jira","figma","slack","postman","webpack","vite",
    ];
    const tools = toolPatterns.filter((t) => text.includes(t));

    // Responsibilities: sentences containing action verbs
    const sentences = jobDescription.split(/[.;\n]+/).map((s) => s.trim()).filter(Boolean);
    const responsibilities = sentences
      .filter((s) =>
        ACTION_VERBS.some((v) => s.toLowerCase().includes(v))
      )
      .slice(0, 8);

    // Keywords: meaningful tokens not in stop words
    const keywords = [...new Set(tokens.filter((t) => !STOP_WORDS.has(t.split(" ")[0]) && t.length > 3))].slice(0, 30);

    return res.status(200).json({ skills, keywords, tools, responsibilities });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/ats/resume-match
export const resumeMatch = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription)
      return res.status(400).json({ message: "Missing resumeData or jobDescription" });

    const resumeText = extractResumeText(resumeData);
    const jdText = jobDescription.toLowerCase();

    // Extract job keywords
    const jobKeywords = [
      ...TECH_KEYWORDS.filter((kw) => jdText.includes(kw)),
      ...extractKeywordsFromText(jdText)
        .filter((t) => !STOP_WORDS.has(t.split(" ")[0]) && t.length > 3)
        .slice(0, 20),
    ];
    const uniqueJobKeywords = [...new Set(jobKeywords)];

    const matchedSkills = [];
    const missingSkills = [];
    const partialMatches = [];

    uniqueJobKeywords.forEach((kw) => {
      if (resumeText.includes(kw)) {
        matchedSkills.push(kw);
      } else {
        // Partial: check if any word in a bigram matches
        const words = kw.split(" ");
        if (words.length > 1 && words.some((w) => resumeText.includes(w) && w.length > 3)) {
          partialMatches.push(kw);
        } else {
          missingSkills.push(kw);
        }
      }
    });

    const totalKeywords = uniqueJobKeywords.length || 1;
    const matchPercentage = Math.round(
      ((matchedSkills.length + partialMatches.length * 0.5) / totalKeywords) * 100
    );

    return res.status(200).json({
      matchPercentage: Math.min(100, matchPercentage),
      matchedSkills,
      missingSkills,
      partialMatches,
      totalJobKeywords: totalKeywords,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/ats/optimize-resume
export const optimizeResume = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription)
      return res.status(400).json({ message: "Missing resumeData or jobDescription" });

    const systemPrompt = `You are an expert resume writer and ATS optimization specialist. 
Your task is to optimize a resume JSON object to better match a given job description.
Rules:
1. Rewrite weak bullet points in experience descriptions using strong action verbs and quantifiable results.
2. Strengthen the professional summary to highlight relevant skills for the role.
3. Add relevant keywords from the job description naturally into the content.
4. Do NOT invent fake experience, companies, or degrees.
5. Keep the same JSON structure — only modify string field VALUES.
6. Return ONLY valid JSON with no additional text, markdown, or code fences.`;

    const userPrompt = `Job Description:
${jobDescription}

Resume JSON:
${JSON.stringify(resumeData, null, 2)}

Return the optimized resume as valid JSON with the same structure.`;

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" }
    });
    const response = await model.generateContent(userPrompt);

    const optimizedResume = JSON.parse(response.response.text());
    return res.status(200).json({ optimizedResume });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
