import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'experience', 'project', 'publication', or 'blog'
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    // Load metadata
    const metadataPath = path.join(process.cwd(), 'content', 'content-metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    // Map content type to metadata key and folder structure
    const typeMapping = {
      'experience': { key: 'experiences', folder: 'experiences', filename: `${id}.md` },
      'project': { key: 'projects', folder: 'projects', filename: `${id}.md` },
      'publication': { key: 'publications', folder: 'publications', filename: `${id}.md` },
      'blog': { key: 'blog', folder: 'blog', filename: `${id}/index.md` }
    };

    const mapping = typeMapping[type];
    if (!mapping) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Find the content item
    const contentItem = metadata[mapping.key]?.find(item => item.id === id);
    if (!contentItem) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Load the markdown file
    const contentPath = path.join(process.cwd(), 'content', mapping.folder, mapping.filename);
    
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json({ error: 'Content file not found' }, { status: 404 });
    }

    const markdownContent = fs.readFileSync(contentPath, 'utf-8');

    return NextResponse.json({
      ...contentItem,
      content: markdownContent
    });

  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}