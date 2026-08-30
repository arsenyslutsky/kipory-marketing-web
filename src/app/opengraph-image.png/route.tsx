import { ImageResponse } from 'next/og';

export const size = { height: 630, width: 1200 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background: '#080a08',
        color: '#f3f5ef',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        height: '100%',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: '64px 72px',
        width: '100%',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', gap: 18 }}>
        <svg height="52" viewBox="0 0 32 32" width="52">
          <path d="M6 8.5 13.8 4 26 11 18.2 15.5 6 8.5Z" fill="none" stroke="#449c40" strokeWidth="1.8" />
          <path d="m6 14.5 12.2 7L26 17" fill="none" stroke="#449c40" strokeWidth="1.8" />
          <path d="m6 20.5 12.2 7L26 23" fill="none" stroke="#449c40" strokeWidth="1.8" />
        </svg>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 8 }}>KIPORY</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 930 }}>
        <span style={{ color: '#449c40', fontSize: 24, fontWeight: 700, letterSpacing: 4 }}>
          BUSINESS FLOW, MADE VISIBLE
        </span>
        <span style={{ fontSize: 70, fontWeight: 500, letterSpacing: -3, lineHeight: 1.02 }}>
          See every signal. Shape what happens next.
        </span>
        <span style={{ color: '#a4afa6', fontSize: 27, lineHeight: 1.4 }}>
          Governed data and agentic workflows for product and operations teams.
        </span>
      </div>
    </div>,
    size,
  );
}
