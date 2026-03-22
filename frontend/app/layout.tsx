import "./globals.css";
import { Providers } from "../components/providers";

export const metadata = {
  title: "Sepolia Control Room",
  description: "Crypto-style dashboard for interacting with a smart contract on Sepolia",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
