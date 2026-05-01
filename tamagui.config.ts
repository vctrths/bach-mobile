import { config as tamaguiConfig } from "@tamagui/config/v3";
import { createFont, createTamagui } from "tamagui";

const satoshiFont = createFont({
  family: "Satoshi, Helvetica, Arial, sans-serif",
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 32,
    9: 48,
    true: 16,
  },
  lineHeight: {
    1: 17,
    2: 22,
    3: 25,
    4: 26,
    5: 29,
    6: 32,
    7: 38,
    8: 50,
    9: 72,
  },
  weight: {
    1: "300",
    3: "400",
    5: "500",
    7: "700",
    9: "900",
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
  },
  face: {
    300: { normal: "SatoshiLight" },
    400: { normal: "Satoshi" },
    500: { normal: "SatoshiMedium" },
    700: { normal: "SatoshiBold" },
    900: { normal: "SatoshiBlack" },
  },
});

const groeneVingersThema = {
  ...tamaguiConfig.themes.light,

  background: "#173300",
  canvas: "#FDFBF7",
  white: "#FFF",

  borderColor: "#C5E1A5",
  primary: "#37392B",
  secondary: "#57594D",
};

const config = createTamagui({
  ...tamaguiConfig,
  fonts: {
    heading: satoshiFont,
    body: satoshiFont,
  },
  themes: {
    ...tamaguiConfig.themes,
    groenevingers: groeneVingersThema,
  },
});

type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
