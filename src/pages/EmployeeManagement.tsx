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
  Chip,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  SwapHoriz,
} from '@mui/icons-material';
import { Employee, Unit, Department } from '../types/api';
import { employeeAPI, unitAPI, departmentAPI } from '../services/api';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    unit: '',
    role: '',
    level: '',
    position: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    identityNumber: '',
    position: '',
    role: '',
    level: '',
    baseSalary: '',
    hourlyRate: '',
    unitId: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesData, unitsData, departmentsData] = await Promise.all([
        employeeAPI.getAll(),
        unitAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
      setUnits(unitsData);
      setDepartments(departmentsData);
    } catch (error) {
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme fonksiyonu
  const applyFilters = () => {
    let filtered = [...employees];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.identityNumber.includes(searchTerm)
      );
    }

    if (filters.department) {
      filtered = filtered.filter(emp =>
        emp.unit?.department?.id?.toString() === filters.department
      );
    }

    if (filters.unit) {
      filtered = filtered.filter(emp =>
        emp.unit?.id?.toString() === filters.unit
      );
    }

    if (filters.role) {
      filtered = filtered.filter(emp =>
        emp.role?.toLowerCase().includes(filters.role.toLowerCase())
      );
    }

    if (filters.level) {
      filtered = filtered.filter(emp =>
        emp.level?.toString() === filters.level
      );
    }

    if (filters.position) {
      filtered = filtered.filter(emp =>
        emp.position?.toLowerCase().includes(filters.position.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  // Filtreler değiştiğinde çalıştır
  useEffect(() => {
    applyFilters();
  }, [filters, employees]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      unit: '',
      role: '',
      level: '',
      position: '',
      search: ''
    });
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      identityNumber: '',
      position: '',
      role: '',
      level: '',
      baseSalary: '',
      hourlyRate: '',
      unitId: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      identityNumber: employee.identityNumber || '',
      position: employee.position || '',
      role: employee.role || '',
      level: employee.level?.toString() || '',
      baseSalary: employee.baseSalary?.toString() || '',
      hourlyRate: employee.hourlyRate?.toString() || '',
      unitId: employee.unit?.id?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleTransfer = (employee: Employee) => {
    setSelectedEmployee(employee);
    setTransferDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        identityNumber: formData.identityNumber,
        position: formData.position,
        role: formData.role,
        level: formData.level ? parseInt(formData.level) : undefined,
        baseSalary: parseFloat(formData.baseSalary),
        hourlyRate: parseInt(formData.hourlyRate),
        unitId: parseInt(formData.unitId),
        userId: null,
        managerId: null
      };

      if (selectedEmployee) {
        await employeeAPI.update(selectedEmployee.id, employeeData);
      } else {
        await employeeAPI.create(employeeData);
      }

      setDialogOpen(false);
      fetchData();
      setError('');
    } catch (error) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      try {
        await employeeAPI.delete(id);
        fetchData();
      } catch (error) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleTransferSubmit = async (newUnitId: number) => {
    if (selectedEmployee) {
      try {
        await employeeAPI.transferUnit(selectedEmployee.id, newUnitId);
        setTransferDialogOpen(false);
        fetchData();
        setError('');
      } catch (error) {
        setError('Transfer işlemi sırasında hata oluştu');
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Ad Soyad',
      width: 200,
      valueGetter: (value, row) => `${row.firstName} ${row.lastName}`,
    },
    { field: 'email', headerName: 'E-posta', width: 200 },
    { field: 'identityNumber', headerName: 'TC Kimlik No', width: 150 },
    { field: 'position', headerName: 'Pozisyon', width: 150 },
    { field: 'role', headerName: 'Rol', width: 120 },
    {
      field: 'level',
      headerName: 'Kademe',
      width: 80,
      renderCell: (params) => (
        params.value ? (
          <Chip
            label={params.value}
            size="small"
            color="secondary"
            variant="filled"
          />
        ) : '-'
      ),
    },
    {
      field: 'unit',
      headerName: 'Birim',
      width: 200,
      renderCell: (params) => (
        <Chip
          label={params.value?.name || 'Birim Atanmamış'}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Departman',
      width: 150,
      valueGetter: (value, row) => row.unit?.department?.name || '-',
    },
    {
      field: 'baseSalary',
      headerName: 'Maaş',
      width: 120,
      valueFormatter: (value: number) => `₺${value?.toLocaleString()}`,
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
          icon={<SwapHoriz />}
          label="Transfer"
          onClick={() => handleTransfer(params.row)}
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
          Çalışan Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{ backgroundColor: '#1e293b' }}
        >
          Yeni Çalışan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtre Paneli */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtreler
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2
        }}>
          <TextField
            label="Arama"
            placeholder="Ad, soyad, e-posta, TC..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Departman"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            size="small"
          >
            <MenuItem value="">Tümü</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Birim"
            value={filters.unit}
            onChange={(e) => handleFilterChange('unit', e.target.value)}
            size="small"
          >
            <MenuItem value="">Tümü</MenuItem>
            {units.filter(unit => !filters.department || unit.department?.id?.toString() === filters.department).map((unit) => (
              <MenuItem key={unit.id} value={unit.id.toString()}>
                {unit.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Rol"
            placeholder="Yönetici, Uzman..."
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            select
            label="Kademe"
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            size="small"
          >
            <MenuItem value="">Tümü</MenuItem>
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level.toString()}>
                Kademe {level}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Pozisyon"
            placeholder="Müdür, Memur..."
            value={filters.position}
            onChange={(e) => handleFilterChange('position', e.target.value)}
            size="small"
          />
          <Button
            variant="outlined"
            onClick={clearFilters}
            size="small"
          >
            Filtreleri Temizle
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ad"
            fullWidth
            variant="outlined"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Soyad"
            fullWidth
            variant="outlined"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="E-posta"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="TC Kimlik Numarası"
            fullWidth
            variant="outlined"
            value={formData.identityNumber}
            onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Pozisyon"
            fullWidth
            variant="outlined"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Rol"
            fullWidth
            variant="outlined"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Örnek: Yönetici, Uzman, Memur"
          />
          <TextField
            margin="dense"
            label="Kademe"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Örnek: 1, 2, 3 (1 en yüksek kademe)"
            inputProps={{ min: 1, max: 10 }}
          />
          <TextField
            select
            margin="dense"
            label="Birim"
            fullWidth
            variant="outlined"
            value={formData.unitId}
            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
            sx={{ mb: 2 }}
            required
          >
            {units.map((unit) => (
              <MenuItem key={unit.id} value={unit.id.toString()}>
                {unit.name} ({unit.department?.name || 'Departman N/A'})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Maaş"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Saatlik Ücret"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEmployee ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)}>
        <DialogTitle>Çalışan Transfer</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedEmployee?.firstName} {selectedEmployee?.lastName} adlı çalışanı hangi birime transfer etmek istiyorsunuz?
          </Typography>
          <TextField
            select
            fullWidth
            label="Yeni Birim"
            variant="outlined"
            defaultValue=""
            onChange={(e) => {
              const newUnitId = parseInt(e.target.value);
              handleTransferSubmit(newUnitId);
            }}
          >
            {units.filter(u => u.id !== selectedEmployee?.unit?.id).map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.department?.name || 'Departman N/A'})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>İptal</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;