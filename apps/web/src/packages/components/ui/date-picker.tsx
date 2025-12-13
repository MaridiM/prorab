"use client"

import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale/ru"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/packages/utils"
import { Button } from "./button"

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
		const [isOpen, setIsOpen] = React.useState(false)
		const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
			value || undefined
		)
		const containerRef = React.useRef<HTMLDivElement>(null)

		// Закрывать календарь при клике вне компонента
		React.useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					containerRef.current &&
					!containerRef.current.contains(event.target as Node)
				) {
					setIsOpen(false)
				}
			}

			if (isOpen) {
				document.addEventListener("mousedown", handleClickOutside)
			}

			return () => {
				document.removeEventListener("mousedown", handleClickOutside)
			}
		}, [isOpen])

		// Синхронизировать внешнее значение
		React.useEffect(() => {
			setSelectedDate(value || undefined)
		}, [value])

		const handleSelect = (date: Date | undefined) => {
			setSelectedDate(date)
			onChange?.(date)
			setIsOpen(false)
		}

		const handleToggle = () => {
			if (!disabled) {
				setIsOpen(!isOpen)
			}
		}

		return (
			<div className={cn("relative", className)} ref={containerRef}>
				<Button
					ref={ref}
					type="button"
					variant="outline"
					onClick={handleToggle}
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal",
						!selectedDate && "text-muted-foreground/40"
					)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="mr-2"
					>
						<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
						<line x1="16" x2="16" y1="2" y2="6" />
						<line x1="8" x2="8" y1="2" y2="6" />
						<line x1="3" x2="21" y1="10" y2="10" />
					</svg>
					{selectedDate ? (
						format(selectedDate, "dd MMMM yyyy", { locale: ru })
					) : (
						<span>{placeholder}</span>
					)}
				</Button>

				{isOpen && (
					<div className="absolute top-full left-0 z-50 mt-2 rounded-md border bg-popover shadow-md">
						<DayPicker
							mode="single"
							selected={selectedDate}
							onSelect={handleSelect}
							locale={ru}
							disabled={
								minDate || maxDate
									? [
											...(minDate ? [{ before: minDate }] : []),
											...(maxDate ? [{ after: maxDate }] : []),
										]
									: undefined
							}
							className="p-3"
							classNames={{
								months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
								month: "space-y-4",
								caption: "flex justify-center pt-1 relative items-center",
								caption_label: "text-sm font-medium",
								nav: "space-x-1 flex items-center",
								nav_button: cn(
									"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
								),
								nav_button_previous: "absolute left-1",
								nav_button_next: "absolute right-1",
								table: "w-full border-collapse space-y-1",
								head_row: "flex",
								head_cell:
									"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
								row: "flex w-full mt-2",
								cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
								day: cn(
									"h-9 w-9 p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
								),
								day_range_end: "day-range-end",
								day_selected:
									"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
								day_today: "bg-accent text-accent-foreground",
								day_outside:
									"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
								day_disabled: "text-muted-foreground opacity-50",
								day_range_middle:
									"aria-selected:bg-accent aria-selected:text-accent-foreground",
								day_hidden: "invisible",
							}}
						/>
					</div>
				)}
			</div>
		)
	}
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
