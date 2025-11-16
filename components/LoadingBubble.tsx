import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";

export const LoadingBubble = () => {
	return (
		<div className="flex gap-3">
			<div className="shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-700 border-2 border-blue-100 dark:border-gray-600 flex items-center justify-center shadow-md">
				<Image
					src={rogaLogo}
					alt="Roga"
					width={40}
					height={40}
					className="rounded-full"
				/>
			</div>

			<div className="relative max-w-xl px-5 py-3.5 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 shadow-md">
				<div className="flex gap-1.5 items-center">
					<span
						className="w-2.5 h-2.5 bg-indigo-400 dark:indigo-300 rounded-full animate-bounce"
						style={{
							animationDelay: "0ms",
							animationDuration: "1s",
						}}
					></span>
					<span
						className="w-2.5 h-2.5 bg-indigo-400 dark:indigo-300 rounded-full animate-bounce"
						style={{
							animationDelay: "150ms",
							animationDuration: "1s",
						}}
					></span>
					<span
						className="w-2.5 h-2.5 bg-indigo-400 dark:indigo-300 rounded-full animate-bounce"
						style={{
							animationDelay: "300ms",
							animationDuration: "1s",
						}}
					></span>
				</div>
			</div>
		</div>
	);
};
