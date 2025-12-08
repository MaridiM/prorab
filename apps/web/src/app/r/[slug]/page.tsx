import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicPhotoReportDocument } from '@/packages/api/graphql/__generated__/output'
import { getClient } from '@/packages/libs/apollo/apollo-client.config'
import { PublicReportView } from './PublicReportView'

interface PageProps {
	params: { slug: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const client = getClient()

	try {
		const { data } = await client.query({
			query: PublicPhotoReportDocument,
			variables: { slug: params.slug },
		})

		if (!data) {
			return {
				title: 'Фотоотчёт не найден',
			}
		}

		const report = data.publicPhotoReport
		const firstPhoto = report.photos[0]

		return {
			title: `${report.title} - ${report.project.name}`,
			description: report.description || `Фотоотчёт по проекту ${report.project.name}`,
			openGraph: {
				title: report.title,
				description: report.description || undefined,
				images: firstPhoto ? [firstPhoto.photoUrl] : [],
				type: 'article',
			},
			twitter: {
				card: 'summary_large_image',
				title: report.title,
				description: report.description || undefined,
				images: firstPhoto ? [firstPhoto.photoUrl] : [],
			},
		}
	} catch {
		return {
			title: 'Фотоотчёт не найден',
		}
	}
}

export default async function PublicPhotoReportPage({ params }: PageProps) {
	const client = getClient()

	try {
		const { data } = await client.query({
			query: PublicPhotoReportDocument,
			variables: { slug: params.slug },
			fetchPolicy: 'no-cache', // Always fetch fresh data for view count
		})

		if (!data) {
			notFound()
		}

		return <PublicReportView report={data.publicPhotoReport as any} />
	} catch (error) {
		notFound()
	}
}
