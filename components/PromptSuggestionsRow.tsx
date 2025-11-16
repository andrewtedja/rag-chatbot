interface PromptSuggestionsRowProps {
	onPromptClick?: (prompt: string) => void;
}

export const PromptSuggestionsRow = ({
	onPromptClick,
}: PromptSuggestionsRowProps) => {
	const prompts = [
		"Ada jurusan apa aja di ITB?",
		"Ceritain dong kampus-kampus yang ada di ITB",
		"Rektor ITB sekarang siapa ya?",
		"Untuk daftar ITB, requirementsnya apa saja?",
	];

	return (
		<div className="w-full flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
			{prompts.map((prompt, index) => (
				<button
					key={index}
					onClick={() => onPromptClick?.(prompt)}
					className="
            px-5 py-3
            bg-white dark:bg-gray-800
            border-2 border-blue-200 dark:border-gray-600
            rounded-2xl 
            text-sm text-gray-700 dark:text-gray-200
            font-medium
            shadow-md
            hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50
            dark:hover:from-gray-700 dark:hover:to-gray-700
            hover:border-blue-400 dark:hover:border-blue-500
            hover:shadow-lg
            hover:scale-105
            transition-all duration-200 
            active:scale-95
            cursor-pointer
          "
				>
					{prompt}
				</button>
			))}
		</div>
	);
};
