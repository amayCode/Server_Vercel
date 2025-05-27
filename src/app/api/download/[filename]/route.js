import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { filename } = params;
  const filePath = path.join(process.cwd(), 'public/uploads', filename);

  try {
    await fs.access(filePath);
    const fileUrl = `${request.nextUrl.origin}/uploads/${filename}`;

    return new Response(`
      <html>
        <head><title>Download</title></head>
        <body>
          <h1>Your Video is Ready</h1>
          <video controls width="500">
            <source src="${fileUrl}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br/>
          <a href="${fileUrl}" download>
            <button>Download Video</button>
          </a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch {
    // err parameter removed to fix lint error about unused variable
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
