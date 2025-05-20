const { calculateAgeInYears } = require('../horseUtils');

describe('calculateAgeInYears', () => {
  // Mock Date.now() to ensure consistent test results regardless of when tests are run.
  // Let's set a fixed "today" date for tests.
  const mockToday = new Date('2024-07-15T10:00:00.000Z');
  let originalDateNow;

  beforeAll(() => {
    originalDateNow = Date.now;
    Date.now = jest.fn(() => mockToday.getTime());
  });

  afterAll(() => {
    Date.now = originalDateNow; // Restore original Date.now
  });

  it('should return 0 if the birth date is today', () => {
    expect(calculateAgeInYears('2024-07-15')).toBe(0);
  });

  it('should return 0 if the birth date was yesterday but less than a full year ago', () => {
    expect(calculateAgeInYears('2024-07-14')).toBe(0);
  });

  it('should return 1 if the birth date was exactly one year ago today', () => {
    expect(calculateAgeInYears('2023-07-15')).toBe(1);
  });

  it('should return 0 if the birth date was one day less than a year ago', () => {
    // Born on 2023-07-16, today is 2024-07-15, so not a full year yet.
    expect(calculateAgeInYears('2023-07-16')).toBe(0);
  });

  it('should return 10 if the birth date was 10 years ago', () => {
    expect(calculateAgeInYears('2014-07-15')).toBe(10);
  });

  it('should handle birth month being later in the year', () => {
    // Born in December 2023, today is July 2024 -> 0 years old
    expect(calculateAgeInYears('2023-12-01')).toBe(0);
  });

  it('should handle birth month being earlier in the year', () => {
    // Born in January 2023, today is July 2024 -> 1 year old
    expect(calculateAgeInYears('2023-01-15')).toBe(1);
  });

  it('should return 0 for a future date of birth (gracefully)', () => {
    expect(calculateAgeInYears('2025-01-01')).toBe(0);
  });

  // Test case considering leap year effects on day before birthday
  it('should correctly calculate age when birthday is Feb 29 and current year is non-leap after leap year', () => {
    // Test with today as March 1, 2025 (non-leap)
    // Birthday Feb 29, 2024 (leap)
    // Effective birthday for non-leap year might be considered Feb 28 or Mar 1
    // Current logic: if monthDifference is 0 and today.getDate() < birthDate.getDate(), age--.
    // If DOB is 2024-02-29, and today is 2025-02-28, age should be 0.
    // If DOB is 2024-02-29, and today is 2025-03-01, age should be 1.
    const specificMockToday = new Date('2025-02-28T10:00:00.000Z');
    Date.now = jest.fn(() => specificMockToday.getTime());
    expect(calculateAgeInYears('2024-02-29')).toBe(0);

    const specificMockTodayNext = new Date('2025-03-01T10:00:00.000Z');
    Date.now = jest.fn(() => specificMockTodayNext.getTime());
    expect(calculateAgeInYears('2024-02-29')).toBe(1);

    // Restore general mock for other tests if any follow in this describe block outside this it()
    Date.now = jest.fn(() => mockToday.getTime());
  });

  it('should correctly calculate age just before birthday', () => {
    expect(calculateAgeInYears('2000-07-16')).toBe(23); // Today is 2024-07-15, so 24th birthday hasn't happened
  });
});
