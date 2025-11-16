import { Message } from "ai";

interface BubbleProps {
	message: Message;
}

export const Bubble = ({ message }: BubbleProps) => {
	const isUser = message.role === "user";

	return (
		<div
			className={`w-full flex mb-3 ${
				isUser ? "justify-end" : "justify-start"
			}`}
		>
			<div
				className={`
          max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed
          ${
				isUser
					? "bg-blue-600 text-white rounded-br-none"
					: "bg-gray-200 text-gray-900 rounded-bl-none"
			}
        `}
			>
				{message.content}
			</div>
		</div>
	);
};
