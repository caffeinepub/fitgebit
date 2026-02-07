import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAllAssistants, useDeleteAssistantData } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import Header from '../components/Header';
import AssistantList from '../components/AssistantList';
import AssistantDetailView from '../components/AssistantDetailView';
import ManagerAnalytics from '../components/ManagerAnalytics';
import ToDoSection from '../components/todo/ToDoSection';
import AuditLogView from '../components/todo/AuditLogView';
import TaskPreferencesManager from '../components/todo/TaskPreferencesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, FileText, ListTodo, Heart } from 'lucide-react';
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
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [selectedAssistant, setSelectedAssistant] = useState<UserProfile | null>(null);
  const [assistantToDelete, setAssistantToDelete] = useState<UserProfile | null>(null);
  const [mainTab, setMainTab] = useState('todo');

  const { data: assistants = [], isLoading: assistantsLoading } = useGetAllAssistants();
  const deleteAssistantMutation = useDeleteAssistantData();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleDeleteAssistant = async () => {
    if (!assistantToDelete) return;

    try {
      await deleteAssistantMutation.mutateAsync(assistantToDelete.principal);
      toast.success(`${assistantToDelete.username}'s data has been deleted`);
      setAssistantToDelete(null);
      if (selectedAssistant?.principal.toString() === assistantToDelete.principal.toString()) {
        setSelectedAssistant(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete assistant data');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userProfile={userProfile} onLogout={handleLogout} />

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
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
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

              <div className="lg:col-span-2">
                {selectedAssistant ? (
                  <AssistantDetailView
                    assistant={selectedAssistant}
                    onDelete={setAssistantToDelete}
                    onClose={() => setSelectedAssistant(null)}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex min-h-[400px] items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Users className="mx-auto mb-4 h-12 w-12" />
                        <p>Select an assistant to view their details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <ManagerAnalytics assistants={assistants} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogView />
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!assistantToDelete} onOpenChange={(open) => !open && setAssistantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all data for {assistantToDelete?.username}? This action cannot be undone
              and will remove all overtime entries and user information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssistant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  );
}
