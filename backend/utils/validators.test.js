/**
 * Unit tests for shared auth validators (FR-01, FR-02).
 * Pure functions — no Express, no database.
 */
const {
  isValidEmail, isValidPassword, isValidMobile, isValidRole, validateProfileData, ACCOUNT_TYPES,
} = require('./validators');

describe('isValidEmail', () => {
  it('accepts a well-formed email', () => {
    expect(isValidEmail('farhan@example.com')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  farhan@example.com  ')).toBe(true);
  });

  it.each([
    ['missing @', 'farhanexample.com'],
    ['missing domain', 'farhan@'],
    ['empty string', ''],
  ])('rejects %s', (_label, value) => {
    expect(isValidEmail(value)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts a password meeting all policy requirements', () => {
    expect(isValidPassword('Str0ng!Pass')).toBe(true);
  });

  it.each([
    ['too short', 'Sh0rt!'],
    ['missing uppercase', 'str0ng!pass'],
    ['missing lowercase', 'STR0NG!PASS'],
    ['missing a number', 'Strong!Pass'],
    ['missing a special character', 'Str0ngPass'],
  ])('rejects a password %s', (_label, value) => {
    expect(isValidPassword(value)).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isValidPassword(undefined)).toBe(false);
  });
});

describe('isValidMobile', () => {
  it('accepts an 11-digit number starting with 01', () => {
    expect(isValidMobile('01712345678')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidMobile('  01712345678  ')).toBe(true);
  });

  it.each([
    ['too short', '0171234567'],
    ['too long', '017123456789'],
    ['wrong prefix', '11712345678'],
    ['non-numeric', '017abcde678'],
  ])('rejects a mobile number that is %s', (_label, value) => {
    expect(isValidMobile(value)).toBe(false);
  });
});

describe('isValidRole', () => {
  it.each(ACCOUNT_TYPES)('accepts the self-registrable role "%s"', (role) => {
    expect(isValidRole(role)).toBe(true);
  });

  it('rejects the admin role (platform-managed, not self-registrable)', () => {
    expect(isValidRole('admin')).toBe(false);
  });

  it('rejects an unknown role', () => {
    expect(isValidRole('superuser')).toBe(false);
  });
});

const validAddress = {
  division: 'Dhaka',
  district: 'Dhaka',
  city: 'Dhaka City Corporation',
  area: 'Mirpur-10',
  detailedAddress: 'House 12, Road 3',
};

describe('validateProfileData for household', () => {
  it('accepts a complete household profile with no payout', () => {
    const errors = validateProfileData('household', { nid: '1234567890', address: validAddress });
    expect(errors).toEqual({});
  });

  it('requires the NID number', () => {
    const errors = validateProfileData('household', { address: validAddress });
    expect(errors.nid).toBeDefined();
  });

  it('requires payout account details once a payout method is chosen', () => {
    const errors = validateProfileData('household', {
      nid: '1234567890', address: validAddress, payout: { method: 'bkash' },
    });
    expect(errors['payout.accountNumber']).toBeDefined();
  });

  it('accepts a fully specified bank payout', () => {
    const errors = validateProfileData('household', {
      nid: '1234567890',
      address: validAddress,
      payout: {
        method: 'bank', accountNumber: '123', bankName: 'City Bank',
      },
    });
    expect(errors).toEqual({});
  });
});

describe('validateProfileData for local collector', () => {
  const validCollector = {
    nid: '1234567890',
    documents: { nidFront: 'front.jpg', nidBack: 'back.jpg', profilePhoto: 'photo.jpg' },
    dob: '1995-01-01',
    address: validAddress,
    dailyCapacity: '12 pickups/day',
    serviceZones: ['Mirpur-10'],
  };

  it('accepts a complete local collector profile', () => {
    expect(validateProfileData('collector', validCollector)).toEqual({});
  });

  it('requires at least one service zone', () => {
    const errors = validateProfileData('collector', { ...validCollector, serviceZones: [] });
    expect(errors.serviceZones).toBeDefined();
  });

  it('requires KYC documents', () => {
    const errors = validateProfileData('collector', { ...validCollector, documents: {} });
    expect(errors['documents.nidFront']).toBeDefined();
    expect(errors['documents.nidBack']).toBeDefined();
    expect(errors['documents.profilePhoto']).toBeDefined();
  });
});

describe('validateProfileData for global collector', () => {
  const validGlobal = {
    nid: '1234567890',
    documents: {
      nidFront: 'front.jpg',
      nidBack: 'back.jpg',
      profilePhoto: 'photo.jpg',
      drivingLicence: 'dl.jpg',
      vehicleRegistration: 'reg.jpg',
    },
    drivingLicenceNumber: 'DL-1',
    vehicleRegistrationNumber: 'Dhaka Metro Ga-1234',
    vehicleCapacity: '5 tons',
  };

  it('accepts a complete global collector profile', () => {
    expect(validateProfileData('global', validGlobal)).toEqual({});
  });

  it('requires the driving licence document', () => {
    const errors = validateProfileData('global', {
      ...validGlobal, documents: { ...validGlobal.documents, drivingLicence: '' },
    });
    expect(errors['documents.drivingLicence']).toBeDefined();
  });
});

describe('validateProfileData for company', () => {
  const validCompany = {
    registrationNumber: 'C-1',
    officeAddress: 'Dhaka',
    supportedCategories: ['Plastic', 'Paper'],
    documents: {
      tradeLicence: 'a.pdf',
      companyRegistration: 'b.pdf',
      tin: 'c.pdf',
      vat: 'd.pdf',
      directorNid: 'e.pdf',
    },
    authorizedPerson: {
      name: 'Rahim Uddin', role: 'Managing Director', phone: '01712345678', email: 'rahim@example.com', nid: '999',
    },
  };

  it('accepts a complete company profile without E-waste', () => {
    expect(validateProfileData('company', validCompany)).toEqual({});
  });

  it('requires at least one supported category', () => {
    const errors = validateProfileData('company', { ...validCompany, supportedCategories: [] });
    expect(errors.supportedCategories).toBeDefined();
  });

  it('requires an E-waste licence when E-waste is selected', () => {
    const errors = validateProfileData('company', {
      ...validCompany, supportedCategories: ['E-waste'],
    });
    expect(errors.ewasteLicenceNumber).toBeDefined();
    expect(errors['documents.ewasteLicence']).toBeDefined();
  });

  it('accepts E-waste when the licence is provided', () => {
    const errors = validateProfileData('company', {
      ...validCompany,
      supportedCategories: ['E-waste'],
      ewasteLicenceNumber: 'EW-1',
      documents: { ...validCompany.documents, ewasteLicence: 'ew.pdf' },
    });
    expect(errors).toEqual({});
  });

  it('validates the authorized person email', () => {
    const errors = validateProfileData('company', {
      ...validCompany, authorizedPerson: { ...validCompany.authorizedPerson, email: 'not-an-email' },
    });
    expect(errors['authorizedPerson.email']).toBeDefined();
  });
});

describe('validateProfileData for an unknown role', () => {
  it('returns an error instead of throwing', () => {
    const errors = validateProfileData('superuser', {});
    expect(errors.role).toBeDefined();
  });
});
