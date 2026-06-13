import { router } from "./router.svelte";

export const page = {
  get url(): URL {
    return new URL(router.path, "https://dataviz.local");
  },
};
