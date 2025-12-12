'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Camera, X, Upload, Loader2, Trash2 } from 'lucide-react'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { UserAvatar } from '../ui/user-avatar'
import { useToast } from '../ui/use-toast'

// GraphQL Mutations
const UPLOAD_AVATAR = gql`
	mutation UploadAvatar($file: Upload!) {
		uploadAvatar(file: $file) {
			id
			avatarUrl
			fullName
			email
		}
	}
`

const DELETE_AVATAR = gql`
	mutation DeleteAvatar {
		deleteAvatar {
			id
			avatarUrl
			fullName
			email
		}
	}
`

interface AvatarUploadProps {
	user: {
		id: string
		fullName: string
		email: string
		avatarUrl?: string | null
	}
	onAvatarChange?: () => void
}

export function AvatarUpload({ user, onAvatarChange }: AvatarUploadProps) {
	const [showCropDialog, setShowCropDialog] = useState(false)
	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const [crop, setCrop] = useState<Crop>({
		unit: '%',
		width: 100,
		height: 100,
		x: 0,
		y: 0,
	})
	const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
	const imgRef = useRef<HTMLImageElement>(null)
	const { toast } = useToast()

	const [uploadAvatar, { loading: uploading }] = useMutation(UPLOAD_AVATAR, {
		onCompleted: () => {
			toast({
				title: 'Успех!',
				description: 'Аватар успешно загружен',
			})
			setShowCropDialog(false)
			setImageSrc(null)
			onAvatarChange?.()
		},
		onError: (error) => {
			toast({
				title: 'Ошибка',
				description: error.message || 'Не удалось загрузить аватар',
				variant: 'destructive',
			})
		},
		refetchQueries: ['Me'],
	})

	const [deleteAvatar, { loading: deleting }] = useMutation(DELETE_AVATAR, {
		onCompleted: () => {
			toast({
				title: 'Успех!',
				description: 'Аватар удалён',
			})
			onAvatarChange?.()
		},
		onError: (error) => {
			toast({
				title: 'Ошибка',
				description: error.message || 'Не удалось удалить аватар',
				variant: 'destructive',
			})
		},
		refetchQueries: ['Me'],
	})

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0]
		if (!file) return

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast({
				title: 'Ошибка',
				description: 'Можно загружать только изображения',
				variant: 'destructive',
			})
			return
		}

		// Validate file size (5MB max)
		const maxSize = 5 * 1024 * 1024
		if (file.size > maxSize) {
			toast({
				title: 'Ошибка',
				description: 'Размер файла не должен превышать 5 МБ',
				variant: 'destructive',
			})
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			setImageSrc(reader.result as string)
			setShowCropDialog(true)
		}
		reader.readAsDataURL(file)
	}, [toast])

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
		},
		multiple: false,
		maxSize: 5 * 1024 * 1024,
	})

	const getCroppedImg = useCallback(
		async (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')

			if (!ctx) {
				throw new Error('Canvas context not available')
			}

			const scaleX = image.naturalWidth / image.width
			const scaleY = image.naturalHeight / image.height

			canvas.width = pixelCrop.width
			canvas.height = pixelCrop.height

			ctx.drawImage(
				image,
				pixelCrop.x * scaleX,
				pixelCrop.y * scaleY,
				pixelCrop.width * scaleX,
				pixelCrop.height * scaleY,
				0,
				0,
				pixelCrop.width,
				pixelCrop.height
			)

			return new Promise((resolve, reject) => {
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('Canvas is empty'))
							return
						}
						resolve(blob)
					},
					'image/jpeg',
					0.95
				)
			})
		},
		[]
	)

	const handleSaveCrop = async () => {
		if (!completedCrop || !imgRef.current) {
			toast({
				title: 'Ошибка',
				description: 'Пожалуйста, выберите область для обрезки',
				variant: 'destructive',
			})
			return
		}

		try {
			const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
			const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })

			await uploadAvatar({
				variables: { file },
			})
		} catch (error) {
			console.error('Error cropping image:', error)
			toast({
				title: 'Ошибка',
				description: 'Не удалось обрезать изображение',
				variant: 'destructive',
			})
		}
	}

	const handleDelete = async () => {
		if (!user.avatarUrl) return

		try {
			await deleteAvatar()
		} catch (error) {
			console.error('Error deleting avatar:', error)
		}
	}

	return (
		<>
			<div className="flex flex-col sm:flex-row items-center gap-6">
				{/* Avatar Preview */}
				<div className="relative group">
					<UserAvatar user={user} size="xl" className="w-24 h-24 text-2xl" />

					{/* Hover Overlay */}
					<div
						{...getRootProps()}
						className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
					>
						<input {...getInputProps()} />
						<Camera className="w-8 h-8 text-white" />
					</div>
				</div>

				{/* Upload & Delete Buttons */}
				<div className="flex flex-col gap-3 flex-1">
					<div {...getRootProps()}>
						<input {...getInputProps()} />
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full sm:w-auto"
							disabled={uploading}
						>
							{uploading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Загрузка...
								</>
							) : isDragActive ? (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Отпустите файл
								</>
							) : (
								<>
									<Camera className="w-4 h-4 mr-2" />
									Загрузить фото
								</>
							)}
						</Button>
					</div>

					{user.avatarUrl && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
							onClick={handleDelete}
							disabled={deleting}
						>
							{deleting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Удаление...
								</>
							) : (
								<>
									<Trash2 className="w-4 h-4 mr-2" />
									Удалить фото
								</>
							)}
						</Button>
					)}

					<p className="text-xs text-muted-foreground">
						JPG, PNG, GIF или WebP. Максимум 5 МБ.
					</p>
				</div>
			</div>

			{/* Crop Dialog */}
			<Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Обрезать изображение</DialogTitle>
						<DialogDescription>
							Выберите область для вашего аватара
						</DialogDescription>
					</DialogHeader>

					<div className="max-h-[60vh] overflow-auto">
						{imageSrc && (
							<ReactCrop
								crop={crop}
								onChange={(c) => setCrop(c)}
								onComplete={(c) => setCompletedCrop(c)}
								aspect={1}
								circularCrop
							>
								<img
									ref={imgRef}
									src={imageSrc}
									alt="Crop preview"
									className="max-w-full"
								/>
							</ReactCrop>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowCropDialog(false)
								setImageSrc(null)
							}}
							disabled={uploading}
						>
							Отмена
						</Button>
						<Button onClick={handleSaveCrop} disabled={uploading}>
							{uploading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Загрузка...
								</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Сохранить
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
