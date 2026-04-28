export const colors = {
  // Brand
  primary: '#002D52',        // Dark navy - header background
  primaryDark: '#0a1628',    // Deeper navy - splash background
  secondary: '#16487d',      // Mid blue - gradient end
  accent: '#00AEEF',         // Cyan - borders, indicators
  gold: '#FFEA00',           // Yellow - logo ring, splash title

  // Backgrounds
  gradientStart: '#E0EAFC',  // Light blue - gradient start
  gradientEnd: '#16487d',    // Mid blue - gradient end
  solidBg: '#003b6f',        // Solid blue - form backgrounds
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  lightGrey: '#F2F2F2',

  // Text
  textDark: '#000000',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  textWhite: '#FFFFFF',
  textBlue: '#053e5a',       // Modal titles, section headings
  textLink: '#4A6A8A',       // Info values, links

  // Buttons
  buttonBlue: '#0061C1',     // Dashboard blue buttons
  buttonNavy: '#004A8D',     // Table action buttons
  buttonGrey: '#4A6A8A',     // Back buttons
  buttonDanger: '#d31a1a',   // Delete / reject red

  // Status
  success: '#2e7d4f',        // Changed fields green
  successLight: '#28a745',   // Success icon green
  warning: '#FFB81C',        // Yellow buttons

  // Modals
  modalOverlay: 'rgba(0,0,0,0.4)',
  modalBg: '#FFFFFF',
  oldSectionBg: '#f2f2f2',
  editedSectionBg: '#eef6ff',

  // Borders
  borderLight: '#DDDDDD',
  borderAccent: '#00AEEF',
  borderBlue: '#053e5a',
  divider: '#c0c0c0',

  // Badges
  badgeValuable: '#EAD163',
  badgeAdmin: '#98D8E9',
};

export const gradients = {
  main: [colors.gradientStart, colors.gradientEnd],
  splash: [colors.primaryDark, colors.secondary, colors.primaryDark],
  cancelModal: ['#fdfcf0', '#e3d8a5'],
};
