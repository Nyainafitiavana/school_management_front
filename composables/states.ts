export const useLanguage = () => useState<'ENG' | 'FR'>("lang", () => 'FR' );
export const useThreshold = () => useState<number>("threshold", () => 10 );