import en from './en'
import ru from './ru'

export const translations = { en, ru } as const
export type TTranslations = (typeof translations)['en']
