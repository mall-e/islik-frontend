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
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Unit, Department } from '../types/api';
import { unitAPI, departmentAPI } from '../services/api';

const UnitManagement: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    departmentId: '',
    address: '',
    district: '',
    city: '',
    active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [unitsData, departmentsData] = await Promise.all([
        unitAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setUnits(unitsData);
      setDepartments(departmentsData);
    } catch (error) {
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUnit(null);
    setFormData({
      code: '',
      name: '',
      departmentId: '',
      address: '',
      district: '',
      city: '',
      active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      code: unit.code || '',
      name: unit.name || '',
      departmentId: unit.department?.id?.toString() || '',
      address: unit.address || '',
      district: unit.district || '',
      city: unit.city || '',
      active: unit.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const unitData = {
        code: formData.code,
        name: formData.name,
        department: departments.find(d => d.id.toString() === formData.departmentId)!,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        active: formData.active,
      };

      if (selectedUnit) {
        await unitAPI.update(selectedUnit.id, unitData);
      } else {
        await unitAPI.create(unitData);
      }

      setDialogOpen(false);
      fetchData();
      setError('');
    } catch (error) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu birimi silmek istediğinizden emin misiniz?')) {
      try {
        await unitAPI.delete(id);
        fetchData();
      } catch (error) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Kod', width: 150 },
    { field: 'name', headerName: 'Birim Adı', width: 200 },
    {
      field: 'department',
      headerName: 'Departman',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value?.name || 'Departman Atanmamış'}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    { field: 'district', headerName: 'İlçe', width: 120 },
    { field: 'city', headerName: 'Şehir', width: 120 },
    {
      field: 'active',
      headerName: 'Durum',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Aktif' : 'Pasif'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
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
          Birim Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{ backgroundColor: '#1e293b' }}
        >
          Yeni Birim
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={units}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUnit ? 'Birim Düzenle' : 'Yeni Birim'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Birim Kodu"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            sx={{ mb: 2 }}
            helperText="Örnek: MARKET-YAKUTIYE, OTOPARK-ISPIR"
          />
          <TextField
            margin="dense"
            label="Birim Adı"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Departman"
            fullWidth
            variant="outlined"
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id.toString()}>
                {department.name} ({department.code})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Adres"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="İlçe"
            fullWidth
            variant="outlined"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Şehir"
            fullWidth
            variant="outlined"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            }
            label="Aktif"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUnit ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnitManagement;