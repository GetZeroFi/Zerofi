// ── Zerofi Constants ──────────────────────────────────────────────────────────

export const USER_TYPES = {
  gig:        { label: 'Gig Worker',   icon: '🚗', color: '#22d3ee', desc: 'Uber, DoorDash, Flex, Spark & more'           },
  individual: { label: 'Individual',   icon: '👤', color: '#10b981', desc: 'Salary, side hustle, student loans, investing' },
  family:     { label: 'Family',       icon: '🏡', color: '#f59e0b', desc: 'Household budget, mortgage, shared goals'      },
  business:   { label: 'Business',     icon: '💼', color: '#a78bfa', desc: 'Revenue, payroll, quarterly taxes, cash flow'   },
};

export const GOAL_OPTIONS = [
  { id: 'debt',      label: 'Get out of debt',               icon: '💳' },
  { id: 'emergency', label: 'Build an emergency fund',       icon: '🛡️' },
  { id: 'save',      label: 'Save for something big',        icon: '🎯' },
  { id: 'retire',    label: 'Plan for retirement',           icon: '📈' },
  { id: 'income',    label: 'Increase my income',            icon: '💰' },
  { id: 'control',   label: 'Take control of my money',      icon: '✊' },
  { id: 'college',   label: 'Save for college',              icon: '🎓' },
  { id: 'home',      label: 'Buy a home',                    icon: '🏠' },
];

export const NOVA = {
  name:  'Nova',
  title: 'Zerofi AI Advisor',
  icon:  '🌟',
  color: '#a78bfa',
  grad:  'linear-gradient(135deg,#6d28d9,#a78bfa)',
};

export const BUDGET_CATEGORIES = {
  bills:         { label: 'Bills',          color: '#ef4444' },
  subscriptions: { label: 'Subscriptions',  color: '#a78bfa' },
  insurance:     { label: 'Insurance',      color: '#f59e0b' },
  utilities:     { label: 'Utilities',      color: '#22d3ee' },
  groceries:     { label: 'Groceries',      color: '#10b981' },
  transport:     { label: 'Transport',      color: '#3b82f6' },
  other:         { label: 'Other',          color: '#5a7094' },
};

// Taglines by user type — Nova adapts her language
export const NOVA_TAGLINES = {
  gig:        "Let's make sure every shift counts.",
  individual: "Let's build the financial future you deserve.",
  family:     "Let's get your whole household on the same page.",
  business:   "Let's make sure your business cash flow is airtight.",
  default:    "Let's get your money working for you.",
};

export const MILEAGE_RATE       = 0.67;  // 2024 IRS standard
export const DEFAULT_DAILY_BURN = 30;
export const DEFAULT_TAX_RATE   = 25;
export const STD_DEDUCTION_SINGLE = 14600;
