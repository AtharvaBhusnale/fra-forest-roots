import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  subject: string;
  claimId: string;
  status: string;
  remarks?: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, claimId, status, remarks, userName }: NotificationEmailRequest = await req.json();

    console.log(`Sending notification email to ${to} for claim ${claimId}`);

    const statusMessages: Record<string, string> = {
      'approved': 'Your land claim has been approved! You can now proceed with the next steps.',
      'rejected': 'Your land claim has been rejected. Please review the remarks and submit a new claim if needed.',
      'under_review': 'Your land claim is now being reviewed by our officials. You will be notified once the review is complete.',
      'pending': 'Your land claim has been received and is pending review.'
    };

    const emailResponse = await resend.emails.send({
      from: "FRA Claims <onboarding@resend.dev>",
      to: [to],
      subject: subject || `Claim Status Update - ${status.toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
              .approved { background: #10b981; color: white; }
              .rejected { background: #ef4444; color: white; }
              .under_review { background: #f59e0b; color: white; }
              .pending { background: #6b7280; color: white; }
              .claim-id { background: #e5e7eb; padding: 10px; border-radius: 4px; margin: 15px 0; }
              .remarks { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Forest Rights Authority</h1>
                <p>Claim Status Notification</p>
              </div>
              <div class="content">
                <p>Dear ${userName},</p>
                <p>${statusMessages[status] || 'Your claim status has been updated.'}</p>
                
                <div class="claim-id">
                  <strong>Claim ID:</strong> ${claimId}
                </div>
                
                <div>
                  <strong>Status:</strong> 
                  <span class="status-badge ${status}">${status.toUpperCase().replace('_', ' ')}</span>
                </div>
                
                ${remarks ? `
                  <div class="remarks">
                    <strong>Official Remarks:</strong><br/>
                    ${remarks}
                  </div>
                ` : ''}
                
                <p>You can view your claim details by logging into your FRA Claims portal.</p>
                
                <div class="footer">
                  <p>This is an automated notification from the Forest Rights Authority Claims System.</p>
                  <p>Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
