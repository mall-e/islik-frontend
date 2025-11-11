import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Department } from '../types/api';
import { departmentAPI } from '../services/api';

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      setError('Departmanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedDepartment(null);
    setFormData({ code: '', name: '' });
    setDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedDepartment) {
        await departmentAPI.update(selectedDepartment.id, formData);
      } else {
        await departmentAPI.create(formData);
      }
      setDialogOpen(false);
      fetchDepartments();
      setError('');
    } catch (error) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      try {
        await departmentAPI.delete(id);
        fetchDepartments();
      } catch (error) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Kod', width: 150 },
    { field: 'name', headerName: 'Departman Adı', width: 300 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Düzenle"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Sil"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Departman Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{ backgroundColor: '#1e293b' }}
        >
          Yeni Departman
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={departments}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDepartment ? 'Departman Düzenle' : 'Yeni Departman'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Departman Kodu"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            sx={{ mb: 2 }}
            helperText="Örnek: MARKET, OTOPARK, REKLAM"
          />
          <TextField
            margin="dense"
            label="Departman Adı"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            helperText="Örnek: Market Operasyonları, Otopark İşletmeleri"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedDepartment ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagement;