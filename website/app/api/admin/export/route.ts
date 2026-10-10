import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    
    if (format === 'csv') {
      const csvContent = 'id,name,role\n1,Admin,ADMIN\n2,User,USER\n';
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="export.csv"'
        }
      });
    }
    
    if (format === 'excel') {
      const csvContent = 'id,name,role\n1,Admin,ADMIN\n2,User,USER\n';
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="export.xlsx"'
        }
      });
    }
    
    if (format === 'pdf') {
      return new NextResponse('PDF content placeholder (Requires a PDF library to generate real PDF)', {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="export.pdf"'
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
