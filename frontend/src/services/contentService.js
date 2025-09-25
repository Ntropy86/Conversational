// Client-side content service using API routes

export async function getContentMetadata() {
  try {
    const response = await fetch('/api/metadata');
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { experiences: [], projects: [] };
  }
}

export async function getExperienceList() {
  const metadata = await getContentMetadata();
  return metadata.experiences || [];
}

export async function getProjectList() {
  const metadata = await getContentMetadata();
  return metadata.projects || [];
}

export async function getPublicationList() {
  const metadata = await getContentMetadata();
  return metadata.publications || [];
}

export async function getBlogList() {
  const metadata = await getContentMetadata();
  return metadata.blog || [];
}

export async function loadMarkdownContent(type, id) {
  try {
    const response = await fetch(`/api/content?type=${type}&id=${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} content: ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading content for ${type}/${id}:`, error);
    return null;
  }
}

export async function getExperienceContent(id) {
  return await loadMarkdownContent('experience', id);
}

export async function getProjectContent(id) {
  return await loadMarkdownContent('project', id);
}

export async function getPublicationContent(id) {
  return await loadMarkdownContent('publication', id);
}

export async function getBlogContent(id) {
  return await loadMarkdownContent('blog', id);
}

export async function getSkillsList() {
  const metadata = await getContentMetadata();
  return metadata.skills || {};
}

export async function getSkillsContent(id) {
  return await loadMarkdownContent('skills', id);
}

export async function getEducationList() {
  const metadata = await getContentMetadata();
  return metadata.education || [];
}

export async function getEducationContent(id) {
  return await loadMarkdownContent('education', id);
}

export async function getContactList() {
  const metadata = await getContentMetadata();
  return metadata.contact || [];
}

export async function getContactContent(id) {
  return await loadMarkdownContent('contact', id);
}