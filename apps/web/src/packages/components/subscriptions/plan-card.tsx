'use client'

import { Check } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export interface PlanCardProps {
	name: string
	price: number
	earlyBirdPrice?: number
	maxActiveProjects: number | null
	maxMembers: number
	storageGB: number
	features: string[]
	isCurrentPlan?: boolean
	isEarlyBird?: boolean
	onSelect?: () => void
	disabled?: boolean
}

export function PlanCard({
	name,
	price,
	earlyBirdPrice,
	maxActiveProjects,
	maxMembers,
	storageGB,
	features,
	isCurrentPlan = false,
	isEarlyBird = false,
	onSelect,
	disabled = false,
}: PlanCardProps) {
	const displayPrice = isEarlyBird && earlyBirdPrice ? earlyBirdPrice : price
	const hasDiscount = isEarlyBird && earlyBirdPrice && earlyBirdPrice < price

	return (
		<Card
			className={`relative overflow-hidden p-6 ${
				isCurrentPlan ? 'border-primary border-2' : ''
			}`}
		>
			{/* Early Bird Badge */}
			{hasDiscount && (
				<div className="absolute top-4 right-4">
					<Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
						Early Bird 🎉
					</Badge>
				</div>
			)}

			{/* Current Plan Badge */}
			{isCurrentPlan && (
				<div className="absolute top-4 left-4">
					<Badge variant="default" className="border-primary text-primary">
						Текущий план
					</Badge>
				</div>
			)}

			<div className="mt-8">
				{/* Plan Name */}
				<h3 className="text-2xl font-bold mb-2">{name}</h3>

				{/* Pricing */}
				<div className="mb-6">
					<div className="flex items-baseline gap-2">
						{hasDiscount && (
							<span className="text-2xl text-muted-foreground line-through">
								{price}₽
							</span>
						)}
						<span className="text-4xl font-bold">{displayPrice}₽</span>
						<span className="text-muted-foreground">/мес</span>
					</div>
					{hasDiscount && (
						<p className="text-sm text-muted-foreground mt-1">
							Экономия {price - displayPrice}₽/мес для первых 500 клиентов
						</p>
					)}
				</div>

				{/* Limits */}
				<div className="space-y-2 mb-6 pb-6 border-b">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Проекты</span>
						<span className="font-medium">
							{maxActiveProjects === null ? 'Без ограничений' : maxActiveProjects}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Участники</span>
						<span className="font-medium">{maxMembers}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Хранилище</span>
						<span className="font-medium">{storageGB} ГБ</span>
					</div>
				</div>

				{/* Features */}
				<ul className="space-y-3 mb-6">
					{features.map((feature, index) => (
						<li key={index} className="flex items-start gap-2">
							<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
							<span className="text-sm">{feature}</span>
						</li>
					))}
				</ul>

				{/* CTA Button */}
				<Button
					onClick={onSelect}
					disabled={disabled || isCurrentPlan}
					className="w-full"
					variant={isCurrentPlan ? 'outline' : 'default'}
				>
					{isCurrentPlan ? 'Текущий план' : 'Выбрать план'}
				</Button>

				{/* Trial Notice */}
				{!isCurrentPlan && (
					<p className="text-xs text-center text-muted-foreground mt-3">
						14 дней бесплатно, карта не требуется
					</p>
				)}
			</div>
		</Card>
	)
}
