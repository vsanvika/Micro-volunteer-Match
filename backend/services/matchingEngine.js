/**
 * Micro-Volunteer Match — Enhanced Hybrid Matching Engine v2.0
 *
 * Score Weights:
 *  - Skill Match:         35%
 *  - Interest Match:      20%
 *  - Time/Availability:   20%
 *  - Duration Efficiency: 10%
 *  - Location Mode:       10%
 *  - Learning Goal Bonus:  5%
 */

// ---------- Core Score Calculator (backward compatible) ----------

const calculateMatchScore = (user, task) => {
  if (!user || !task) return { score: 50, level: 'Moderate Match', reasons: ['General opportunity'] };

  let skillScore = 0;
  let interestScore = 0;
  let timeScore = 0;
  let durationScore = 0;
  let modeScore = 0;
  let learningBonus = 0;
  const reasons = [];

  const userSkills = (user.skills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
  const requiredSkills = (task.requiredSkills || []).map(s => s.toLowerCase());

  // 1. Skill Match (35%)
  if (requiredSkills.length === 0) {
    skillScore = 100;
    reasons.push('No specialized skills required');
  } else {
    let matchedSkillCount = 0;
    const matchedSkillNames = [];
    requiredSkills.forEach(reqSkill => {
      const match = userSkills.some(uSkill => uSkill.includes(reqSkill) || reqSkill.includes(uSkill));
      if (match) { matchedSkillCount++; matchedSkillNames.push(reqSkill); }
    });
    skillScore = (matchedSkillCount / requiredSkills.length) * 100;
    if (matchedSkillNames.length > 0) {
      reasons.push(`Your ${matchedSkillNames.slice(0, 2).join(', ')} skill matches the task`);
    }
  }

  // 2. Interest Match (20%)
  const userInterests = (user.interests || []).map(i => i.toLowerCase());
  const categoryName = (task.category || '').toLowerCase();
  const descriptionText = (task.description || '').toLowerCase();
  const isInterestMatch = userInterests.some(interest =>
    categoryName.includes(interest) || interest.includes(categoryName) || descriptionText.includes(interest)
  );
  if (isInterestMatch) {
    interestScore = 100;
    reasons.push(`You are interested in ${task.category}`);
  } else {
    interestScore = 40;
  }

  // 3. Time / Availability Match (20%)
  const availableMins = user.availableMinutes || 30;
  const taskMins = task.estimatedDuration || 15;
  if (availableMins >= taskMins) {
    timeScore = 100;
    reasons.push(`You have enough time available (task: ${taskMins} mins)`);
  } else if (taskMins - availableMins <= 10) {
    timeScore = 60;
  } else {
    timeScore = 20;
  }

  // 4. Duration Efficiency (10%)
  if (taskMins <= 15) { durationScore = 100; reasons.push('Quick micro-task (≤15 mins)'); }
  else if (taskMins <= 30) { durationScore = 80; }
  else { durationScore = 60; }

  // 5. Location Mode (10%)
  const userMode = user.preferredMode || 'both';
  const taskMode = task.locationMode || 'online';
  if (userMode === 'both' || userMode === taskMode) {
    modeScore = 100;
    reasons.push(`Matches your ${taskMode} preference`);
  } else {
    modeScore = 30;
  }

  // 6. Learning Goal Bonus (5%)
  const learningGoals = (user.learningGoals || []).map(g => g.skill?.toLowerCase());
  const taskSkillsLower = (task.requiredSkills || []).map(s => s.toLowerCase());
  const taskLearningFor = (task.skillLearningFor || []).map(s => s.toLowerCase());
  const matchesLearningGoal = learningGoals.some(goal =>
    taskSkillsLower.some(s => s.includes(goal) || goal.includes(s)) ||
    taskLearningFor.some(s => s.includes(goal) || goal.includes(s))
  );
  if (matchesLearningGoal) {
    learningBonus = 100;
    reasons.push('Helps you learn a skill you want to develop');
  }

  // Weighted total
  const totalScore = Math.round(
    skillScore * 0.35 +
    interestScore * 0.20 +
    timeScore * 0.20 +
    durationScore * 0.10 +
    modeScore * 0.10 +
    learningBonus * 0.05
  );

  let level = 'Low Match';
  if (totalScore >= 80) level = 'Excellent Match';
  else if (totalScore >= 60) level = 'Good Match';
  else if (totalScore >= 40) level = 'Moderate Match';

  return {
    score: Math.max(15, Math.min(99, totalScore)),
    level,
    reasons: reasons.slice(0, 5),
  };
};

// ---------- Detailed / Explainable Match ----------

const generateMatchExplanation = (user, task) => {
  if (!user || !task) return { score: 50, level: 'Moderate Match', reasons: [], summary: 'General opportunity' };

  const structuredReasons = [];
  let skillScore = 0, interestScore = 0, timeScore = 0, durationScore = 0, modeScore = 0, learningBonus = 0;

  const userSkills = (user.skills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
  const requiredSkills = (task.requiredSkills || []).map(s => s.toLowerCase());

  // Skill
  if (requiredSkills.length === 0) {
    skillScore = 100;
    structuredReasons.push({ icon: '✓', text: 'No specialized skills required', factor: 'skill' });
  } else {
    const matchedSkillNames = [];
    requiredSkills.forEach(reqSkill => {
      const match = userSkills.some(uSkill => uSkill.includes(reqSkill) || reqSkill.includes(uSkill));
      if (match) matchedSkillNames.push(reqSkill);
    });
    skillScore = (matchedSkillNames.length / requiredSkills.length) * 100;
    if (matchedSkillNames.length > 0) {
      structuredReasons.push({
        icon: '✓',
        text: `Your ${matchedSkillNames.slice(0, 2).join(' & ')} skill matches this task`,
        factor: 'skill',
      });
    } else {
      structuredReasons.push({ icon: '✗', text: 'Some required skills not in your profile yet', factor: 'skill' });
    }
  }

  // Interest
  const userInterests = (user.interests || []).map(i => i.toLowerCase());
  const categoryName = (task.category || '').toLowerCase();
  const isInterestMatch = userInterests.some(i => categoryName.includes(i) || i.includes(categoryName));
  if (isInterestMatch) {
    interestScore = 100;
    structuredReasons.push({ icon: '✓', text: `You are interested in ${task.category}`, factor: 'interest' });
  } else {
    interestScore = 40;
  }

  // Time
  const availableMins = user.availableMinutes || 30;
  const taskMins = task.estimatedDuration || 15;
  if (availableMins >= taskMins) {
    timeScore = 100;
    structuredReasons.push({
      icon: '✓',
      text: `You have ${availableMins} mins available — task only needs ${taskMins} mins`,
      factor: 'time',
    });
  } else {
    timeScore = taskMins - availableMins <= 10 ? 60 : 20;
    structuredReasons.push({ icon: '⚠', text: `Task (${taskMins} min) slightly exceeds your ${availableMins} min setting`, factor: 'time' });
  }

  // Duration
  if (taskMins <= 15) { durationScore = 100; structuredReasons.push({ icon: '✓', text: 'Quick micro-task — perfect for spare moments', factor: 'duration' }); }
  else if (taskMins <= 30) { durationScore = 80; }
  else { durationScore = 60; }

  // Mode
  const userMode = user.preferredMode || 'both';
  const taskMode = task.locationMode || 'online';
  if (userMode === 'both' || userMode === taskMode) {
    modeScore = 100;
    structuredReasons.push({ icon: '✓', text: `${taskMode === 'online' ? 'Online task' : 'In-person'} — matches your preference`, factor: 'mode' });
  } else {
    modeScore = 30;
    structuredReasons.push({ icon: '⚠', text: `Task is ${taskMode} — you prefer ${userMode}`, factor: 'mode' });
  }

  // Learning bonus
  const learningGoals = (user.learningGoals || []).map(g => g.skill?.toLowerCase());
  const taskSkillsLower = requiredSkills;
  const matchesGoal = learningGoals.some(goal =>
    taskSkillsLower.some(s => s.includes(goal) || goal.includes(s))
  );
  if (matchesGoal) {
    learningBonus = 100;
    structuredReasons.push({ icon: '🎯', text: 'This task helps you practice a skill you want to learn', factor: 'learning' });
  }

  const totalScore = Math.round(
    skillScore * 0.35 + interestScore * 0.20 + timeScore * 0.20 +
    durationScore * 0.10 + modeScore * 0.10 + learningBonus * 0.05
  );
  const finalScore = Math.max(15, Math.min(99, totalScore));

  let level = 'Low Match';
  if (finalScore >= 80) level = 'Excellent Match';
  else if (finalScore >= 60) level = 'Good Match';
  else if (finalScore >= 40) level = 'Moderate Match';

  const summary =
    finalScore >= 80 ? `Great fit! Your skills and interests align strongly with this ${task.category} task.` :
    finalScore >= 60 ? `Good match. You have the core skills for this ${task.category} task.` :
    `Some alignment with this task — a good stretch opportunity.`;

  return { score: finalScore, level, reasons: structuredReasons, summary };
};

// ---------- Recommendation Sections ----------

const getRecommendationSections = (user, tasks) => {
  if (!tasks || tasks.length === 0) return { quickTasks: [], recommendedForYou: [], becauseYouLike: [], improveYourSkills: [], beginnerFriendly: [] };

  const scored = tasks.map(task => {
    const taskObj = typeof task.toObject === 'function' ? task.toObject() : { ...task };
    const match = calculateMatchScore(user, taskObj);
    return { ...taskObj, matchScore: match.score, matchLevel: match.level, matchReasons: match.reasons };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const quickTasks = scored.filter(t => t.estimatedDuration <= (user?.availableMinutes || 15)).slice(0, 4);
  const recommendedForYou = scored.slice(0, 6);

  const userInterests = (user?.interests || []).map(i => i.toLowerCase());
  const becauseYouLike = userInterests.length > 0
    ? scored.filter(t => userInterests.some(i => (t.category || '').toLowerCase().includes(i) || i.includes((t.category || '').toLowerCase()))).slice(0, 4)
    : scored.slice(0, 4);

  const learningGoalSkills = (user?.learningGoals || []).map(g => g.skill?.toLowerCase());
  const improveYourSkills = learningGoalSkills.length > 0
    ? scored.filter(t => (t.requiredSkills || []).some(s => learningGoalSkills.some(g => s.toLowerCase().includes(g) || g.includes(s.toLowerCase())))).slice(0, 4)
    : [];

  const beginnerFriendly = scored.filter(t => t.isBeginnerFriendly || t.difficulty === 'Beginner').slice(0, 4);

  return { quickTasks, recommendedForYou, becauseYouLike, improveYourSkills, beginnerFriendly };
};

module.exports = { calculateMatchScore, generateMatchExplanation, getRecommendationSections };
