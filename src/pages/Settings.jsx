import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  Database,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();


  const settingsCategories = [
    {
      id: 'notifications',
      title: 'Notifications (Placeholder)',
      description: 'Configure system notifications and alerts',
      icon: Bell,
      color: 'bg-green-500',
      path: '/settings/notifications'
    },
    {
      id: 'appearance',
      title: 'App Theme',
      description: 'Light/Dark colors and Home/Feed/Live section backgrounds',
      icon: Palette,
      color: 'bg-purple-500',
      path: '/theme'
    },
    {
      id: 'database',
      title: 'Database (Placeholder)',
      description: 'Database settings and backup configuration',
      icon: Database,
      color: 'bg-orange-500',
      path: '/settings/database'
    },
    {
      id: 'email',
      title: 'Email (Placeholder)',
      description: 'SMTP configuration and email templates',
      icon: Mail,
      color: 'bg-red-500',
      path: '/settings/email'
    }
  ];

  const handleCategoryClick = (category) => {
    if (category.id === 'appearance') {
      navigate('/theme');
      return;
    }
    console.log(`Navigate to ${category.title}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories
          .map((category) => {
          const IconComponent = category.icon;

          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4"
              style={{ borderLeftColor: category.color.replace('bg-', '') === 'blue-500' ? '#3b82f6' :
                       category.color.replace('bg-', '') === 'green-500' ? '#10b981' :
                       category.color.replace('bg-', '') === 'purple-500' ? '#8b5cf6' :
                       category.color.replace('bg-', '') === 'orange-500' ? '#f97316' :
                       category.color.replace('bg-', '') === 'red-500' ? '#ef4444' : '#6b7280' }}
              onClick={() => handleCategoryClick(category)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <SettingsIcon className="h-5 w-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-600">
            <p>• Start with <strong>Roles & Permissions</strong> to set up user access control</p>
            <p>• Configure <strong>Notifications</strong> to stay informed about system events</p>
            <p>• Customize <strong>Appearance</strong> to match your brand</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;