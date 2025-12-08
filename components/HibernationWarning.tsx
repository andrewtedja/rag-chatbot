"use client";
import { X } from "lucide-react";
import { useState } from "react";

export const HibernationWarning = () => {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) return null;

	return (
		<div className="absolute left-12 flex items-start gap-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs">
			<p className="text-amber-800 dark:text-amber-200 flex-1">
				<strong>Note:</strong> Database hibernates setelah 48 jam inactive.
				Mohon menunggu 10-20 detik jika first load.
			</p>
			<button
				onClick={() => setIsVisible(false)}
				className="text-amber-600 cursor-pointer dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
				aria-label="Close warning"
			>
				<X size={16} />
			</button>
		</div>
	);
};
