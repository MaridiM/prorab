'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { DonationDialog } from './donation-dialog'
import { cn } from '@/packages/utils'

export function DonationFloatingButton() {
	const [showDialog, setShowDialog] = useState(false)

	return (
		<>
			{/* Floating Button */}
			<motion.div
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ delay: 1, type: 'spring', stiffness: 200 }}
				className="fixed bottom-24 right-6 z-40"
			>
				<motion.button
					onClick={() => setShowDialog(true)}
					className={cn(
						'relative w-14 h-14 rounded-full flex items-center justify-center',
						'text-white shadow-xl hover:shadow-2xl',
						'transition-all duration-300',
						'bg-gradient-to-br from-rose-500 to-red-600',
						'hover:from-rose-600 hover:to-red-700 hover:scale-105'
					)}
					whileTap={{ scale: 0.95 }}
					title="Поддержать разработку ProRab.space"
					aria-label="Поддержать разработку"
				>
					<Heart className="w-6 h-6 fill-current" />
					
					{/* Pulse effect */}
					<motion.div
						className="absolute inset-0 rounded-full bg-rose-500/30"
						animate={{ 
							scale: [1, 1.3, 1], 
							opacity: [0.5, 0, 0.5] 
						}}
						transition={{ 
							duration: 2, 
							repeat: Infinity,
							ease: "easeInOut"
						}}
					/>
				</motion.button>
			</motion.div>

			{/* Donation Dialog */}
			<DonationDialog open={showDialog} onOpenChange={setShowDialog} />
		</>
	)
}

