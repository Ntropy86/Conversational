import Guestbook from '../../components/Guestbook';
import MainLayout from '../../components/MainLayout';

export const metadata = {
  title: 'Guestbook | Nitigya Kargeti',
  description: 'Sign the guestbook and leave your mark!',
};

export default function GuestbookPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-20">
        <Guestbook />
      </div>
    </MainLayout>
  );
}

