import { useState } from 'react';
import { useGetAllAssistants, useDeleteAssistantData } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import Header from '../components/Header';
import AssistantList from '../components/AssistantList';
import AssistantDetailView from '../components/AssistantDetailView';
import ManagerAnalytics from '../components/ManagerAnalytics';
import AuditLogView from '../components/todo/AuditLogView';
import ToDoSection from '../components/todo/ToDoSection';
import TaskPreferencesManager from '../components/todo/TaskPreferencesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, FileText, ListTodo, Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ManagerDashboardProps {
  userProfile: UserProfile;
}

export default function ManagerDashboard({ userProfile }: ManagerDashboardProps) {
  const [selectedAssistant, setSelectedAssistant] = useState<UserProfile | null>(null);
  const [assistantToDelete, setAssistantToDelete] = useState<UserProfile | null>(null);
  const [mainTab, setMainTab] = useState('todo');

  const { data: assistants = [], isLoading: assistantsLoading } = useGetAllAssistants();
  const deleteAssistantMutation = useDeleteAssistantData();

  const handleDeleteAssistant = async () => {
    if (!assistantToDelete) return;

    try {
      await deleteAssistantMutation.mutateAsync(assistantToDelete.principal.toString());
      toast.success(`Assistant ${assistantToDelete.username} deleted successfully`);
      setAssistantToDelete(null);
      setSelectedAssistant(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete assistant');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4">
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="todo" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              To-Do
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo" className="space-y-6">
            <ToDoSection />
            <TaskPreferencesManager />
          </TabsContent>

          <TabsContent value="team">
            {selectedAssistant ? (
              <AssistantDetailView
                assistant={selectedAssistant}
                onDelete={setAssistantToDelete}
                onClose={() => setSelectedAssistant(null)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Overview
                  </CardTitle>
                  <CardDescription>Select an assistant to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <AssistantList
                    assistants={assistants}
                    isLoading={assistantsLoading}
                    selectedAssistant={selectedAssistant}
                    onSelectAssistant={setSelectedAssistant}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <ManagerAnalytics assistants={assistants} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogView />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-12 border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <AlertDialog open={!!assistantToDelete} onOpenChange={(open) => !open && setAssistantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {assistantToDelete?.username}? This will permanently remove all their
              data including overtime entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssistant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssistantMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
