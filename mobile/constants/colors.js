// FOREST
// const LIGHT_COLORS = {
//   primary: "#4CAF50",
//   textPrimary: "#2e5a2e",
//   textSecondary: "#688f68",
//   textDark: "#1b361b",
//   placeholderText: "#767676",
//   background: "#e8f5e9",
//   cardBackground: "#f1f8f2",
//   inputBackground: "#f4faf5",
//   border: "#c8e6c9",
//   white: "#ffffff",
//   black: "#000000",
// };

// RETRO
const LIGHT_COLORS = {
  primary: "#e17055",
  textPrimary: "#784e2d",
  textSecondary: "#a58e7c",
  textDark: "#50372a",
  placeholderText: "#767676",
  background: "#ede1d1",
  cardBackground: "#faf5eb",
  inputBackground: "#f7f2ea",
  border: "#e2d6c1",
  white: "#ffffff",
  black: "#000000",
};

// OCEAN
// const LIGHT_COLORS = {
//   primary: "#1976D2",
//   textPrimary: "#1a4971",
//   textSecondary: "#6d93b8",
//   textDark: "#0d2b43",
//   placeholderText: "#767676",
//   background: "#e3f2fd",
//   cardBackground: "#f5f9ff",
//   inputBackground: "#f0f8ff",
//   border: "#bbdefb",
//   white: "#ffffff",
//   black: "#000000",
// };

// BLOSSOM
//  const LIGHT_COLORS = {
//    primary: "#EC407A",
//    textPrimary: "#7d2150",
//    textSecondary: "#b06a8f",
//    textDark: "#5a1836",
//    placeholderText: "#767676",
//    background: "#fce4ec",
//    cardBackground: "#fff5f8",
//   inputBackground: "#fef8fa",
//   border: "#f8bbd0",
// white: "#ffffff",
//   black: "#000000",
//  };

// Shared dark theme for all light palettes.
// It keeps a single dark palette and syncs the accent color with the active light theme.
const DARK_COLORS_BASE = {
  textPrimary: "#f7e8de",
  textSecondary: "#d7b89c",
  textDark: "#f4d7c8",
  placeholderText: "#af8c7c",
  background: "#2e1f18",
  cardBackground: "#3d2f28",
  inputBackground: "#493a33",
  border: "#5f4f49",
  white: "#ffffff",
  black: "#000000",
};

export const DARK_COLORS = {
  ...DARK_COLORS_BASE,
  primary: LIGHT_COLORS.primary,
};

export const THEME_COLORS = {
  light: LIGHT_COLORS,
  dark: DARK_COLORS,
};

export default LIGHT_COLORS;