/**
 * Script to generate updates.json from CHANGELOG files
 * 
 * This script parses frontend and backend CHANGELOG files
 * and generates a JSON file with update data for the UpdatesView component
 */

import * as fs from 'fs'
import * as path from 'path'
import { parseChangelog, mergeChangelogs } from '../src/packages/utils/changelog-parser'

// Пути относительно корня проекта (apps/web находится в корне)
const PROJECT_ROOT = path.resolve(__dirname, '../../..')
const CHANGELOG_FRONTEND_PATH = path.join(PROJECT_ROOT, 'docs/changelog.frontend.md')
const CHANGELOG_BACKEND_PATH = path.join(PROJECT_ROOT, 'docs/changelog.backend.md')
const OUTPUT_PATH = path.join(__dirname, '../src/packages/data/updates.json')

// Иконки для разных типов обновлений
const getIconForType = (title: string, type: string): string => {
	const titleLower = title.toLowerCase()
	
	if (titleLower.includes('донат') || titleLower.includes('donation')) {
		return 'Gift'
	}
	if (titleLower.includes('telegram')) {
		return 'MessageCircle'
	}
	if (titleLower.includes('подписк') || titleLower.includes('subscription')) {
		return 'CreditCard'
	}
	if (titleLower.includes('безопасност') || titleLower.includes('security')) {
		return 'Shield'
	}
	if (titleLower.includes('уведомлен') || titleLower.includes('notification')) {
		return 'Bell'
	}
	if (titleLower.includes('проект') || titleLower.includes('project')) {
		return 'FolderKanban'
	}
	if (titleLower.includes('команд') || titleLower.includes('team')) {
		return 'Users'
	}
	
	return 'Sparkles'
}

// Цвета для разных типов обновлений
const getColorForType = (title: string, type: string): { color: string; bg: string } => {
	const titleLower = title.toLowerCase()
	
	if (titleLower.includes('донат') || titleLower.includes('donation')) {
		return { color: 'text-pink-500', bg: 'bg-pink-500/10' }
	}
	if (titleLower.includes('telegram')) {
		return { color: 'text-blue-500', bg: 'bg-blue-500/10' }
	}
	if (titleLower.includes('подписк') || titleLower.includes('subscription')) {
		return { color: 'text-green-500', bg: 'bg-green-500/10' }
	}
	if (titleLower.includes('безопасност') || titleLower.includes('security')) {
		return { color: 'text-red-500', bg: 'bg-red-500/10' }
	}
	if (titleLower.includes('уведомлен') || titleLower.includes('notification')) {
		return { color: 'text-purple-500', bg: 'bg-purple-500/10' }
	}
	
	return { color: 'text-amber-500', bg: 'bg-amber-500/10' }
}

function main() {
	console.log('📝 Generating updates.json from CHANGELOG files...')
	
	// Читаем CHANGELOG файлы
	const frontendContent = fs.readFileSync(CHANGELOG_FRONTEND_PATH, 'utf-8')
	const backendContent = fs.readFileSync(CHANGELOG_BACKEND_PATH, 'utf-8')
	
	// Парсим CHANGELOG файлы
	const frontendEntries = parseChangelog(frontendContent)
	const backendEntries = parseChangelog(backendContent)
	
	// Объединяем записи
	const mergedEntries = mergeChangelogs(frontendEntries, backendEntries)
	
	// Преобразуем в формат для UpdatesView
	const updates = mergedEntries.slice(0, 10).map(entry => ({
		version: entry.version,
		date: entry.date,
		title: entry.title,
		description: entry.description,
		features: entry.features,
		icon: getIconForType(entry.title, entry.type),
		...getColorForType(entry.title, entry.type)
	}))
	
	// Создаем директорию если её нет
	const outputDir = path.dirname(OUTPUT_PATH)
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}
	
	// Записываем JSON файл
	fs.writeFileSync(
		OUTPUT_PATH,
		JSON.stringify(updates, null, 2),
		'utf-8'
	)
	
	console.log(`✅ Generated ${updates.length} updates in ${OUTPUT_PATH}`)
	console.log(`   Latest version: ${updates[0]?.version}`)
}

main()

