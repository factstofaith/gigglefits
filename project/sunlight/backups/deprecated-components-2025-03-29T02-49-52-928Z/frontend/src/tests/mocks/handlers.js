// tests/mocks/handlers.js
// HTTP request handlers for MSW

import { http, HttpResponse } from 'msw';

// Sample application data for testing
const sampleApplications = [
  {
    id: 1,
    name: 'Salesforce',
    type: 'api',
    description: 'Salesforce CRM integration',
    status: 'active',
    is_public: true,
    auth_type: 'oauth2',
    created_at: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 2,
    name: 'Azure Blob Storage',
    type: 'file',
    description: 'Microsoft Azure Blob Storage',
    status: 'active',
    is_public: true,
    auth_type: 'api_key',
    created_at: '2025-01-20T14:30:00.000Z',
  },
];

// Sample usage stats for testing
const sampleUsageStats = {
  application: {
    id: 1,
    name: 'Salesforce',
    description: 'Salesforce CRM integration',
  },
  totalIntegrations: 24,
  activeIntegrations: 18,
  tenantsUsing: 5,
  recentActivity: [
    {
      event: 'Integration Created',
      tenant: 'Acme Corp',
      timestamp: '2025-03-15T10:30:00.000Z',
    },
    {
      event: 'Integration Run',
      tenant: 'TechStart Inc',
      timestamp: '2025-03-14T15:45:00.000Z',
    },
    {
      event: 'Configuration Updated',
      tenant: 'Globex Solutions',
      timestamp: '2025-03-12T09:20:00.000Z',
    },
  ],
};

// Define API handlers
export const handlers = [
  // All API paths
  http.get('/api/admin/applications', () => {
    return HttpResponse.json(sampleApplications, { status: 200 });
  }),

  http.get('/admin/applications', () => {
    return HttpResponse.json(sampleApplications, { status: 200 });
  }),
  
  // Documentation analytics endpoints
  http.get('/api/admin/documentation/analytics', () => {
    return HttpResponse.json({
      total_views: 1250,
      unique_documents: 45,
      unique_users: 120,
      start_date: '2025-03-01T00:00:00Z',
      end_date: '2025-03-22T23:59:59Z',
      top_documents: [
        { document_id: 'integration-guide', title: 'Integration Guide', views: 230 },
        { document_id: 'api-reference', title: 'API Reference', views: 180 },
        { document_id: 'getting-started', title: 'Getting Started', views: 140 }
      ],
      feedback: {
        positive: 85,
        negative: 15
      }
    }, { status: 200 });
  }),
  
  http.get('/api/admin/documentation/top-search-terms', () => {
    return HttpResponse.json([
      { term: 'integration flow', count: 78 },
      { term: 'api key', count: 65 },
      { term: 'webhook', count: 52 },
      { term: 'oauth setup', count: 45 },
      { term: 'error handling', count: 38 }
    ], { status: 200 });
  }),
  
  http.get('/api/admin/documentation/category-usage', () => {
    return HttpResponse.json([
      { category: 'Getting Started', views: 450, documents: 10 },
      { category: 'Integrations', views: 350, documents: 15 },
      { category: 'API Reference', views: 250, documents: 25 },
      { category: 'Tutorials', views: 150, documents: 8 },
      { category: 'Troubleshooting', views: 50, documents: 5 }
    ], { status: 200 });
  }),
  
  // User security settings endpoints
  http.get('/api/users/security-settings', () => {
    return HttpResponse.json({
      mfaEnabled: true,
      lastPasswordChange: '2025-01-15T10:00:00Z',
      recoveryCodes: [
        'AB12-CD34-EF56',
        'GH78-IJ90-KL12',
        'MN34-OP56-QR78',
        'ST90-UV12-WX34',
        'YZ56-78AB-90CD'
      ],
      securityQuestions: true,
      loginHistory: [
        {
          date: '2025-03-22T14:30:00Z',
          ip: '192.168.1.1',
          device: 'Chrome on Windows',
          location: 'New York, USA'
        },
        {
          date: '2025-03-20T09:15:00Z',
          ip: '192.168.1.1',
          device: 'Chrome on Windows',
          location: 'New York, USA'
        }
      ]
    }, { status: 200 });
  }),

  // Get application by ID
  http.get('/api/admin/applications/:id', ({ params }) => {
    const { id } = params;
    const application = sampleApplications.find(app => app.id === Number(id));

    if (!application) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    return HttpResponse.json(application, { status: 200 });
  }),

  // Create application
  http.post('/api/admin/applications', async ({ request }) => {
    const application = await request.json();
    const newApplication = {
      ...application,
      id: sampleApplications.length + 1,
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json(newApplication, { status: 201 });
  }),

  // Update application
  http.put('/api/admin/applications/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    const index = sampleApplications.findIndex(app => app.id === Number(id));

    if (index === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    const updatedApplication = {
      ...sampleApplications[index],
      ...updates,
    };

    return HttpResponse.json(updatedApplication, { status: 200 });
  }),

  // Delete application
  http.delete('/api/admin/applications/:id', ({ params }) => {
    const { id } = params;
    const index = sampleApplications.findIndex(app => app.id === Number(id));

    if (index === -1) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Get application usage stats
  http.get('/api/admin/applications/:id/stats', ({ params }) => {
    const { id } = params;

    // Mock checking if application exists
    const application = sampleApplications.find(app => app.id === Number(id));

    if (!application) {
      return HttpResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Return sample stats with application name
    const stats = {
      ...sampleUsageStats,
      application: {
        ...sampleUsageStats.application,
        name: application.name,
        description: application.description,
      },
    };

    return HttpResponse.json(stats, { status: 200 });
  }),

  // Auth token endpoint
  http.post('/api/auth/token', () => {
    return HttpResponse.json(
      {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      },
      { status: 200 }
    );
  }),

  // Refresh token endpoint
  http.post('/api/auth/refresh', () => {
    return HttpResponse.json(
      {
        access_token: 'mock-refreshed-token',
        refresh_token: 'mock-new-refresh-token',
        expires_in: 3600,
      },
      { status: 200 }
    );
  }),

  // Current user endpoint
  http.get('/api/integrations/current-user', () => {
    return HttpResponse.json(
      {
        id: 'user_1',
        username: 'testuser',
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'admin',
        tenantId: 'tenant_1',
        createdAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }),
];
