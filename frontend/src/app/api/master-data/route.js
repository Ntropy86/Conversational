import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Load master data
    const masterDataPath = path.join(process.cwd(), 'content', 'master-data.json');
    const masterData = JSON.parse(fs.readFileSync(masterDataPath, 'utf-8'));

    return NextResponse.json(masterData);

  } catch (error) {
    console.error('Error loading master data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}