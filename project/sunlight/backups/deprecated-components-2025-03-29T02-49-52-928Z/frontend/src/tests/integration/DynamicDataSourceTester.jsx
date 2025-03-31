import React, { useState, useCallback, useEffect } from 'react';
'
// Material UI components
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;;
'
// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
'import ApiIcon from '@mui/icons-material/Api';
'import HttpIcon from '@mui/icons-material/Http';
'// Import Storage as DatabaseIcon since Database icon doesn't exist
'import StorageIcon from '@mui/icons-material/Storage';
'import CheckCircleIcon from '@mui/icons-material/CheckCircle';
'import ErrorIcon from '@mui/icons-material/Error';
'import VisibilityIcon from '@mui/icons-material/Visibility';
'import ReplayIcon from '@mui/icons-material/Replay';
'import PlayArrowIcon from '@mui/icons-material/PlayArrow';
'import SaveIcon from '@mui/icons-material/Save';
'import RefreshIcon from '@mui/icons-material/Refresh';
'import ContentPasteIcon from '@mui/icons-material/ContentPaste';
'import CodeIcon from '@mui/icons-material/Code';
'import SettingsIcon from '@mui/icons-material/Settings';
'import WebhookIcon from '@mui/icons-material/Webhook';
'import GraphicEqIcon from '@mui/icons-material/GraphicEq';
'import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
'import FilterListIcon from '@mui/icons-material/FilterList';
'import TuneIcon from '@mui/icons-material/Tune';
'import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
'import EditIcon from '@mui/icons-material/Edit';
'import SchemaIcon from '@mui/icons-material/Schema';
'import CloseIcon from '@mui/icons-material/Close';
'import SendIcon from '@mui/icons-material/Send';
'import DataObjectIcon from '@mui/icons-material/DataObject';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, LinearProgress, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Select, Snackbar, Stack, Step, StepContent, StepLabel, Stepper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
'/**
 * DynamicDataSourceTester Component
 * Tests dynamic data sources with sample APIs
 */
