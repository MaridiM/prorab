"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
	createProjectSchema,
	updateProjectSchema,
	type CreateProjectInput,
	type UpdateProjectInput,
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
	DatePicker,
} from "../ui"

export interface ProjectFormProps {
	mode: "create" | "edit"
	teamId?: string
	defaultValues?: Partial<UpdateProjectInput>
	onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void | Promise<void>
	onCancel?: () => void
	isSubmitting?: boolean
	submitLabel?: string
	cancelLabel?: string
}

const ProjectForm: React.FC<ProjectFormProps> = ({
	mode,
	teamId,
	defaultValues,
	onSubmit,
	onCancel,
	isSubmitting = false,
	submitLabel,
	cancelLabel = "Отмена",
}) => {
	const schema = mode === "create" ? createProjectSchema : updateProjectSchema

	const form = useForm<CreateProjectInput | UpdateProjectInput>({
		resolver: zodResolver(schema),
		mode: "onChange",
		defaultValues:
			mode === "create"
				? {
						teamId: teamId || "",
						name: "",
						address: "",
						description: "",
						budget: undefined,
						clientPhone: "",
						startDate: undefined,
						endDate: undefined,
						notes: "",
					}
				: defaultValues,
	})

	const handleSubmit = async (data: CreateProjectInput | UpdateProjectInput) => {
		await onSubmit(data)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Название проекта */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Название проекта
								{mode === "create" && <span className="text-red-500">*</span>}
							</FormLabel>
							<FormControl>
								<Input
									placeholder="Например: Ремонт квартиры на ул. Пушкина"
									disabled={isSubmitting}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Адрес */}
				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Адрес объекта</FormLabel>
							<FormControl>
								<Input
									placeholder="ул. Пушкина, д. 12, кв. 34"
									disabled={isSubmitting}
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Описание */}
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Описание проекта</FormLabel>
							<FormControl>
								<textarea
									placeholder="Краткое описание работ и особенностей проекта"
									disabled={isSubmitting}
									className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Бюджет и Телефон клиента в одной строке */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="budget"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Бюджет (₽)</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="0"
										disabled={isSubmitting}
										{...field}
										value={field.value ?? ""}
										onChange={e => {
											const value = e.target.value
											field.onChange(value === "" ? undefined : Number(value))
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="clientPhone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Телефон клиента</FormLabel>
								<FormControl>
									<Input
										type="tel"
										placeholder="+7 (999) 123-45-67"
										disabled={isSubmitting}
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Даты */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="startDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Дата начала</FormLabel>
								<FormControl>
									<DatePicker
										value={field.value}
										onChange={field.onChange}
										disabled={isSubmitting}
										placeholder="Выберите дату начала"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="endDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Дата завершения</FormLabel>
								<FormControl>
									<DatePicker
										value={field.value}
										onChange={field.onChange}
										disabled={isSubmitting}
										placeholder="Выберите дату завершения"
										minDate={form.watch("startDate") || undefined}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{/* Заметки */}
				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Заметки</FormLabel>
							<FormControl>
								<textarea
									placeholder="Дополнительные заметки и комментарии"
									disabled={isSubmitting}
									className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Кнопки */}
				<div className="flex gap-3 justify-end">
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}
						>
							{cancelLabel}
						</Button>
					)}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Сохранение...
							</>
						) : (
							submitLabel ||
							(mode === "create" ? "Создать проект" : "Сохранить изменения")
						)}
					</Button>
				</div>
			</form>
		</Form>
	)
}

export { ProjectForm }
