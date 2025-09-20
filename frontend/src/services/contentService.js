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