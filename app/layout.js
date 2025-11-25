import './globals.css';
import ToastProvider from '@/components/ToastProvider';

export const metadata = {
  title: 'Task Manager - Organize Your Life',
  description: 'A simple and efficient task management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

