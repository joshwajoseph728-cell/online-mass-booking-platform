// Internationalization (i18n) Service with English, Tamil (தமிழ்), and Malayalam (മലയാളം)

const STORAGE_KEY = 'oldd_selected_language';

export const LANGUAGES = {
  EN: { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  TA: { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  ML: { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' }
};

export const DICTIONARY = {
  // Navigation
  'nav.home': { en: 'Home', ta: 'முகப்பு', ml: 'ഹോം' },
  'nav.about': { en: 'About Church', ta: 'ஆலயம் பற்றி', ml: 'ദേവാലയത്തെക്കുറിച്ച്' },
  'nav.massSchedule': { en: 'Mass Schedule', ta: 'திருப்பலி நேரங்கள்', ml: 'കുർബാന സമയങ്ങൾ' },
  'nav.massBooking': { en: 'Mass Booking', ta: 'திருப்பலி பதிவு', ml: 'കുർബാന ബുക്കിംഗ്' },
  'nav.gallery': { en: 'Gallery', ta: 'புகைப்படங்கள்', ml: 'ഫോട്ടോ ഗാലറി' },
  'nav.offerings': { en: 'Online Offerings', ta: 'காணிக்கை', ml: 'ഓൺലൈൻ വഴിപാടുകൾ' },
  'nav.contact': { en: 'Contact Office', ta: 'தொடர்புக்கு', ml: 'ഓഫീസ് ബന്ധപ്പെടുക' },
  'nav.bookMass': { en: 'Book Mass', ta: 'திருப்பலி பதிவு', ml: 'കുർബാന ബുക്ക് ചെയ്യുക' },
  'nav.signIn': { en: 'Sign In', ta: 'உள்நுழைவு', ml: 'ലോഗിൻ' },
  'nav.memberPortal': { en: 'Member Portal', ta: 'பங்குத்தள உறுப்பினர்', ml: 'ഇടവകാംഗ പോർട്ടൽ' },
  'nav.priestPortal': { en: 'Priest Portal', ta: 'குருத்துவ தளம்', ml: 'വൈദിക പോർട്ടൽ' },
  'nav.adminPortal': { en: 'Admin Portal', ta: 'நிர்வாக தளம்', ml: 'അഡ്മിൻ പോർട്ടൽ' },
  'nav.languages': { en: 'Languages', ta: 'மொழிகள்', ml: 'ഭാഷകൾ' },
  'brand.title': { en: 'OUR LADY OF DOLOURS', ta: 'வியாகுல மாதா பேராலயம்', ml: 'വ്യാകുലമാതാ ദേവാലയം' },
  'brand.subtitle': { en: 'Parish & Mass Booking Portal', ta: 'பங்கு மற்றும் திருப்பலி பதிவு தளம்', ml: 'ഇടവക & കുർബാന ബുക്കിംഗ് പോർട്ടൽ' },
  'brand.location': { en: 'Marthandanthurai', ta: 'மார்த்தாண்டன்துறை', ml: 'മാർത്താണ്ഡൻതുറ' },

  // Hero Section
  'hero.welcomeBadge': { en: 'Welcome to Our Lady of Dolours Church', ta: 'வியாகுல மாதா திருத்தலத்திற்கு வரவேற்கிறோம்', ml: 'വ്യാകുലമാതാ ദൈവാലയത്തിലേക്ക് സ്വാഗതം' },
  'hero.title': { en: 'Book Mass Intentions Online', ta: 'திருப்பலி கருத்துக்களை இணையவழியில் பதிவு செய்யுங்கள்', ml: 'വിശുദ്ധ കുർബാന നിയോഗങ്ങൾ ഓൺലൈനായി സമർപ്പിക്കാം' },
  'hero.subtitle': { en: 'Submit intentions, remember departed loved ones, and offer thanksgiving from anywhere in the world through our official parish portal.', ta: 'உலகெங்கிலும் உள்ள பக்தர்கள் தங்கள் திருப்பலி கருத்துக்களை பதிவு செய்யவும், மரித்த ஆன்மாக்களுக்காக ஜெபிக்கவும், நன்றிக் காணிக்கை செலுத்தவும் உதவும் அதிகாரப்பூர்வ தளம்.', ml: 'ലോകത്തെവിടെ നിന്നും നിങ്ങളുടെ പ്രിയപ്പെട്ടവർക്കായി വിശുദ്ധ കുർബാന നിയോഗങ്ങൾ സമർപ്പിക്കാനും പ്രാർത്ഥനകളിൽ പങ്കുചേരാനും സാധിക്കുന്നു.' },
  'hero.btnBook': { en: '✝️ Book Mass Intention', ta: '✝️ திருப்பலி பதிவு செய்க', ml: '✝️ കുർബാന ബുക്ക് ചെയ്യുക' },
  'hero.btnSchedule': { en: 'View Mass Schedule', ta: 'திருப்பலி அட்டவணை', ml: 'കുർബാന സമയവിവരം' },
  'hero.statYears': { en: '130 Years of Faith', ta: '130 ஆண்டுகால விசுவாச பாரம்பரியம்', ml: '130 വർഷത്തെ വിശ്വാസ പാരമ്പര്യം' },
  'hero.statMasses': { en: 'Daily & Weekend Liturgies in English, Tamil & Malayalam', ta: 'தமிழ், மலையாளம் மற்றும் ஆங்கிலத்தில் தினசரி திருப்பலிகள்', ml: 'തമിഴ്, മലയാളം, ഇംഗ്ലീഷ് ഭാഷകളിലുള്ള ദിവ്യബലികൾ' },
  'hero.statVerified': { en: 'Altar Prayer Lists', ta: 'பீட ஜெபப் பட்டியல்', ml: 'അൾത്താര പ്രാർത്ഥനാ പട്ടിക' },

  // Intentions & Steps
  'intention.departed': { en: 'Departed Souls', ta: 'மரித்த ஆன்மாக்கள்', ml: 'മരിച്ചവർക്കായുള്ള നിയോഗം' },
  'intention.thanksgiving': { en: 'Thanksgiving', ta: 'நன்றியறிதல் திருப்பலி', ml: 'കൃതജ്ഞതാ ബലി' },
  'intention.healing': { en: 'Healing Prayers', ta: 'சுகமளிக்கும் ஜெபம்', ml: 'രോഗശാന്തി പ്രാർത്ഥന' },
  'intention.special': { en: 'Special Petitions', ta: 'சிறப்பு கருத்துக்கள்', ml: 'പ്രത്യേക നിയോഗങ്ങൾ' },
  'booking.perHead': { en: '₹50 per head', ta: 'ஒருவருக்கு ₹50', ml: 'ഒരാൾക്ക് ₹50' },
  'booking.headCountLabel': { en: 'Number of Departed Souls / Members', ta: 'மரித்த ஆன்மாக்கள் / உறுப்பினர்களின் எண்ணிக்கை', ml: 'മരിച്ച വ്യക്തികളുടെ / അംഗങ്ങളുടെ എണ്ണം' },
  'booking.continue': { en: 'Continue to Date & Mass Slot →', ta: 'நாள் மற்றும் நேரத்தை தேர்வு செய்க →', ml: 'തീയതിയും സമയവും തിരഞ്ഞെടുക്കുക →' },
  'booking.selectLanguage': { en: 'Mass Language', ta: 'திருப்பலி மொழி', ml: 'കുർബാന ഭാഷ' },

  // Gallery
  'gallery.title': { en: 'Moments of Grace & Fellowship', ta: 'பங்கு நினைவுகள் மற்றும் திருவிழாக்கள்', ml: 'ഇടവക വിശേഷങ്ങളും ഓർമ്മകളും' },
  'gallery.desc': { en: 'Explore glimpses of our sacred liturgies, annual parish feasts, community ministries, and spiritual life at Our Lady of Dolours.', ta: 'பங்குத் திருவிழாக்கள், திருப்பலிகள் மற்றும் சமூகப் பணிகளின் புகைப்படத் தொகுப்பு.', ml: 'തിരുനാളുകൾ, ദിവ്യബലികൾ, ഇടവക മുന്നേറ്റങ്ങൾ എന്നിവയുടെ ഫോട്ടോ ഗാലറി.' },
  'gallery.all': { en: 'All Photos', ta: 'அனைத்து புகைப்படங்கள்', ml: 'എല്ലാ ഫോട്ടോകളും' },
  'gallery.feasts': { en: 'Feasts & Celebrations', ta: 'திருவிழாக்கள்', ml: 'തിരുനാളുകൾ' },
  'gallery.liturgy': { en: 'Holy Mass & Liturgy', ta: 'திருப்பலி மற்றும் வழிபாடுகள்', ml: 'ദിവ്യബലിയും ആരാധനയും' },
  'gallery.community': { en: 'Community & Youth', ta: 'இளைஞர் மற்றும் பங்கு சமூகம்', ml: 'യുവജനവേദിയും സമൂഹവും' },
  'gallery.altar': { en: 'Altar & Sanctuary', ta: 'பீடம் மற்றும் பேராலயம்', ml: 'അൾത്താരയും ദേവാലയവും' },

  // Common UI
  'ui.save': { en: 'Save', ta: 'சேமிக்க', ml: 'സംരക്ഷിക്കുക' },
  'ui.cancel': { en: 'Cancel', ta: 'ரத்து செய்', ml: 'റദ്ദാക്കുക' },
  'ui.submit': { en: 'Submit', ta: 'சமர்ப்பிக்க', ml: 'സമർപ്പിക്കുക' },
  'ui.payNow': { en: 'Proceed to Payment', ta: 'காணிக்கை செலுத்த தொடர்க', ml: 'പണം അടയ്ക്കുക' },
  'ui.receipt': { en: 'Download PDF Receipt', ta: 'ரசீது பதிவிறக்கம் (PDF)', ml: 'രസീത് ഡൗൺലോഡ് ചെയ്യുക (PDF)' },
  'footer.copyright': { en: 'Our Lady of Dolours Church, Marthandanthurai. All Rights Reserved.', ta: 'வியாகுல மாதா பேராலயம், மார்த்தாண்டன்துறை. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.', ml: 'വ്യാകുലമാതാ ദൈവാലയം, മാർത്താണ്ഡൻതുറ. സർവ്വ അവകാശങ്ങളും നിക്ഷിപ്തം.' }
};

class I18nService {
  constructor() {
    this.currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
    this.listeners = [];
  }

  getLanguage() {
    return this.currentLang;
  }

  setLanguage(langCode) {
    if (!LANGUAGES[langCode.toUpperCase()] && !Object.values(LANGUAGES).some(l => l.code === langCode)) {
      langCode = 'en';
    }
    this.currentLang = langCode;
    localStorage.setItem(STORAGE_KEY, langCode);
    this.notifyListeners();
  }

  t(key, fallback = '') {
    const entry = DICTIONARY[key];
    if (entry && entry[this.currentLang]) {
      return entry[this.currentLang];
    }
    if (entry && entry.en) {
      return entry.en;
    }
    return fallback || key;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentLang));
  }
}

export const i18n = new I18nService();
