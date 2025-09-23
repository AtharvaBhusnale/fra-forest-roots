import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Shield, Users, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface AdminAction {
  id: string;
  action_type: string;
  details: any;
  created_at: string;
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [newOfficialForm, setNewOfficialForm] = useState({
    email: '',
    full_name: '',
    password: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchProfiles();
    fetchAdminActions();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

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
        .limit(10);

      if (error) {
        console.error('Error fetching admin actions:', error);
        return;
      }

      setAdminActions(data || []);
    } catch (error) {
      console.error('Error fetching admin actions:', error);
    }
  };

  const createOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newOfficialForm.email,
        password: newOfficialForm.password,
        options: {
          data: {
            full_name: newOfficialForm.full_name,
            role: 'official'
          }
        }
      });

      if (authError) {
        toast({
          title: "Failed to create official account",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      // Log the admin action
      if (authData.user) {
        await supabase
          .from('admin_actions')
          .insert({
            admin_user_id: user?.id,
            action_type: 'create_official',
            target_user_id: authData.user.id,
            details: {
              email: newOfficialForm.email,
              full_name: newOfficialForm.full_name
            }
          });
      }

      toast({
        title: "Official account created successfully",
        description: `Account created for ${newOfficialForm.full_name}`,
      });

      // Reset form and refresh data
      setNewOfficialForm({ email: '', full_name: '', password: '' });
      fetchProfiles();
      fetchAdminActions();

    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage government officials and system users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Officials</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.role === 'official').length}
            </div>
            <p className="text-xs text-muted-foreground">Government officials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citizens</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.role === 'citizen').length}
            </div>
            <p className="text-xs text-muted-foreground">Registered citizens</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Official Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Government Official Account
          </CardTitle>
          <CardDescription>
            Create secure accounts for government officials with elevated permissions
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
                  placeholder="Enter official's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="official-email">Official Email</Label>
                <Input
                  id="official-email"
                  type="email"
                  value={newOfficialForm.email}
                  onChange={(e) => setNewOfficialForm({ ...newOfficialForm, email: e.target.value })}
                  placeholder="official@government.in"
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
                placeholder="Generate a secure temporary password"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                The official should change this password upon first login
              </p>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Official Account
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            View and manage all registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                        {profile.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Admin Actions
          </CardTitle>
          <CardDescription>
            Audit trail of recent administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminActions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No admin actions recorded yet
              </p>
            ) : (
              adminActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{action.action_type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.details && typeof action.details === 'object' 
                        ? `${action.details.full_name} (${action.details.email})`
                        : 'System action'
                      }
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(action.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;