'use server'

import { cookies } from 'next/headers'

import { COOKIE_NAME, TLanguage, defaultLanguage } from './config'

export async function getCurrentLanguage() {
    const cookieStore = await cookies()
    return (cookieStore.get(COOKIE_NAME)?.value ?? defaultLanguage) as TLanguage
}

export async function setLanguage(language: TLanguage): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, language, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
}
