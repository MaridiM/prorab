import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { PlanCard } from '@/packages/components'
import { Button } from '@/packages/components/ui/button'

export const metadata: Metadata = {
	title: 'Тарифы | ProRab.space',
	description: 'Выберите подходящий тариф для управления строительными проектами. 14 дней бесплатно, карта не требуется.',
}

const PLANS = [
	{
		id: 'LITE',
		name: 'Лайт',
		price: 490,
		earlyBirdPrice: 290,
		maxActiveProjects: 1,
		maxMembers: 1,
		storageGB: 0.5,
		features: [
			'1 активный проект',
			'1 участник команды',
			'500 МБ хранилища',
			'Базовый функционал',
			'Email поддержка',
		],
		popular: false,
	},
	{
		id: 'FOREMAN',
		name: 'Прораб',
		price: 990,
		earlyBirdPrice: 690,
		maxActiveProjects: 4,
		maxMembers: 3,
		storageGB: 2,
		features: [
			'До 4 активных проектов',
			'До 3 участников команды',
			'2 ГБ хранилища',
			'Расчёты зарплаты',
			'Фотоотчёты с публичными ссылками',
			'Priority email поддержка',
		],
		popular: true,
	},
	{
		id: 'BRIGADE',
		name: 'Бригада',
		price: 1990,
		earlyBirdPrice: 1490,
		maxActiveProjects: null,
		maxMembers: 10,
		storageGB: 10,
		features: [
			'Безлимитные проекты',
			'До 10 участников команды',
			'10 ГБ хранилища',
			'Все функции платформы',
			'API доступ',
			'Dedicated support',
			'Кастомизация',
		],
		popular: false,
	},
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
				</div>
			</section>

			{/* Pricing Cards */}
			<section className="container mx-auto px-4 pb-16">
				<div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
					{PLANS.map((plan) => (
						<div key={plan.id} className="relative">
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
									<div className="px-4 py-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium rounded-full">
										Популярный
									</div>
								</div>
							)}
							<PlanCard
								name={plan.name}
								price={plan.price}
								earlyBirdPrice={plan.earlyBirdPrice}
								maxActiveProjects={plan.maxActiveProjects}
								maxMembers={plan.maxMembers}
								storageGB={plan.storageGB}
								features={plan.features}
								isEarlyBird={true}
								onSelect={() => {
									window.location.href = '/auth/signup'
								}}
							/>
						</div>
					))}
				</div>
			</section>

			{/* Feature Comparison */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-12">Сравнение функций</h2>
					<div className="bg-card rounded-lg border overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="text-left p-4 font-semibold">Функция</th>
									<th className="text-center p-4 font-semibold">Лайт</th>
									<th className="text-center p-4 font-semibold">Прораб</th>
									<th className="text-center p-4 font-semibold">Бригада</th>
								</tr>
							</thead>
							<tbody>
								{[
									{ feature: 'Активные проекты', lite: '1', foreman: '4', brigade: 'Без лимита' },
									{ feature: 'Участники команды', lite: '1', foreman: '3', brigade: '10' },
									{ feature: 'Хранилище', lite: '0.5 ГБ', foreman: '2 ГБ', brigade: '10 ГБ' },
									{ feature: 'Управление проектами', lite: true, foreman: true, brigade: true },
									{ feature: 'Учёт расходов', lite: true, foreman: true, brigade: true },
									{ feature: 'Расчёт зарплаты', lite: false, foreman: true, brigade: true },
									{ feature: 'Фотоотчёты', lite: false, foreman: true, brigade: true },
									{ feature: 'API доступ', lite: false, foreman: false, brigade: true },
									{ feature: 'Priority support', lite: false, foreman: true, brigade: true },
								].map((row, index) => (
									<tr key={index} className="border-b last:border-0">
										<td className="p-4 font-medium">{row.feature}</td>
										<td className="p-4 text-center">
											{typeof row.lite === 'boolean' ? (
												row.lite ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : '—'
											) : (
												row.lite
											)}
										</td>
										<td className="p-4 text-center">
											{typeof row.foreman === 'boolean' ? (
												row.foreman ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : '—'
											) : (
												row.foreman
											)}
										</td>
										<td className="p-4 text-center">
											{typeof row.brigade === 'boolean' ? (
												row.brigade ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : '—'
											) : (
												row.brigade
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
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
