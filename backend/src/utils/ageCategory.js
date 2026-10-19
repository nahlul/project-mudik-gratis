'use strict';

/**
 * Calculate age category for a passenger.
 * @param {Date|string} birthDate
 * @param {Date|string} referenceDate - defaults to now
 * @param {Object} settings - { babyMaxMonths: 24, childMaxYears: 12 }
 * @returns {'bayi'|'anak'|'dewasa'}
 */
function calculateAgeCategory(birthDate, referenceDate = new Date(), settings = {}) {
  const babyMaxMonths = settings.babyMaxMonths || 24;
  const childMaxYears = settings.childMaxYears || 12;

  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);

  if (isNaN(birth.getTime())) {
    throw new Error(`Invalid birth date: ${birthDate}`);
  }

  let years = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && ref.getDate() < birth.getDate())) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  if (totalMonths < babyMaxMonths) return 'bayi';
  if (years <= childMaxYears) return 'anak';
  return 'dewasa';
}

module.exports = { calculateAgeCategory };
