/**
 * Changelog Parser Utility
 * 
 * Парсит CHANGELOG файлы и извлекает данные об обновлениях
 * для отображения на странице "История обновлений"
 */

export interface ChangelogEntry {
	version: string
	date: string
	title: string
	description: string
	features: string[]
	type: 'major' | 'minor' | 'patch'
}

/**
 * Парсит CHANGELOG markdown файл и извлекает записи об обновлениях
 */
export function parseChangelog(content: string): ChangelogEntry[] {
	const entries: ChangelogEntry[] = []
	
	// Регулярное выражение для поиска заголовков версий
	// Формат: ## [версия] - дата - название
	const versionRegex = /^## \[([\d.]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})\s*-\s*(.+)$/gm
	
	// Разделяем файл на секции по версиям
	const sections = content.split(/^## \[/gm)
	
	for (let i = 1; i < sections.length; i++) {
		const section = '## [' + sections[i]
		const match = section.match(/^## \[([\d.]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})\s*-\s*(.+)$/m)
		
		if (!match) continue
		
		const [, version, date, title] = match
		
		// Определяем тип версии
		const versionParts = version.split('.')
		const major = parseInt(versionParts[0] || '0')
		const minor = parseInt(versionParts[1] || '0')
		const patch = parseInt(versionParts[2] || '0')
		
		let type: 'major' | 'minor' | 'patch' = 'patch'
		if (major > 0 && minor === 0 && patch === 0) {
			type = 'major'
		} else if (patch === 0) {
			type = 'minor'
		}
		
		// Извлекаем список фич из секции "### Added"
		const addedMatch = section.match(/### Added\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
		const features: string[] = []
		
		if (addedMatch) {
			const addedContent = addedMatch[1]
			// Ищем пункты списка, начинающиеся с "-" или "*"
			const featureMatches = addedContent.match(/^[-*]\s+(.+)$/gm)
			if (featureMatches) {
				features.push(...featureMatches.map(m => {
					let feature = m.replace(/^[-*]\s+/, '').trim()
					// Извлекаем только название фичи (до первого двоеточия или точки)
					const match = feature.match(/^\*\*([^*]+)\*\*:\s*(.+)$/)
					if (match) {
						// Если есть формат "**Название**: описание", берем только название
						feature = match[1].trim()
					} else {
						// Убираем markdown разметку
						feature = feature
							.replace(/\*\*([^*]+)\*\*/g, '$1') // Убираем жирный текст
							.replace(/`([^`]+)`/g, '$1') // Убираем код
							.split(':')[0] // Берем только до двоеточия
							.split('.')[0] // Берем только до точки
							.trim()
					}
					return feature
				}))
			}
		}
		
		// Если нет фич в Added, ищем в других секциях
		if (features.length === 0) {
			const fixedMatch = section.match(/### Fixed\s*\n([\s\S]*?)(?=\n###|\n##|$)/i)
			if (fixedMatch) {
				const fixedContent = fixedMatch[1]
				const featureMatches = fixedContent.match(/^[-*]\s+(.+)$/gm)
				if (featureMatches) {
					features.push(...featureMatches.slice(0, 3).map(m => {
						let feature = m.replace(/^[-*]\s+/, '').trim()
						feature = feature
							.replace(/\*\*([^*]+)\*\*/g, '$1')
							.replace(/`([^`]+)`/g, '$1')
							.split(':')[0]
							.split('.')[0]
							.trim()
						return feature
					}))
				}
			}
		}
		
		// Ограничиваем количество фич до 5
		const limitedFeatures = features.slice(0, 5)
		
		// Извлекаем описание (первый параграф после заголовка, но до секций)
		// Ищем текст между заголовком версии и первой секцией ###
		const descriptionMatch = section.match(/\n\n([^#]+?)(?=\n###|\n##|$)/s)
		let description = descriptionMatch 
			? descriptionMatch[1].trim()
				.replace(/\n/g, ' ')
				.replace(/\*\*/g, '') // Убираем жирный текст
				.replace(/`([^`]+)`/g, '$1') // Убираем код
				.replace(/\s+/g, ' ') // Убираем лишние пробелы
				.substring(0, 200)
			: ''
		
		// Если описание пустое, используем первую фичу как описание
		if (!description && limitedFeatures.length > 0) {
			description = limitedFeatures[0].replace(/\*\*/g, '').replace(/`([^`]+)`/g, '$1').substring(0, 200)
		}
		
		// Форматируем дату для отображения
		const dateObj = new Date(date)
		const formattedDate = dateObj.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
		
		entries.push({
			version: `v${version}`,
			date: formattedDate,
			title: title.trim(),
			description: description || (limitedFeatures.length > 0 ? limitedFeatures[0] : `Обновление версии ${version}`),
			features: limitedFeatures,
			type
		})
	}
	
	// Сортируем по дате (новые сверху)
	return entries.sort((a, b) => {
		const dateA = new Date(a.date.split(' ').reverse().join('-'))
		const dateB = new Date(b.date.split(' ').reverse().join('-'))
		return dateB.getTime() - dateA.getTime()
	})
}

/**
 * Объединяет данные из frontend и backend CHANGELOG
 */
export function mergeChangelogs(
	frontendEntries: ChangelogEntry[],
	backendEntries: ChangelogEntry[]
): ChangelogEntry[] {
	const merged: Map<string, ChangelogEntry> = new Map()
	
	// Добавляем записи из frontend
	for (const entry of frontendEntries) {
		const key = entry.version
		if (!merged.has(key)) {
			merged.set(key, { ...entry })
		} else {
			// Объединяем фичи если версия уже есть
			const existing = merged.get(key)!
			existing.features = [...existing.features, ...entry.features].slice(0, 5)
		}
	}
	
	// Добавляем записи из backend
	for (const entry of backendEntries) {
		const key = entry.version
		if (!merged.has(key)) {
			merged.set(key, { ...entry })
		} else {
			// Объединяем фичи если версия уже есть
			const existing = merged.get(key)!
			existing.features = [...existing.features, ...entry.features].slice(0, 5)
		}
	}
	
	// Возвращаем отсортированный массив
	return Array.from(merged.values()).sort((a, b) => {
		const dateA = new Date(a.date.split(' ').reverse().join('-'))
		const dateB = new Date(b.date.split(' ').reverse().join('-'))
		return dateB.getTime() - dateA.getTime()
	})
}

