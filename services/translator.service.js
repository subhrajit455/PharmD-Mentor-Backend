const https = require('https');

// Supported 9 Primary Indian Languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
];

// In-memory translation cache to optimize speed and API quotas
const translationCache = new Map();

// Medical & Pharm.D high-yield term dictionary for instant accuracy
const PHARMD_DICTIONARY = {
  'Pharmacology & Toxicology': {
    hi: 'फ़ार्माकोलॉजी और विष विज्ञान',
    bn: 'ফার্মাকোলজি ও টক্সিকোলজি',
    te: 'ఫార్మకాలజీ & టాక్సికాలజీ',
    ta: 'மருந்தியல் மற்றும் நச்சுயியல்',
    mr: 'औषधनिर्माणशास्त्र आणि विषशास्त्र',
    gu: 'ફાર્માકોલોજી અને ટોક્સિકોલોજી',
    kn: 'ಫಾರ್ಮಾಕಾಲಜಿ & ಟಾಕ್ಸಿಕಾಲಜಿ',
    ml: 'ഫാർമക്കോളജിയും ടോക്സിക്കോളജിയും'
  },
  'Pharmacotherapeutics & Clinical Pharmacy': {
    hi: 'फार्माकोथेरेप्यूटिक्स और क्लिनिकल फार्मेसी',
    bn: 'ফার্মাকোথেরাপিউটিক্স এবং ক্লিনিকাল ফার্মেসি',
    te: 'ఫార్మాకోథెరపీటిక్స్ & క్లినికల్ ఫార్మసీ',
    ta: 'மருந்து சிகிச்சை மற்றும் மருத்துவமனை மருந்தகம்',
    mr: 'औषधोपचारशास्त्र आणि क्लिनिकल फार्मसी',
    gu: 'ફાર્માકોથેરાપ્યુટિક્સ અને ક્લિનિકલ ફાર્મસી',
    kn: 'ಫಾರ್ಮಾಕೋಥೆರಪಿಟಿಕ್ಸ್ & ಕ್ಲಿನಿಕಲ್ ಫಾರ್ಮಸಿ',
    ml: 'ഫാർമക്കോതെറാപ്പിറ്റിക്സും ക്ലിനിക്കൽ ഫാർമസിയും'
  },
  'Pharmaceutical & Clinical Biochemistry': {
    hi: 'फार्मास्युटिकल और क्लिनिकल बायोकैमिस्ट्री',
    bn: 'ফার্মাসিউটিক্যাল ও ক্লিনিক্যাল বায়োকেমিস্ট্রি',
    te: 'ఫార్మాస్యూటికల్ & క్లినికల్ బయోకెమిస్ట్రీ',
    ta: 'மருந்து மற்றும் மருத்துவ உயிர்வேதியியல்',
    mr: 'औषधीय आणि क्लिनिकल बायोकेमिस्ट्री',
    gu: 'ફાર્માસ્યુટિકલ અને ક્લિનિકલ બાયોકેમિસ્ટ્રી',
    kn: 'ಫಾರ್ಮಾಸ್ಯುಟಿಕಲ್ & ಕ್ಲಿನಿಕಲ್ ಬಯೋಕೆಮಿಸ್ಟ್ರಿ',
    ml: 'ഫാർമസ്യൂട്ടിക്കൽ & ക്ലിനിക്കൽ ബയോകെമിസ്ട്രി'
  },
  'Clinical Pharmacokinetics & TDM': {
    hi: 'क्लिनिकल फार्माकोकाइनेटिक्स और टीडीएम',
    bn: 'ক্লিনিক্যাল ফার্মাকোকিনেটিক্স এবং টিডিএম',
    te: 'క్లినికల్ ఫార్మాకోకైనటిక్స్ & TDM',
    ta: 'மருத்துவ மருந்தியல் இயக்கம் மற்றும் TDM',
    mr: 'क्लिनिकल फार्माकोकिनेटिक्स आणि टीडीएम',
    gu: 'ક્લિનિકલ ફાર્માકોકીનેટિક્સ અને ટીડીએમ',
    kn: 'ಕ್ಲಿನಿಕಲ್ ಫಾರ್ಮಾಕೋಕೈನೆಟಿಕ್ಸ್ & ಟಿಡಿಎಂ',
    ml: 'ക്ലിനിക്കൽ ഫാർമക്കോകിനറ്റിക്സും ടിഡിഎമ്മും'
  },
  'Hospital Pharmacy & Clinical Postings': {
    hi: 'अस्पताल फार्मेसी और नैदानिक पोस्टिंग',
    bn: 'হাসপাতাল ফার্মেসি এবং ক্লিনিকাল পোস্টিং',
    te: 'హాస్పిటల్ ఫార్మసీ & క్లినికల్ పోస్టింగ్‌లు',
    ta: 'மருத்துவமனை மருந்தகம் மற்றும் மருத்துவ பயிற்சிகள்',
    mr: 'हॉस्पिटल फार्मसी आणि क्लिनिकल पोस्टिंग',
    gu: 'હોસ્પિટલ ફાર્મસી અને ક્લિનિકલ પોસ્ટિંગ્સ',
    kn: 'ಆಸ್ಪತ್ರೆ ಫಾರ್ಮಸಿ & ಕ್ಲಿನಿಕಲ್ ಪೋಸ್ಟಿಂಗ್‌ಗಳು',
    ml: 'ഹോസ്പിറ്റൽ ഫാർമസിയും ക്ലിനിക്കൽ പോസ്റ്റിംഗും'
  },
  'Pharmaceutical Jurisprudence & Ethics': {
    hi: 'फार्मास्युटिकल न्यायशास्त्र और नैतिकता',
    bn: 'ফার্মাসিউটিক্যাল জুরিসপ্রুডেন্স এবং এথিক্স',
    te: 'ఫార్మాస్యూటికల్ జ్యూరిస్ప్రూడెన్స్ & ఎథిక్స్',
    ta: 'மருந்து நீதித்துறை மற்றும் நெறிமுறைகள்',
    mr: 'फार्मास्युटिकल न्यायशास्त्र आणि नीतिशास्त्र',
    gu: 'ફાર્માસ્યુટિકલ ન્યાયશાસ્ત્ર અને નીતિશાસ્ત્ર',
    kn: 'ಔಷಧೀಯ ನ್ಯಾಯಶಾಸ್ತ್ರ ಮತ್ತು ನೈತಿಕತೆ',
    ml: 'ഫാർമസ്യൂട്ടിക്കൽ ജുരിസ്‌പ്രൂഡൻസും നൈതികതയും'
  }
};

