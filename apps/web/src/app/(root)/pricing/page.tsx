'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { ArrowRight, Check, Sparkles, Globe } from 'lucide-react'
import { PlanCard } from '@/packages/components'
import { Button } from '@/packages/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/packages/components/ui/select'
import { GetAvailablePlansDocument } from '@/packages/api/graphql/__generated__/output'

const CURRENCIES = [
	{ code: 'RUB', symbol: '₽', name: 'Российский рубль' },
	{ code: 'USD', symbol: '$', name: 'Доллар США' },
	{ code: 'EUR', symbol: '€', name: 'Евро' },
]

const FAQ_ITEMS = [
	{
		question: 'Есть ли бесплатный триал?',
		answer: 'Да! Все тарифы включают 14-дневный бесплатный триал. Карта не требуется при регистрации.',
	},
	{
		question: 'Что такое Early Bird цена?',
		answer: 'Первые 500 клиентов получают специальную скидку 200-500₽/мес навсегда. Успейте зафиксировать выгодную цену!',
	},
	{
		question: 'Можно ли сменить тариф?',
		answer: 'Да, вы можете в любой момент улучшить или понизить тариф. При улучшении изменения вступают сразу, при понижении — с начала следующего периода.',
	},
	{
		question: 'Как происходит оплата?',
		answer: 'Оплата производится через YooKassa (ЮKassa) — безопасный платёжный шлюз. Принимаем карты, СБП, электронные кошельки.',
	},
	{
		question: 'Что если превышу лимиты?',
		answer: 'При достижении лимита вы получите уведомление с предложением улучшить тариф. Существующие данные сохранятся, но добавление новых будет ограничено.',
	},
	{
		question: 'Можно ли отменить подписку?',
		answer: 'Да, подписку можно отменить в любой момент. Доступ сохранится до конца оплаченного периода.',
	},
]

