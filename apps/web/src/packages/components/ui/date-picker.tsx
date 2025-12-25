"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale/ru"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/packages/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface DatePickerProps {
	value?: Date | null
	onChange?: (date: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	minDate?: Date
	maxDate?: Date
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
	(
		{
			value,
			onChange,
			placeholder = "Выберите дату",
			disabled = false,
			className,
			minDate,
			maxDate,
		},
		ref
	) => {
		return (
			<Popover>
				<PopoverTrigger asChild>
					<Button
						ref={ref}
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!value && "text-muted-foreground",
							className
						)}
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{value ? (
							format(value, "dd MMMM yyyy", { locale: ru })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={value || undefined}
						onSelect={onChange}
						disabled={
							minDate || maxDate
								? [
										...(minDate ? [{ before: minDate }] : []),
										...(maxDate ? [{ after: maxDate }] : []),
									]
								: undefined
						}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		)
	}
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
