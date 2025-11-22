import { useTranslations as useTranslationsIntl } from 'next-intl'
import { getTranslations as getTranslationsIntl } from 'next-intl/server'

import { TTranslations } from '../locales'

import { GetByPath, PathKeys, TypedT } from './paths'

// Combined view of all messages (core + auth + beyond)
export type AllMessages = TTranslations

// Allowed namespaces: "auth", "auth.changePassword", "core", ...
export type Namespace = PathKeys<AllMessages>

/* =======================
   Client: useT()
   ======================= */
export function useTranslations<N extends Namespace>(ns: N): TypedT<GetByPath<AllMessages, N>>
export function useTranslations(): TypedT<AllMessages>
export function useTranslations(ns?: string) {
    // Typing only — runtime delegated to next-intl
    return useTranslationsIntl(ns as any) as any
}

/* =======================
   Server: getT()
   ======================= */
type GetTOptions<N extends string = string> = { locale: string; namespace?: N }

export async function getTranslations<N extends Namespace>(ns: N): Promise<TypedT<GetByPath<AllMessages, N>>>
export async function getTranslations(): Promise<TypedT<AllMessages>>
export async function getTranslations<N extends Namespace>(
    opts: GetTOptions<N>
): Promise<TypedT<GetByPath<AllMessages, N>>>
export async function getTranslations(arg?: string | GetTOptions): Promise<TypedT<any>> {
    // 1) String → overload getTranslations(namespace?: string)
    if (typeof arg === 'string' || typeof arg === 'undefined') {
        return getTranslationsIntl(arg as string | undefined) as any
    }
    // 2) Object → overload getTranslations({ locale, namespace? })
    const { locale, namespace } = arg
    return getTranslationsIntl({ locale, namespace }) as any
}
