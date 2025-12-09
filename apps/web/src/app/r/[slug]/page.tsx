import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicPhotoReportDocument } from '@/packages/api/graphql/__generated__/output'
import { getServerClient } from '@/packages/libs/apollo/apollo-server-client.config'
import { PublicReportView } from './PublicReportView'

interface PageProps {
	params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params
	const client = getServerClient()

	try {
		const { data } = await client.query({
			query: PublicPhotoReportDocument,
			variables: { slug },
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

// ISR configuration: revalidate every 60 seconds
export const revalidate = 60;

export default async function PublicPhotoReportPage({ params }: PageProps) {
	const { slug } = await params
	const client = getServerClient()

	try {
		const { data } = await client.query({
			query: PublicPhotoReportDocument,
			variables: { slug },
		})

		if (!data || !data.publicPhotoReport) {
			notFound()
		}

		return <PublicReportView report={data.publicPhotoReport as any} />
	} catch (error) {
		console.error('[PublicPhotoReportPage] Error fetching report:', error);
		notFound()
	}
}
