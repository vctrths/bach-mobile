import { config as tamaguiConfig } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

const groeneVingersThema = {
  ...tamaguiConfig.themes.light,

  background: "#576238",
  canvas: "#FDFBF7",
  color: "#FFF",

  borderColor: "#C5E1A5",
  primary: "#37392B",
  secondary: "#57594D",
};

const config = createTamagui({
  ...tamaguiConfig,
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
