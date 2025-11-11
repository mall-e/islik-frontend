import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { Add, Edit, Delete, AccessTime, TrendingUp, Person, Group } from '@mui/icons-material';
import { TimeEntry, Employee, Unit, Department } from '../types/api';
import { timeTrackingAPI, employeeAPI, unitAPI, departmentAPI } from '../services/api';

const TimeTracking: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [mode, setMode] = useState<'individual' | 'unit'>('individual');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [unitEmployees, setUnitEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date(),
    checkIn: '',
    checkOut: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    date: new Date(),
    checkIn: '',
    checkOut: '',
  });
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalHours: 0,
    overtimeHours: 0,
    avgDailyHours: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchUnits();
  }, []);

  const fetchTimeEntries = useCallback(async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const data = await timeTrackingAPI.getTimeEntries(
        parseInt(selectedEmployee),
        dateRange.start.toISOString().split('T')[0],
        dateRange.end.toISOString().split('T')[0]
      );
      setTimeEntries(data);
      calculateStats(data);
    } catch (error) {
      setError('Mesai kayıtları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee, dateRange]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchTimeEntries();
    }
  }, [selectedEmployee, fetchTimeEntries]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      setError('Çalışanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Departmanlar yüklenirken hata oluştu', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await unitAPI.getAll();
      setUnits(data);
    } catch (error) {
      console.error('Birimler yüklenirken hata oluştu', error);
    }
  };

  const fetchUnitEmployees = async (unitId: string) => {
    try {
      const data = await employeeAPI.getByUnit(parseInt(unitId));
      setUnitEmployees(data);
      setSelectedEmployeeIds([]);
    } catch (error) {
      setError('Birim çalışanları yüklenirken hata oluştu');
    }
  };

  useEffect(() => {
    if (selectedUnit && mode === 'unit') {
      fetchUnitEmployees(selectedUnit);
    }
  }, [selectedUnit, mode]);

  const filteredUnits = selectedDepartment
    ? units.filter(unit => unit.department?.id?.toString() === selectedDepartment)
    : units;

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'individual' | 'unit' | null) => {
    if (newMode !== null) {
      setMode(newMode);
      setSelectedEmployee('');
      setSelectedDepartment('');
      setSelectedUnit('');
      setUnitEmployees([]);
      setSelectedEmployeeIds([]);
      setTimeEntries([]);
    }
  };

  const handleEmployeeSelect = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(prev => [...prev, employeeId]);
    } else {
      setSelectedEmployeeIds(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleSelectAllEmployees = (checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(unitEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleBulkSubmit = async () => {
    try {
      const entries = selectedEmployeeIds.map(employeeId => ({
        employeeId,
        date: bulkFormData.date.toISOString().split('T')[0],
        checkIn: bulkFormData.checkIn,
        checkOut: bulkFormData.checkOut || undefined,
      }));

      await Promise.all(entries.map(entry => timeTrackingAPI.createTimeEntry(entry)));

      setBulkDialogOpen(false);
      setBulkFormData({ date: new Date(), checkIn: '', checkOut: '' });
      setSelectedEmployeeIds([]);
      setError('');
    } catch (error) {
      setError('Toplu kayıt işlemi sırasında hata oluştu');
    }
  };

  const openBulkDialog = () => {
    setBulkFormData({
      date: new Date(),
      checkIn: '',
      checkOut: '',
    });
    setBulkDialogOpen(true);
  };


  const calculateStats = (entries: TimeEntry[]) => {
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const overtimeHours = entries.reduce((sum, entry) => sum + (entry.overtimeHours || 0), 0);
    const avgDailyHours = entries.length > 0 ? totalHours / entries.length : 0;

    setStats({
      totalHours,
      overtimeHours,
      avgDailyHours,
    });
  };

  const handleAdd = () => {
    setSelectedEntry(null);
    setFormData({
      employeeId: selectedEmployee,
      date: new Date(),
      checkIn: '',
      checkOut: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setFormData({
      employeeId: entry.employeeId.toString(),
      date: new Date(entry.date),
      checkIn: entry.checkIn,
      checkOut: entry.checkOut || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const entryData = {
        employeeId: parseInt(formData.employeeId),
        date: formData.date.toISOString().split('T')[0],
        checkIn: formData.checkIn,
        checkOut: formData.checkOut || undefined,
      };

      if (selectedEntry) {
        await timeTrackingAPI.updateTimeEntry(selectedEntry.id!, entryData);
      } else {
        await timeTrackingAPI.createTimeEntry(entryData);
      }

      setDialogOpen(false);
      fetchTimeEntries();
      setError('');
    } catch (error) {
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu mesai kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await timeTrackingAPI.deleteTimeEntry(id);
        fetchTimeEntries();
      } catch (error) {
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Tarih',
      width: 120,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString('tr-TR'),
    },
    {
      field: 'checkIn',
      headerName: 'Giriş',
      width: 100,
      valueFormatter: (value: string) => formatTime(value),
    },
    {
      field: 'checkOut',
      headerName: 'Çıkış',
      width: 100,
      valueFormatter: (value: string) => value ? formatTime(value) : '-',
    },
    {
      field: 'totalHours',
      headerName: 'Toplam Saat',
      width: 120,
      valueFormatter: (value: number) => value ? `${value.toFixed(2)}h` : '-',
    },
    {
      field: 'overtimeHours',
      headerName: 'Mesai',
      width: 100,
      renderCell: (params) => (
        params.value > 0 ? (
          <Chip
            label={`${params.value.toFixed(2)}h`}
            size="small"
            color="warning"
          />
        ) : (
          '-'
        )
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Mesai Takibi
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              aria-label="mesai giriş modu"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="individual" aria-label="tekil çalışan">
                <Person sx={{ mr: 1 }} />
                Tekil Çalışan
              </ToggleButton>
              <ToggleButton value="unit" aria-label="birim bazında">
                <Group sx={{ mr: 1 }} />
                Birim Bazında
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {mode === 'individual' ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' },
              gap: 2,
              alignItems: 'center'
            }}>
              <TextField
                select
                fullWidth
                label="Çalışan Seçin"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id.toString()}>
                    {employee.firstName} {employee.lastName} - {employee.unit?.name || 'Birim Atanmamış'}
                  </MenuItem>
                ))}
              </TextField>

              <DatePicker
                label="Başlangıç Tarihi"
                value={dateRange.start}
                onChange={(date) => setDateRange({ ...dateRange, start: date! })}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <DatePicker
                label="Bitiş Tarihi"
                value={dateRange.end}
                onChange={(date) => setDateRange({ ...dateRange, end: date! })}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
                disabled={!selectedEmployee}
                sx={{ backgroundColor: '#1e293b', whiteSpace: 'nowrap' }}
              >
                Yeni Kayıt
              </Button>
            </Box>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
              gap: 2,
              alignItems: 'center'
            }}>
              <TextField
                select
                fullWidth
                label="Departman Seçin"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedUnit('');
                  setUnitEmployees([]);
                  setSelectedEmployeeIds([]);
                }}
              >
                <MenuItem value="">Tüm Departmanlar</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id.toString()}>
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Birim Seçin"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={!selectedDepartment}
              >
                <MenuItem value="">Birim Seçin</MenuItem>
                {filteredUnits.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openBulkDialog}
                disabled={selectedEmployeeIds.length === 0}
                sx={{ backgroundColor: '#1e293b', whiteSpace: 'nowrap' }}
              >
                Toplu Kayıt
              </Button>
            </Box>
          )}
        </Paper>

        {mode === 'unit' && selectedUnit && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {units.find(u => u.id.toString() === selectedUnit)?.name} Çalışanları
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedEmployeeIds.length === unitEmployees.length && unitEmployees.length > 0}
                    indeterminate={selectedEmployeeIds.length > 0 && selectedEmployeeIds.length < unitEmployees.length}
                    onChange={(e) => handleSelectAllEmployees(e.target.checked)}
                  />
                }
                label="Tümünü Seç"
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                {selectedEmployeeIds.length} / {unitEmployees.length} çalışan seçildi
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Seç</TableCell>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>Pozisyon</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Kademe</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unitEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedEmployeeIds.includes(employee.id)}
                          onChange={(e) => handleEmployeeSelect(employee.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.role || '-'}</TableCell>
                      <TableCell>{employee.level || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {((mode === 'individual' && selectedEmployee) || (mode === 'unit' && selectedUnit)) && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 3
          }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ color: '#3b82f6', fontWeight: 'bold' }}>
                      {stats.totalHours.toFixed(2)}h
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Toplam Çalışma Saati
                    </Typography>
                  </Box>
                  <AccessTime sx={{ color: '#3b82f6', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      {stats.overtimeHours.toFixed(2)}h
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Mesai Saati
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ color: '#f59e0b', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                      {stats.avgDailyHours.toFixed(2)}h
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Günlük Ortalama
                    </Typography>
                  </Box>
                  <AccessTime sx={{ color: '#10b981', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={timeEntries}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </Paper>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedEntry ? 'Mesai Kaydı Düzenle' : 'Yeni Mesai Kaydı'}
          </DialogTitle>
          <DialogContent>
            <DatePicker
              label="Tarih"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date: date! })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'dense',
                  sx: { mb: 2 }
                }
              }}
            />
            <TextField
              margin="dense"
              label="Giriş Saati"
              type="time"
              fullWidth
              variant="outlined"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="dense"
              label="Çıkış Saati"
              type="time"
              fullWidth
              variant="outlined"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedEntry ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Toplu Mesai Kaydı ({selectedEmployeeIds.length} çalışan)
          </DialogTitle>
          <DialogContent>
            <DatePicker
              label="Tarih"
              value={bulkFormData.date}
              onChange={(date) => setBulkFormData({ ...bulkFormData, date: date! })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'dense',
                  sx: { mb: 2 }
                }
              }}
            />
            <TextField
              margin="dense"
              label="Giriş Saati"
              type="time"
              fullWidth
              variant="outlined"
              value={bulkFormData.checkIn}
              onChange={(e) => setBulkFormData({ ...bulkFormData, checkIn: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="dense"
              label="Çıkış Saati"
              type="time"
              fullWidth
              variant="outlined"
              value={bulkFormData.checkOut}
              onChange={(e) => setBulkFormData({ ...bulkFormData, checkOut: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Bu bilgiler seçili {selectedEmployeeIds.length} çalışanın tümüne uygulanacaktır.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkDialogOpen(false)}>İptal</Button>
            <Button onClick={handleBulkSubmit} variant="contained" color="primary">
              Toplu Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TimeTracking;