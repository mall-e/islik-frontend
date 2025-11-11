import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#1e293b',
        ml: sidebarOpen ? '240px' : 0,
        width: sidebarOpen ? 'calc(100% - 240px)' : '100%',
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          İnsan Kaynakları Yönetim Sistemi
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountCircle />
            <Typography variant="body2">
              {user?.username}
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Çıkış
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;