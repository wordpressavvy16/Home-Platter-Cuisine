export interface Theme {
  name: string;
  colors: {
    '--color-primary': string;
    '--color-secondary': string;
    '--color-dark': string;
    '--color-light': string;
    '--color-background': string;
    '--color-text': string;
  };
  decorations?: {
    backgroundEffect?: 'snowfall' | 'diya' | 'marigold-fall' | 'banana-leaf-fall' | 'sugarcane-fall' | 'sun-pulse' | 'hibiscus-fall' | 'moon-and-stars' | 'dandiya-fall' | 'lantern-fall' | 'ganesh-chaturthi-fall' | 'christmas-mix-fall';
    headerIcon?: 'snowflake' | 'diya' | 'marigold' | 'onam-flower' | 'sun' | 'modak' | 'crescent-moon-star' | 'durga-eye' | 'lantern' | 'animated-santa';
    sideDecoration?: 'hanging-lamp' | 'hanging-lanterns';
  };
}

export const themes: Theme[] = [
  {
    name: 'Glassmorphism Light',
    colors: {
      '--color-primary': '#F97316',
      '--color-secondary': '#10B981',
      '--color-dark': '#4A2C2A',
      '--color-light': '#FDFBF5',
      '--color-background': '#FDFBF5',
      '--color-text': '#1F2937',
    },
  },
  {
    name: 'Glassmorphism Dark',
    colors: {
      '--color-primary': '#F97316',
      '--color-secondary': '#34D399',
      '--color-dark': '#1E293B',
      '--color-light': '#334155',
      '--color-background': '#0F172A',
      '--color-text': '#E2E8F0',
    },
  },
   {
    name: 'Christmas',
    colors: {
      '--color-primary': '#C81E1E',   // Festive Red
      '--color-secondary': '#166534', // Forest Green
      '--color-dark': '#450A0A',     // Dark Red
      '--color-light': '#FEF2F2',    // Red-50
      '--color-background': '#F8FAFC',// Slate-50
      '--color-text': '#1E293B',     // Slate-800
    },
    decorations: {
      backgroundEffect: 'christmas-mix-fall',
      headerIcon: 'animated-santa',
    }
  },
];