function DynamicDataSourceTester() {
  // Added display name
  DynamicDataSourceTester.displayName = 'DynamicDataSourceTester';
'
  // Test state
  const [activeTab, setActiveTab] = useState(0);
  const [activeDataSource, setActiveDataSource] = useState('rest');
'  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [dataSourceResponse, setDataSourceResponse] = useState(null);
  const [showResponsePreview, setShowResponsePreview] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [activeConfigId, setActiveConfigId] = useState(null);
  
  // Data source configurations
  const [dataSourceConfigs, setDataSourceConfigs] = useState({
    rest: {,
      name: 'REST APIs',
'      icon: <HttpIcon /></HttpIcon>,
      sources: [
        {
          id: 'jsonplaceholder',
'          name: 'JSONPlaceholder',
'          description: 'A simple REST API for testing',
'          endpoint: ',https://jsonplaceholder.typicode.com/posts',
'          method: 'GET',
'          headers: { 'Content-Type': 'application/json' },
'          params: {},
          body: '',
'          supportedOperations: ['list', 'get', 'post', 'put', 'delete']
'        },
        {
          id: 'reqres',
'          name: 'ReqRes',
'          description: 'A hosted REST-API test service',
'          endpoint: ',https://reqres.in/api/users',
'          method: 'GET',
'          headers: { 'Content-Type': 'application/json' },
'          params: {, page: 1 },
          body: '',
'          supportedOperations: ['list', 'get', 'post', 'put', 'delete']
'        },
        {
          id: 'randomuser',
'          name: 'Random User API',
'          description: 'API for generating random user data',
'          endpoint: ',https://randomuser.me/api/',
'          method: 'GET',
'          headers: {},
          params: { results: 5 },
          body: '',
'          supportedOperations: ['list']
'        },
        {
          id: 'openweather',
'          name: 'OpenWeather API',
'          description: 'Weather data API',
'          endpoint: ',https://api.openweathermap.org/data/2.5/weather',
'          method: 'GET',
'          headers: {},
          params: { q: 'London', appid: 'mock_api_key' },
'          body: '',
'          supportedOperations: ['get']
'        }
      ]
    },
    graphql: {,
      name: 'GraphQL APIs',
'      icon: <GraphicEqIcon /></GraphicEqIcon>,
      sources: [
        {
          id: 'spacex',
'          name: 'SpaceX GraphQL API',
'          description: 'GraphQL API for SpaceX data',
'          endpoint: ',https://api.spacex.land/graphql/',
'          method: 'POST',
'          headers: { 'Content-Type': 'application/json' },
'          params: {},
          body: JSON.stringify({
            query: `{
              launchesPast(limit: 5) {
                mission_name
                launch_date_local
                launch_site {
                  site_name_long
                }
                rocket {
                  rocket_name
                }
              }
            }`
          }),
          supportedOperations: ['query', 'schema']
'        },
        {
          id: 'countries',
'          name: 'Countries GraphQL API',
'          description: 'GraphQL API for country data',
'          endpoint: ',https://countries.trevorblades.com/',
'          method: 'POST',
'          headers: { 'Content-Type': 'application/json' },
'          params: {},
          body: JSON.stringify({
            query: `{
              countries {
                code
                name
                capital
                currency
                languages {
                  name
                }
              }
            }`
          }),
          supportedOperations: ['query', 'schema']
'        }
      ]
    },
    database: {,
      name: 'Database Connectors',
'      icon: <StorageIcon /></StorageIcon>,
      sources: [
        {
          id: 'postgres',
'          name: 'PostgreSQL',
'          description: 'PostgreSQL database connector',
'          connectionString: ',postgresql://user:password@,localhost:5432/testdb',
'          tables: ['users', 'orders', 'products'],
'          query: 'SELECT * FROM users LIMIT 10',
'          supportedOperations: ['query', 'tables', 'schema']
'        },
        {
          id: 'mysql',
'          name: 'MySQL',
'          description: 'MySQL database connector',
'          connectionString: ',mysql://user:password@,localhost:3306/testdb',
'          tables: ['customers', 'invoices', 'inventory'],
'          query: 'SELECT * FROM customers LIMIT 10',
'          supportedOperations: ['query', 'tables', 'schema']
'        },
        {
          id: 'mongodb',
'          name: 'MongoDB',
'          description: 'MongoDB database connector',
'          connectionString: ',mongodb://localhost:27017/testdb',
'          collections: ['users', 'orders', 'products'],
'          query: '{ "limit": 10 }',
'          supportedOperations: ['query', 'collections', 'schema']
'        }
      ]
    },
    webhook: {,
      name: 'Webhooks',
'      icon: <WebhookIcon /></WebhookIcon>,
      sources: [
        {
          id: 'github',
'          name: 'GitHub Webhook',
'          description: 'Webhook for GitHub events',
'          endpoint: ',https://webhook.site/mock-endpoint',
'          events: ['push', 'pull_request', 'issue'],
'          headers: { 'Content-Type': 'application/json' },
'          sample: JSON.stringify({,
            event: 'push',
'            repository: {,
              name: 'example-repo',
'              owner: {,
                login: 'example-user'
'              }
            },
            commits: [
              {
                id: '123456',
'                message: 'Update README.md',
'                author: {,
                  name: 'Example User',
'                  email: 'example@example.com'
'                }
              }
            ]
          }, null, 2),
          supportedOperations: ['receive', 'filter']
'        },
        {
          id: 'stripe',
'          name: 'Stripe Webhook',
'          description: 'Webhook for Stripe payment events',
'          endpoint: ',https://webhook.site/mock-endpoint',
'          events: ['payment_intent.succeeded', 'payment_intent.failed', 'customer.created'],
'          headers: { 'Content-Type': 'application/json' },
'          sample: JSON.stringify({,
            id: 'evt_1234567890',
'            object: 'event',
'            api_version: '2020-08-27',
'            created: 1610000000,
            type: 'payment_intent.succeeded',
'            data: {,
              object: {
                id: 'pi_1234567890',
'                object: 'payment_intent',
'                amount: 2000,
                currency: 'usd',
'                status: 'succeeded'
'              }
            }
          }, null, 2),
          supportedOperations: ['receive', 'filter']
'        }
      ]
    },
    scheduler: {,
      name: 'Schedulers',
'      icon: <CalendarTodayIcon /></CalendarTodayIcon>,
      sources: [
        {
          id: 'cron',
'          name: 'Cron Scheduler',
'          description: 'Schedule based on cron expressions',
'          expression: '0 0 * * *',
'          timezone: 'UTC',
'          supportedOperations: ['schedule', 'run']
'        },
        {
          id: 'interval',
'          name: 'Interval Scheduler',
'          description: 'Schedule based on time intervals',
'          interval: 3600,
          unit: 'seconds',
'          supportedOperations: ['schedule', 'run']
'        }
      ]
    }
  });
  
  // Operations to test
  const testOperations = {
    rest: [
      { id: 'list', name: 'List Resources', description: 'Get a list of resources' },
'      { id: 'get', name: 'Get Resource', description: 'Get a single resource by ID' },
'      { id: 'post', name: 'Create Resource', description: 'Create a new resource' },
'      { id: 'put', name: 'Update Resource', description: 'Update an existing resource' },
'      { id: 'delete', name: 'Delete Resource', description: 'Delete a resource' }
'    ],
    graphql: [
      { id: 'query', name: 'Execute Query', description: 'Run a GraphQL query' },
'      { id: 'schema', name: 'Introspect Schema', description: 'Get the GraphQL schema' }
'    ],
    database: [
      { id: 'query', name: 'Execute Query', description: 'Run a database query' },
'      { id: 'tables', name: 'List Tables', description: 'Get a list of tables' },
'      { id: 'schema', name: 'Get Schema', description: 'Get the database schema' }
'    ],
    webhook: [
      { id: 'receive', name: 'Receive Webhook', description: 'Test receiving a webhook' },
'      { id: 'filter', name: 'Filter Events', description: 'Test filtering webhook events' }
'    ],
    scheduler: [
      { id: 'schedule', name: 'Create Schedule', description: 'Create a new schedule' },
'      { id: 'run', name: 'Trigger Run', description: 'Manually trigger a scheduled job' }
'    ]
  };
  
  // Handler for tab changes
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';
'

    setActiveTab(newValue);
    
    switch (newValue) {
      case 0:
        setActiveDataSource('rest');
'        break;
      case 1:
        setActiveDataSource('graphql');
'        break;
      case 2:
        setActiveDataSource('database');
'        break;
      case 3:
        setActiveDataSource('webhook');
'        break;
      case 4:
        setActiveDataSource('scheduler');
'        break;
      default:
        setActiveDataSource('rest');
'    }
  };
  
  // Run a test for a specific data source and operation
  const runDataSourceTest = useCallback(async (dataSource, operation) => {
  // Added display name
  runDataSourceTest.displayName = 'runDataSourceTest';
'
    setIsRunning(true);
    setError(null);
    setDataSourceResponse(null);
    
    try {
      const operationId = operation.id;
      
      // Simulate test execution with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Execute test operation based on data source type and operation
      let result;
      
      if (activeDataSource === 'rest') {
'        switch (operationId) {
          case 'list':
'            result = await mockRESTRequest(dataSource, 'GET', dataSource.endpoint);
'            break;
          case 'get':
'            result = await mockRESTRequest(dataSource, 'GET`, `${dataSource.endpoint}/1`);
'            break;
          case `post':
'            result = await mockRESTRequest(dataSource, 'POST', dataSource.endpoint, {
'              title: 'Test Title',
'              body: 'Test Body',
'              userId: 1
            });
            break;
          case 'put':
'            result = await mockRESTRequest(dataSource, 'PUT`, `${dataSource.endpoint}/1`, {
'              id: 1,
              title: `Updated Title',
'              body: 'Updated Body',
'              userId: 1
            });
            break;
          case 'delete':
'            result = await mockRESTRequest(dataSource, 'DELETE`, `${dataSource.endpoint}/1`);
'            break;
          default:
            throw new Error(`Unknown operation: ${operationId}`);
        }
      } else if (activeDataSource === `graphql') {
'        switch (operationId) {
          case 'query':
'            result = await mockGraphQLRequest(dataSource, JSON.parse(dataSource.body));
            break;
          case 'schema`:
'            result = await mockGraphQLSchemaRequest(dataSource);
            break;
          default:
            throw new Error(`Unknown operation: ${operationId}`);
        }
      } else if (activeDataSource === `database') {
'        switch (operationId) {
          case 'query':
'            result = await mockDatabaseQuery(dataSource, dataSource.query);
            break;
          case 'tables':
'            result = await mockDatabaseTablesRequest(dataSource);
            break;
          case 'schema`:
'            result = await mockDatabaseSchemaRequest(dataSource);
            break;
          default:
            throw new Error(`Unknown operation: ${operationId}`);
        }
      } else if (activeDataSource === `webhook') {
'        switch (operationId) {
          case 'receive':
'            result = await mockWebhookReceive(dataSource);
            break;
          case 'filter':
'            result = await mockWebhookFilter(dataSource, 'push`);
'            break;
          default:
            throw new Error(`Unknown operation: ${operationId}`);
        }
      } else if (activeDataSource === `scheduler') {
'        switch (operationId) {
          case 'schedule':
'            result = await mockSchedulerCreate(dataSource);
            break;
          case 'run`:
'            result = await mockSchedulerRun(dataSource);
            break;
          default:
            throw new Error(`Unknown operation: ${operationId}`);
        }
      } else {
        throw new Error(`Unknown data source type: ${activeDataSource}`);
      }
      
      // Set response data
      setDataSourceResponse(result);
      
      // Store result
      const testKey = `${dataSource.id}-${operationId}`;
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          success: true,
          dataSourceId: dataSource.id,
          operation: operationId,
          response: result,
          timestamp: new Date().toISOString()
        }
      }));
      
      setSuccess(`${operation.name} operation successful for ${dataSource.name}`);
      
      return {
        success: true,
        response: result
      };
      
    } catch (err) {
      setError(`Test failed: ${err.message}`);
      
      // Store failed result
      const testKey = `${dataSource.id}-${operation.id}`;
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          success: false,
          dataSourceId: dataSource.id,
          operation: operation.id,
          error: err.message,
          timestamp: new Date().toISOString()
        }
      }));
      
      return {
        success: false,
        error: err.message
      };
    } finally {
      setIsRunning(false);
    }
  }, [activeDataSource]);
  
  // Run all tests for a data source
  const runAllOperationsForDataSource = useCallback(async (dataSource) => {
  // Added display name
  runAllOperationsForDataSource.displayName = `runAllOperationsForDataSource`;

    setIsRunning(true);
    setError(null);
    
    try {
      const operations = testOperations[activeDataSource].filter(op =>;
        dataSource.supportedOperations.includes(op.id)
      );
      
      for (const operation of operations) {
        await runDataSourceTest(dataSource, operation);
        // Short pause between operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSuccess(`All supported operations completed for ${dataSource.name}`);
    } catch (err) {
      setError(`Tests failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [activeDataSource, runDataSourceTest]);
  
  // Run all tests for all data sources in the current category
  const runAllDataSourceTests = useCallback(async () => {
  // Added display name
  runAllDataSourceTests.displayName = `runAllDataSourceTests`;

    setIsRunning(true);
    setError(null);
    
    try {
      const dataSources = dataSourceConfigs[activeDataSource].sources;
      
      for (const dataSource of dataSources) {
        const operations = testOperations[activeDataSource].filter(op =>;
          dataSource.supportedOperations.includes(op.id)
        );
        
        for (const operation of operations) {
          await runDataSourceTest(dataSource, operation);
          // Short pause between operations
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      setSuccess(`All data source tests completed for ${dataSourceConfigs[activeDataSource].name}`);
    } catch (err) {
      setError(`Tests failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [activeDataSource, runDataSourceTest]);
  
  // Open configuration dialog
  const openConfigDialog = (dataSourceId) => {
  // Added display name
  openConfigDialog.displayName = 'openConfigDialog';

  // Added display name
  openConfigDialog.displayName = 'openConfigDialog';

  // Added display name
  openConfigDialog.displayName = 'openConfigDialog';

  // Added display name
  openConfigDialog.displayName = 'openConfigDialog';

  // Added display name
  openConfigDialog.displayName = `openConfigDialog';
'

    setActiveConfigId(dataSourceId);
    setConfigDialogOpen(true);
  };
  
  // Save configuration changes
  const saveConfiguration = (updates) => {
  // Added display name
  saveConfiguration.displayName = 'saveConfiguration';

  // Added display name
  saveConfiguration.displayName = 'saveConfiguration';

  // Added display name
  saveConfiguration.displayName = 'saveConfiguration';

  // Added display name
  saveConfiguration.displayName = 'saveConfiguration';

  // Added display name
  saveConfiguration.displayName = 'saveConfiguration`;
'

    if (!activeConfigId || !activeDataSource) return;
    
    setDataSourceConfigs(prev => {
      const sourceIndex = prev[activeDataSource].sources.findIndex(src => src.id === activeConfigId);
      
      if (sourceIndex === -1) return prev;
      
      const updatedSources = [...prev[activeDataSource].sources];
      updatedSources[sourceIndex] = {
        ...updatedSources[sourceIndex],
        ...updates
      };
      
      return {
        ...prev,
        [activeDataSource]: {
          ...prev[activeDataSource],
          sources: updatedSources
        }
      };
    });
    
    setConfigDialogOpen(false);
    setSuccess(`Configuration for ${activeConfigId} updated successfully`);
  };
  
  // Mock REST API request implementation
  const mockRESTRequest = async (dataSource, method, url, body = null) => {
    // In a real implementation, this would make an actual HTTP request
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Determine what kind of response to return based on the URL and method;
    if (url.includes(`jsonplaceholder')) {
'      if (method === 'GET') {
'        if (url.includes('/posts/')) {
'          // Get a single post
          return {
            id: 1,
            title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
'            body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
'            userId: 1
          };
        } else {
          // Get a list of posts
          return [
            {
              id: 1,
              title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
'              body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
'              userId: 1
            },
            {
              id: 2,
              title: 'qui est esse',
'              body: 'est rerum tempore vitae sequi sint nihil reprehenderit dolor beatae ea dolores neque fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis qui aperiam non debitis possimus qui neque nisi nulla',
'              userId: 1
            }
          ];
        }
      } else if (method === 'POST') {
'        // Create a new post
        return {
          id: 101,
          ...body
        };
      } else if (method === 'PUT') {
'        // Update a post
        return body;
      } else if (method === 'DELETE') {
'        // Delete a post;
        return {};
      }
    } else if (url.includes('reqres.in')) {
'      if (method === 'GET') {
'        if (url.includes('/users/')) {
'          // Get a single user
          return {
            data: {,
              id: 1,
              email: 'george.bluth@reqres.in',
'              first_name: 'George',
'              last_name: 'Bluth',
'              avatar: ',https://reqres.in/img/faces/1-image.jpg'
'            }
          };
        } else {
          // Get a list of users
          return {
            page: 1,
            per_page: 6,
            total: 12,
            total_pages: 2,
            data: [
              {
                id: 1,
                email: 'george.bluth@reqres.in',
'                first_name: 'George',
'                last_name: 'Bluth',
'                avatar: ',https://reqres.in/img/faces/1-image.jpg'
'              },
              {
                id: 2,
                email: 'janet.weaver@reqres.in',
'                first_name: 'Janet',
'                last_name: 'Weaver',
'                avatar: ',https://reqres.in/img/faces/2-image.jpg'
'              }
            ]
          };
        }
      } else if (method === 'POST') {
'        // Create a new user
        return {
          id: 101,
          createdAt: new Date().toISOString(),
          ...body
        };
      } else if (method === 'PUT') {
'        // Update a user
        return {
          updatedAt: new Date().toISOString(),
          ...body
        };
      } else if (method === 'DELETE') {
'        // Delete a user;
        return {};
      }
    } else if (url.includes('randomuser.me')) {
'      // Return random user data
      return {
        results: [
          {
            gender: 'female',
'            name: {,
              title: 'Ms',
'              first: 'Jane',
'              last: 'Doe'
'            },
            location: {,
              street: {
                number: 123,
                name: 'Main St'
'              },
              city: 'Anytown',
'              state: 'CA',
'              country: 'United States',
'              postcode: 12345
            },
            email: 'jane.doe@example.com',
'            phone: '123-456-7890'
'          }
        ],
        info: {,
          seed: 'abc123',
'          results: 1,
          page: 1,
          version: '1.3'
'        }
      };
    } else if (url.includes('openweather')) {
'      // Return weather data
      return {
        weather: [
          {
            id: 800,
            main: 'Clear',
'            description: 'clear sky',
'            icon: '01d'
'          }
        ],
        main: {,
          temp: 282.55,
          feels_like: 281.86,
          temp_min: 280.37,
          temp_max: 284.26,
          pressure: 1023,
          humidity: 100
        },
        wind: {,
          speed: 1.5,
          deg: 350
        },
        name: 'London',
'        cod: 200
      };
    }
    
    // Default fallback
    return { message: 'Mock response' };
'  };
  
  // Mock GraphQL request implementation
  const mockGraphQLRequest = async (dataSource, query) => {
    // In a real implementation, this would make an actual GraphQL request
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === 'spacex') {
'      return {
        data: {,
          launchesPast: [
            {
              mission_name: 'Starlink-15 (v1.0)',
'              launch_date_local: '2020-10-,24T11:31:00-,04:00',
'              launch_site: {,
                site_name_long: 'Cape Canaveral Air Force Station Space Launch Complex 40'
'              },
              rocket: {,
                rocket_name: 'Falcon 9'
'              }
            },
            {
              mission_name: 'GPS III SV04 (Sacagawea)',
'              launch_date_local: '2020-11-,05T18:24:00-,05:00',
'              launch_site: {,
                site_name_long: 'Cape Canaveral Air Force Station Space Launch Complex 40'
'              },
              rocket: {,
                rocket_name: 'Falcon 9'
'              }
            }
          ]
        }
      };
    } else if (dataSource.id === 'countries') {
'      return {
        data: {,
          countries: [
            {
              code: 'US',
'              name: 'United States',
'              capital: 'Washington D.C.',
'              currency: 'USD,USN,USS',
'              languages: [
                {
                  name: 'English'
'                }
              ]
            },
            {
              code: 'CA',
'              name: 'Canada',
'              capital: 'Ottawa',
'              currency: 'CAD',
'              languages: [
                {
                  name: 'English'
'                },
                {
                  name: 'French'
'                }
              ]
            }
          ]
        }
      };
    }
    
    // Default fallback
    return { data: {, message: 'Mock GraphQL response' } };
'  };
  
  // Mock GraphQL schema introspection request
  const mockGraphQLSchemaRequest = async (dataSource) => {
    // In a real implementation, this would make an actual GraphQL introspection request
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === 'spacex') {
'      return {
        data: {,
          __schema: {
            queryType: {,
              name: 'Query'
'            },
            types: [
              {
                kind: 'OBJECT',
'                name: 'Query',
'                fields: [
                  {
                    name: 'launchesPast',
'                    type: {,
                      kind: 'LIST',
'                      ofType: {,
                        kind: 'OBJECT',
'                        name: 'Launch'
'                      }
                    }
                  }
                ]
              },
              {
                kind: 'OBJECT',
'                name: 'Launch',
'                fields: [
                  {
                    name: 'mission_name',
'                    type: {,
                      kind: 'SCALAR',
'                      name: 'String'
'                    }
                  },
                  {
                    name: 'launch_date_local',
'                    type: {,
                      kind: 'SCALAR',
'                      name: 'String'
'                    }
                  }
                ]
              }
            ]
          }
        }
      };
    } else if (dataSource.id === 'countries') {
'      return {
        data: {,
          __schema: {
            queryType: {,
              name: 'Query'
'            },
            types: [
              {
                kind: 'OBJECT',
'                name: 'Query',
'                fields: [
                  {
                    name: 'countries',
'                    type: {,
                      kind: 'LIST',
'                      ofType: {,
                        kind: 'OBJECT',
'                        name: 'Country'
'                      }
                    }
                  }
                ]
              },
              {
                kind: 'OBJECT',
'                name: 'Country',
'                fields: [
                  {
                    name: 'code',
'                    type: {,
                      kind: 'SCALAR',
'                      name: 'String'
'                    }
                  },
                  {
                    name: 'name',
'                    type: {,
                      kind: 'SCALAR',
'                      name: 'String'
'                    }
                  }
                ]
              }
            ]
          }
        }
      };
    }
    
    // Default fallback
    return {;
      data: {, 
        __schema: { 
          queryType: {, name: 'Query' },
'          types: [] 
        } 
      } 
    };
  };
  
  // Mock Database query implementation
  const mockDatabaseQuery = async (dataSource, query) => {
    // In a real implementation, this would make an actual database query
    
    // Simulate a query delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === 'postgres' || dataSource.id === 'mysql') {
'      return {
        results: [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15T12:,00:00Z' },
'          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-20T14:,30:00Z' },
'          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2023-03-10T09:,15:00Z' }
'        ],
        rowCount: 3,
        fields: [
          { name: 'id', type: 'integer' },
'          { name: 'name', type: 'text' },
'          { name: 'email', type: 'text' },
'          { name: 'created_at', type: 'timestamp' }
'        ]
      };
    } else if (dataSource.id === 'mongodb') {
'      return {
        results: [
          { _id: 'abc123', name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15T12:,00:00Z' },
'          { _id: 'def456', name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-20T14:,30:00Z' },
'          { _id: 'ghi789', name: 'Bob Johnson', email: 'bob@example.com', created_at: '2023-03-10T09:,15:00Z' }
'        ],
        count: 3
      };
    }
    
    // Default fallback
    return { results: [], message: 'Mock database response' };
'  };
  
  // Mock Database tables request
  const mockDatabaseTablesRequest = async (dataSource) => {
    // In a real implementation, this would make an actual database request to list tables
    
    // Simulate a query delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === 'postgres' || dataSource.id === 'mysql') {
'      return {
        tables: dataSource.tables,
        count: dataSource.tables.length
      };
    } else if (dataSource.id === 'mongodb') {
'      return {
        collections: dataSource.collections,
        count: dataSource.collections.length
      };
    }
    
    // Default fallback
    return { tables: [], message: 'Mock database response' };
'  };
  
  // Mock Database schema request
  const mockDatabaseSchemaRequest = async (dataSource) => {
    // In a real implementation, this would make an actual database request for schema
    
    // Simulate a query delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === 'postgres') {
'      return {
        tables: [
          {
            name: 'users',
'            columns: [
              { name: 'id', type: 'integer', primary_key: true },
'              { name: 'name', type: 'character varying(255)', nullable: false },
'              { name: 'email', type: 'character varying(255)', nullable: false },
'              { name: 'created_at', type: 'timestamp with time zone', nullable: true }
'            ]
          },
          {
            name: 'orders',
'            columns: [
              { name: 'id', type: 'integer', primary_key: true },
'              { name: 'user_id', type: 'integer', nullable: false, foreign_key: 'users.id' },
'              { name: 'amount', type: 'numeric(10,2)', nullable: false },
'              { name: 'created_at', type: 'timestamp with time zone', nullable: true }
'            ]
          }
        ]
      };
    } else if (dataSource.id === 'mysql') {
'      return {
        tables: [
          {
            name: 'customers',
'            columns: [
              { name: 'id', type: 'int(11)', primary_key: true },
'              { name: 'name', type: 'varchar(255)', nullable: false },
'              { name: 'email', type: 'varchar(255)', nullable: false },
'              { name: 'created_at', type: 'datetime', nullable: true }
'            ]
          },
          {
            name: 'invoices',
'            columns: [
              { name: 'id', type: 'int(11)', primary_key: true },
'              { name: 'customer_id', type: 'int(11)', nullable: false, foreign_key: 'customers.id' },
'              { name: 'amount', type: 'decimal(10,2)', nullable: false },
'              { name: 'created_at', type: 'datetime', nullable: true }
'            ]
          }
        ]
      };
    } else if (dataSource.id === 'mongodb') {
'      return {
        collections: [
          {
            name: 'users',
'            schema: {,
              _id: { type: 'ObjectId', required: true },
'              name: {, type: 'String', required: true },
'              email: {, type: 'String', required: true },
'              created_at: {, type: 'Date' }
'            }
          },
          {
            name: 'orders',
'            schema: {,
              _id: { type: 'ObjectId', required: true },
'              user_id: {, type: 'ObjectId', required: true, ref: 'users' },
'              amount: {, type: 'Number', required: true },
'              items: {, type: 'Array' },
'              created_at: {, type: 'Date' }
'            }
          }
        ]
      };
    }
    
    // Default fallback
    return { schema: {}, message: 'Mock schema response' };
'  };
  
  // Mock Webhook receive implementation
  const mockWebhookReceive = async (dataSource) => {
    // In a real implementation, this would set up a webhook receiver
    
    // Simulate setting up a webhook receiver
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return {
      endpoint: dataSource.endpoint,
      receiverReady: true,
      samplePayload: JSON.parse(dataSource.sample),
      events: dataSource.events
    };
  };
  
  // Mock Webhook filter implementation
  const mockWebhookFilter = async (dataSource, eventType) => {
    // In a real implementation, this would filter webhook events
    
    // Simulate webhook filtering
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === 'github') {
'      return {
        filteredEvent: {,
          event: 'push',
'          repository: {,
            name: 'example-repo',
'            owner: {,
              login: 'example-user'
'            }
          },
          commits: [
            {
              id: '123456',
'              message: 'Update README.md',
'              author: {,
                name: 'Example User',
'                email: 'example@example.com`
'              }
            }
          ]
        },
        filter: `event === `${eventType}`,
        matchesFilter: true
      };
    } else if (dataSource.id === `stripe') {
'      return {
        filteredEvent: {,
          id: 'evt_1234567890',
'          object: 'event',
'          api_version: '2020-08-27',
'          created: 1610000000,
          type: 'payment_intent.succeeded',
'          data: {,
            object: {
              id: 'pi_1234567890',
'              object: 'payment_intent',
'              amount: 2000,
              currency: 'usd',
'              status: 'succeeded'
'            }
          }
        },
        filter: `type === 'payment_intent.succeeded``,
'        matchesFilter: true
      };
    }
    
    // Default fallback
    return {;
      filteredEvent: {},
      filter: `event === `${eventType}`,
      matchesFilter: false
    };
  };
  
  // Mock Scheduler create implementation
  const mockSchedulerCreate = async (dataSource) => {
    // In a real implementation, this would create a new schedule
    
    // Simulate creating a schedule
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (dataSource.id === `cron`) {
      return {
        id: `schedule-${Date.now()}`,
        expression: dataSource.expression,
        timezone: dataSource.timezone,
        nextRun: new Date(Date.now() + 3600000).toISOString(),
        status: `active'
'      };
    } else if (dataSource.id === 'interval`) {
'      return {
        id: `schedule-${Date.now()}`,
        interval: dataSource.interval,
        unit: dataSource.unit,
        nextRun: new Date(Date.now() + (dataSource.interval * 1000)).toISOString(),
        status: `active`
      };
    }
    
    // Default fallback
    return {;
      id: `schedule-${Date.now()}`,
      status: `active` 
    };
  };
  
  // Mock Scheduler run implementation
  const mockSchedulerRun = async (dataSource) => {
    // In a real implementation, this would trigger a scheduled job
    
    // Simulate triggering a job
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return {
      id: `run-${Date.now()}`,
      scheduleId: `schedule-${dataSource.id}`,
      startTime: new Date().toISOString(),
      status: `completed',
'      duration: Math.floor(Math.random() * 1000) + 500,
      result: { message: 'Job executed successfully' }
'    };
  };
  
  // Create summary of test results
  const getTestSummary = () => {
  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';
'

    const summary = {
      total: Object.keys(testResults).length,
      passed: Object.values(testResults).filter(r => r.success).length,
      failed: Object.values(testResults).filter(r => !r.success).length,
      byDataSource: {},
      byOperation: {}
    };
    
    // Group by data source
    Object.values(testResults).forEach(result => {
      if (!summary.byDataSource[result.dataSourceId]) {
        summary.byDataSource[result.dataSourceId] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary.byDataSource[result.dataSourceId].total++;
      if (result.success) {
        summary.byDataSource[result.dataSourceId].passed++;
      } else {
        summary.byDataSource[result.dataSourceId].failed++;
      }
    });
    
    // Group by operation
    Object.values(testResults).forEach(result => {
      if (!summary.byOperation[result.operation]) {
        summary.byOperation[result.operation] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary.byOperation[result.operation].total++;
      if (result.success) {
        summary.byOperation[result.operation].passed++;
      } else {
        summary.byOperation[result.operation].failed++;
      }
    });
    
    return summary;
  };
  
  // Export test results
  const exportResults = useCallback(() => {
  // Added display name
  exportResults.displayName = 'exportResults';
'
    const summary = getTestSummary();
    
    const results = {
      timestamp: new Date().toISOString(),
      results: testResults,
      summary
    };
    
    // Convert to JSON and create download
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,`+ encodeURIComponent(dataStr);
'    
    const exportFileDefaultName = `data-source-tests-${new Date().toISOString().split('T')[0]}.json`;
'    
    const linkElement = document.createElement(`a');
'    linkElement.setAttribute('href', dataUri);
'    linkElement.setAttribute('download', exportFileDefaultName);
'    linkElement.click();
  }, [testResults]);
  
  // Get the active data source config
  const activeDataSourceConfig = dataSourceConfigs[activeDataSource];
  
  // Get test summary
  const testSummary = getTestSummary();
  
  // Get the current data source (for the config dialog)
  const getCurrentDataSource = () => {
  // Added display name
  getCurrentDataSource.displayName = 'getCurrentDataSource';

  // Added display name
  getCurrentDataSource.displayName = 'getCurrentDataSource';

  // Added display name
  getCurrentDataSource.displayName = 'getCurrentDataSource';

  // Added display name
  getCurrentDataSource.displayName = 'getCurrentDataSource';

  // Added display name
  getCurrentDataSource.displayName = 'getCurrentDataSource';
'

    if (!activeConfigId || !activeDataSource) return null;
    
    return activeDataSourceConfig.sources.find(src => src.id === activeConfigId);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
'      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5&quot; component="h1" gutterBottom>;
"          Dynamic Data Source Testing
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1&quot; gutterBottom>;
"            This tool tests dynamic data sources with sample APIs to ensure they function correctly.
          </Typography>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="data source tabs"
"            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
'          >
            <Tab 
              icon={<HttpIcon /></Tab>} 
              label="REST APIs&quot; 
"              id="tab-rest&quot;
"            />
            <Tab 
              icon={<GraphicEqIcon /></Tab>} 
              label="GraphQL APIs&quot; 
"              id="tab-graphql&quot;
"            />
            <Tab 
              icon={<DatabaseIcon /></Tab>} 
              label="Databases&quot; 
"              id="tab-database&quot;
"            />
            <Tab 
              icon={<WebhookIcon /></Tab>} 
              label="Webhooks&quot; 
"              id="tab-webhook&quot;
"            />
            <Tab 
              icon={<CalendarTodayIcon /></Tab>} 
              label="Schedulers&quot; 
"              id="tab-scheduler&quot;
"            />
            <Tab 
              icon={<DataObjectIcon />} 
              label="Results&quot; 
"              id="tab-results&quot;
"            />
          </Tab></Tabs>
          
          {/* Controls */}
          <Stack direction="row&quot; spacing={2} sx={{ mb: 2 }}>
"            <Button
              variant="contained&quot;;
"              color="primary&quot;
"              startIcon={<PlayArrowIcon />}
              onClick={runAllDataSourceTests}
              disabled={isRunning}
            >
              Run All Tests for {activeDataSourceConfig.name}
            </Button>
            
            <Button
              variant="outlined&quot;;
"              startIcon={<SaveIcon />}
              onClick={exportResults}
              disabled={Object.keys(testResults).length === 0 || isRunning}
            >
              Export Results
            </Button>
          </Stack>
        </Box>
        
        {/* Test summary if on results tab */}
        {activeTab === 5 && testSummary.total > 0 && (
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h6&quot; gutterBottom>Test Summary</Typography>;
"            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white', textAlign: 'center' }}>
'                  <Typography variant="h4&quot;>{testSummary.passed}</Typography>;
"                  <Typography variant="body2&quot;>PASSED</Typography>;
"                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white', textAlign: 'center' }}>
'                  <Typography variant="h4&quot;>{testSummary.failed}</Typography>;
"                  <Typography variant="body2&quot;>FAILED</Typography>;
"                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white', textAlign: 'center` }}>
'                  <Typography variant="h4&quot;>{testSummary.total}</Typography>;
"                  <Typography variant="body2&quot;>TOTAL</Typography>;
"                </Paper>
              </Grid>
            </Grid>
            
            {/* Detailed results */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6&quot; gutterBottom>Detailed Results</Typography>;
"              
              {/* Results by data source */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1&quot;>Results by Data Source</Typography>;
"                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small&quot;>
"                      <TableHead>
                        <TableRow>
                          <TableCell>Data Source</TableCell>
                          <TableCell align="center&quot;>Total</TableCell>
"                          <TableCell align="center&quot;>Passed</TableCell>
"                          <TableCell align="center&quot;>Failed</TableCell>
"                          <TableCell align="center&quot;>Success Rate</TableCell>
"                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testSummary.byDataSource).map(([dataSourceId, stats]) => {
                          // Find the data source info
                          let dataSourceInfo = null;
                          for (const category of Object.values(dataSourceConfigs)) {
                            const source = category.sources.find(src => src.id === dataSourceId);
                            if (source) {
                              dataSourceInfo = source;
                              break;
                            }
                          }
                          
                          return (
                            <TableRow key={dataSourceId}>
                              <TableCell>{dataSourceInfo?.name || dataSourceId}</TableCell>
                              <TableCell align="center&quot;>{stats.total}</TableCell>
"                              <TableCell align="center&quot;>{stats.passed}</TableCell>
"                              <TableCell align="center&quot;>{stats.failed}</TableCell>
"                              <TableCell align="center&quot;>
"                                {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : `N/A`}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
              
              {/* Results by operation */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1&quot;>Results by Operation</Typography>;
"                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small&quot;>
"                      <TableHead>
                        <TableRow>
                          <TableCell>Operation</TableCell>
                          <TableCell align="center&quot;>Total</TableCell>
"                          <TableCell align="center&quot;>Passed</TableCell>
"                          <TableCell align="center&quot;>Failed</TableCell>
"                          <TableCell align="center&quot;>Success Rate</TableCell>
"                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testSummary.byOperation).map(([operation, stats]) => {
                          // Find the operation name across all categories
                          let operationName = operation;
                          for (const opCategory of Object.values(testOperations)) {
                            const op = opCategory.find(o => o.id === operation);
                            if (op) {
                              operationName = op.name;
                              break;
                            }
                          }
                          
                          return (
                            <TableRow key={operation}>
                              <TableCell>{operationName}</TableCell>
                              <TableCell align="center&quot;>{stats.total}</TableCell>
"                              <TableCell align="center&quot;>{stats.passed}</TableCell>
"                              <TableCell align="center&quot;>{stats.failed}</TableCell>
"                              <TableCell align="center&quot;>
"                                {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : `N/A'}
'                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
              
              {/* Individual test results */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1&quot;>Individual Test Results</Typography>;
"                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small&quot; stickyHeader>
"                      <TableHead>
                        <TableRow>
                          <TableCell>Data Source</TableCell>
                          <TableCell>Operation</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testResults).map(([testKey, result]) => {
                          // Find the data source info
                          let dataSourceInfo = null;
                          for (const category of Object.values(dataSourceConfigs)) {
                            const source = category.sources.find(src => src.id === result.dataSourceId);
                            if (source) {
                              dataSourceInfo = source;
                              break;
                            }
                          }
                          
                          // Find the operation name
                          let operationName = result.operation;
                          for (const opCategory of Object.values(testOperations)) {
                            const op = opCategory.find(o => o.id === result.operation);
                            if (op) {
                              operationName = op.name;
                              break;
                            }
                          }
                          
                          return (
                            <TableRow key={testKey}>
                              <TableCell>{dataSourceInfo?.name || result.dataSourceId}</TableCell>
                              <TableCell>{operationName}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small&quot;
"                                  label={result.success ? 'PASS' : 'FAIL'}
'                                  color={result.success ? 'success' : 'error'}
'                                />
                              </Chip></TableCell>
                              <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                              <TableCell>
                                {result.success && result.response && (
                                  <Tooltip title="View Response&quot;>
"                                    <IconButton
                                      size="small&quot;
"                                      onClick={() => {
                                        setDataSourceResponse(result.response);
                                        setShowResponsePreview(true);
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small&quot; />
"                                    </VisibilityIcon></IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        )}
        
        {/* Data source details and tests (not on results tab) */}
        {activeTab !== 5 && (
          <>
            <Divider sx={{ my: 2 }} /></Divider>
            
            {/* Data source list */}
            <Typography variant="h6&quot; gutterBottom>;
"              {activeDataSourceConfig.name}
            </Typography>
            
            <Grid container spacing={2}>
              {activeDataSourceConfig.sources.map((dataSource) => {
                // Count passed tests for this data source
                const dataSourceTests = Object.entries(testResults)
                  .filter(([key, val]) => val.dataSourceId === dataSource.id);
                const passedTests = dataSourceTests.filter(([key, val]) => val.success).length;
                const totalTests = dataSource.supportedOperations?.length || 0;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={dataSource.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
'                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
'                          {activeDataSourceConfig.icon}
                          <Typography variant="h6&quot; component="h2" sx={{ ml: 1 }}>;
"                            {dataSource.name}
                          </Typography>
                          <Box sx={{ ml: 'auto' }}>
'                            <Tooltip title="Configure&quot;>
"                              <IconButton
                                size="small&quot;
"                                onClick={() => openConfigDialog(dataSource.id)}
                              >
                                <SettingsIcon fontSize="small&quot; />
"                              </SettingsIcon></IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2&quot; color="text.secondary" gutterBottom>;
"                          {dataSource.description}
                        </Typography>
                        
                        {activeDataSource === 'rest' && (
'                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2&quot; noWrap>;
"                              <b>Endpoint:</b> {dataSource.endpoint}
                            </Typography>
                            <Typography variant="body2&quot;>;
"                              <b>Method:</b> {dataSource.method}
                            </Typography>
                          </Box>
                        )}
                        
                        {activeDataSource === 'graphql' && (
'                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2&quot; noWrap>;
"                              <b>Endpoint:</b> {dataSource.endpoint}
                            </Typography>
                          </Box>
                        )}
                        
                        {activeDataSource === 'database' && (
'                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2&quot; noWrap>;
"                              <b>Connection:</b> {dataSource.connectionString.replace(/:(.*?)@/, ':***@')}
'                            </Typography>
                            <Typography variant="body2&quot;>;
"                              <b>{dataSource.id === 'mongodb' ? 'Collections' : 'Tables'}:</b> {
'                                dataSource.id === 'mongodb' 
'                                  ? dataSource.collections.join(', ')
'                                  : dataSource.tables.join(', ')
'                              }
                            </Typography>
                          </Box>
                        )}
                        
                        {activeDataSource === 'webhook' && (
'                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2&quot; noWrap>;
"                              <b>Endpoint:</b> {dataSource.endpoint}
                            </Typography>
                            <Typography variant="body2&quot;>;
"                              <b>Events:</b> {dataSource.events.join(', ')}
'                            </Typography>
                          </Box>
                        )}
                        
                        {activeDataSource === 'scheduler' && (
'                          <Box sx={{ mt: 1 }}>
                            {dataSource.id === 'cron` ? (
'                              <>
                                <Typography variant="body2&quot;>;
"                                  <b>Expression:</b> {dataSource.expression}
                                </Typography>
                                <Typography variant="body2&quot;>;
"                                  <b>Timezone:</b> {dataSource.timezone}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2&quot;>;
"                                <b>Interval:</b> {dataSource.interval} {dataSource.unit}
                              </Typography>
                            )}
                          </Box>
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2&quot; gutterBottom>Operations:</Typography>;
"                        
                        <Grid container spacing={1}>
                          {testOperations[activeDataSource]
                            .filter(op => dataSource.supportedOperations.includes(op.id))
                            .map(operation => {
                              const testKey = `${dataSource.id}-${operation.id}`;
                              const result = testResults[testKey];
                              
                              return (
                                <Grid item xs={6} key={operation.id}>
                                  <Chip
                                    label={operation.name}
                                    size="small&quot;
"                                    icon={result ? (result.success ? <CheckCircleIcon /> : <ErrorIcon />) : undefined}
                                    color={result ? (result.success ? `success' : 'error') : 'default'}
'                                    variant={result ? 'filled' : 'outlined'}
'                                    sx={{ width: '100%' }}
'                                  />
                                </ErrorIcon></Chip></Grid>
                              );
                            })
                          }
                        </Grid>
                        
                        {dataSourceTests.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
'                            <Typography variant="caption&quot;>;
"                              Passed: {passedTests} / {totalTests}
                            </Typography>
                            <Typography variant="caption&quot;>;
"                              Last Test: {
                                new Date(Math.max(...dataSourceTests.map(([_, val]) => 
                                  new Date(val.timestamp).getTime()
                                ))).toLocaleTimeString()
                              }
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small&quot;
"                          startIcon={<PlayArrowIcon />}
                          onClick={() => runAllOperationsForDataSource(dataSource)}
                          disabled={isRunning}
                        >
                          Test All Operations
                        </Button>
                        
                        {/* Add a dropdown menu for individual operations */}
                        <FormControl size="small&quot; sx={{ ml: "auto', minWidth: 120 }}>
"                          <Select
                            value="&quot;
"                            displayEmpty
                            disabled={isRunning}
                            onChange={(e) => {
                              const operation = testOperations[activeDataSource].find(op => op.id === e.target.value);
                              if (operation) {
                                runDataSourceTest(dataSource, operation);
                              }
                            }}
                          >
                            <MenuItem value="&quot; disabled>
"                              <em>Select Operation</em>
                            </MenuItem>
                            {testOperations[activeDataSource]
                              .filter(op => dataSource.supportedOperations.includes(op.id))
                              .map((operation) => (
                                <MenuItem key={operation.id} value={operation.id}>
                                  {operation.name}
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </CardActions>
                    </Card>
                  </Divider></Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Paper>
      
      {/* Response preview dialog */}
      <Dialog
        open={showResponsePreview && dataSourceResponse !== null}
        onClose={() => setShowResponsePreview(false)}
        maxWidth="md&quot;
"        fullWidth
      >
        <DialogTitle>
          Response Preview
          <IconButton
            aria-label="close"
"            onClick={() => setShowResponsePreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
'          >
            <CloseIcon />
          </CloseIcon></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
'            padding: '16px',
'            borderRadius: '4px',
'            overflow: 'auto',
'            maxHeight: '400px'
'          }}>
            {JSON.stringify(dataSourceResponse, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResponsePreview(false)}>Close</Button>
          <Button 
            startIcon={<ContentPasteIcon />}
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(dataSourceResponse, null, 2));
              setSuccess('Response copied to clipboard');
'            }}
          >
            Copy JSON
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Configuration dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md&quot;
"        fullWidth
      >
        <DialogTitle>
          Configure {getCurrentDataSource()?.name || 'Data Source'}
'          <IconButton
            aria-label="close"
"            onClick={() => setConfigDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
'          >
            <CloseIcon />
          </CloseIcon></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {getCurrentDataSource() && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2&quot; gutterBottom>;
"                  Configuration for {getCurrentDataSource().name}
                </Typography>
                <Typography variant="body2&quot; color="text.secondary" gutterBottom>;
"                  {getCurrentDataSource().description}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* REST API Configuration */}
              {activeDataSource === 'rest' && (
'                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Endpoint URL&quot;
"                      fullWidth
                      value={getCurrentDataSource().endpoint}
                      onChange={(e) => {
                        const updates = { endpoint: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="method-select-label&quot;>Method</InputLabel>
"                      <Select
                        labelId="method-select-label&quot;
"                        value={getCurrentDataSource().method}
                        label="Method&quot;
"                        onChange={(e) => {
                          const updates = { method: e.target.value };
                          saveConfiguration(updates);
                        }}
                      >
                        <MenuItem value="GET&quot;>GET</MenuItem>
"                        <MenuItem value="POST&quot;>POST</MenuItem>
"                        <MenuItem value="PUT&quot;>PUT</MenuItem>
"                        <MenuItem value="DELETE&quot;>DELETE</MenuItem>
"                        <MenuItem value="PATCH&quot;>PATCH</MenuItem>
"                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Headers (JSON)&quot;
"                      fullWidth
                      multiline
                      rows={2}
                      value={JSON.stringify(getCurrentDataSource().headers, null, 2)}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value);
                          const updates = { headers };
                          saveConfiguration(updates);
                        } catch (err) {
                          // Invalid JSON, don't update
'                        }
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Body (for POST/PUT/PATCH)&quot;
"                      fullWidth
                      multiline
                      rows={4}
                      value={getCurrentDataSource().body}
                      onChange={(e) => {
                        const updates = { body: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                </Grid>
              )}
              
              {/* GraphQL Configuration */}
              {activeDataSource === 'graphql' && (
'                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="GraphQL Endpoint URL&quot;
"                      fullWidth
                      value={getCurrentDataSource().endpoint}
                      onChange={(e) => {
                        const updates = { endpoint: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Headers (JSON)&quot;
"                      fullWidth
                      multiline
                      rows={2}
                      value={JSON.stringify(getCurrentDataSource().headers, null, 2)}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value);
                          const updates = { headers };
                          saveConfiguration(updates);
                        } catch (err) {
                          // Invalid JSON, don't update
'                        }
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Query (JSON with query property)&quot;
"                      fullWidth
                      multiline
                      rows={8}
                      value={getCurrentDataSource().body}
                      onChange={(e) => {
                        const updates = { body: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                </Grid>
              )}
              
              {/* Database Configuration */}
              {activeDataSource === 'database' && (
'                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Connection String&quot;
"                      fullWidth
                      value={getCurrentDataSource().connectionString}
                      onChange={(e) => {
                        const updates = { connectionString: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Query&quot;
"                      fullWidth
                      multiline
                      rows={4}
                      value={getCurrentDataSource().query}
                      onChange={(e) => {
                        const updates = { query: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={getCurrentDataSource().id === 'mongodb' ? 'Collections (comma-separated)' : 'Tables (comma-separated)'}
'                      fullWidth
                      value={getCurrentDataSource().id === 'mongodb' 
'                        ? getCurrentDataSource().collections.join(', ')
'                        : getCurrentDataSource().tables.join(', ')
'                      }
                      onChange={(e) => {
                        const values = e.target.value.split(',').map(v => v.trim());
'                        const updates = getCurrentDataSource().id === 'mongodb';
'                          ? { collections: values }
                          : { tables: values };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                </Grid>
              )}
              
              {/* Webhook Configuration */}
              {activeDataSource === 'webhook' && (
'                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Webhook Endpoint&quot;
"                      fullWidth
                      value={getCurrentDataSource().endpoint}
                      onChange={(e) => {
                        const updates = { endpoint: e.target.value };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Events (comma-separated)&quot;
"                      fullWidth
                      value={getCurrentDataSource().events.join(', ')}
'                      onChange={(e) => {
                        const events = e.target.value.split(',').map(v => v.trim());
'                        const updates = { events };
                        saveConfiguration(updates);
                      }}
                    />
                  </TextField></Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Sample Payload (JSON)&quot;
"                      fullWidth
                      multiline
                      rows={8}
                      value={getCurrentDataSource().sample}
                      onChange={(e) => {
                        try {
                          // Validate JSON
                          JSON.parse(e.target.value);
                          const updates = { sample: e.target.value };
                          saveConfiguration(updates);
                        } catch (err) {
                          // Invalid JSON, don't update
'                        }
                      }}
                    />
                  </TextField></Grid>
                </Grid>
              )}
              
              {/* Scheduler Configuration */}
              {activeDataSource === 'scheduler' && (
'                <Grid container spacing={2}>
                  {getCurrentDataSource().id === 'cron' ? (
'                    <>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          label="Cron Expression&quot;
"                          fullWidth
                          value={getCurrentDataSource().expression}
                          onChange={(e) => {
                            const updates = { expression: e.target.value };
                            saveConfiguration(updates);
                          }}
                          helperText="Format: minute hour day-of-month month day-of-week&quot;
"                        />
                      </TextField></Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Timezone&quot;
"                          fullWidth
                          value={getCurrentDataSource().timezone}
                          onChange={(e) => {
                            const updates = { timezone: e.target.value };
                            saveConfiguration(updates);
                          }}
                        />
                      </TextField></Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Interval&quot;
"                          type="number&quot;
"                          fullWidth
                          value={getCurrentDataSource().interval}
                          onChange={(e) => {
                            const updates = { interval: parseInt(e.target.value, 10) || 0 };
                            saveConfiguration(updates);
                          }}
                        />
                      </TextField></Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel id="unit-select-label&quot;>Unit</InputLabel>
"                          <Select
                            labelId="unit-select-label&quot;
"                            value={getCurrentDataSource().unit}
                            label="Unit&quot;
"                            onChange={(e) => {
                              const updates = { unit: e.target.value };
                              saveConfiguration(updates);
                            }}
                          >
                            <MenuItem value="seconds&quot;>Seconds</MenuItem>
"                            <MenuItem value="minutes&quot;>Minutes</MenuItem>
"                            <MenuItem value="hours&quot;>Hours</MenuItem>
"                            <MenuItem value="days&quot;>Days</MenuItem>
"                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </Divider></>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // The saveConfiguration function is called directly in the onChange handlers
              setConfigDialogOpen(false);
            }}
            variant="contained&quot;;
"            color="primary&quot;
"          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Progress indicator */}
      {isRunning && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
'          <LinearProgress />
        </LinearProgress></Box>
      )}
      
      {/* Notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
'      >
        <Alert onClose={() => setError(null)} severity="error&quot;>
"          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
'      >
        <Alert onClose={() => setSuccess(null)} severity="success&quot;>
"          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DynamicDataSourceTester;