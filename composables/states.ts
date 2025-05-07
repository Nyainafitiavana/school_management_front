export const useLanguage = () => useState<'ENG' | 'FR'>("lang", () => 'ENG' );
export const useThreshold = () => useState<number>("threshold", () => 10 );