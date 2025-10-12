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
      'experience': { key: 'experiences', folder: 'experiences' },
      'project': { key: 'projects', folder: 'projects' },
      'publication': { key: 'publications', folder: 'publications' },
      'blog': { key: 'blog', folder: 'blog' },
      'education': { key: 'education', folder: 'education' },
      'contact': { key: 'contact', folder: 'contact' }
    };

    const mapping = typeMapping[type];
    if (!mapping) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Find the content item
    const contentItem = metadata[mapping.key]?.find(item => item.id === id);
    if (!contentItem) {
      return NextResponse.json({ error: `Content not found in metadata for type: ${type}, id: ${id}` }, { status: 404 });
    }

    // Use the 'file' field from contentItem to construct the path
    if (!contentItem.file) {
      return NextResponse.json({ error: `No file path specified in metadata for id: ${id}` }, { status: 404 });
    }

    const contentPath = path.join(process.cwd(), 'content', mapping.folder, contentItem.file);
    
    if (!fs.existsSync(contentPath)) {
      return NextResponse.json({ 
        error: 'Content file not found', 
        path: contentPath
      }, { status: 404 });
    }

    const markdownContent = fs.readFileSync(contentPath, 'utf-8');

    return NextResponse.json({
      ...contentItem,
      content: markdownContent
    });

  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}