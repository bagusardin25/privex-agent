import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Private AI Financial Agent',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    network: 'Flare Testnet (Coston2)',
    chainId: 114,
  });
}