export default function PricingPage() {
	const [selectedCurrency, setSelectedCurrency] = useState('RUB')

	const { data, loading } = useQuery(GetAvailablePlansDocument, {
		variables: {
			currency: selectedCurrency,
		},
	})

	const plans = data?.availablePlans || []
	const currentCurrency = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0]

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: selectedCurrency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)
	}

	const getFeaturesList = (plan: any) => {
		const features: string[] = []

		if (plan.maxActiveProjects === null) {
			features.push('Безлимитные проекты')
		} else {
			features.push(`${plan.maxActiveProjects} активн${plan.maxActiveProjects === 1 ? 'ый проект' : 'ых проекта'}`)
		}

		features.push(`До ${plan.maxMembers} участник${plan.maxMembers === 1 ? 'а' : 'ов'} команды`)
		features.push(`${plan.storageGB} ГБ хранилища`)

		plan.features
			.filter((f: any) => f.isIncluded)
			.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
			.forEach((f: any) => {
				features.push(f.name)
			})

		return features
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
			{/* Header */}
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						ProRab.space
					</Link>
					<div className="flex items-center gap-4">
						<Link href="/auth/signin">
							<Button variant="ghost">Войти</Button>
						</Link>
						<Link href="/auth/signup">
							<Button>Начать бесплатно</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16 text-center">
				<div className="max-w-3xl mx-auto">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-sm font-medium mb-6">
						<Sparkles className="h-4 w-4" />
						Early Bird: Скидка до 500₽/мес для первых 500 клиентов
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
						Простые и честные тарифы
					</h1>
					<p className="text-xl text-muted-foreground mb-8">
						Выберите план, который подходит вашему бизнесу.
						<br />
						14 дней бесплатно, карта не требуется.
					</p>

					{/* Currency Selector */}
					<div className="flex items-center justify-center gap-3">
						<Globe className="h-5 w-5 text-muted-foreground" />
						<Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Выберите валюту" />
							</SelectTrigger>
							<SelectContent>
								{CURRENCIES.map((currency) => (
									<SelectItem key={currency.code} value={currency.code}>
										{currency.symbol} {currency.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="container mx-auto px-4 pb-16">
				{loading ? (
					<div className="text-center py-12">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
						<p className="text-muted-foreground mt-4">Загрузка тарифов...</p>
					</div>
				) : (
					<div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
						{plans.map((plan) => {
							const planPrice = plan.prices.find((p) => p.currency === selectedCurrency)
							if (!planPrice) return null

							return (
								<div key={plan.id} className="relative">
									{plan.isPopular && (
										<div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
											<div className="px-4 py-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium rounded-full">
												Популярный
											</div>
										</div>
									)}
									<PlanCard
										name={plan.name}
										price={planPrice.price}
										earlyBirdPrice={planPrice.earlyBirdPrice}
										maxActiveProjects={plan.maxActiveProjects}
										maxMembers={plan.maxMembers}
										storageGB={plan.storageGB}
										features={getFeaturesList(plan)}
										isEarlyBird={plan.isEarlyBird}
										onSelect={() => {
											window.location.href = '/auth/signup'
										}}
									/>
								</div>
							)
						})}
					</div>
				)}
			</section>

			{/* Feature Comparison */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-12">Сравнение функций</h2>
					{loading ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Загрузка...</p>
						</div>
					) : (
						<div className="bg-card rounded-lg border overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b bg-muted/50">
											<th className="text-left p-4 font-semibold min-w-[200px]">Функция</th>
											{plans.map((plan) => (
												<th key={plan.id} className="text-center p-4 font-semibold min-w-[120px]">
													{plan.name}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										<tr className="border-b">
											<td className="p-4 font-medium">Активные проекты</td>
											{plans.map((plan) => (
												<td key={plan.id} className="p-4 text-center">
													{plan.maxActiveProjects === null ? 'Без лимита' : plan.maxActiveProjects}
												</td>
											))}
										</tr>
										<tr className="border-b">
											<td className="p-4 font-medium">Участники команды</td>
											{plans.map((plan) => (
												<td key={plan.id} className="p-4 text-center">
													{plan.maxMembers}
												</td>
											))}
										</tr>
										<tr className="border-b">
											<td className="p-4 font-medium">Хранилище</td>
											{plans.map((plan) => (
												<td key={plan.id} className="p-4 text-center">
													{plan.storageGB} ГБ
												</td>
											))}
										</tr>
										{plans[0]?.features.map((feature: any, index: number) => (
											<tr key={feature.id} className="border-b last:border-0">
												<td className="p-4 font-medium">{feature.name}</td>
												{plans.map((plan) => {
													const planFeature = plan.features[index]
													return (
														<td key={plan.id} className="p-4 text-center">
															{planFeature?.isIncluded ? (
																<Check className="h-5 w-5 text-green-500 mx-auto" />
															) : (
																'—'
															)}
														</td>
													)
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* FAQ Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-12">Частые вопросы</h2>
					<div className="space-y-6">
						{FAQ_ITEMS.map((item, index) => (
							<div key={index} className="bg-card rounded-lg border p-6">
								<h3 className="font-semibold text-lg mb-2">{item.question}</h3>
								<p className="text-muted-foreground">{item.answer}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-primary-foreground">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Готовы начать?
					</h2>
					<p className="text-xl mb-8 opacity-90">
						Присоединяйтесь к сотням прорабов, которые уже управляют проектами с ProRab.space
					</p>
					<Link href="/auth/signup">
						<Button size="lg" variant="secondary" className="text-lg px-8">
							Начать 14-дневный триал
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<p className="text-sm mt-4 opacity-75">
						Карта не требуется • Отменить можно в любой момент
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t bg-muted/30 py-8">
				<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
					<p>© 2025 ProRab.space. Все права защищены.</p>
					<div className="flex justify-center gap-6 mt-4">
						<Link href="/terms" className="hover:text-foreground transition-colors">
							Условия использования
						</Link>
						<Link href="/privacy" className="hover:text-foreground transition-colors">
							Политика конфиденциальности
						</Link>
						<Link href="/support" className="hover:text-foreground transition-colors">
							Поддержка
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}
