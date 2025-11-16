import Image from "next/image";
import rogaLogo from "@/public/assets/roga-mascot.png";

const Navbar = () => (
	<nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-blue-100 dark:border-gray-700 shadow-sm">
		<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<Image
					src={rogaLogo}
					alt="Roga Logo"
					width={40}
					height={40}
					className="rounded-full"
				/>
				<h1 className="text-2xl font-bold text-foreground bg-clip-text">
					ITB RAG Chatbot
				</h1>
			</div>
			<h2 className="text-sm text-gray-600 dark:text-gray-400">
				By Andrew Tedjapratama @ 2025
			</h2>
		</div>
	</nav>
);

export default Navbar;
