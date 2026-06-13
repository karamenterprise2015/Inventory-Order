import "./globals.css";

export const metadata = {
  title: "Inventory Ordering Panel | Store Management",
  description: "Premium mobile-first B2B ordering panel. Easily compile items, track past orders, and submit orders directly via WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
