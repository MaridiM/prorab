import { useTranslations } from './types'
import { GetByPath, TypedT } from './types/paths'
import type { AllMessages, Namespace } from './types/typed'

export const COOKIE_NAME = 'language'
export const languages = ['ru', 'en'] as const
export const defaultLanguage: TLanguage = 'en'

export type TLanguage = (typeof languages)[number]

// Base type (for useTranslations without arguments)
export type TUseTranslations = ReturnType<typeof useTranslations>

// Generic type for scoped translations
export type TScopedTranslations<N extends Namespace> = TypedT<GetByPath<AllMessages, N>>

// Universal type for any scenario
export type TTranslationFunction<N extends Namespace | never = never> = N extends never
    ? TypedT<AllMessages>
    : TypedT<GetByPath<AllMessages, N>>
