const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Category = require('../models/Category');
const Skill = require('../models/Skill');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Rating = require('../models/Rating');
const Certificate = require('../models/Certificate');
const Organization = require('../models/Organization');
const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');

dotenv.config({ path: __dirname + '/../.env' });

const getWeekBounds = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday, weekEnd: sunday };
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/micro-volunteer';
    await mongoose.connect(mongoUri);
    console.log('[Seed]: Connected to MongoDB...');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}), Task.deleteMany({}), Application.deleteMany({}),
      Category.deleteMany({}), Skill.deleteMany({}), Badge.deleteMany({}),
      UserBadge.deleteMany({}), Activity.deleteMany({}), Notification.deleteMany({}),
      Rating.deleteMany({}), Certificate.deleteMany({}), Organization.deleteMany({}),
      Challenge.deleteMany({}), ChallengeProgress.deleteMany({}),
    ]);
    console.log('[Seed]: Cleared all collections.');

    // 1. Categories
    const categoriesData = [
      { name: 'Education', description: 'Tutoring, explaining concepts, academic guidance', icon: 'GraduationCap', color: '#10b981' },
      { name: 'Technology', description: 'Coding help, debugging, tech setup, web design', icon: 'Code', color: '#0ea5e9' },
      { name: 'Design', description: 'Poster design, graphic tweaks, UI/UX feedback', icon: 'Palette', color: '#ec4899' },
      { name: 'Translation', description: 'Language translation, document proofreading', icon: 'Languages', color: '#8b5cf6' },
      { name: 'Community', description: 'Event assistance, campus organizing, book sorting', icon: 'Users', color: '#f59e0b' },
      { name: 'Writing', description: 'Content proofreading, copy editing, essay feedback', icon: 'FileText', color: '#14b8a6' },
      { name: 'Social Media', description: 'Creating campus flyers, social posts, media copy', icon: 'Share2', color: '#6366f1' },
      { name: 'Donations', description: 'Organizing food, clothes, and book drives', icon: 'HeartHandshake', color: '#ef4444' },
      { name: 'Environment', description: 'Sustainability, green campus, eco awareness', icon: 'Leaf', color: '#22c55e' },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`[Seed]: Created ${categories.length} Categories.`);

    // 2. Skills
    await Skill.insertMany([
      { name: 'React', category: 'Technology', aliases: ['ReactJS', 'React.js'] },
      { name: 'JavaScript', category: 'Technology', aliases: ['JS', 'ES6'] },
      { name: 'Python', category: 'Technology', aliases: ['Py', 'Python3'] },
      { name: 'Java', category: 'Technology', aliases: ['Java8'] },
      { name: 'Node.js', category: 'Technology', aliases: ['Node', 'Express'] },
      { name: 'UI/UX Design', category: 'Design', aliases: ['Figma', 'User Interface'] },
      { name: 'Graphic Design', category: 'Design', aliases: ['Photoshop', 'Canva'] },
      { name: 'Teaching', category: 'Education', aliases: ['Tutoring', 'Mentorship'] },
      { name: 'Translation', category: 'Translation', aliases: ['Bilingual', 'Proofreading'] },
      { name: 'Public Speaking', category: 'Community', aliases: ['Presentation'] },
      { name: 'Social Media', category: 'Social Media', aliases: ['Instagram', 'Marketing'] },
      { name: 'Video Editing', category: 'Design', aliases: ['Premiere', 'CapCut'] },
      { name: 'Data Analysis', category: 'Technology', aliases: ['Excel', 'Tableau'] },
      { name: 'Writing', category: 'Writing', aliases: ['Copywriting', 'Content'] },
    ]);

    // 3. Badges
    const badgesData = [
      { code: 'FIRST_VOLUNTEER', name: 'First Volunteer', description: 'Completed your very first micro-task', icon: '🌱', category: 'Milestone', criteriaType: 'FIRST_TASK', criteriaThreshold: 1 },
      { code: 'COMMUNITY_HELPER', name: 'Community Helper', description: 'Completed 5 micro-volunteering tasks', icon: '🤝', category: 'Milestone', criteriaType: 'TASKS_COUNT', criteriaThreshold: 5 },
      { code: 'SUPER_VOLUNTEER', name: 'Super Volunteer', description: 'Completed 10 micro-volunteering tasks', icon: '💎', category: 'Milestone', criteriaType: 'TASKS_COUNT', criteriaThreshold: 10 },
      { code: 'CHAMPION', name: 'Community Champion', description: 'Completed 25 tasks', icon: '🏆', category: 'Milestone', criteriaType: 'TASKS_COUNT', criteriaThreshold: 25 },
      { code: 'TIME_50', name: '50 Volunteer Minutes', description: 'Contributed 50+ verified minutes', icon: '⏱️', category: 'Impact', criteriaType: 'MINUTES_COUNT', criteriaThreshold: 50 },
      { code: 'TIME_CHAMPION', name: '100 Volunteer Minutes', description: 'Contributed 100+ verified minutes', icon: '🕐', category: 'Impact', criteriaType: 'MINUTES_COUNT', criteriaThreshold: 100 },
      { code: 'STREAK_MASTER', name: '7-Day Streak', description: 'Maintained a 7-day active volunteering streak', icon: '🔥', category: 'Streak', criteriaType: 'STREAK_DAYS', criteriaThreshold: 7 },
      { code: 'SKILL_MENTOR', name: 'Skill Mentor', description: 'Provided specialized technical or academic help', icon: '🎓', category: 'Skill', criteriaType: 'TASKS_COUNT', criteriaThreshold: 3 },
    ];
    const badges = await Badge.insertMany(badgesData);
    console.log(`[Seed]: Created ${badges.length} Badges.`);

    // 4. Users
    const usersData = [
      {
        name: 'Admin User', email: 'admin@microvolunteer.org', password: 'password123', role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
        bio: 'Platform Administrator maintaining campus impact & safety.',
      },
      {
        name: 'Sarah Chen', email: 'sarah.requester@campus.edu', password: 'password123', role: 'requester',
        organizationName: 'Campus Coding Club',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
        bio: 'Lead organizer at Campus Coding Club connecting tech learners.',
        location: { city: 'Hyderabad', country: 'India' },
      },
      {
        name: 'David Miller', email: 'david.ngo@community.org', password: 'password123', role: 'requester',
        organizationName: 'Metro Literacy NGO',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=David',
        bio: 'Program Director at Metro Literacy Foundation.',
        location: { city: 'Bangalore', country: 'India' },
      },
      {
        name: 'Green Campus Initiative', email: 'green@campus.edu', password: 'password123', role: 'requester',
        organizationName: 'Sustainability Society',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Green',
        bio: 'Promoting zero-waste and environmental awareness on campus.',
        location: { city: 'Pune', country: 'India' },
      },
      // Volunteers
      {
        name: 'Alex Johnson', email: 'alex.volunteer@student.edu', password: 'password123', role: 'volunteer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
        bio: 'Computer Science senior passionate about React, UI design, and tutoring.',
        skills: [{ name: 'React', proficiency: 'Expert' }, { name: 'JavaScript', proficiency: 'Expert' }, { name: 'UI/UX Design', proficiency: 'Intermediate' }, { name: 'Python', proficiency: 'Intermediate' }],
        interests: ['Technology', 'Education', 'Design'],
        availableMinutes: 15, preferredMode: 'online',
        points: 860, volunteerMinutes: 420, verifiedMinutes: 380, tasksCompleted: 18,
        totalPeopleHelped: 28, impactScore: 88, trustScore: 96, completionRate: 98,
        streak: { current: 7, lastActiveDate: new Date() },
        rating: { average: 4.9, count: 15 },
        portfolioUsername: 'alex-johnson', portfolioPublic: true,
        categoriesContributed: ['Technology', 'Education', 'Design'],
        learningGoals: [{ skill: 'Node.js', priority: 'High' }, { skill: 'Machine Learning', priority: 'Medium' }],
        location: { city: 'Hyderabad', country: 'India' },
        monthlyGoal: { targetTasks: 10, targetMinutes: 150, month: 'September 2026', weekPlan: [{ week: 1, targetTasks: 2 }, { week: 2, targetTasks: 3 }, { week: 3, targetTasks: 2 }, { week: 4, targetTasks: 3 }], currentProgress: 3 },
      },
      {
        name: 'Rahul Sharma', email: 'rahul.v@student.edu', password: 'password123', role: 'volunteer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',
        bio: 'Software engineer student who loves helping juniors debug Java & Python.',
        skills: [{ name: 'Java', proficiency: 'Expert' }, { name: 'Python', proficiency: 'Expert' }, { name: 'Teaching', proficiency: 'Intermediate' }],
        interests: ['Technology', 'Education'],
        availableMinutes: 30, preferredMode: 'online',
        points: 620, volunteerMinutes: 310, verifiedMinutes: 280, tasksCompleted: 12,
        totalPeopleHelped: 18, impactScore: 72, trustScore: 90, completionRate: 95,
        streak: { current: 4, lastActiveDate: new Date() },
        rating: { average: 4.8, count: 10 },
        portfolioUsername: 'rahul-sharma', portfolioPublic: true,
        categoriesContributed: ['Technology', 'Education'],
        learningGoals: [{ skill: 'React', priority: 'High' }, { skill: 'UI/UX Design', priority: 'Low' }],
        location: { city: 'Bangalore', country: 'India' },
      },
      {
        name: 'Priya Patel', email: 'priya.p@student.edu', password: 'password123', role: 'volunteer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
        bio: 'Graphic Design major passionate about social media posters & branding.',
        skills: [{ name: 'Graphic Design', proficiency: 'Expert' }, { name: 'UI/UX Design', proficiency: 'Intermediate' }, { name: 'Social Media', proficiency: 'Expert' }],
        interests: ['Design', 'Social Media', 'Community'],
        availableMinutes: 20, preferredMode: 'both',
        points: 540, volunteerMinutes: 280, verifiedMinutes: 240, tasksCompleted: 10,
        totalPeopleHelped: 15, impactScore: 65, trustScore: 88, completionRate: 92,
        streak: { current: 3, lastActiveDate: new Date() },
        rating: { average: 5.0, count: 8 },
        portfolioUsername: 'priya-patel', portfolioPublic: true,
        categoriesContributed: ['Design', 'Social Media', 'Community'],
        learningGoals: [{ skill: 'Video Editing', priority: 'Medium' }],
        location: { city: 'Mumbai', country: 'India' },
      },
      {
        name: 'Elena Rostova', email: 'elena.r@student.edu', password: 'password123', role: 'volunteer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena',
        bio: 'Multilingual linguistics student for quick translation & proofreading.',
        skills: [{ name: 'Translation', proficiency: 'Expert' }, { name: 'Teaching', proficiency: 'Intermediate' }, { name: 'Writing', proficiency: 'Intermediate' }],
        interests: ['Translation', 'Writing', 'Education'],
        availableMinutes: 15, preferredMode: 'online',
        points: 410, volunteerMinutes: 190, verifiedMinutes: 170, tasksCompleted: 7,
        totalPeopleHelped: 12, impactScore: 48, trustScore: 82, completionRate: 90,
        streak: { current: 2, lastActiveDate: new Date() },
        rating: { average: 4.7, count: 5 },
        portfolioUsername: 'elena-rostova', portfolioPublic: true,
        categoriesContributed: ['Translation', 'Writing', 'Education'],
        learningGoals: [{ skill: 'Social Media', priority: 'Low' }],
        location: { city: 'Delhi', country: 'India' },
      },
      {
        name: 'Marcus Vance', email: 'marcus.v@student.edu', password: 'password123', role: 'volunteer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus',
        bio: 'Community organizer helping with logistics, book sorting, and drives.',
        skills: [{ name: 'Public Speaking', proficiency: 'Intermediate' }, { name: 'Social Media', proficiency: 'Intermediate' }],
        interests: ['Community', 'Donations', 'Environment'],
        availableMinutes: 45, preferredMode: 'in-person',
        points: 320, volunteerMinutes: 160, verifiedMinutes: 140, tasksCompleted: 5,
        totalPeopleHelped: 8, impactScore: 38, trustScore: 78, completionRate: 85,
        streak: { current: 1, lastActiveDate: new Date() },
        rating: { average: 4.9, count: 4 },
        portfolioUsername: 'marcus-vance', portfolioPublic: true,
        categoriesContributed: ['Community', 'Environment'],
        location: { city: 'Chennai', country: 'India' },
      },
    ];

    const users = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      users.push(user);
    }
    console.log(`[Seed]: Created ${users.length} Users.`);

    const requesterSarah = users.find(u => u.email === 'sarah.requester@campus.edu');
    const requesterDavid = users.find(u => u.email === 'david.ngo@community.org');
    const requesterGreen = users.find(u => u.email === 'green@campus.edu');
    const volunteerAlex = users.find(u => u.email === 'alex.volunteer@student.edu');
    const volunteerRahul = users.find(u => u.email === 'rahul.v@student.edu');
    const volunteerPriya = users.find(u => u.email === 'priya.p@student.edu');

    // 5. Organizations
    const orgsData = [
      { user: requesterSarah._id, name: 'Campus Coding Club', description: 'A student-run club connecting tech learners and builders.', category: 'Technology', isVerified: true, verificationStatus: 'APPROVED', location: { city: 'Hyderabad', country: 'India' }, tasksPosted: 12, totalVolunteers: 28, totalImpactMinutes: 380 },
      { user: requesterDavid._id, name: 'Metro Literacy NGO', description: 'Promoting literacy and education in underprivileged communities.', category: 'Education', isVerified: true, verificationStatus: 'APPROVED', location: { city: 'Bangalore', country: 'India' }, tasksPosted: 8, totalVolunteers: 15, totalImpactMinutes: 240 },
      { user: requesterGreen._id, name: 'Sustainability Society', description: 'Driving environmental awareness and green campus initiatives.', category: 'Environment', isVerified: false, verificationStatus: 'PENDING', location: { city: 'Pune', country: 'India' }, tasksPosted: 5, totalVolunteers: 10, totalImpactMinutes: 150 },
    ];
    const orgs = await Organization.insertMany(orgsData);
    console.log(`[Seed]: Created ${orgs.length} Organizations.`);

    // 6. Tasks (25+ diverse tasks)
    const tasksData = [
      // Standard tasks
      { title: 'Explain Java Loop Constructs to a Beginner', description: 'Need a quick 10-minute explanation of for, while, and do-while loops for an upcoming freshman quiz.', category: 'Education', requiredSkills: ['Java', 'Teaching'], estimatedDuration: 10, difficulty: 'Beginner', locationMode: 'online', priority: 'High', requester: requesterSarah._id, status: 'OPEN', isBeginnerFriendly: true, organizationId: orgs[0]._id, locationCoordinates: { lat: 17.385, lng: 78.486 } },
      { title: 'Design Hackathon Poster Header Graphic', description: 'Create a clean banner graphic for our upcoming campus web dev hackathon announcement.', category: 'Design', requiredSkills: ['Graphic Design', 'UI/UX Design'], estimatedDuration: 15, difficulty: 'Intermediate', locationMode: 'online', priority: 'Medium', requester: requesterSarah._id, status: 'OPEN', isSkillLearning: true, skillLearningFor: ['Graphic Design', 'UI/UX Design'], organizationId: orgs[0]._id, locationCoordinates: { lat: 17.390, lng: 78.490 } },
      { title: 'Translate Event Announcement to Spanish', description: 'Translate a short community literacy flyer (~200 words) from English to Spanish.', category: 'Translation', requiredSkills: ['Translation'], estimatedDuration: 15, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterDavid._id, status: 'OPEN', isBeginnerFriendly: true, organizationId: orgs[1]._id, locationCoordinates: { lat: 12.971, lng: 77.594 } },
      { title: 'Debug React State Update Warning', description: 'Quick 15-min screen share to fix a "Cannot update component while rendering" warning.', category: 'Technology', requiredSkills: ['React', 'JavaScript'], estimatedDuration: 15, difficulty: 'Intermediate', locationMode: 'online', priority: 'High', requester: requesterSarah._id, status: 'OPEN', organizationId: orgs[0]._id, locationCoordinates: { lat: 17.395, lng: 78.480 } },
      { title: 'Proofread 2-Page Essay Introduction', description: 'Check grammar, spelling, and flow for a short intro essay on renewable energy.', category: 'Writing', requiredSkills: ['Writing', 'Teaching'], estimatedDuration: 10, difficulty: 'Beginner', locationMode: 'online', priority: 'Low', requester: requesterGreen._id, status: 'OPEN', isBeginnerFriendly: true, locationCoordinates: { lat: 18.520, lng: 73.856 } },
      { title: 'Create Instagram Story for Food Drive', description: 'Design a catchy 1080x1920 Instagram Story flyer promoting this week\'s campus food drive.', category: 'Social Media', requiredSkills: ['Social Media', 'Graphic Design'], estimatedDuration: 15, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterDavid._id, status: 'OPEN', isBeginnerFriendly: true, organizationId: orgs[1]._id, locationCoordinates: { lat: 12.975, lng: 77.600 } },
      { title: 'Sort Donated Children Books at Library Hub', description: 'Help group donated children books by age category at the campus student union lobby.', category: 'Community', requiredSkills: ['Public Speaking'], estimatedDuration: 30, difficulty: 'Beginner', locationMode: 'in-person', locationAddress: 'Student Union Room 204', priority: 'Low', requester: requesterDavid._id, status: 'OPEN', isBeginnerFriendly: true, organizationId: orgs[1]._id, locationCoordinates: { lat: 12.968, lng: 77.588 } },
      { title: 'Explain Python List Comprehensions', description: '5-minute micro tutoring session on converting for-loops into Python list comprehensions.', category: 'Education', requiredSkills: ['Python', 'Teaching'], estimatedDuration: 5, difficulty: 'Beginner', locationMode: 'online', priority: 'High', requester: requesterSarah._id, status: 'OPEN', isBeginnerFriendly: true, isSkillLearning: true, skillLearningFor: ['Python', 'Teaching'], locationCoordinates: { lat: 17.388, lng: 78.492 } },
      { title: 'Review UI Color Contrast for Accessibility', description: 'Quick 10-minute check of our club website contrast ratios for WCAG compliance.', category: 'Design', requiredSkills: ['UI/UX Design'], estimatedDuration: 10, difficulty: 'Intermediate', locationMode: 'online', priority: 'Low', requester: requesterSarah._id, status: 'OPEN', isSkillLearning: true, skillLearningFor: ['UI/UX Design'], organizationId: orgs[0]._id, locationCoordinates: { lat: 17.382, lng: 78.484 } },
      { title: 'Setup GitHub Actions CI for Node App', description: 'Write a simple `.github/workflows/test.yml` to run npm test automatically.', category: 'Technology', requiredSkills: ['Node.js', 'JavaScript'], estimatedDuration: 30, difficulty: 'Intermediate', locationMode: 'online', priority: 'Medium', requester: requesterSarah._id, status: 'OPEN', isSkillLearning: true, skillLearningFor: ['Node.js'], organizationId: orgs[0]._id, locationCoordinates: { lat: 17.378, lng: 78.488 } },
      { title: 'Organize Recycling Bin Labels', description: 'Attach eco-friendly sorting labels on hallway recycling bins in the Science Building.', category: 'Environment', requiredSkills: ['Public Speaking'], estimatedDuration: 15, difficulty: 'Beginner', locationMode: 'in-person', locationAddress: 'Science Building Floor 2', priority: 'Low', requester: requesterGreen._id, status: 'OPEN', isBeginnerFriendly: true, locationCoordinates: { lat: 18.515, lng: 73.860 } },
      { title: 'Proofread Resume Summary Section', description: 'Give feedback on bullet point impact metrics for a junior software engineering resume.', category: 'Writing', requiredSkills: ['Teaching', 'Writing'], estimatedDuration: 10, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterSarah._id, status: 'OPEN', isBeginnerFriendly: true, locationCoordinates: { lat: 17.392, lng: 78.478 } },
      { title: 'Explain Express Middleware Concept', description: '15-min call explaining how `next()` works in Express middleware pipeline.', category: 'Education', requiredSkills: ['Node.js', 'JavaScript'], estimatedDuration: 15, difficulty: 'Intermediate', locationMode: 'online', priority: 'Medium', requester: requesterSarah._id, status: 'OPEN', isSkillLearning: true, skillLearningFor: ['Node.js', 'JavaScript'], organizationId: orgs[0]._id, locationCoordinates: { lat: 17.380, lng: 78.476 } },
      { title: 'Create Canva Banner for Campus Clean-Up', description: 'Quick visual graphic for campus newsletter header promoting Saturday clean-up.', category: 'Design', requiredSkills: ['Graphic Design'], estimatedDuration: 15, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterGreen._id, status: 'OPEN', isBeginnerFriendly: true, locationCoordinates: { lat: 18.525, lng: 73.852 } },
      { title: 'Verify Python Script Regex Formatting', description: 'Fix a regular expression string parser extracting email addresses from raw text.', category: 'Technology', requiredSkills: ['Python'], estimatedDuration: 10, difficulty: 'Intermediate', locationMode: 'online', priority: 'High', requester: requesterSarah._id, status: 'OPEN', isSkillLearning: true, skillLearningFor: ['Python'], organizationId: orgs[0]._id, locationCoordinates: { lat: 17.376, lng: 78.494 } },
      // Team tasks
      {
        title: 'College Fest Campaign — Full Team',
        description: 'We need a designer, writer, and social media volunteer to create a complete college fest promotional campaign.',
        category: 'Social Media', requiredSkills: ['Graphic Design', 'Writing', 'Social Media'],
        estimatedDuration: 30, difficulty: 'Intermediate', locationMode: 'online', priority: 'High',
        requester: requesterSarah._id, status: 'OPEN',
        isTeamTask: true,
        teamRoles: [
          { role: 'Designer', skillRequired: 'Graphic Design', filled: false },
          { role: 'Writer', skillRequired: 'Writing', filled: false },
          { role: 'Social Media Lead', skillRequired: 'Social Media', filled: false },
        ],
        requiredVolunteers: 3,
        organizationId: orgs[0]._id,
        locationCoordinates: { lat: 17.400, lng: 78.470 },
      },
      {
        title: 'NGO Awareness Drive — Multi-skill Team',
        description: 'Plan a community awareness session: needs a translator, presenter, and graphic designer.',
        category: 'Community', requiredSkills: ['Translation', 'Public Speaking', 'Graphic Design'],
        estimatedDuration: 45, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium',
        requester: requesterDavid._id, status: 'OPEN',
        isTeamTask: true,
        teamRoles: [
          { role: 'Translator', skillRequired: 'Translation', filled: false },
          { role: 'Presenter', skillRequired: 'Public Speaking', filled: false },
          { role: 'Graphic Designer', skillRequired: 'Graphic Design', filled: false },
        ],
        requiredVolunteers: 3,
        organizationId: orgs[1]._id,
        locationCoordinates: { lat: 12.960, lng: 77.582 },
      },
      {
        title: 'Tech Workshop Setup — Pair Coding',
        description: 'Two React developers needed to help set up the code sandbox for our upcoming JavaScript workshop.',
        category: 'Technology', requiredSkills: ['React', 'JavaScript'],
        estimatedDuration: 30, difficulty: 'Intermediate', locationMode: 'online', priority: 'High',
        requester: requesterSarah._id, status: 'OPEN',
        isTeamTask: true,
        teamRoles: [
          { role: 'React Developer 1', skillRequired: 'React', filled: false },
          { role: 'React Developer 2', skillRequired: 'React', filled: false },
        ],
        requiredVolunteers: 2,
        organizationId: orgs[0]._id,
        locationCoordinates: { lat: 17.393, lng: 78.486 },
      },
      // More quick tasks
      { title: 'Quick Python Debug Session', description: 'Help debug a 20-line Python script that\'s throwing a KeyError on a dictionary lookup.', category: 'Technology', requiredSkills: ['Python'], estimatedDuration: 5, difficulty: 'Beginner', locationMode: 'online', priority: 'High', requester: requesterSarah._id, status: 'OPEN', isBeginnerFriendly: true, locationCoordinates: { lat: 17.384, lng: 78.482 } },
      { title: 'Translate FAQ to Hindi', description: 'Translate 10 simple FAQ items from English to Hindi for a literacy program pamphlet.', category: 'Translation', requiredSkills: ['Translation'], estimatedDuration: 15, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterDavid._id, status: 'OPEN', isBeginnerFriendly: true, isSkillLearning: true, skillLearningFor: ['Translation'], locationCoordinates: { lat: 12.965, lng: 77.596 } },
      { title: 'Review Club Website Landing Page', description: 'Give design feedback on our club\'s landing page — colour scheme, typography, and spacing.', category: 'Design', requiredSkills: ['UI/UX Design'], estimatedDuration: 10, difficulty: 'Beginner', locationMode: 'online', priority: 'Low', requester: requesterSarah._id, status: 'OPEN', isSkillLearning: true, skillLearningFor: ['UI/UX Design'], organizationId: orgs[0]._id, locationCoordinates: { lat: 17.386, lng: 78.488 } },
      { title: 'Teach Basic Git Commands', description: 'Walk a first-year student through git init, add, commit, push in a 15-minute session.', category: 'Education', requiredSkills: ['Teaching', 'JavaScript'], estimatedDuration: 15, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterSarah._id, status: 'OPEN', isBeginnerFriendly: true, organizationId: orgs[0]._id, locationCoordinates: { lat: 17.379, lng: 78.491 } },
      { title: 'Write Campus Green Initiative Post', description: 'Draft a 150-word Instagram caption promoting our zero-waste campus drive this Saturday.', category: 'Writing', requiredSkills: ['Writing', 'Social Media'], estimatedDuration: 10, difficulty: 'Beginner', locationMode: 'online', priority: 'Low', requester: requesterGreen._id, status: 'OPEN', isBeginnerFriendly: true, locationCoordinates: { lat: 18.522, lng: 73.858 } },
      { title: 'Help Set Up Club Stall for Freshers', description: 'Need 2 volunteers to help set up tables, banners, and registration sheets for the annual freshers fair.', category: 'Community', requiredSkills: ['Public Speaking'], estimatedDuration: 60, difficulty: 'Beginner', locationMode: 'in-person', locationAddress: 'Main Campus Grounds', priority: 'Medium', requester: requesterSarah._id, status: 'OPEN', isBeginnerFriendly: true, requiredVolunteers: 2, organizationId: orgs[0]._id, locationCoordinates: { lat: 17.397, lng: 78.474 } },
      { title: 'Data Entry for NGO Survey Responses', description: 'Enter 30 paper survey forms into a Google Sheets document for our community needs assessment.', category: 'Community', requiredSkills: ['Data Analysis'], estimatedDuration: 30, difficulty: 'Beginner', locationMode: 'online', priority: 'Medium', requester: requesterDavid._id, status: 'OPEN', isBeginnerFriendly: true, isSkillLearning: true, skillLearningFor: ['Data Analysis'], organizationId: orgs[1]._id, locationCoordinates: { lat: 12.978, lng: 77.592 } },
    ];

    const tasks = await Task.insertMany(tasksData);
    console.log(`[Seed]: Created ${tasks.length} Tasks.`);

    // 7. Badges for Alex
    const badge1 = badges.find(b => b.code === 'FIRST_VOLUNTEER');
    const badge2 = badges.find(b => b.code === 'COMMUNITY_HELPER');
    const badge3 = badges.find(b => b.code === 'TIME_CHAMPION');
    const badge4 = badges.find(b => b.code === 'STREAK_MASTER');
    await Promise.all([
      badge1 && UserBadge.create({ user: volunteerAlex._id, badge: badge1._id }),
      badge2 && UserBadge.create({ user: volunteerAlex._id, badge: badge2._id }),
      badge3 && UserBadge.create({ user: volunteerAlex._id, badge: badge3._id }),
      badge4 && UserBadge.create({ user: volunteerAlex._id, badge: badge4._id }),
      // Rahul badges
      badge1 && UserBadge.create({ user: volunteerRahul._id, badge: badge1._id }),
      badge2 && UserBadge.create({ user: volunteerRahul._id, badge: badge2._id }),
    ]);

    // 8. Activities
    await Activity.insertMany([
      { user: volunteerAlex._id, action: 'Completed Task: Debug React State Update Warning', details: 'Logged 15 verified volunteer mins', pointsEarned: 15, minutesLogged: 15 },
      { user: volunteerAlex._id, action: 'Completed Task: Explain Python List Comprehensions', details: 'Logged 5 verified volunteer mins', pointsEarned: 5, minutesLogged: 5 },
      { user: volunteerAlex._id, action: 'Completed Task: Review UI Color Contrast', details: 'Logged 10 verified volunteer mins', pointsEarned: 10, minutesLogged: 10 },
      { user: volunteerRahul._id, action: 'Completed Task: Explain Java Loop Constructs', details: 'Logged 10 verified volunteer mins', pointsEarned: 10, minutesLogged: 10 },
      { user: volunteerPriya._id, action: 'Completed Task: Create Instagram Story for Food Drive', details: 'Logged 15 verified volunteer mins', pointsEarned: 15, minutesLogged: 15 },
    ]);

    // 9. Certificates for Alex
    await Certificate.insertMany([
      { user: volunteerAlex._id, verificationId: 'MVM-2026-000001', type: 'MINUTES_100', volunteerName: 'Alex Johnson', achievement: 'Contributed 100 Verified Volunteer Minutes', tasksCompleted: 18, volunteerMinutes: 380, issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { user: volunteerAlex._id, verificationId: 'MVM-2026-000002', type: 'TASKS_10', volunteerName: 'Alex Johnson', achievement: 'Completed 10 Verified Volunteer Tasks', tasksCompleted: 18, volunteerMinutes: 380, issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('[Seed]: Created Certificates for Alex.');

    // 10. Weekly Challenges
    const { weekStart, weekEnd } = getWeekBounds();
    const challengesData = [
      { title: 'Speed Helper', description: 'Complete 3 tasks under 15 minutes this week', icon: '⚡', type: 'COMPLETE_TASKS', target: 3, rewardPoints: 75, weekStart, weekEnd, isActive: true },
      { title: 'Volunteer Minutes', description: 'Log 60 volunteer minutes this week', icon: '⏱️', type: 'VOLUNTEER_MINUTES', target: 60, rewardPoints: 100, weekStart, weekEnd, isActive: true },
      { title: 'Education Champion', description: 'Complete 2 tasks in the Education category', icon: '🎓', type: 'CATEGORY_TASKS', target: 2, targetCategory: 'Education', rewardPoints: 60, weekStart, weekEnd, isActive: true },
      { title: 'Tech Guru', description: 'Complete 2 Technology tasks this week', icon: '💻', type: 'CATEGORY_TASKS', target: 2, targetCategory: 'Technology', rewardPoints: 60, weekStart, weekEnd, isActive: true },
    ];
    const challenges = await Challenge.insertMany(challengesData);
    console.log(`[Seed]: Created ${challenges.length} Challenges.`);

    // Challenge progress for Alex
    await ChallengeProgress.insertMany([
      { user: volunteerAlex._id, challenge: challenges[0]._id, progress: 2, completed: false },
      { user: volunteerAlex._id, challenge: challenges[1]._id, progress: 45, completed: false },
    ]);

    console.log('\n[Seed]: ✅ Database seeding complete!\n');
    console.log('Demo Accounts:');
    console.log('  Admin:     admin@microvolunteer.org / password123');
    console.log('  Requester: sarah.requester@campus.edu / password123');
    console.log('  Volunteer: alex.volunteer@student.edu / password123');
    console.log('  Volunteer: rahul.v@student.edu / password123');
    console.log('\nPortfolio URLs:');
    console.log('  /portfolio/alex-johnson');
    console.log('  /portfolio/rahul-sharma');
    console.log('\nCertificate Verification:');
    console.log('  /verify/MVM-2026-000001');
    console.log('  /verify/MVM-2026-000002');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
