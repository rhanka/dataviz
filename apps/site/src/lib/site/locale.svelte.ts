export type Locale = "fr" | "en";

class LocaleStore {
  value = $state<Locale>("fr");
}

export const locale = new LocaleStore();
