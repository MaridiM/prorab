'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/packages/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/packages/ui'
import { Loader2, ExternalLink, Unlink } from 'lucide-react'
import { useMutation, useApolloClient } from '@apollo/client/react'
import { useToast } from '@/packages/hooks'
import { cn } from '@/packages/utils/tw-merge'
import {
    InitTelegramAuthDocument,
    CheckTelegramLinkStatusDocument,
    LinkTelegramAccountDocument,
    DisconnectTelegramDocument,
    MeDocument,
    SendTestTelegramNotificationDocument,
} from '@/packages/api/graphql/__generated__/output'

interface TelegramConnectionProps {
    className?: string
    isConnected?: boolean
    telegramUsername?: string
    onUnlink?: () => void
    onLinkSuccess?: () => void
}

export const TelegramConnection = ({
    className,
    isConnected = false,
    telegramUsername,
    onUnlink,
    onLinkSuccess
}: TelegramConnectionProps) => {
    const { showToast } = useToast()
    const apolloClient = useApolloClient()
    const [initAuth, { loading: initLoading }] = useMutation(InitTelegramAuthDocument)
    const [checkLinkStatus] = useMutation(CheckTelegramLinkStatusDocument)
    const [linkAccount] = useMutation(LinkTelegramAccountDocument, {
        refetchQueries: [{ query: MeDocument }],
    })
    const [disconnectTelegram, { loading: isDisconnecting }] = useMutation(DisconnectTelegramDocument, {
        refetchQueries: [{ query: MeDocument }],
    })
    const [sendTestNotification, { loading: isTesting }] = useMutation(SendTestTelegramNotificationDocument)

    const [pollingToken, setPollingToken] = useState<string | null>(null)
    const [deepLink, setDeepLink] = useState<string | null>(null)
    const [isLinking, setIsLinking] = useState(false)
    const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)
    const pollingTokenRef = useRef<string | null>(null)

    // Finalize Linking
    const performLinking = useCallback(async (token: string) => {
        setIsLinking(true)
        try {
            await linkAccount({ variables: { token } })
            showToast({
                title: 'Успешно',
                description: 'Telegram аккаунт успешно привязан',
                type: 'success'
            })
            // Call success callback to refresh user data
            if (onLinkSuccess) {
                await onLinkSuccess()
            }
        } catch (error: any) {
            showToast({
                title: 'Ошибка',
                description: error.message || 'Не удалось привязать аккаунт',
                type: 'error'
            })
        } finally {
            setIsLinking(false)
        }
    }, [linkAccount, showToast, onLinkSuccess])

    // Handle Unlink
    const handleUnlink = useCallback(async () => {
        setShowUnlinkDialog(true)
    }, [])

    const confirmUnlink = useCallback(async () => {
        setShowUnlinkDialog(false)
        try {
            await disconnectTelegram()
            showToast({
                title: 'Успешно',
                description: 'Telegram аккаунт успешно отключен',
                type: 'success'
            })
            // Call unlink callback to refresh user data
            if (onUnlink) {
                await onUnlink()
            }
        } catch (error: any) {
            showToast({
                title: 'Ошибка',
                description: error.message || 'Не удалось отключить Telegram',
                type: 'error'
            })
        }
    }, [disconnectTelegram, showToast, onUnlink])

    const handleTestNotification = useCallback(async () => {
        try {
            await sendTestNotification()
            showToast({
                title: 'Успешно',
                description: 'Тестовое уведомление отправлено в Telegram. Проверьте ваш бот.',
                type: 'success'
            })
        } catch (error: any) {
            showToast({
                title: 'Ошибка',
                description: error.message || 'Не удалось отправить тестовое уведомление',
                type: 'error'
            })
        }
    }, [sendTestNotification, showToast])

    // Start Auth Flow
    const handleConnect = useCallback(async () => {
        try {
            const { data } = await initAuth()
            if (data?.initTelegramAuth) {
                const token = data.initTelegramAuth.token
                pollingTokenRef.current = token
                setPollingToken(token)
                setDeepLink(data.initTelegramAuth.deepLink)

                // Open Telegram in new tab
                window.open(data.initTelegramAuth.deepLink, '_blank')
            }
        } catch (error) {
            showToast({
                title: 'Ошибка',
                description: 'Не удалось инициализировать подключение Telegram',
                type: 'error'
            })
        }
    }, [initAuth, showToast])

    // Poll for completion
    useEffect(() => {
        if (!pollingToken) return

        const currentToken = pollingToken

        const interval = setInterval(async () => {
            try {
                const { data } = await checkLinkStatus({
                    variables: { input: { token: currentToken } }
                })

                if (data?.checkTelegramLinkStatus?.completed) {
                    clearInterval(interval)
                    setPollingToken(null)
                    setDeepLink(null)
                    performLinking(currentToken)
                }
            } catch (error) {
                console.error('Polling error', error)
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [pollingToken, checkLinkStatus, performLinking])

    return (
        <div className={cn("flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30", className)}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2AABEE]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                </div>
                <div>
                    <p className="font-medium">Telegram</p>
                    {isConnected ? (
                        <p className="text-sm text-[#2AABEE]">
                            Подключено: @{telegramUsername || 'User'}
                        </p>
                    ) : pollingToken ? (
                        <p className="text-sm text-yellow-500 animate-pulse">
                            Ожидание подтверждения...
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Получайте уведомления в Telegram
                        </p>
                    )}
                </div>
            </div>

            {isConnected ? (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={handleTestNotification}
                        disabled={isTesting}
                    >
                        {isTesting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <span className="mr-2">🧪</span>
                        )}
                        {isTesting ? 'Отправка...' : 'Тест'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive hover:text-destructive"
                        onClick={handleUnlink}
                        disabled={isDisconnecting}
                    >
                        {isDisconnecting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Unlink className="w-4 h-4 mr-2" />
                        )}
                        {isDisconnecting ? 'Отключение...' : 'Отключить'}
                    </Button>
                </div>
            ) : pollingToken ? (
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => window.open(deepLink!, '_blank')}
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Открыть бот
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={handleConnect}
                    disabled={initLoading || isLinking}
                >
                    {initLoading || isLinking ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    {initLoading ? 'Загрузка...' : isLinking ? 'Привязка...' : 'Подключить'}
                </Button>
            )}
            
            {/* Unlink Confirmation Dialog */}
            <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отключить Telegram?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите отключить Telegram? Все данные Telegram (chat ID, username, фото) будут удалены из вашего аккаунта.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmUnlink}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Отключить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
