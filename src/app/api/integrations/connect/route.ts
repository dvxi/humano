import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVitalClient } from '@/integrations/vital/client';
import { z } from 'zod';

const connectSchema = z.object({
  provider: z.enum(['VITAL', 'TERRA', 'POLAR', 'GOOGLEFIT']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider } = connectSchema.parse(body);

    // For now, only Vital is implemented
    if (provider === 'VITAL') {
      try {
        const vitalClient = getVitalClient();

        // Create link token
        const linkToken = await vitalClient.createLinkToken(session.user.id);

        // The link token contains the URL to redirect the user to
        const authUrl = `https://link.tryvital.io/?token=${linkToken.link_token}&env=${process.env.VITAL_ENVIRONMENT || 'sandbox'}`;

        return NextResponse.json({
          authUrl,
          linkToken: linkToken.link_token,
        });
      } catch (error) {
        console.error('Vital connection error:', error);
        return NextResponse.json(
          {
            error:
              'Failed to connect to Vital. Please ensure VITAL_API_KEY is configured correctly.',
          },
          { status: 500 }
        );
      }
    }

    // Other providers not yet implemented
    return NextResponse.json(
      {
        error: `${provider} integration is not yet implemented. Currently only VITAL is supported.`,
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Integration connect error:', error);
    return NextResponse.json({ error: 'Failed to initiate connection' }, { status: 500 });
  }
}
