import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import type { FAQEntry } from '../../../prisma/generated/client'

@Injectable()
export class FAQService {
	private readonly logger = new Logger(FAQService.name)

	constructor(private readonly prisma: PrismaService) {}

	// ==================== FAQ Search ====================

	/**
	 * Search FAQ by query using keyword matching
	 */
	async searchFAQ(query: string, limit = 5): Promise<FAQEntry[]> {
		const normalizedQuery = query.toLowerCase().trim()

		// Get all FAQs
		const allFaqs = await this.prisma.fAQEntry.findMany()

		// Score each FAQ based on keyword matches
		const scored = allFaqs.map((faq) => {
			let score = 0

			// Check if query matches question
			if (faq.question.toLowerCase().includes(normalizedQuery)) {
				score += 10
			}

			// Check if query matches keywords
			const queryWords = normalizedQuery.split(/\s+/)
			for (const queryWord of queryWords) {
				for (const keyword of faq.keywords) {
					if (keyword.toLowerCase().includes(queryWord)) {
						score += 3
					}
					if (queryWord.includes(keyword.toLowerCase())) {
						score += 2
					}
				}
			}

			// Check if query matches answer
			if (faq.answer.toLowerCase().includes(normalizedQuery)) {
				score += 1
			}

			return { faq, score }
		})

		// Filter and sort by score
		const results = scored
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map((item) => item.faq)

		this.logger.log(
			`FAQ search for "${query}" found ${results.length} results`,
		)

		return results
	}

	/**
	 * Get FAQs by category
	 */
	async getFAQsByCategory(category: string): Promise<FAQEntry[]> {
		return await this.prisma.fAQEntry.findMany({
			where: { category },
			orderBy: {
				views: 'desc',
			},
		})
	}

	/**
	 * Get all FAQ categories
	 */
	async getCategories(): Promise<string[]> {
		const faqs = await this.prisma.fAQEntry.findMany({
			select: {
				category: true,
			},
			distinct: ['category'],
		})

		return faqs.map((faq) => faq.category)
	}

	/**
	 * Get FAQ by ID
	 */
	async getFAQById(id: string): Promise<FAQEntry> {
		const faq = await this.prisma.fAQEntry.findUnique({
			where: { id },
		})

		if (!faq) {
			throw new NotFoundException(`FAQ #${id} not found`)
		}

		return faq
	}

	/**
	 * Get popular FAQs
	 */
	async getPopularFAQs(limit = 10): Promise<FAQEntry[]> {
		return await this.prisma.fAQEntry.findMany({
			orderBy: {
				views: 'desc',
			},
			take: limit,
		})
	}

	// ==================== FAQ Management ====================

	/**
	 * Create FAQ entry
	 */
	async createFAQ(data: {
		question: string
		answer: string
		category: string
		keywords: string[]
	}): Promise<FAQEntry> {
		this.logger.log(`Creating FAQ: ${data.question}`)

		return await this.prisma.fAQEntry.create({
			data: {
				question: data.question,
				answer: data.answer,
				category: data.category,
				keywords: data.keywords,
			},
		})
	}

	/**
	 * Update FAQ entry
	 */
	async updateFAQ(
		id: string,
		data: Partial<{
			question: string
			answer: string
			category: string
			keywords: string[]
		}>,
	): Promise<FAQEntry> {
		this.logger.log(`Updating FAQ #${id}`)

		return await this.prisma.fAQEntry.update({
			where: { id },
			data,
		})
	}

	/**
	 * Delete FAQ entry
	 */
	async deleteFAQ(id: string): Promise<void> {
		this.logger.log(`Deleting FAQ #${id}`)

		await this.prisma.fAQEntry.delete({
			where: { id },
		})
	}

	// ==================== Analytics ====================

	/**
	 * Increment view count
	 */
	async incrementViews(id: string): Promise<void> {
		await this.prisma.fAQEntry.update({
			where: { id },
			data: {
				views: {
					increment: 1,
				},
			},
		})
	}

	/**
	 * Mark FAQ as helpful or not helpful
	 */
	async markHelpful(id: string, helpful: boolean): Promise<void> {
		if (helpful) {
			await this.prisma.fAQEntry.update({
				where: { id },
				data: {
					helpful: {
						increment: 1,
					},
				},
			})
		} else {
			await this.prisma.fAQEntry.update({
				where: { id },
				data: {
					notHelpful: {
						increment: 1,
					},
				},
			})
		}
	}

	/**
	 * Get FAQ statistics
	 */
	async getFAQStats(id: string): Promise<{
		views: number
		helpful: number
		notHelpful: number
		helpfulRate: number
	}> {
		const faq = await this.getFAQById(id)

		const total = faq.helpful + faq.notHelpful
		const helpfulRate = total > 0 ? (faq.helpful / total) * 100 : 0

		return {
			views: faq.views,
			helpful: faq.helpful,
			notHelpful: faq.notHelpful,
			helpfulRate: Math.round(helpfulRate),
		}
	}
}
