import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Business } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password);

    try {
      console.log('Calling authAPI.login...');
      const response = await authAPI.login({ email, password });
      console.log('Login API response:', response);

      console.log('Calling login function...');
      login(response);

      console.log('Navigating to /...');
      navigate('/');
      console.log('=== LOGIN SUCCESS ===');
    } catch (err: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Business sx={{ fontSize: 48, color: '#1e293b', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              İşlik HR
            </Typography>
            <Typography variant="body1" color="textSecondary">
              İnsan Kaynakları Yönetim Sistemi
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              placeholder="ornek@sirket.com"
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#1e293b',
                '&:hover': {
                  backgroundColor: '#334155',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Giriş Yap'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;