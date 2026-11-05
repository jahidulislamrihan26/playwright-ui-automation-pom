export interface CheckoutInfo { firstName: string; lastName: string; postalCode: string }

export const validInfo: CheckoutInfo = { firstName: 'Test', lastName: 'User', postalCode: '12345' };

// Data-driven: each row blanks one field and names the error the site must show.
export const missingField: Array<{ title: string; info: CheckoutInfo; error: string }> = [
  { title: 'first name', info: { ...validInfo, firstName: '' }, error: 'First Name is required' },
  { title: 'last name', info: { ...validInfo, lastName: '' }, error: 'Last Name is required' },
  { title: 'postal code', info: { ...validInfo, postalCode: '' }, error: 'Postal Code is required' },
];
