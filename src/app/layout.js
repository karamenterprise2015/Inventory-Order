import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://burgerbhau.com'),
  title: "Burger Bhau — Store Order Panel",
  description: "Franchise inventory ordering system for Burger Bhau stores. Browse products, build orders, track history, and manage your store — all in one place.",
  keywords: "burger bhau, franchise, inventory, order, store management, gujarat",
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Burger Bhau — Store Order Panel",
    description: "Franchise inventory ordering system for Burger Bhau stores.",
    images: ['/logo.png'],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
