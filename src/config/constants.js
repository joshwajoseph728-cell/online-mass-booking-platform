// Application Constants & Enums

export const ROLES = {
  MEMBER: 'member',
  PRIEST: 'priest',
  ADMIN: 'admin'
};

export const INTENTION_TYPES = {
  DEPARTED_SOUL: {
    id: 'Departed Soul',
    label: 'Departed Soul',
    icon: '✝️',
    description: 'Pray for the eternal repose and peace of a deceased loved one.',
    badgeClass: 'badge-departed'
  },
  THANKSGIVING: {
    id: 'Thanksgiving',
    label: 'Thanksgiving',
    icon: '✨',
    description: 'Offer praise and thanks for blessings, birthdays, anniversaries, and answered prayers.',
    badgeClass: 'badge-thanksgiving'
  },
  SPECIAL_INTENTION: {
    id: 'Special Intention',
    label: 'Special Intention',
    icon: '🕯️',
    description: 'Personal petition for family harmony, studies, travels, new ventures, or spiritual guidance.',
    badgeClass: 'badge-special'
  },
  HEALING_PRAYER: {
    id: 'Healing Prayer',
    label: 'Healing Prayer',
    icon: '🕊️',
    description: 'Seek physical, emotional, and spiritual healing and comfort for the sick or distressed.',
    badgeClass: 'badge-healing'
  }
};

export const BOOKING_STATUS = {
  PENDING: { id: 'PENDING', label: 'Pending Approval', badgeClass: 'badge-pending' },
  APPROVED: { id: 'APPROVED', label: 'Approved', badgeClass: 'badge-approved' },
  SCHEDULED: { id: 'SCHEDULED', label: 'Scheduled', badgeClass: 'badge-scheduled' },
  COMPLETED: { id: 'COMPLETED', label: 'Completed', badgeClass: 'badge-completed' },
  ARCHIVED: { id: 'ARCHIVED', label: 'Archived', badgeClass: 'badge-archived' },
  REJECTED: { id: 'REJECTED', label: 'Rejected', badgeClass: 'badge-rejected' }
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

export const DEFAULT_OFFERING_AMOUNTS = [100, 250, 500, 1000];

export const CHURCH_DETAILS = {
  name: 'Our Lady of Dolours Church',
  patron: 'Our Lady of Seven Sorrows (Mater Dolorosa)',
  established: '1896',
  diocese: 'Archdiocese of Verapoly',
  location: 'Kowdiar, Thiruvananthapuram, Kerala 695003',
  phone: '+91 (471) 231-4560',
  emergencyPhone: '+91 94471 23456',
  email: 'office@ourladyofdolours.org',
  priestEmail: 'vicar@ourladyofdolours.org',
  officeHours: 'Tuesday to Sunday: 9:00 AM – 1:00 PM, 4:00 PM – 6:30 PM (Mondays Closed)',
  confessionHours: 'Daily 30 minutes before every Holy Mass and Saturdays 5:00 PM – 6:00 PM'
};
