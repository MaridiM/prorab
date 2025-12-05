"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
	createExpenseSchema,
	updateExpenseSchema,
	EXPENSE_CATEGORIES,
	type CreateExpenseInput,
	type UpdateExpenseInput,
} from "@/packages/schemas"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui"

export interface ExpenseFormProps {
	mode: "create" | "edit"
	projectId?: string
	defaultValues?: any
	onSubmit: (data: any) => void | Promise<void>
	onCancel?: () => void
	isSubmitting?: boolean
	submitLabel?: string
	cancelLabel?: string
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
	mode,
	projectId,
	defaultValues,
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel,
	cancelLabel = "Отмена",
}) => {
	const schema = mode === "create" ? createExpenseSchema : updateExpenseSchema

	const form = useForm<any>({
		resolver: zodResolver(schema) as any,
		mode: "onChange",
		defaultValues:
			mode === "create"
				? {
						projectId: projectId || "",
						amount: 0,
						category: "Материалы",
						photos: [],
						comment: "",
						paidByClient: false,
					}
				: defaultValues,
	})

	const handleSubmit = async (data: any) => {
		await onSubmit(data)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Сумма расхода */}
				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Сумма расхода
								<span className="text-red-500">*</span>
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.01"
									min="0.01"
									placeholder="Например: 5000"
									disabled={isSubmitting}
									{...field}
									onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Категория */}
				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Категория
								<span className="text-red-500">*</span>
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger disabled={isSubmitting}>
										<SelectValue placeholder="Выберите категорию" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{EXPENSE_CATEGORIES.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Комментарий */}
				<FormField
					control={form.control}
					name="comment"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Комментарий</FormLabel>
							<FormControl>
								<Input
									placeholder="Опишите расход (необязательно)"
									disabled={isSubmitting}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Оплачено клиентом */}
				<FormField
					control={form.control}
					name="paidByClient"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
							<FormControl>
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-gray-300"
									checked={field.value}
									onChange={field.onChange}
									disabled={isSubmitting}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>Оплачено клиентом</FormLabel>
								<p className="text-sm text-muted-foreground">
									Отметьте, если расход оплачен заказчиком
								</p>
							</div>
						</FormItem>
					)}
				/>

				{/* Кнопки действий */}
				<div className="flex gap-3">
					<Button type="submit" disabled={isSubmitting} className="flex-1">
						{isSubmitting ? "Сохранение..." : submitLabel || (mode === "create" ? "Добавить расход" : "Сохранить")}
					</Button>
					{onCancel && (
						<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
							{cancelLabel}
						</Button>
					)}
				</div>
			</form>
		</Form>
	)
}

export { ExpenseForm }
