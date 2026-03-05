import type { BuildConfig } from "@scripts/types";
import { CONTENT_FOLDERS, GIT, PATHS } from "./constants";
import { log } from "./logger";

export const DefaultConfig: BuildConfig = {
  PATHS: PATHS,
  GIT: GIT,
  CONTENT_FOLDERS: CONTENT_FOLDERS,
  logger: log,
};
