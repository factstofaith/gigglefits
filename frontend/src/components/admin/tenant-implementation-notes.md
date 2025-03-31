# Multi-Tenancy UI Implementation Notes

## Changes Already Made

1. **TenantsManager.jsx**
   - ✅ Converted from mock data to API integration
   - ✅ Added create tenant functionality
   - ✅ Implemented tenant detail view
   - ✅ Added management of application and dataset associations

2. **ReleasesManager.jsx**
   - ✅ Updated to fetch tenants from the API
   - ✅ Modified to use proper API methods for tenant associations

3. **ApplicationsManager.jsx**
   - ✅ Added tenant-related state variables
   - ✅ Added function to fetch tenant data
   - ✅ Added function to handle tenant association toggling
   - ✅ Modified handleOpenDetails to fetch tenant associations

## Remaining Tasks to Complete

1. **For ApplicationsManager.jsx:**
   - Add a new Tab component for "Tenant Associations" in the detail dialog
   - Add a new TabPanel for the tenant associations content
   - Implement UI to view and manage tenant associations

2. **For DatasetsManager.jsx:**
   - Add tenant-related state variables
   - Add function to fetch tenant data
   - Add function to handle tenant association toggling
   - Modify detail dialog to include tenant associations tab
   - Implement UI to view and manage tenant associations

3. **For AdminDashboardPage.jsx:**
   - Update dashboard stats to include tenant count
   - Consider adding tenant-based filtering options

## Implementation Plan for ApplicationsManager.jsx

### States to Add
```jsx
const [tenants, setTenants] = useState([]);
const [loadingTenants, setLoadingTenants] = useState(false);
const [applicationTenants, setApplicationTenants] = useState([]);
const [tenantUpdateLoading, setTenantUpdateLoading] = useState(false);
```

### Tab to Add
```jsx
<Tab icon={<TenantIcon />} label="Tenant Associations" />
```

### TabPanel to Add
```jsx
{/* Tenant Associations Tab */}
<TabPanel value={activeTab} index={4}>
  <Box>
    <Typography variant="h6" gutterBottom>
      Tenant Associations
    </Typography>
    
    {loadingTenants ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    ) : applicationTenants.length === 0 ? (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No tenants associated with this application.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Associate tenants with this application to make it available to them.
        </Typography>
      </Paper>
    ) : (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant Name</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicationTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TenantIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">{tenant.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{tenant.domain}</TableCell>
                <TableCell>
                  <Chip 
                    label={tenant.status} 
                    color={tenant.status === 'active' ? 'success' : tenant.status === 'trial' ? 'info' : 'default'} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleToggleTenantAssociation(currentApplication.id, tenant.id, true)}
                    disabled={tenantUpdateLoading}
                  >
                    <LinkOffIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
    
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Add Application to Tenant
      </Typography>
      
      {tenants.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No available tenants found.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {tenants
              .filter(tenant => !applicationTenants.some(at => at.id === tenant.id))
              .map((tenant) => (
                <Grid item xs={12} sm={6} md={4} key={tenant.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">{tenant.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{tenant.domain}</Typography>
                      <Button
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleToggleTenantAssociation(currentApplication.id, tenant.id, false)}
                        disabled={tenantUpdateLoading}
                      >
                        Add to Tenant
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Paper>
      )}
    </Box>
  </Box>
</TabPanel>
```

### Functions to add/update
- ✅ `handleOpenDetails` - Updated to fetch tenant associations
- ✅ `handleToggleTenantAssociation` - Added to toggle tenant associations
- ✅ `fetchTenants` - Added to fetch all tenants

As an alternative approach, you could create a new branch of the codebase and directly modify the relevant files with all the required changes, then merge your branch back to main.