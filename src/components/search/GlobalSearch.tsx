import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, User, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'claim' | 'profile' | 'notification';
  title: string;
  subtitle: string;
  metadata?: any;
}

const GlobalSearch = () => {
  const { user, isOfficial } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!user) return;

    setLoading(true);
    const results: SearchResult[] = [];

    try {
      // Search claims
      let claimsQuery = supabase
        .from('claims')
        .select('id, claim_type, village, district, state, status, submitted_at')
        .or(`village.ilike.%${query}%,district.ilike.%${query}%,state.ilike.%${query}%,claim_description.ilike.%${query}%`);

      if (!isOfficial) {
        claimsQuery = claimsQuery.eq('user_id', user.id);
      }

      const { data: claims } = await claimsQuery.limit(5);

      if (claims) {
        results.push(...claims.map(claim => ({
          id: claim.id,
          type: 'claim' as const,
          title: `${claim.claim_type.replace('_', ' ')} - ${claim.village}`,
          subtitle: `${claim.district}, ${claim.state} • ${claim.status}`,
          metadata: claim
        })));
      }

      // Search profiles (only for officials)
      if (isOfficial) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(5);

        if (profiles) {
          results.push(...profiles.map(profile => ({
            id: profile.id,
            type: 'profile' as const,
            title: profile.full_name,
            subtitle: `${profile.email} • ${profile.role}`,
            metadata: profile
          })));
        }
      }

      // Search notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id, title, message, type, created_at')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
        .limit(3);

      if (notifications) {
        results.push(...notifications.map(notification => ({
          id: notification.id,
          type: 'notification' as const,
          title: notification.title,
          subtitle: notification.message.length > 50 
            ? notification.message.substring(0, 50) + '...' 
            : notification.message,
          metadata: notification
        })));
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setOpen(false);
    setSearchQuery('');

    switch (result.type) {
      case 'claim':
        if (isOfficial) {
          navigate('/admin-dashboard');
        } else {
          navigate('/my-claims');
        }
        break;
      case 'profile':
        navigate('/admin-dashboard');
        break;
      case 'notification':
        // Just close the search, notification details are shown in the bell
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'claim': return FileText;
      case 'profile': return User;
      case 'notification': return Calendar;
      default: return Search;
    }
  };

  const getResultBadge = (result: SearchResult) => {
    switch (result.type) {
      case 'claim':
        return <Badge variant="outline">{result.metadata.status}</Badge>;
      case 'profile':
        return <Badge variant="secondary">{result.metadata.role}</Badge>;
      case 'notification':
        return <Badge variant="outline">{result.metadata.type}</Badge>;
      default:
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-start text-muted-foreground">
          <Search className="h-4 w-4 mr-2" />
          Search claims, users...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search claims, users, notifications..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <>
                {searchResults.some(r => r.type === 'claim') && (
                  <CommandGroup heading="Claims">
                    {searchResults
                      .filter(r => r.type === 'claim')
                      .map((result) => {
                        const Icon = getResultIcon(result.type);
                        return (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleResultSelect(result)}
                            className="flex items-center space-x-3 p-3"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{result.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            </div>
                            {getResultBadge(result)}
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                )}

                {searchResults.some(r => r.type === 'profile') && (
                  <CommandGroup heading="Users">
                    {searchResults
                      .filter(r => r.type === 'profile')
                      .map((result) => {
                        const Icon = getResultIcon(result.type);
                        return (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleResultSelect(result)}
                            className="flex items-center space-x-3 p-3"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{result.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            </div>
                            {getResultBadge(result)}
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                )}

                {searchResults.some(r => r.type === 'notification') && (
                  <CommandGroup heading="Notifications">
                    {searchResults
                      .filter(r => r.type === 'notification')
                      .map((result) => {
                        const Icon = getResultIcon(result.type);
                        return (
                          <CommandItem
                            key={result.id}
                            onSelect={() => handleResultSelect(result)}
                            className="flex items-center space-x-3 p-3"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{result.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            </div>
                            {getResultBadge(result)}
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GlobalSearch;