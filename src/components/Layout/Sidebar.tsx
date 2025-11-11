import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  AccountTree,
  Schedule,
  AttachMoney,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Çalışanlar', icon: <People />, path: '/employees' },
  { text: 'Departmanlar', icon: <Business />, path: '/departments' },
  { text: 'Birimler', icon: <AccountTree />, path: '/units' },
  { text: 'Organizasyon Şeması', icon: <AccountTree />, path: '/organization' },
  { text: 'Mesai Takibi', icon: <Schedule />, path: '/time-tracking' },
  { text: 'Maaş Hesaplama', icon: <AttachMoney />, path: '/salary' },
  { text: 'Ayarlar', icon: <Settings />, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          İşlik HR Sistemi
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: '#334155' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                },
                '&:hover': {
                  backgroundColor: '#334155',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;