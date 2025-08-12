import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  Payment,
  Warning,
  TrendingUp,
  Refresh,
  Visibility
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 1250, active: 980, newThisMonth: 45 },
    payments: { totalThisMonth: 2450000, successRate: 98.5, pending: 12 },
    emergencyAlerts: { totalThisMonth: 8, active: 1, averageResponseTime: '4.2 minutes' },
    forumActivity: { totalPosts: 156, activeUsers: 340 }
  });

  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: 1,
      type: 'Security',
      location: 'Kimironko, Gasabo',
      status: 'Active',
      time: '2 minutes ago',
      priority: 'High'
    },
    {
      id: 2,
      type: 'Medical',
      location: 'Kicukiro Center',
      status: 'Resolved',
      time: '1 hour ago',
      priority: 'High'
    },
    {
      id: 3,
      type: 'General',
      location: 'Nyarutarama',
      status: 'En Route',
      time: '15 minutes ago',
      priority: 'Medium'
    }
  ]);

  const [paymentTrends] = useState([
    { month: 'Jan', amount: 2100000 },
    { month: 'Feb', amount: 2300000 },
    { month: 'Mar', amount: 2200000 },
    { month: 'Apr', amount: 2500000 },
    { month: 'May', amount: 2400000 },
    { month: 'Jun', amount: 2450000 }
  ]);

  const [districtData] = useState([
    { name: 'Gasabo', value: 520, color: '#4CAF50' },
    { name: 'Kicukiro', value: 380, color: '#2196F3' },
    { name: 'Nyarugenge', value: 350, color: '#FF9800' }
  ]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color: color, opacity: 0.7 }} />
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            <Typography variant="body2" color="success.main">
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'error';
      case 'resolved': return 'success';
      case 'en route': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data
    console.log('Refreshing dashboard data...');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rwanda Safe Pay Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.users.total.toLocaleString()}
            subtitle={`${stats.users.active} active`}
            icon={People}
            color="primary.main"
            trend="+12% this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`${(stats.payments.totalThisMonth / 1000000).toFixed(1)}M RWF`}
            subtitle={`${stats.payments.successRate}% success rate`}
            icon={Payment}
            color="success.main"
            trend="+8% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Emergency Alerts"
            value={stats.emergencyAlerts.totalThisMonth}
            subtitle={`${stats.emergencyAlerts.active} active`}
            icon={Warning}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Forum Posts"
            value={stats.forumActivity.totalPosts}
            subtitle={`${stats.forumActivity.activeUsers} active users`}
            icon={DashboardIcon}
            color="info.main"
            trend="+15 this week"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Payment Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Trends (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${(value / 1000000).toFixed(1)}M RWF`, 'Amount']} />
                  <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* District Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Users by District
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={districtData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {districtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Emergency Alerts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Recent Emergency Alerts
                </Typography>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell>{alert.location}</TableCell>
                        <TableCell>
                          <Chip
                            label={alert.status}
                            color={getStatusColor(alert.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={alert.priority}
                            color={getPriorityColor(alert.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{alert.time}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Status Alert */}
      <Box mt={3}>
        <Alert severity="success">
          All systems operational. Last updated: {new Date().toLocaleString()}
        </Alert>
      </Box>
    </Box>
  );
};

export default Dashboard;
