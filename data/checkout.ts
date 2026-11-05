export interface CheckoutInfo { firstName: string; lastName: string; postalCode: string }

export const validInfo: CheckoutInfo = { firstName: 'Test', lastName: 'User', postalCode: '12345' };

// Data-driven: each row blanks one field and names the error the site must show. `tc` is the manual test case it automates.
export const missingField: Array<{ tc: string; title: string; info: CheckoutInfo; error: string }> = [
  { tc: 'TC-039', title: 'first name', info: { ...validInfo, firstName: '' }, error: 'First Name is required' },
  { tc: 'TC-040', title: 'last name', info: { ...validInfo, lastName: '' }, error: 'Last Name is required' },
  { tc: 'TC-041', title: 'postal code', info: { ...validInfo, postalCode: '' }, error: 'Postal Code is required' },
];
