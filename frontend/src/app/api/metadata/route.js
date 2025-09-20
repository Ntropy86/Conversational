import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Load metadata
    const metadataPath = path.join(process.cwd(), 'content', 'content-metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Error loading metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}