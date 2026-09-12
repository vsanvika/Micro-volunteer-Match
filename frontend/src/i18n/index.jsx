import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    'nav.dashboard': 'Dashboard', 'nav.findTasks': 'Find Tasks',
    'nav.quickMatch': '⏱️ I Have 15 Minutes', 'nav.recommended': 'Recommended',
    'nav.learn': 'Learn Skills', 'nav.applications': 'My Applications',
    'nav.saved': 'Saved Tasks', 'nav.challenges': 'Challenges',
    'nav.achievements': 'Achievements', 'nav.portfolio': 'My Portfolio',
    'nav.certificates': 'Certificates', 'nav.messages': 'Messages',
    'nav.impact': 'Community Impact', 'nav.profile': 'Profile',
    'nav.impactMap': 'Impact Map',
    'quick.title': 'I Have Free Time', 'quick.subtitle': 'Find tasks you can complete right now',
    'quick.selectTime': 'How much time do you have?', 'quick.perfectMatches': 'Perfect Matches',
    'match.whyMatch': "Why you're a great match", 'match.score': 'Match',
    'portfolio.title': 'Impact Portfolio', 'portfolio.tasksCompleted': 'Tasks Completed',
    'portfolio.verifiedMins': 'Verified Minutes', 'portfolio.peopleHelped': 'People Helped',
    'cert.title': 'Volunteer Certificates', 'cert.generate': 'Generate Certificate', 'cert.verify': 'Verify',
    'challenge.title': 'Weekly Challenges', 'challenge.progress': 'Progress', 'challenge.reward': 'Reward',
    'learn.title': 'Learn Through Volunteering', 'learn.wantToLearn': 'Skills I Want to Learn',
    'dashboard.greeting': 'Good morning', 'dashboard.streakDays': 'Day Streak',
  },
  te: {
    'nav.dashboard': 'డాష్‌బోర్డ్', 'nav.findTasks': 'పనులు వెతకండి',
    'nav.quickMatch': '⏱️ నాకు 15 నిమిషాలు ఉన్నాయి', 'nav.recommended': 'సిఫారసు చేయబడినవి',
    'nav.learn': 'నైపుణ్యాలు నేర్చుకోండి', 'nav.applications': 'నా దరఖాస్తులు',
    'nav.saved': 'సేవ్ చేసిన పనులు', 'nav.challenges': 'సవాళ్ళు',
    'nav.achievements': 'విజయాలు', 'nav.portfolio': 'నా పోర్ట్‌ఫోలియో',
    'nav.certificates': 'సర్టిఫికేట్లు', 'nav.messages': 'సందేశాలు',
    'nav.impact': 'సమాజ ప్రభావం', 'nav.profile': 'ప్రొఫైల్', 'nav.impactMap': 'ప్రభావ మ్యాప్',
    'quick.title': 'నాకు ఖాళీ సమయం ఉంది', 'quick.subtitle': 'ఇప్పుడే పూర్తి చేయగల పనులు వెతకండి',
    'quick.selectTime': 'మీకు ఎంత సమయం ఉంది?', 'quick.perfectMatches': 'సరైన జతలు',
    'match.whyMatch': 'మీరు ఎందుకు సరైన అభ్యర్థి', 'match.score': 'జత',
    'portfolio.title': 'ప్రభావ పోర్ట్‌ఫోలియో', 'portfolio.tasksCompleted': 'పూర్తి చేసిన పనులు',
    'portfolio.verifiedMins': 'ధృవీకరించిన నిమిషాలు', 'portfolio.peopleHelped': 'సహాయం చేసిన వ్యక్తులు',
    'cert.title': 'వలంటీర్ సర్టిఫికేట్లు', 'cert.generate': 'సర్టిఫికేట్ రూపొందించండి', 'cert.verify': 'ధృవీకరించండి',
    'challenge.title': 'వారపు సవాళ్ళు', 'challenge.progress': 'పురోగతి', 'challenge.reward': 'బహుమతి',
    'learn.title': 'వలంటీరింగ్ ద్వారా నేర్చుకోండి', 'learn.wantToLearn': 'నేను నేర్చుకోవాలనుకుంటున్న నైపుణ్యాలు',
    'dashboard.greeting': 'శుభోదయం', 'dashboard.streakDays': 'రోజుల స్ట్రీక్',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड', 'nav.findTasks': 'कार्य खोजें',
    'nav.quickMatch': '⏱️ मेरे पास 15 मिनट हैं', 'nav.recommended': 'अनुशंसित',
    'nav.learn': 'कौशल सीखें', 'nav.applications': 'मेरे आवेदन',
    'nav.saved': 'सहेजे गए कार्य', 'nav.challenges': 'चुनौतियाँ',
    'nav.achievements': 'उपलब्धियाँ', 'nav.portfolio': 'मेरा पोर्टफोलियो',
    'nav.certificates': 'प्रमाण पत्र', 'nav.messages': 'संदेश',
    'nav.impact': 'सामुदायिक प्रभाव', 'nav.profile': 'प्रोफ़ाइल', 'nav.impactMap': 'प्रभाव मानचित्र',
    'quick.title': 'मेरे पास खाली समय है', 'quick.subtitle': 'अभी पूरे किए जा सकने वाले कार्य खोजें',
    'quick.selectTime': 'आपके पास कितना समय है?', 'quick.perfectMatches': 'सर्वश्रेष्ठ मिलान',
    'match.whyMatch': 'आप एक बेहतरीन उम्मीदवार क्यों हैं', 'match.score': 'मिलान',
    'portfolio.title': 'प्रभाव पोर्टफोलियो', 'portfolio.tasksCompleted': 'पूर्ण कार्य',
    'portfolio.verifiedMins': 'सत्यापित मिनट', 'portfolio.peopleHelped': 'सहायता किए गए लोग',
    'cert.title': 'स्वयंसेवक प्रमाण पत्र', 'cert.generate': 'प्रमाण पत्र बनाएं', 'cert.verify': 'सत्यापित करें',
    'challenge.title': 'साप्ताहिक चुनौतियाँ', 'challenge.progress': 'प्रगति', 'challenge.reward': 'पुरस्कार',
    'learn.title': 'स्वयंसेवा के माध्यम से सीखें', 'learn.wantToLearn': 'मैं जो कौशल सीखना चाहता हूँ',
    'dashboard.greeting': 'सुप्रभात', 'dashboard.streakDays': 'दिन की स्ट्रीक',
  },
};

export const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('mvm_lang') || 'en');
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  const changeLang = (l) => { setLang(l); localStorage.setItem('mvm_lang', l); };
  return <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
