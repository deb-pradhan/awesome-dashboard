import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { PolymarketData } from '@/lib/types';

async function fetchPolymarketData(): Promise<PolymarketData> {
  // Read from the local JSON file
  const filePath = path.join(process.cwd(), 'polymarket_btc_data.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(fileContents) as PolymarketData;
  
  return data;
}

export async function GET() {
  try {
    const data = await fetchPolymarketData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Polymarket data' },
      { status: 500 }
    );
  }
}
