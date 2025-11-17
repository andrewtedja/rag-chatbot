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
					className="px-5 py-3 rounded-2xl bg-card text-foreground border border-border shadow-md hover:bg-muted hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
				>
					{prompt}
				</button>
			))}
		</div>
	);
};
