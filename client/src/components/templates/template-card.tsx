import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Edit, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Send,
  Eye,
  BarChart3,
  Zap 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Template } from "@/types/template";

interface TemplateCardProps {
  template: Template;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function TemplateCard({ template, onDelete, isDeleting }: TemplateCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "UTILITY":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "MARKETING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "AUTHENTICATION":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getApprovalColor = (probability?: number) => {
    if (!probability) return "text-muted-foreground";
    if (probability >= 90) return "text-green-600";
    if (probability >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="template-card p-6 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-foreground" data-testid={`template-name-${template.id}`}>
              {template.name}
            </h4>
            <Badge
              variant={getStatusVariant(template.status)}
              className="capitalize"
              data-testid={`template-status-${template.id}`}
            >
              {template.status}
            </Badge>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(template.category)}`}>
              {template.category}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {template.components?.body?.text?.length > 150
              ? `${template.components.body.text.substring(0, 150)}...`
              : template.components?.body?.text || "No content"}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>
              Modified {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
            </span>
            {template.approvalProbability && (
              <span className={getApprovalColor(template.approvalProbability)}>
                Approval: {Math.round(template.approvalProbability)}%
              </span>
            )}
            <span>
              Language: {template.language.replace('_', '-').toUpperCase()}
            </span>
            {template.components?.buttons && template.components.buttons.length > 0 && (
              <span className="text-blue-600">
                {template.components.buttons.length} button{template.components.buttons.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={`/templates/${template.id}/edit`}>
            <Button 
              variant="ghost" 
              size="sm"
              data-testid={`button-edit-template-${template.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid={`button-template-menu-${template.id}`}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/templates/${template.id}/edit`}>
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              
              {template.status === 'approved' && (
                <DropdownMenuItem>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Message
                </DropdownMenuItem>
              )}
              
              {template.status === 'draft' && (
                <>
                  <DropdownMenuItem>
                    <Zap className="w-4 h-4 mr-2" />
                    AI Validate
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Approval
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(template.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
