/**
 * Shipping Calculator
 *
 * Calculates shipping costs based on destination address and order details
 */

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface ShippingResult {
  cost: number;
  method: string;
  estimatedDays: string;
  freeShippingEligible: boolean;
}

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 50;

// Base shipping rates by zone (shipping from Georgia)
// All costs include $3 shipping and handling fee
const SHIPPING_ZONES = {
  // Local/nearby southeastern states (faster, cheaper)
  zone1: {
    states: ['GA', 'AL', 'FL', 'SC', 'NC', 'TN'],
    baseCost: 8.99, // $5.99 + $3 S&H
    estimatedDays: '2-3',
  },
  // Eastern and nearby states
  zone2: {
    states: ['VA', 'WV', 'KY', 'MS', 'LA', 'AR', 'MD', 'DE', 'DC', 'OH', 'IN', 'IL', 'MO', 'TX', 'OK'],
    baseCost: 10.99, // $7.99 + $3 S&H
    estimatedDays: '3-5',
  },
  // Western and northern states
  zone3: {
    states: ['PA', 'NJ', 'NY', 'CT', 'RI', 'MA', 'VT', 'NH', 'ME', 'MI', 'WI', 'MN', 'IA', 'KS', 'NE', 'SD', 'ND', 'CO', 'NM', 'WY', 'MT', 'UT', 'AZ', 'NV', 'CA', 'OR', 'WA', 'ID'],
    baseCost: 12.99, // $9.99 + $3 S&H
    estimatedDays: '4-6',
  },
  // Alaska, Hawaii, Territories
  zone4: {
    states: ['AK', 'HI', 'PR', 'GU', 'VI'],
    baseCost: 18.99, // $15.99 + $3 S&H
    estimatedDays: '7-10',
  },
};

/**
 * Calculate shipping cost based on destination and cart total
 */
export function calculateShipping(
  address: ShippingAddress,
  cartSubtotal: number,
  cartWeight?: number
): ShippingResult {
  const state = address.state.toUpperCase();
  const country = (address.country || 'US').toUpperCase();

  // Check if eligible for free shipping
  const freeShippingEligible = cartSubtotal >= FREE_SHIPPING_THRESHOLD;

  if (freeShippingEligible) {
    return {
      cost: 0,
      method: 'Free Standard Shipping',
      estimatedDays: '3-7',
      freeShippingEligible: true,
    };
  }

  // Only US shipping for now
  if (country !== 'US') {
    return {
      cost: 25.00,
      method: 'International Shipping',
      estimatedDays: '10-20',
      freeShippingEligible,
    };
  }

  // Determine shipping zone
  let zone = SHIPPING_ZONES.zone3; // Default to zone 3

  for (const [zoneName, zoneData] of Object.entries(SHIPPING_ZONES)) {
    if (zoneData.states.includes(state)) {
      zone = zoneData;
      break;
    }
  }

  // Calculate cost based on weight (if provided)
  let cost = zone.baseCost;

  if (cartWeight && cartWeight > 2) {
    // Add $1.50 per pound over 2 lbs
    const extraWeight = cartWeight - 2;
    cost += extraWeight * 1.50;
  }

  // Round to 2 decimal places
  cost = Math.round(cost * 100) / 100;

  return {
    cost,
    method: `Standard Shipping (${zone.estimatedDays} business days)`,
    estimatedDays: zone.estimatedDays,
    freeShippingEligible,
  };
}

/**
 * Validate US ZIP code format
 */
export function isValidZipCode(zip: string): boolean {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return usZipRegex.test(zip);
}

/**
 * Validate state code
 */
export function isValidStateCode(state: string): boolean {
  const allStates = [
    ...SHIPPING_ZONES.zone1.states,
    ...SHIPPING_ZONES.zone2.states,
    ...SHIPPING_ZONES.zone3.states,
    ...SHIPPING_ZONES.zone4.states,
  ];
  return allStates.includes(state.toUpperCase());
}

/**
 * Get state name from code
 */
export function getStateName(code: string): string {
  const stateNames: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
    'PR': 'Puerto Rico', 'GU': 'Guam', 'VI': 'Virgin Islands',
  };
  return stateNames[code.toUpperCase()] || code;
}

/**
 * Get all US states
 */
export function getAllStates(): Array<{ code: string; name: string }> {
  const allStates = [
    ...SHIPPING_ZONES.zone1.states,
    ...SHIPPING_ZONES.zone2.states,
    ...SHIPPING_ZONES.zone3.states,
    ...SHIPPING_ZONES.zone4.states,
  ].sort();

  return allStates.map(code => ({
    code,
    name: getStateName(code),
  }));
}
