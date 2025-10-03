import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  format: 'csv' | 'json';
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { format, filters }: ExportRequest = await req.json();
    
    console.log(`Exporting claims for user ${user.id} in ${format} format`);

    // Build query
    let query = supabase
      .from('claims')
      .select(`
        *,
        profiles!claims_user_id_fkey(full_name, email, phone)
      `)
      .order('submitted_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('submitted_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('submitted_at', filters.endDate);
    }

    const { data: claims, error } = await query;

    if (error) {
      throw error;
    }

    console.log(`Exporting ${claims?.length || 0} claims`);

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Claim ID',
        'Applicant Name',
        'Email',
        'Phone',
        'Claim Type',
        'State',
        'District',
        'Village',
        'Land Area (Hectares)',
        'Status',
        'Submitted At',
        'Reviewed At',
        'Remarks'
      ];

      const rows = claims?.map(claim => [
        claim.id,
        claim.profiles?.full_name || 'N/A',
        claim.profiles?.email || 'N/A',
        claim.profiles?.phone || 'N/A',
        claim.claim_type,
        claim.state,
        claim.district,
        claim.village,
        claim.land_area || 'N/A',
        claim.status,
        new Date(claim.submitted_at).toLocaleDateString(),
        claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleDateString() : 'N/A',
        claim.remarks || 'N/A'
      ]) || [];

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new Response(csvContent, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="claims-export-${new Date().toISOString()}.csv"`
        },
      });
    } else {
      // Return JSON
      return new Response(JSON.stringify(claims, null, 2), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="claims-export-${new Date().toISOString()}.json"`
        },
      });
    }
  } catch (error: any) {
    console.error("Error exporting claims:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
