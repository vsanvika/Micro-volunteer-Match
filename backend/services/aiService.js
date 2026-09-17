/**
 * Micro-Volunteer Match — AI Integration Service v2.0
 * Uses Google Gemini API when GEMINI_API_KEY is set; robust rule-based fallbacks otherwise.
 */

const getApiKey = () => process.env.GEMINI_API_KEY;

// Known skills for rule-based extraction
const KNOWN_SKILLS = [
  { name: 'React', category: 'Technology', keywords: ['react', 'reactjs', 'react.js'] },
  { name: 'JavaScript', category: 'Technology', keywords: ['javascript', 'js', 'es6', 'typescript', 'ts'] },
  { name: 'Python', category: 'Technology', keywords: ['python', 'django', 'flask', 'pandas', 'numpy'] },
  { name: 'Java', category: 'Technology', keywords: ['java', 'spring', 'maven', 'android'] },
  { name: 'Node.js', category: 'Technology', keywords: ['node', 'express', 'nodejs', 'backend'] },
  { name: 'MongoDB', category: 'Technology', keywords: ['mongodb', 'mongoose', 'nosql'] },
  { name: 'SQL', category: 'Technology', keywords: ['sql', 'mysql', 'postgresql', 'database'] },
  { name: 'UI/UX Design', category: 'Design', keywords: ['ui', 'ux', 'figma', 'user interface', 'user experience', 'wireframe', 'prototype'] },
  { name: 'Graphic Design', category: 'Design', keywords: ['graphic design', 'photoshop', 'illustrator', 'canva', 'poster', 'logo', 'branding'] },
  { name: 'Teaching', category: 'Education', keywords: ['teach', 'tutor', 'mentor', 'instruct', 'tutoring', 'mentoring'] },
  { name: 'Translation', category: 'Translation', keywords: ['translat', 'bilingual', 'proofread', 'language'] },
  { name: 'Public Speaking', category: 'Community', keywords: ['public speaking', 'presentation', 'communication', 'speaking'] },
  { name: 'Social Media', category: 'Social Media', keywords: ['social media', 'instagram', 'twitter', 'content creation', 'marketing'] },
  { name: 'Video Editing', category: 'Design', keywords: ['video edit', 'premiere', 'capcut', 'after effects', 'davinci'] },
  { name: 'Machine Learning', category: 'Technology', keywords: ['machine learning', 'ml', 'ai', 'deep learning', 'tensorflow', 'pytorch'] },
  { name: 'Data Analysis', category: 'Technology', keywords: ['data analysis', 'data science', 'analytics', 'excel', 'tableau'] },
  { name: 'Writing', category: 'Writing', keywords: ['writing', 'copywriting', 'blog', 'content', 'editorial'] },
  { name: 'Photography', category: 'Design', keywords: ['photography', 'photo', 'lightroom', 'camera'] },
];

const INTEREST_KEYWORDS = {
  'Technology': ['tech', 'coding', 'programming', 'software', 'developer', 'engineer'],
  'Education': ['teach', 'learn', 'tutor', 'mentor', 'student', 'academic'],
  'Design': ['design', 'creative', 'art', 'visual', 'graphic', 'ui', 'ux'],
  'Community': ['community', 'volunteer', 'social', 'help', 'nonprofit', 'ngo'],
  'Translation': ['language', 'translat', 'bilingual', 'multilingual'],
  'Writing': ['write', 'blog', 'content', 'journalism', 'editorial'],
  'Social Media': ['social', 'instagram', 'twitter', 'marketing', 'digital'],
  'Environment': ['environment', 'sustainability', 'green', 'eco', 'climate'],
};

// ---------- Helper: Gemini API call ----------
const callGemini = async (prompt) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      }
    );
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    }
    return null;
  } catch (err) {
    console.warn('[AI Service]: Gemini call failed, using fallback.', err.message);
    return null;
  }
};

