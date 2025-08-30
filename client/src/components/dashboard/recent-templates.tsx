import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, MoreVertical, Eye, Copy, FileText } from "lucide-react";
import type { Template } from "@/types/template";
import { formatDistanceToNow } from "date-fns";

interface RecentTemplatesProps {
  templates?: Template[];
  isLoading: boolean;
}

export default function RecentTemplates({ templates, isLoading }: RecentTemplatesProps) {
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
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "MARKETING":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "AUTHENTICATION":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Templates</CardTitle>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Templates</CardTitle>
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]" data-testid="select-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="UTILITY">Utility</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/templates">
              <Button variant="outline" size="sm" data-testid="button-view-all-templates">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {templates && templates.length > 0 ? (
          templates.slice(0, 5).map((template) => (
            <div key={template.id} className="template-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.components?.body?.text?.length > 100
                      ? `${template.components.body.text.substring(0, 100)}...`
                      : template.components?.body?.text || "No content"}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      Modified {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                    </span>
                    {template.approvalProbability && (
                      <span className="text-green-600">
                        Approval: {template.approvalProbability}%
                      </span>
                    )}
                    <span>
                      Language: {template.language}
                    </span>
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
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-template-menu-${template.id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first WhatsApp Business template to get started
            </p>
            <Link href="/templates/new">
              <Button data-testid="button-create-first-template">
                Create Template
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
