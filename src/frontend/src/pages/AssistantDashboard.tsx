import { useState } from 'react';
import { useGetOvertimeEntries, useGetOvertimeTotals, useLogOvertime } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import Header from '../components/Header';
import OvertimeForm from '../components/OvertimeForm';
import OvertimeSummary from '../components/OvertimeSummary';
import OvertimeHistory from '../components/OvertimeHistory';
import OvertimeChart from '../components/OvertimeChart';
import ToDoSection from '../components/todo/ToDoSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, History, Plus, Minus, ListTodo } from 'lucide-react';

interface AssistantDashboardProps {
  userProfile: UserProfile;
}

export default function AssistantDashboard({ userProfile }: AssistantDashboardProps) {
  const [activeTab, setActiveTab] = useState('add');
  const [mainTab, setMainTab] = useState('todo');

  const { data: entries = [], isLoading: entriesLoading } = useGetOvertimeEntries(userProfile.username);
  const { data: totals, isLoading: totalsLoading } = useGetOvertimeTotals(userProfile.username);
  const logOvertimeMutation = useLogOvertime();

  const handleLogOvertime = async (data: {
    date: string;
    minutes: number;
    comment: string;
    isAdd: boolean;
  }) => {
    await logOvertimeMutation.mutateAsync({
      ...data,
      username: userProfile.username,
    });
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
            <TabsTrigger value="overtime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Overtime
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo">
            <ToDoSection />
          </TabsContent>

          <TabsContent value="overtime" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Log Overtime
                    </CardTitle>
                    <CardDescription>
                      Add overtime hours or use accumulated overtime
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="add" className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Overtime
                        </TabsTrigger>
                        <TabsTrigger value="use" className="flex items-center gap-2">
                          <Minus className="h-4 w-4" />
                          Use Overtime
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="add" className="mt-4">
                        <OvertimeForm
                          onSubmit={handleLogOvertime}
                          isAdd={true}
                          isLoading={logOvertimeMutation.isPending}
                        />
                      </TabsContent>
                      <TabsContent value="use" className="mt-4">
                        <OvertimeForm
                          onSubmit={handleLogOvertime}
                          isAdd={false}
                          isLoading={logOvertimeMutation.isPending}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <OvertimeChart entries={entries} isLoading={entriesLoading} variant="line" />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Overtime History
                    </CardTitle>
                    <CardDescription>View all your overtime entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OvertimeHistory 
                      entries={entries} 
                      isLoading={entriesLoading}
                      username={userProfile.username}
                    />
                  </CardContent>
                </Card>
              </div>

              <div>
                <OvertimeSummary totals={totals} isLoading={totalsLoading} />
              </div>
            </div>
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
    </div>
  );
}
