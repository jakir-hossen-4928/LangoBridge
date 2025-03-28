import React, { useEffect, useState, useCallback } from 'react';
import { useVocabulary } from '@/context/VocabularyContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  Users,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Loading from '@/components/Loading';

const AdminOverview: React.FC = () => {
  const { adminOverview, fetchAdminOverview, translate, isLoading } = useVocabulary();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null); // Added to track fetch errors

  const memoizedFetchAdminOverview = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setFetchAttempted(true);
      return;
    }

    try {
      await fetchAdminOverview(); // Call the fetch function from context
      setFetchAttempted(true);
      setFetchError(null); // Clear any previous errors on success
    } catch (error) {
      console.error("Failed to fetch admin overview:", error);
      setFetchError("Failed to load admin overview. Please try again.");
      setFetchAttempted(true);
    }
  }, [isAuthenticated, token, fetchAdminOverview]);

  useEffect(() => {
    if (isAuthenticated && token && !fetchAttempted) {
      memoizedFetchAdminOverview();
    } else if (!isAuthenticated && fetchAttempted) {
      navigate('/login');
    }
  }, [isAuthenticated, token, navigate, memoizedFetchAdminOverview, fetchAttempted]);

  const stats = [
    {
      title: 'Total Words',
      value: adminOverview?.totalWords ?? 0,
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      description: 'Word pairs in database',
      link: '/admin/vocabulary',
      linkText: 'Manage Words',
    },
    {
      title: 'Word Requests',
      value: adminOverview?.pendingRequests ?? 0,
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      description: 'Pending review',
      link: '/admin/requests',
      linkText: 'View Requests',
    },
    {
      title: 'Active Users',
      value: adminOverview?.activeUsers ?? 0,
      icon: <Users className="h-8 w-8 text-primary" />,
      description: 'Users this month',
      link: '#',
      linkText: 'User Analytics',
    },
    {
      title: 'Last Update',
      value: adminOverview?.lastUpdate
        ? new Date(adminOverview.lastUpdate).toLocaleDateString()
        : 'N/A',
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      description: 'Latest vocabulary update',
      link: '#',
      linkText: 'Activity Log',
    },
  ];

  if (!isAuthenticated && !fetchAttempted) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Please <Link to="/login" className="text-primary underline">log in</Link> to view admin overview.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Welcome to the admin dashboard</p>
        </div>
        <Button asChild>
          <Link to="/admin/vocabulary">
        <Languages className="mr-2 h-4 w-4" />
        Vocabulary
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : fetchError ? (
        <div className="text-center text-red-500">
          <p>{fetchError}</p>
          <Button variant="outline" onClick={memoizedFetchAdminOverview} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/50">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{stat.description}</p>
                  <Button variant="link" className="p-0 h-auto text-xs" asChild>
                    <Link to={stat.link}>{stat.linkText} →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminOverview?.recentActivity?.length > 0 ? (
                    adminOverview.recentActivity.map((activity) => {
                      const timeAgo = Math.floor(
                        (Date.now() - new Date(activity.timestamp).getTime()) / (1000 * 60 * 60)
                      );
                      return (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Word "{activity.bangla} / {activity.korean}" added
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {timeAgo} hour{timeAgo !== 1 ? 's' : ''} ago
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vocabulary Growth</CardTitle>
                  <CardDescription>Words added over time</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="h-[160px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-medium">{adminOverview?.totalWords ?? 0} words in total</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last word added:{' '}
                      {adminOverview?.lastUpdate
                        ? new Date(adminOverview.lastUpdate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link to="/admin/vocabulary">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Add New Words
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;