import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Settings, 
  Activity,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
}

interface TeamActivity {
  id: string;
  userId: string;
  activityType: string;
  description: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export default function Team() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/team/users"],
  });

  const { data: teamActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/team/activity"],
    refetchInterval: 60000, // Refresh every minute
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getOnlineStatus = (member: TeamMember) => {
    const lastActive = new Date(member.lastActiveAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 5) return 'online';
    if (diffInMinutes < 30) return 'away';
    return 'offline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'away':
        return 'bg-yellow-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'manager':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'member':
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'template_created':
      case 'template_updated':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'template_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'template_rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'auto_fix_applied':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'compliance_alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredMembers = teamMembers?.filter((member: TeamMember) => {
    const matchesSearch = searchTerm === "" || 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    const status = getOnlineStatus(member);
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && member.isActive) ||
      (statusFilter === "inactive" && !member.isActive) ||
      status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const onlineCount = teamMembers?.filter((member: TeamMember) => 
    member.isActive && getOnlineStatus(member) === 'online'
  ).length || 0;

  const teamStats = {
    totalMembers: teamMembers?.length || 0,
    activeMembers: teamMembers?.filter((m: TeamMember) => m.isActive).length || 0,
    onlineMembers: onlineCount,
    adminCount: teamMembers?.filter((m: TeamMember) => m.role === 'admin').length || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Team Management"
          subtitle="Manage team members, roles, and collaboration settings"
          actions={
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {onlineCount} online
              </Badge>
              
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-invite-member">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="colleague@company.com"
                        className="mt-1"
                        data-testid="input-invite-email"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Role</label>
                      <Select defaultValue="member">
                        <SelectTrigger className="mt-1" data-testid="select-invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button data-testid="button-send-invite">
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" data-testid="button-team-settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          }
        />

        <main className="p-8">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-total-members">
                      {teamStats.totalMembers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-blue-600 font-medium">Team size</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-active-members">
                      {teamStats.activeMembers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-green-600 font-medium">
                    {Math.round((teamStats.activeMembers / teamStats.totalMembers) * 100)}% active
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Online Now</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-online-members">
                      {teamStats.onlineMembers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <span className="text-sm text-green-600 font-medium">Live status</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="metric-admin-count">
                      {teamStats.adminCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-yellow-600 font-medium">Admin roles</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="activity">Team Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-members"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-role-filter">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Members List */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4">
                          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Invite your first team member to get started"
                        }
                      </p>
                      {(!searchTerm && roleFilter === "all" && statusFilter === "all") && (
                        <Button onClick={() => setIsInviteDialogOpen(true)} data-testid="button-invite-first-member">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Team Member
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMembers.map((member: TeamMember) => {
                        const status = getOnlineStatus(member);
                        return (
                          <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback>
                                    {getInitials(member.firstName, member.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(status)} border-2 border-white rounded-full`} />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-foreground">
                                    {member.firstName} {member.lastName}
                                  </h4>
                                  {getRoleIcon(member.role)}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-muted-foreground">{member.email}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getRoleBadgeColor(member.role)}`}
                                  >
                                    {member.role}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <div className={`w-2 h-2 ${getStatusColor(status)} rounded-full mr-1`} />
                                    {getStatusText(status)}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Last active {formatDistanceToNow(new Date(member.lastActiveAt), { addSuffix: true })}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Joined {format(new Date(member.createdAt), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {!member.isActive && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                  Inactive
                                </Badge>
                              )}
                              <Button variant="ghost" size="sm" data-testid={`button-member-menu-${member.id}`}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !teamActivities || teamActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No recent activity</h3>
                      <p className="text-muted-foreground">
                        Team activity will appear here as members work on templates and projects.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {teamActivities.map((activity: TeamActivity) => (
                        <div key={activity.id} className="flex items-start space-x-4" data-testid={`activity-${activity.id}`}>
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.activityType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">
                                {activity.user ? 
                                  `${activity.user.firstName} ${activity.user.lastName}` : 
                                  'System'
                                }
                              </span>{' '}
                              <span>{activity.description}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
