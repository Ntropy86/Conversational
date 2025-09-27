import { promises as fs } from 'fs';
import path from 'path';
import HomeClient from '../components/HomeClient';

// Server-side function to read resume data
async function getResumeData() {
  try {
    const filePath = path.join(process.cwd(), '..', 'backend', 'resume_data.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading resume data:', error);
    // Fallback to empty structure
    return {
      experience: [],
      projects: [],
      education: [],
      name: 'Portfolio',
      contact: {},
      headline: '',
      profile: ''
    };
  }
}

export default async function Home() {
  // Get resume data on the server
  const resumeData = await getResumeData();
  const experiences = resumeData.experience || [];
  const projects = resumeData.projects || [];
  const education = resumeData.education || [];

  // Pass all data to client component for interactive features
  return (
    <HomeClient 
      resumeData={resumeData}
      experiences={experiences}
      projects={projects}
      education={education}
    />
  );
}