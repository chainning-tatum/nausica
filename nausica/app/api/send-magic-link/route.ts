import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Generate magic link via Supabase
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: error?.message || 'Failed to generate link' }, { status: 500 })
  }

  const magicLink = data.properties.action_link

  // Send via Resend
  const { error: sendError } = await resend.emails.send({
    from: 'nausica <hello@nausica.app>',
    to: email,
    subject: 'Your sign-in link for nausica',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f9f7f4;font-family:'Georgia',serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;padding:48px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#f9f7f4;max-width:520px;width:100%;padding:0 24px;">
                  <tr>
                    <td style="padding-bottom:32px;">
                      <p style="font-family:'Georgia',serif;font-size:22px;color:#1a1814;margin:0;letter-spacing:-0.02em;">nausica</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e8e2d9;padding-top:32px;">
                      <p style="font-family:'Georgia',serif;font-size:20px;color:#1a1814;margin:0 0 12px;font-style:italic;line-height:1.5;">
                        Your sign-in link.
                      </p>
                      <p style="font-family:'Helvetica Neue',sans-serif;font-size:14px;color:#6b6560;margin:0 0 32px;line-height:1.6;font-weight:300;">
                        Click below to sign in to nausica. This link expires in 1 hour and can only be used once.
                      </p>
                      <a href="${magicLink}" style="display:inline-block;background:#1a1814;color:#f9f7f4;text-decoration:none;font-family:'Helvetica Neue',sans-serif;font-size:14px;font-weight:500;padding:12px 28px;border-radius:99px;letter-spacing:0.01em;">
                        Sign in to nausica
                      </a>
                      <p style="font-family:'Helvetica Neue',sans-serif;font-size:12px;color:#b8b3ae;margin:32px 0 0;line-height:1.6;font-weight:300;">
                        If you didn't request this, you can safely ignore it.<br>
                        This link was sent to ${email}.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })

  if (sendError) {
    return NextResponse.json({ error: sendError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
