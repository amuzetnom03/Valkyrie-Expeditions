import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // googleapis needs nodejs

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { expeditionName, startDate, endDate, fullName } = await req.json();

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `Expedition: ${expeditionName}`,
      description: `Traveler: ${fullName}\nOrganized by Vanguard Command.`,
      start: {
        date: startDate,
        timeZone: 'UTC',
      },
      end: {
        date: endDate,
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Calendar error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json(response.data.items || []);
  } catch (error: any) {
    console.error('Calendar list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
