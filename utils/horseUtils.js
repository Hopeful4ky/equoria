/**
 * Calculates the age in whole years from a given birth date string.
 * @param {string} dateInput - The birth date in 'YYYY-MM-DD' format or a Date object.
 * @returns {number} The age in whole years.
 */
function calculateAgeInYears(dateInput) {
  let dateStringProcessed;
  if (dateInput instanceof Date) {
    // Convert Date object to YYYY-MM-DD string (UTC to be consistent)
    const year = dateInput.getUTCFullYear();
    const month = (dateInput.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = dateInput.getUTCDate().toString().padStart(2, '0');
    dateStringProcessed = `${year}-${month}-${day}`;
  } else if (typeof dateInput === 'string') {
    dateStringProcessed = dateInput;
  } else {
    console.error(
      'Invalid input for calculateAgeInYears. Expected string or Date object.'
    );
    return 0; // Or throw an error
  }

  const [year, month, day] = dateStringProcessed.split('-').map(Number);
  // Construct birthDate as UTC to avoid timezone shifts from just new Date('YYYY-MM-DD')
  // Date.UTC month is 0-indexed (0 for January, 11 for December)
  const birthDate = new Date(Date.UTC(year, month - 1, day));

  const today = new Date(Date.now()); // Uses the mocked Date.now() in tests, which gives a timestamp

  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDifference = today.getUTCMonth() - birthDate.getUTCMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getUTCDate() < birthDate.getUTCDate())
  ) {
    age--;
  }
  return age < 0 ? 0 : age; // Ensure age is not negative if dob is in future
}

module.exports = {
  calculateAgeInYears,
};
