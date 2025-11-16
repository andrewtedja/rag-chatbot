import { Message } from "ai";
import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";

interface BubbleProps {
	message: Message;
}

export const Bubble = ({ message }: BubbleProps) => {
	const isUser = message.role === "user";
	if (!message?.content?.trim()) return null;

	return (
		<div
			className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
		>
			<div
				className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
					isUser
						? "bg-indigo-400 text-white border border-gray-200"
						: "bg-white dark:bg-gray-700 border-2 border-blue-100 dark:border-gray-600"
				}`}
			>
				{isUser ? (
					<span className="font-bold text-sm">You</span>
				) : (
					<Image
						src={rogaLogo}
						alt="Roga"
						width={40}
						height={40}
						className="rounded-full"
					/>
				)}
			</div>

			<div
				className={`
          relative max-w-xl px-5 py-3.5 rounded-2xl shadow-md
          ${
				isUser
					? "bg-white text-gray-900 border border-gray-200 rounded-br-md"
					: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-blue-100 dark:border-gray-700"
			}
        `}
			>
				<p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
					{message.content}
				</p>
			</div>
		</div>
	);
};
