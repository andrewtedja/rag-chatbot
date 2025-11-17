import type { Metadata } from "next";
import { Sora } from "next/font/google";
// import { Providers } from "./provider";

import "./globals.css";

// const inter = Inter({
// 	subsets: ["latin"],
// 	variable: "--font-inter",
// });

// const spaceGrotesk = Space_Grotesk({
// 	subsets: ["latin"],
// 	variable: "--font-space-grotesk",
// });

const sora = Sora({
	subsets: ["latin"],
	variable: "--font-sora",
});

export const metadata: Metadata = {
	title: "ITBGPT",
	description: "The place to go for all ITB related questions!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" suppressHydrationWarning>
			<body
				className={`${sora.className} antialiased h-full overflow-hidden`}
			>
				{children}
			</body>
		</html>
	);
}
