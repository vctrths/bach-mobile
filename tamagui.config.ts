import { createFont, createTamagui, createTokens } from "tamagui";
import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/config/v3";

const satoshiFont = createFont({
  family: "Satoshi, Helvetica, Arial, sans-serif",
  size: { 1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20, 7: 24, 8: 32, 9: 48, true: 16 },
  lineHeight: { 1: 17, 2: 22, 3: 25, 4: 26, 5: 29, 6: 32, 7: 38, 8: 50, 9: 72 },
  weight: { 1: "300", 3: "400", 5: "500", 7: "700", 9: "900" },
  letterSpacing: { 1: 0, 2: -0.5 },
  face: {
    300: { normal: "SatoshiLight" },
    400: { normal: "Satoshi" },
    500: { normal: "SatoshiMedium" },
    700: { normal: "SatoshiBold" },
    900: { normal: "SatoshiBlack" },
  },
});

const groeneVingersThema = {
  ...themes.light,
  background: "#173300",
  background_secondary: "#F1F3EC",
  canvas: "#FDFBF7",
  text_dark: "#172211",
  white: "#FFF",
  divider: "#F5F5F5",
  borderColor: "#E3ECD7",
  primary: "#37392B",
  secondary: "#57594D",
  error: "#D32F2F",
  button_primary_bg: "#173300",
  button_primary_hover: "#172211",
  button_primary_text: "#F5FFF3",
  button_secondary_bg: "#EAF0D8",
  button_secondary_border: "#D4E1AE",
  button_secondary_hover_border: "#E3ECD7",
  button_secondary_text: "#172211",
  button_decline_bg: "#FF0F03",
  button_decline_text: "#FFFFFF",
  button_accept_bg: "#698D14",
  button_accept_text: "#FFFFFF",
};

export const config = createTamagui({
  shorthands,
  fonts: {
    heading: satoshiFont,
    body: satoshiFont,
    // Add Aliases
    Inter: satoshiFont,
    Satoshi: satoshiFont,
  },
  themes: {
    ...themes,
    groenevingers: groeneVingersThema,
  },
  tokens,
});

export default config;

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig { }
}