// ---------- 1. AI Task Recommendations (existing) ----------
const getAiTaskRecommendations = async (userPrompt, availableTasks, userProfile) => {
  const geminiResult = await callGemini(`You are the Micro-Volunteer Match AI Assistant.
User prompt: "${userPrompt}"
User profile: ${JSON.stringify(userProfile)}
Available tasks: ${JSON.stringify(availableTasks.map(t => ({ id: t._id, title: t.title, duration: t.estimatedDuration, category: t.category, skills: t.requiredSkills })))}

Select 1-3 best matching tasks from the database ONLY. Return JSON:
{"reply": "friendly explanation...", "recommendedTaskIds": ["id1", "id2"]}`);

  if (geminiResult) return geminiResult;

  // Fallback
  const promptLower = userPrompt.toLowerCase();
  let matchedTasks = availableTasks.filter(task => {
    return task.title.toLowerCase().includes(promptLower) ||
      task.category.toLowerCase().includes(promptLower) ||
      task.requiredSkills.some(s => promptLower.includes(s.toLowerCase())) ||
      promptLower.includes(`${task.estimatedDuration}`);
  });
  if (matchedTasks.length === 0) matchedTasks = availableTasks.slice(0, 3);
  return {
    reply: `Here are top micro-volunteering tasks matched for "${userPrompt}" based on your skills and time!`,
    recommendedTaskIds: matchedTasks.slice(0, 3).map(t => t._id.toString()),
  };
};

// ---------- 2. Smart Task Creator (existing) ----------
const generateSmartTaskSuggestions = async (prompt) => {
  const geminiResult = await callGemini(`Analyze this volunteer task request and extract details into JSON:
Prompt: "${prompt}"
Return JSON: {"title": "...", "category": "Education|Technology|Design|Translation|Community|Writing|Social Media|Other", "requiredSkills": ["skill1"], "estimatedDuration": 15, "difficulty": "Beginner|Intermediate|Advanced", "description": "..."}`);

  if (geminiResult) return geminiResult;

  // Fallback
  const textLower = prompt.toLowerCase();
  let category = 'Community'; let skills = ['Communication']; let duration = 15; let difficulty = 'Beginner';
  if (textLower.includes('code') || textLower.includes('python') || textLower.includes('react') || textLower.includes('java')) {
    category = 'Technology'; skills = ['Programming'];
  } else if (textLower.includes('design') || textLower.includes('poster') || textLower.includes('ui')) {
    category = 'Design'; skills = ['UI/UX Design'];
  } else if (textLower.includes('tutor') || textLower.includes('teach') || textLower.includes('explain')) {
    category = 'Education'; skills = ['Teaching'];
  } else if (textLower.includes('translat') || textLower.includes('proofread')) {
    category = 'Translation'; skills = ['Translation'];
  }
  if (textLower.includes('5 min')) duration = 5;
  else if (textLower.includes('10 min')) duration = 10;
  else if (textLower.includes('30 min')) duration = 30;

  return { title: prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt, category, requiredSkills: skills, estimatedDuration: duration, difficulty, description: `Volunteers will assist with ${prompt}. Clear guidance provided by requester.` };
};

const generateTaskBreakdown = async ({ title, description, duration }) => {
  const geminiResult = await callGemini(`Break this micro-volunteer task into practical steps that fit within ${duration} minutes.
Task: "${title}"
Description: "${description}"
Return JSON: {"steps":[{"title":"...","minutes":5,"outcome":"..."}],"totalMinutes":${duration},"successSignal":"..."}`);

  if (geminiResult?.steps?.length) return geminiResult;

  const safeDuration = Math.max(5, Number(duration) || 15);
  const stepCount = safeDuration <= 10 ? 2 : safeDuration <= 30 ? 3 : 4;
  const baseMinutes = Math.max(5, Math.floor(safeDuration / stepCount / 5) * 5);
  const steps = [
    { title: 'Clarify the goal', minutes: baseMinutes, outcome: 'Agree on the exact result needed.' },
    { title: 'Do the focused work', minutes: baseMinutes, outcome: 'Complete the main contribution.' },
    { title: 'Review and refine', minutes: baseMinutes, outcome: 'Check quality and resolve open issues.' },
    { title: 'Share the result', minutes: Math.max(5, safeDuration - baseMinutes * 3), outcome: 'Send the finished result and next step.' },
  ].slice(0, stepCount);
  const totalMinutes = steps.reduce((sum, step) => sum + step.minutes, 0);
  return { steps, totalMinutes, successSignal: 'The requester confirms the agreed result is ready to use.' };
};

