import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Stack,
} from '@mui/material';
import {
  People,
  Business,
  AccountTree,
  TrendingUp,
} from '@mui/icons-material';
import { employeeAPI, departmentAPI, unitAPI } from '../services/api';

interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalUnits: number;
  activeEmployees: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalDepartments: 0,
    totalUnits: 0,
    activeEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('=== DASHBOARD FETCH STATS ===');
        console.log('Starting API calls...');

        const [employees, departments, units] = await Promise.all([
          employeeAPI.getAll().then(data => {
            console.log('Employees API success:', data);
            return data;
          }).catch(err => {
            console.error('Employees API error:', err);
            throw err;
          }),
          departmentAPI.getAll().then(data => {
            console.log('Departments API success:', data);
            return data;
          }).catch(err => {
            console.error('Departments API error:', err);
            throw err;
          }),
          unitAPI.getAll().then(data => {
            console.log('Units API success:', data);
            return data;
          }).catch(err => {
            console.error('Units API error:', err);
            throw err;
          }),
        ]);

        console.log('All API calls successful');
        setStats({
          totalEmployees: employees.length,
          totalDepartments: departments.length,
          totalUnits: units.filter(unit => unit.active).length,
          activeEmployees: employees.length, // Assume all are active for now
        });
      } catch (error: any) {
        console.error('=== DASHBOARD FETCH ERROR ===');
        console.error('Full error:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
              {loading ? '...' : value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 48 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <StatCard
          title="Toplam Çalışan"
          value={stats.totalEmployees}
          icon={<People />}
          color="#3b82f6"
        />
        <StatCard
          title="Departman Sayısı"
          value={stats.totalDepartments}
          icon={<Business />}
          color="#10b981"
        />
        <StatCard
          title="Aktif Birim"
          value={stats.totalUnits}
          icon={<AccountTree />}
          color="#f59e0b"
        />
        <StatCard
          title="Aktif Çalışan"
          value={stats.activeEmployees}
          icon={<TrendingUp />}
          color="#ef4444"
        />
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3
      }}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Son Aktiviteler
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Yakında eklenecek...
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Departman Dağılımı
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Yakında eklenecek...
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;