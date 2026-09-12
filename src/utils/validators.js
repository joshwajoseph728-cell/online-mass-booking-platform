// Input Validation Utilities

export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePhone(phone) {
  if (!phone) return false;
  // Allows Indian & international formats
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,14}$/;
  return re.test(String(phone).trim());
}

export function validateRequired(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

export function validateOfferingAmount(amount, min = 50) {
  const num = Number(amount);
  return !isNaN(num) && num >= min;
}

export function validateBookingForm(data) {
  const errors = {};

  if (!validateRequired(data.fullName)) {
    errors.fullName = 'Full name is required';
  }

  if (!validateRequired(data.phone)) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateRequired(data.intentionType)) {
    errors.intentionType = 'Please select an Intention Type';
  }

  if (!validateRequired(data.personNames)) {
    errors.personNames = 'Please enter the name(s) of the person(s) to pray for';
  }

  if (!validateRequired(data.massDate)) {
    errors.massDate = 'Please select a date for the Mass';
  }

  if (!validateRequired(data.massTime)) {
    errors.massTime = 'Please select preferred Mass time';
  }

  const minOffering = data.intentionType === 'Departed Soul' ? (Number(data.numberOfSouls || 1) * 50) : 50;
  if (!validateOfferingAmount(data.offeringAmount, minOffering)) {
    errors.offeringAmount = `Offering amount must be at least ₹${minOffering}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
