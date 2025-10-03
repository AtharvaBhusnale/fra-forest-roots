import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserCog, FileText, AlertTriangle } from "lucide-react";

interface AdminAction {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  action_type: string;
  details: any;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const AuditLog = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Fetch profile data separately
      const actionsWithProfiles = await Promise.all(
        (data || []).map(async (action) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', action.admin_user_id)
            .single();
          
          return {
            ...action,
            profiles: profile
          };
        })
      );
      
      setActions(actionsWithProfiles as AdminAction[]);
    } catch (error: any) {
      toast({
        title: "Error loading audit log",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'claim_review':
        return <FileText className="h-4 w-4" />;
      case 'user_role_change':
        return <UserCog className="h-4 w-4" />;
      case 'system_config':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'claim_review':
        return 'default';
      case 'user_role_change':
        return 'secondary';
      case 'system_config':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Loading audit trail...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>
          Track all administrative actions in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {actions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No audit records found
              </p>
            ) : (
              actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {getActionIcon(action.action_type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionColor(action.action_type)}>
                        {action.action_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(action.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {action.profiles?.full_name || 'Unknown Admin'} ({action.profiles?.email})
                    </p>
                    {action.details && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(action.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
