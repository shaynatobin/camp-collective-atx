import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default function handler(req) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Camp Collective ATX'
  const subtitle = searchParams.get('subtitle') || 'Find the perfect Austin summer camp for your kids'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F0E8',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', position: 'relative', width: 100, height: 85, marginBottom: 32 }}>
          {/* Sun */}
          <div style={{
            position: 'absolute', top: 0, left: 35, width: 30, height: 30,
            borderRadius: '50%', backgroundColor: '#F2C14E',
          }} />
          {/* Back peak */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 0, height: 0,
            borderLeft: '40px solid transparent',
            borderRight: '40px solid transparent',
            borderBottom: '60px solid #3B6E52',
          }} />
          {/* Front peak */}
          <div style={{
            position: 'absolute', bottom: 0, right: 0, width: 0, height: 0,
            borderLeft: '32px solid transparent',
            borderRight: '32px solid transparent',
            borderBottom: '50px solid #E8794A',
          }} />
        </div>

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: '#1C1C1C', letterSpacing: '-1px' }}>
            Camp Collective
          </span>
          <span style={{ fontSize: 48, fontWeight: 700, color: '#E8794A' }}>ATX</span>
        </div>

        {/* Title (page-specific) */}
        {title !== 'Camp Collective ATX' && (
          <div style={{
            fontSize: 32, fontWeight: 700, color: '#1C1C1C',
            textAlign: 'center', marginBottom: 12, maxWidth: 900,
          }}>
            {title}
          </div>
        )}

        {/* Subtitle */}
        <div style={{
          fontSize: 24, color: '#666', textAlign: 'center', maxWidth: 800,
        }}>
          {subtitle}
        </div>

        {/* URL badge */}
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          fontSize: 20, color: '#999',
        }}>
          campcollectiveatx.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
