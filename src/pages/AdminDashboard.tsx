import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield, UserPlus, Users, Activity } from 'lucide-react';

interface AdminAction {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_user_id: string | null;
  details: any;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  
  const [newOfficialForm, setNewOfficialForm] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  useEffect(() => {
    if (isSuperAdmin) {
      fetchProfiles();
      fetchAdminActions();
    }
  }, [isSuperAdmin]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchAdminActions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAdminActions(data || []);
    } catch (error) {
      console.error('Error fetching admin actions:', error);
    }
  };

  const logAdminAction = async (actionType: string, targetUserId?: string, details?: any) => {
    try {
      await supabase
        .from('admin_actions')
        .insert({
          admin_user_id: user?.id,
          action_type: actionType,
          target_user_id: targetUserId,
          details: details
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const createOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/supabase/functions/v1/create-official', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newOfficialForm.email,
          password: newOfficialForm.password,
          full_name: newOfficialForm.full_name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create official account');
      }

      toast({
        title: "Official Account Created",
        description: result.message
      });

      setNewOfficialForm({ email: '', password: '', full_name: '' });
      fetchProfiles();
      fetchAdminActions();

    } catch (error: any) {
      toast({
        title: "Error Creating Account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'official': return 'default';
      case 'citizen': return 'secondary';
      default: return 'outline';
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage government officials and system administration</p>
        </div>

        <Tabs defaultValue="create-official" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create-official" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create Official
            </TabsTrigger>
            <TabsTrigger value="manage-users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="audit-log" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-official">
            <Card>
              <CardHeader>
                <CardTitle>Create Government Official Account</CardTitle>
                <CardDescription>
                  Create a new account for a government official with secure access to the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createOfficial} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="official-name">Full Name</Label>
                      <Input
                        id="official-name"
                        type="text"
                        value={newOfficialForm.full_name}
                        onChange={(e) => setNewOfficialForm({ ...newOfficialForm, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="official-email">Government Email</Label>
                      <Input
                        id="official-email"
                        type="email"
                        value={newOfficialForm.email}
                        onChange={(e) => setNewOfficialForm({ ...newOfficialForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="official-password">Temporary Password</Label>
                    <Input
                      id="official-password"
                      type="password"
                      value={newOfficialForm.password}
                      onChange={(e) => setNewOfficialForm({ ...newOfficialForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Officials should change this password after first login.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Official Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all user accounts in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.full_name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(profile.role)}>
                            {profile.role === 'super_admin' ? 'Super Admin' : 
                             profile.role === 'official' ? 'Official' : 'Citizen'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit-log">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Recent administrative actions performed in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">
                          {action.action_type.replace('_', ' ').toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {action.details?.email || action.details?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(action.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;