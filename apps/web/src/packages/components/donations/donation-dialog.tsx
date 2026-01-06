'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/packages/components/ui/dialog'
import { Button } from '@/packages/components/ui/button'
import { Input } from '@/packages/components/ui/input'
import { Label } from '@/packages/components/ui/label'
import { Textarea } from '@/packages/components/ui/textarea'
import { Checkbox } from '@/packages/components/ui/checkbox'
import { toast } from 'sonner'
import { Heart, Loader2 } from 'lucide-react'
import { cn } from '@/packages/utils'
import { gql } from '@apollo/client'

const CREATE_DONATION = gql`
	mutation CreateDonation($input: CreateDonationInput!) {
		createDonation(input: $input) {
			url
			donationId
		}
	}
`

interface DonationDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const PRESET_AMOUNTS = [
	{ value: 100, label: '100₽' },
	{ value: 300, label: '300₽' },
	{ value: 500, label: '500₽' },
	{ value: 1000, label: '1000₽' },
]

export function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
	const [amount, setAmount] = useState<number>(300)
	const [customAmount, setCustomAmount] = useState<string>('')
	const [message, setMessage] = useState<string>('')
	const [donorName, setDonorName] = useState<string>('')
	const [isAnonymous, setIsAnonymous] = useState<boolean>(false)

	const [createDonation, { loading }] = useMutation(CREATE_DONATION, {
		onCompleted: (data) => {
			if (data?.createDonation?.url) {
				// Redirect to payment URL
				window.location.href = data.createDonation.url
			}
		},
		onError: (error) => {
			toast.error('Ошибка создания доната', {
				description: error.message,
			})
		},
	})

	const handlePresetClick = (value: number) => {
		setAmount(value)
		setCustomAmount('')
	}

	const handleCustomAmountChange = (value: string) => {
		setCustomAmount(value)
		const numValue = parseInt(value, 10)
		if (!isNaN(numValue) && numValue >= 50 && numValue <= 100000) {
			setAmount(numValue)
		}
	}

	const handleSubmit = async () => {
		// Validation
		if (amount < 50) {
			toast.error('Минимальная сумма доната 50₽')
			return
		}
		if (amount > 100000) {
			toast.error('Максимальная сумма доната 100,000₽')
			return
		}

		if (message.length > 500) {
			toast.error('Сообщение не должно превышать 500 символов')
			return
		}

		try {
			await createDonation({
				variables: {
					input: {
						amount,
						message: message || undefined,
						donorName: donorName || undefined,
						isAnonymous,
					},
				},
			})
		} catch (error) {
			// Error handling is done in onError callback
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5 text-red-500" />
						Поддержите ProRab.space
					</DialogTitle>
					<DialogDescription>
						Ваши донаты помогают нам развивать платформу и делать её лучше для
						всех пользователей
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Preset amounts */}
					<div className="space-y-3">
						<Label>Выберите сумму</Label>
						<div className="grid grid-cols-2 gap-3">
							{PRESET_AMOUNTS.map((preset) => (
								<Button
									key={preset.value}
									type="button"
									variant={amount === preset.value && !customAmount ? 'default' : 'outline'}
									onClick={() => handlePresetClick(preset.value)}
									className={cn(
										'h-12',
										amount === preset.value &&
											!customAmount &&
											'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
									)}
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>

					{/* Custom amount */}
					<div className="space-y-2">
						<Label htmlFor="customAmount">Или введите свою сумму (от 50₽)</Label>
						<Input
							id="customAmount"
							type="number"
							min={50}
							max={100000}
							value={customAmount}
							onChange={(e) => handleCustomAmountChange(e.target.value)}
							placeholder="Например: 250"
						/>
					</div>

					{/* Message */}
					<div className="space-y-2">
						<Label htmlFor="message">Сообщение (необязательно)</Label>
						<Textarea
							id="message"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Напишите что-нибудь приятное..."
							maxLength={500}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground">
							{message.length}/500 символов
						</p>
					</div>

					{/* Donor name */}
					<div className="space-y-2">
						<Label htmlFor="donorName">Ваше имя (необязательно)</Label>
						<Input
							id="donorName"
							value={donorName}
							onChange={(e) => setDonorName(e.target.value)}
							placeholder="Как вас представить?"
							maxLength={200}
							disabled={isAnonymous}
						/>
					</div>

					{/* Anonymous checkbox */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="anonymous"
							checked={isAnonymous}
							onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
						/>
						<Label
							htmlFor="anonymous"
							className="text-sm font-normal cursor-pointer"
						>
							Сделать донат анонимным
						</Label>
					</div>

					{/* Payment info */}
					<div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
						<p>
							После нажатия кнопки вы будете перенаправлены на страницу оплаты.
							Доступны способы оплаты: банковские карты (РФ и международные),
							а также Telegram Stars.
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						Отмена
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={loading}
						className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Создание...
							</>
						) : (
							<>
								<Heart className="mr-2 h-4 w-4" />
								Поддержать {amount}₽
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
