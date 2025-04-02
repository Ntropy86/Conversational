export const metadata = {
  title: 'Voice Assistant',
  description: 'AI Voice Assistant with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}