/**
 * Primary engine: Fast Google translation for Chrome dict client
 */
function translateViaGoogleDict(text, targetLang) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const req = https.get(url, { timeout: 3500 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (Array.isArray(json) && Array.isArray(json[0])) {
            const translated = json[0].map((item) => item[0]).join('');
            if (translated && !translated.includes('<html')) {
              return resolve(translated);
            }
          }
          reject(new Error('Invalid Google response'));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Google timeout'));
    });

    req.on('error', (err) => reject(err));
  });
}

/**
 * Secondary engine: MyMemory API fallback
 */
function translateViaMyMemory(text, targetLang) {
  return new Promise((resolve, reject) => {
    const queryText = text.length > 400 ? text.substring(0, 400) : text;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=en|${targetLang}`;

    const req = https.get(url, { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translated = json?.responseData?.translatedText;
          if (translated && !translated.startsWith('MYMEMORY WARNING') && !translated.includes('<html')) {
            return resolve(translated);
          }
          reject(new Error('Invalid MyMemory response'));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('MyMemory timeout'));
    });

    req.on('error', (err) => reject(err));
  });
}

/**
 * Translates a single text string from English to a target language code
 */
async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text || '';
  if (targetLang === 'en') return text;

  const trimmed = text.trim();
  if (!trimmed) return '';

  // 1. Check curated Pharm.D dictionary
  if (PHARMD_DICTIONARY[trimmed] && PHARMD_DICTIONARY[trimmed][targetLang]) {
    return PHARMD_DICTIONARY[trimmed][targetLang];
  }

  // 2. Check in-memory cache
  const cacheKey = `${trimmed}___${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 3. Try primary Google engine
  try {
    const googleTrans = await translateViaGoogleDict(trimmed, targetLang);
    if (googleTrans && googleTrans !== trimmed) {
      translationCache.set(cacheKey, googleTrans);
      return googleTrans;
    }
  } catch (err) {
    // Continue to fallback
  }

  // 4. Try secondary MyMemory engine
  try {
    const memoryTrans = await translateViaMyMemory(trimmed, targetLang);
    if (memoryTrans) {
      translationCache.set(cacheKey, memoryTrans);
      return memoryTrans;
    }
  } catch (err) {
    // Return original as safety fallback
  }

  return trimmed;
}

/**
 * Translates a text string into all 9 Indian languages concurrently
 */
async function translateToAll9Languages(text) {
  if (!text) return {};
  const results = { en: text };

  const targetLangs = ['hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml'];
  await Promise.all(
    targetLangs.map(async (lang) => {
      try {
        const trans = await translateText(text, lang);
        results[lang] = trans || text;
      } catch (err) {
        results[lang] = text;
      }
    })
  );

  return results;
}

/**
 * Translates an array of strings (e.g. clinical pearls or key takeaways) into all 9 languages
 */
async function translateArrayToAll9Languages(items = []) {
  const result = {
    en: items,
    hi: [],
    bn: [],
    te: [],
    ta: [],
    mr: [],
    gu: [],
    kn: [],
    ml: []
  };

  if (!items || items.length === 0) return result;

  const allTrans = await Promise.all(items.map((item) => translateToAll9Languages(item)));
  allTrans.forEach((t) => {
    Object.keys(result).forEach((lang) => {
      if (lang !== 'en') {
        result[lang].push(t[lang] || '');
      }
    });
  });

  return result;
}

/**
 * Translates an entire Subject into all 9 Indian languages
 */
async function translateSubject(subjectData) {
  const { name, description } = subjectData;
  const nameTranslations = await translateToAll9Languages(name || '');
  const descTranslations = description ? await translateToAll9Languages(description) : {};

  const translations = {};
  SUPPORTED_LANGUAGES.forEach(({ code }) => {
    translations[code] = {
      name: nameTranslations[code] || name,
      description: descTranslations[code] || description || ''
    };
  });

  return translations;
}

/**
 * Translates an entire Topic into all 9 Indian languages
 */
async function translateTopic(topicData) {
  const { title, clinicalPearls = [], keyTakeaways = [], contentMarkdown = '' } = topicData;

  const titleTrans = await translateToAll9Languages(title || '');
  const pearlsTrans = await translateArrayToAll9Languages(clinicalPearls);
  const takeawaysTrans = await translateArrayToAll9Languages(keyTakeaways);

  // For markdown content, translate the summary or top section
  const firstParagraph = contentMarkdown.split('\n\n')[0] || contentMarkdown;
  const contentTrans = await translateToAll9Languages(firstParagraph);

  const translations = {};
  SUPPORTED_LANGUAGES.forEach(({ code }) => {
    translations[code] = {
      title: titleTrans[code] || title,
      clinicalPearls: pearlsTrans[code] || clinicalPearls,
      keyTakeaways: takeawaysTrans[code] || keyTakeaways,
      contentMarkdown: contentTrans[code] && code !== 'en'
        ? `${contentTrans[code]}\n\n---\n*Original Clinical Formulation:*\n${contentMarkdown}`
        : contentMarkdown
    };
  });

  return translations;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  translateText,
  translateToAll9Languages,
  translateSubject,
  translateTopic
};
