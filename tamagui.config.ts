import { config as tamaguiConfig } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

const config = createTamagui(tamaguiConfig);

type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
