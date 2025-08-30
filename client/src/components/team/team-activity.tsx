import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Settings,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastActiveAt: string;
}

interface Activity {
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

export default function TeamActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/team/activity"],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: users } = useQuery({
    queryKey: ["/api/team/users"],
  });

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
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'template_approved':
        return 'text-green-600';
      case 'template_rejected':
      case 'compliance_alert':
        return 'text-red-600';
      case 'auto_fix_applied':
        return 'text-purple-600';
      case 'template_created':
      case 'template_updated':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getOnlineStatus = (user: TeamMember) => {
    const lastActive = new Date(user.lastActiveAt);
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

  const onlineUsers = users?.filter((user: TeamMember) => 
    user.isActive && getOnlineStatus(user) !== 'offline'
  ).slice(0, 3) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Team Activity</span>
          </div>
          <Button variant="ghost" size="sm" data-testid="button-manage-team">
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Online Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">Online Now</h4>
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length} active
            </Badge>
          </div>
          
          {onlineUsers.length > 0 ? (
            <div className="space-y-3">
              {onlineUsers.map((user) => {
                const status = getOnlineStatus(user);
                return (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(status)} border-2 border-white rounded-full`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team members online</p>
            </div>
          )}
        </div>

        {/* Recent Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Actions</h4>
          
          {activities && activities.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {activities.slice(0, 8).map((activity: Activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="flex-shrink-0">
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
                      <span className={getActivityColor(activity.activityType)}>
                        {activity.description}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground" data-testid="total-team-members">
              {users?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="active-today">
              {onlineUsers.length}
            </p>
            <p className="text-xs text-muted-foreground">Active Today</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1" data-testid="button-view-all-activity">
            View All
          </Button>
          <Button size="sm" variant="outline" data-testid="button-invite-member">
            <Plus className="w-4 h-4 mr-1" />
            Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
