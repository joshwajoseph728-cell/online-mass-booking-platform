// Initial Realistic Seed Data for Our Lady of Dolours Parish

export const SEED_USERS = [
  {
    id: 'user_admin_01',
    uid: 'user_admin_01',
    username: 'joshwa',
    fullName: 'Joshwa',
    email: 'joshwa@ourladyofdolours.org',
    phone: '+91 98950 55667',
    role: 'admin',
    active: true,
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    designation: 'Parish Web Administrator',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z'
  }
];

export const SEED_PRIESTS = [];

export const SEED_SCHEDULES = [
  {
    id: 'sched_daily_01',
    dayType: 'weekday',
    time: '06:30 AM',
    language: 'Malayalam',
    priestId: '',
    priestName: '',
    capacity: 25,
    location: 'Main Altar',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_daily_02',
    dayType: 'weekday',
    time: '07:00 AM',
    language: 'English',
    priestId: '',
    priestName: '',
    capacity: 30,
    location: 'Main Sanctuary',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_daily_03',
    dayType: 'weekday',
    time: '05:30 PM',
    language: 'Tamil (தமிழ்)',
    priestId: '',
    priestName: '',
    capacity: 35,
    location: 'Main Sanctuary',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_daily_04',
    dayType: 'weekday',
    time: '06:30 PM',
    language: 'Malayalam',
    priestId: '',
    priestName: '',
    capacity: 35,
    location: 'Our Lady Chapel',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_sun_01',
    dayType: 'sunday',
    time: '06:00 AM',
    language: 'Malayalam',
    priestId: '',
    priestName: '',
    capacity: 40,
    location: 'Main Sanctuary',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_sun_02',
    dayType: 'sunday',
    time: '07:30 AM',
    language: 'English',
    priestId: '',
    priestName: '',
    capacity: 50,
    location: 'Solemn High Altar',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_sun_03',
    dayType: 'sunday',
    time: '09:00 AM',
    language: 'Malayalam',
    priestId: '',
    priestName: '',
    capacity: 40,
    location: 'Main Sanctuary',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_sun_04',
    dayType: 'sunday',
    time: '10:30 AM',
    language: 'Tamil (தமிழ்)',
    priestId: '',
    priestName: '',
    capacity: 50,
    location: 'Solemn High Altar',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sched_sun_05',
    dayType: 'sunday',
    time: '05:30 PM',
    language: 'English & Tamil',
    priestId: '',
    priestName: '',
    capacity: 45,
    location: 'Main Altar & Novena',
    active: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// Helper for dynamic dates
const getTodayYMD = () => new Date().toISOString().split('T')[0];
const getFutureYMD = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

export const SEED_INTENTIONS = [];

export const SEED_PAYMENTS = [];

export const SEED_NOTIFICATIONS = [];

export const SEED_SETTINGS = {
  churchName: 'Our Lady of Dolours Church',
  churchSubTitle: 'Marthandanthurai',
  address: 'Marthandanthurai, Tamil Nadu / Kerala Border, India',
  phone: '+91 (471) 231-4560',
  emergencyPhone: '+91 94471 23456',
  email: 'office@ourladyofdolours.org',
  website: 'https://ourladyofdolours.org',
  heroImage: '/assets/church-logo.jpg',
  vicarName: 'Rev. Fr. Joseph Thomas',
  allowOnlineBookings: true,
  maxDaysAdvance: 90,
  minOfferingAmount: 50,
  
  // UPI Payment & QR Code Configuration
  upiId: 'ourladyofdolours@sbi',
  upiPhone: '+91 94471 23456',
  upiAccountName: 'Our Lady of Dolours Parish Church',
  upiQrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=ourladyofdolours@sbi%26pn=Our%20Lady%20of%20Dolours%20Church%26cu=INR',
  allowUpiDirect: true,
  allowRazorpay: true,
  allowCashAtOffice: true,
  
  // Custom Website Logo (Data URL or Image URL)
  logoUrl: '/assets/church-logo.jpg'
};

export const SEED_GALLERY = [
  {
    id: 'gal_01',
    title: 'Feast of Our Lady of Dolours Procession',
    category: 'feasts',
    categoryLabel: 'Feasts & Celebrations',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?w=900&q=80',
    caption: 'Solemn candlelight procession and Marian veneration during the annual parish feast.',
    eventDate: '2026-09-15',
    uploadedBy: 'Rev. Fr. Joseph Thomas',
    uploadedRole: 'priest',
    createdAt: '2026-09-10T10:00:00Z'
  },
  {
    id: 'gal_02',
    title: 'Solemn High Altar & Holy Eucharistic Adoration',
    category: 'altar',
    categoryLabel: 'Altar & Sanctuary',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=900&q=80',
    caption: 'The main sanctuary beautifully adorned for First Friday Adoration and Benediction.',
    eventDate: '2026-09-05',
    uploadedBy: 'Joshwa',
    uploadedRole: 'admin',
    createdAt: '2026-09-06T14:30:00Z'
  },
  {
    id: 'gal_03',
    title: 'Parish Choir & Liturgical Orchestra',
    category: 'liturgy',
    categoryLabel: 'Holy Mass & Liturgy',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=900&q=80',
    caption: 'The Saint Cecilia Choir rendering hymns during the Easter Vigil celebration.',
    eventDate: '2026-04-12',
    uploadedBy: 'Rev. Fr. Antony George',
    uploadedRole: 'priest',
    createdAt: '2026-04-13T09:00:00Z'
  },
  {
    id: 'gal_04',
    title: 'Parish Youth Ministry (ICYM) Community Outreach',
    category: 'community',
    categoryLabel: 'Parish Community',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=80',
    caption: 'Parish youth organizing the annual charity food drive and medical camp.',
    eventDate: '2026-08-20',
    uploadedBy: 'Joshwa',
    uploadedRole: 'admin',
    createdAt: '2026-08-21T11:00:00Z'
  },
  {
    id: 'gal_05',
    title: 'First Holy Communion Class Ceremony',
    category: 'liturgy',
    categoryLabel: 'Holy Mass & Liturgy',
    imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=900&q=80',
    caption: '32 parish children receiving the Sacrament of Holy Eucharist for the first time.',
    eventDate: '2026-05-18',
    uploadedBy: 'Rev. Fr. Joseph Thomas',
    uploadedRole: 'priest',
    createdAt: '2026-05-19T16:00:00Z'
  },
  {
    id: 'gal_06',
    title: 'Christmas Midnight Mass & Nativity Crib',
    category: 'feasts',
    categoryLabel: 'Feasts & Celebrations',
    imageUrl: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?w=900&q=80',
    caption: 'Parishioners gathering for the blessing of the Nativity Crib at Christmas Midnight Mass.',
    eventDate: '2025-12-25',
    uploadedBy: 'Joshwa',
    uploadedRole: 'admin',
    createdAt: '2025-12-26T08:00:00Z'
  }
];


