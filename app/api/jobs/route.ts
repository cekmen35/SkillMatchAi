import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Extract optional dynamic search queries from the URL, or default rigorously to "software engineer"
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'yazılım mühendisi Türkiye';
    
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "RAPIDAPI_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      }
    });

    if (!response.ok) {
        throw new Error(`JSearch API rejected with status ${response.status}`);
    }

    const data = await response.json();

    // Requirement: Return only the job list (data.data)
    return NextResponse.json(data.data || []);

  } catch (error: any) {
    console.error("Job Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs data", details: error.message },
      { status: 500 }
    );
  }
}
