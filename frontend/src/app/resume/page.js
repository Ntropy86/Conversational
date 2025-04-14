// app/resume/page.tsx
import { Metadata } from 'next';

export const metadata = {
    title: 'Resume Download',
    description: 'Download my resume',
};

export default function ResumePage() {
  return (
    <>
    <head>
        <meta httpEquiv="refresh" content="0.5;url=/resume.pdf" />
      </head>
      <p>Your resume is loading...</p>
      </>
  );
}     