// ---------- 3. NEW: Skill Extractor ----------
const extractSkillsFromText = async (text) => {
  const geminiResult = await callGemini(`Analyze this resume/profile text and extract skills and interests. Return ONLY valid JSON:
Text: "${text.substring(0, 2000)}"
{"skills": [{"name": "React", "category": "Technology"}, ...], "interests": ["Education", "Technology", ...]}`);

  if (geminiResult && Array.isArray(geminiResult.skills)) return geminiResult;

  // Fallback: keyword matching
  const textLower = text.toLowerCase();
  const foundSkills = KNOWN_SKILLS.filter(skill =>
    skill.keywords.some(kw => textLower.includes(kw))
  ).map(s => ({ name: s.name, category: s.category }));

  const foundInterests = [];
  Object.entries(INTEREST_KEYWORDS).forEach(([interest, keywords]) => {
    if (keywords.some(kw => textLower.includes(kw))) foundInterests.push(interest);
  });

  return { skills: foundSkills, interests: [...new Set(foundInterests)] };
};

// ---------- 4. NEW: Resume Description Builder ----------
const generateResumeDescription = async (activities, title) => {
  const activitySummary = activities.map(a => a.action || a).join('; ');
  const geminiResult = await callGemini(`Generate a professional resume bullet point for a volunteer based on these activities:
Activities: "${activitySummary}"
Title context: "${title || 'Volunteer'}"
Write 1-2 impactful sentences with action verbs and quantifiable impact. Return JSON: {"description": "..."}`);

  if (geminiResult?.description) return geminiResult.description;

  // Fallback: template-based
  const taskCount = activities.length;
  const totalMins = activities.reduce((sum, a) => sum + (a.minutesLogged || 15), 0);
  const hours = Math.round(totalMins / 60 * 10) / 10;
  return `Completed ${taskCount} verified micro-volunteering tasks, contributing ${hours} hours of community service and directly impacting ${Math.round(taskCount * 1.5)} community members.`;
};

// ---------- 5. NEW: Goal Planner ----------
const generateGoalPlan = async (user, monthlyGoal) => {
  const { targetTasks, targetMinutes, month } = monthlyGoal;
  const geminiResult = await callGemini(`Create a realistic monthly volunteer plan:
User profile: skills=${(user.skills || []).map(s => s.name).join(',')}, availableMinutes=${user.availableMinutes || 15}, streak=${user.streak?.current || 0}
Goal: ${targetTasks} tasks, ${targetMinutes} minutes in ${month}
Return JSON: {"weekPlan": [{"week": 1, "targetTasks": 2, "tip": "..."}, ...], "tips": ["tip1", ...], "feasible": true}`);

  if (geminiResult?.weekPlan) return geminiResult;

  // Fallback: evenly distribute
  const perWeek = Math.ceil(targetTasks / 4);
  const weekPlan = [1, 2, 3, 4].map((week, i) => ({
    week,
    targetTasks: i === 3 ? targetTasks - perWeek * 3 > 0 ? targetTasks - perWeek * 3 : perWeek : perWeek,
    tip: ['Start with quick 10-15 min tasks', 'Try education or technology tasks', 'Maintain your streak for bonus points', 'Finish strong — review your progress!'][i],
  }));

  return {
    weekPlan,
    tips: [
      `Focus on ${(user.skills?.[0]?.name) || 'your top skills'} tasks for the highest match scores`,
      `${user.availableMinutes || 15}-minute tasks are your best bet — match your availability`,
      'Complete tasks early in the week to build momentum',
    ],
    feasible: targetTasks <= 20 && targetMinutes <= 600,
  };
};

// ---------- 6. NEW: Explainable Match Summary ----------
const generateExplainableMatchSummary = async (user, task, reasons) => {
  const reasonText = reasons.map(r => r.text || r).join('; ');
  const geminiResult = await callGemini(`Write a 1-2 sentence friendly explanation of why a volunteer is a good match for a task:
Volunteer: skills=${(user.skills || []).map(s => s.name).join(',')}, interests=${(user.interests || []).join(',')}
Task: "${task.title}" in ${task.category}, requires ${(task.requiredSkills || []).join(',')}
Match reasons: "${reasonText}"
Return JSON: {"summary": "..."}`);

  if (geminiResult?.summary) return geminiResult.summary;
  return reasons.length > 0
    ? `You're a great match because ${reasons[0]?.text || reasons[0]}. This ${task.category} task aligns with your profile.`
    : `This ${task.category} task is a good opportunity for you.`;
};

module.exports = {
  getAiTaskRecommendations,
  generateSmartTaskSuggestions,
  generateTaskBreakdown,
  extractSkillsFromText,
  generateResumeDescription,
  generateGoalPlan,
  generateExplainableMatchSummary,
};
