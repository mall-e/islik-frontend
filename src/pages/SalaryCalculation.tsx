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
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { Calculate, History, AttachMoney, Edit, Settings } from '@mui/icons-material';
import { SalaryCalculation, Employee, EmployeeCreateRequest, Unit } from '../types/api';
import { salaryAPI, employeeAPI, unitAPI } from '../services/api';

const SalaryCalculationPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const [currentCalculation, setCurrentCalculation] = useState<SalaryCalculation | null>(null);
  const [unitCalculations, setUnitCalculations] = useState<SalaryCalculation[]>([]);
  const [salaryHistory, setSalaryHistory] = useState<SalaryCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [unitResultsDialogOpen, setUnitResultsDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [calculationMode, setCalculationMode] = useState<'individual' | 'unit'>('individual');
  const [error, setError] = useState('');
  const [tempSettings, setTempSettings] = useState({
    baseSalary: 0,
    hourlyRate: 0,
    overtimeMultiplier: 1.5
  });

  useEffect(() => {
    fetchEmployees();
    fetchUnits();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      setError('Çalışanlar yüklenirken hata oluştu');
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await unitAPI.getAll();
      setUnits(data);
    } catch (error) {
      setError('Birimler yüklenirken hata oluştu');
    }
  };

  const calculateSalary = async () => {
    if (!selectedEmployee) {
      setError('Lütfen bir çalışan seçin');
      return;
    }

    try {
      setLoading(true);
      const period = `${selectedPeriod.getFullYear()}-${String(selectedPeriod.getMonth() + 1).padStart(2, '0')}`;
      const calculation = await salaryAPI.calculateSalary(parseInt(selectedEmployee), period);
      setCurrentCalculation(calculation);
      setError('');
    } catch (error) {
      setError('Maaş hesaplama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const calculateUnitSalaries = async () => {
    if (!selectedUnit) {
      setError('Lütfen bir birim seçin');
      return;
    }

    try {
      setLoading(true);
      const period = `${selectedPeriod.getFullYear()}-${String(selectedPeriod.getMonth() + 1).padStart(2, '0')}`;
      const calculations = await salaryAPI.calculateUnitSalaries(parseInt(selectedUnit), period);
      setUnitCalculations(calculations);
      setUnitResultsDialogOpen(true);
      setError('');
    } catch (error) {
      setError('Birim maaş hesaplama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const showHistory = async () => {
    if (!selectedEmployee) {
      setError('Lütfen bir çalışan seçin');
      return;
    }

    try {
      setLoading(true);
      const history = await salaryAPI.getSalaryHistory(parseInt(selectedEmployee));
      setSalaryHistory(history);
      setHistoryDialogOpen(true);
      setError('');
    } catch (error) {
      setError('Maaş geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openSettingsDialog = () => {
    if (selectedEmployeeData) {
      setTempSettings({
        baseSalary: selectedEmployeeData.baseSalary,
        hourlyRate: selectedEmployeeData.hourlyRate,
        overtimeMultiplier: selectedEmployeeData.overtimeMultiplier || 1.5
      });
      setSettingsDialogOpen(true);
    }
  };

  const saveSettings = async () => {
    if (!selectedEmployee || !selectedEmployeeData) return;

    try {
      setLoading(true);
      const updateRequest: EmployeeCreateRequest = {
        firstName: selectedEmployeeData.firstName,
        lastName: selectedEmployeeData.lastName,
        email: selectedEmployeeData.email,
        identityNumber: selectedEmployeeData.identityNumber,
        position: selectedEmployeeData.position,
        role: selectedEmployeeData.role,
        level: selectedEmployeeData.level,
        baseSalary: tempSettings.baseSalary,
        hourlyRate: tempSettings.hourlyRate,
        overtimeMultiplier: tempSettings.overtimeMultiplier,
        unitId: selectedEmployeeData.unit.id,
        managerId: selectedEmployeeData.manager?.id || null
      };

      await employeeAPI.update(parseInt(selectedEmployee), updateRequest);

      // Refresh employee data
      await fetchEmployees();

      setSettingsDialogOpen(false);
      setCurrentCalculation(null); // Clear calculation to force recalculation
      setError('');
    } catch (error) {
      setError('Maaş ayarları güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
  };

  const selectedEmployeeData = employees.find(emp => emp.id.toString() === selectedEmployee);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Maaş Hesaplama
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          {/* Mode Selection */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant={calculationMode === 'individual' ? 'contained' : 'outlined'}
                onClick={() => {
                  setCalculationMode('individual');
                  setCurrentCalculation(null);
                  setUnitCalculations([]);
                }}
                sx={{ backgroundColor: calculationMode === 'individual' ? '#1e293b' : 'transparent' }}
              >
                Bireysel Hesaplama
              </Button>
              <Button
                variant={calculationMode === 'unit' ? 'contained' : 'outlined'}
                onClick={() => {
                  setCalculationMode('unit');
                  setCurrentCalculation(null);
                  setUnitCalculations([]);
                }}
                sx={{ backgroundColor: calculationMode === 'unit' ? '#1e293b' : 'transparent' }}
              >
                Birim Bazlı Hesaplama
              </Button>
            </Box>
          </Box>

          {/* Form Fields */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
            gap: 3,
            alignItems: 'end'
          }}>
            {calculationMode === 'individual' ? (
              <TextField
                select
                fullWidth
                label="Çalışan Seçin"
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  setCurrentCalculation(null);
                }}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id.toString()}>
                    {employee.firstName} {employee.lastName} - {employee.position}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                select
                fullWidth
                label="Birim Seçin"
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  setUnitCalculations([]);
                }}
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id.toString()}>
                    {unit.name} - {unit.department.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <DatePicker
              label="Dönem"
              views={['year', 'month']}
              value={selectedPeriod}
              onChange={(date) => {
                setSelectedPeriod(date!);
                setCurrentCalculation(null);
                setUnitCalculations([]);
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <Button
              variant="contained"
              startIcon={<Calculate />}
              onClick={calculationMode === 'individual' ? calculateSalary : calculateUnitSalaries}
              disabled={
                (calculationMode === 'individual' && !selectedEmployee) ||
                (calculationMode === 'unit' && !selectedUnit) ||
                loading
              }
              fullWidth
              sx={{ backgroundColor: '#1e293b', height: '56px' }}
            >
              {calculationMode === 'individual' ? 'Maaş Hesapla' : 'Birim Maaşlarını Hesapla'}
            </Button>

            {calculationMode === 'individual' && (
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={showHistory}
                disabled={!selectedEmployee || loading}
                fullWidth
                sx={{ height: '56px' }}
              >
                Geçmiş
              </Button>
            )}
          </Box>
        </Paper>

        {selectedEmployeeData && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Çalışan Bilgileri
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Ad Soyad:
                    </Typography>
                    <Typography variant="body1">
                      {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Pozisyon:
                    </Typography>
                    <Typography variant="body1">
                      {selectedEmployeeData.position}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Birim:
                    </Typography>
                    <Typography variant="body1">
                      {selectedEmployeeData.unit?.name || 'Birim Atanmamış'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Departman:
                    </Typography>
                    <Typography variant="body1">
                      {selectedEmployeeData.unit?.department?.name || 'Departman N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Maaş Bilgileri
                  </Typography>
                  <Tooltip title="Maaş Ayarlarını Düzenle">
                    <IconButton
                      onClick={openSettingsDialog}
                      sx={{ color: '#1e293b' }}
                    >
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Temel Maaş:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#10b981' }}>
                      {formatCurrency(selectedEmployeeData.baseSalary)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Saatlik Ücret:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#3b82f6' }}>
                      ₺{selectedEmployeeData.hourlyRate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Mesai Çarpanı:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#f59e0b' }}>
                      {selectedEmployeeData.overtimeMultiplier || 1.5}x
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {currentCalculation && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney sx={{ mr: 1 }} />
              Maaş Hesaplama Sonucu - {formatPeriod(currentCalculation.period)}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Açıklama</strong></TableCell>
                    <TableCell align="right"><strong>Saat</strong></TableCell>
                    <TableCell align="right"><strong>Tutar</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Temel Maaş</TableCell>
                    <TableCell align="right">-</TableCell>
                    <TableCell align="right">{formatCurrency(currentCalculation.baseSalary)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Normal Çalışma Saati</TableCell>
                    <TableCell align="right">{currentCalculation.regularHours}h</TableCell>
                    <TableCell align="right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mesai Saati</TableCell>
                    <TableCell align="right">
                      {currentCalculation.overtimeHours > 0 && (
                        <Chip
                          label={`${currentCalculation.overtimeHours}h`}
                          size="small"
                          color="warning"
                        />
                      )}
                      {currentCalculation.overtimeHours === 0 && '0h'}
                    </TableCell>
                    <TableCell align="right">
                      {currentCalculation.overtimePay > 0 ? formatCurrency(currentCalculation.overtimePay) : '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Toplam Maaş</strong></TableCell>
                    <TableCell align="right">
                      <strong>{currentCalculation.regularHours + currentCalculation.overtimeHours}h</strong>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                        {formatCurrency(currentCalculation.totalSalary)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        <Dialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Maaş Geçmişi</DialogTitle>
          <DialogContent>
            {salaryHistory.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dönem</TableCell>
                      <TableCell align="right">Normal Saat</TableCell>
                      <TableCell align="right">Mesai Saati</TableCell>
                      <TableCell align="right">Mesai Ödemesi</TableCell>
                      <TableCell align="right">Toplam Maaş</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryHistory.map((calculation, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatPeriod(calculation.period)}</TableCell>
                        <TableCell align="right">{calculation.regularHours}h</TableCell>
                        <TableCell align="right">{calculation.overtimeHours}h</TableCell>
                        <TableCell align="right">{formatCurrency(calculation.overtimePay)}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(calculation.totalSalary)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Henüz maaş geçmişi bulunmuyor.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryDialogOpen(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={unitResultsDialogOpen}
          onClose={() => setUnitResultsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Birim Maaş Hesaplama Sonuçları
            {units.find(u => u.id.toString() === selectedUnit) &&
              ` - ${units.find(u => u.id.toString() === selectedUnit)?.name}`}
          </DialogTitle>
          <DialogContent>
            {unitCalculations.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Çalışan</TableCell>
                      <TableCell>Pozisyon</TableCell>
                      <TableCell align="right">Normal Saat</TableCell>
                      <TableCell align="right">Mesai Saati</TableCell>
                      <TableCell align="right">Mesai Ödemesi</TableCell>
                      <TableCell align="right">Toplam Maaş</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unitCalculations.map((calculation) => {
                      const employee = employees.find(emp => emp.id === calculation.employeeId);
                      return (
                        <TableRow key={calculation.employeeId}>
                          <TableCell>
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'Bilinmeyen'}
                          </TableCell>
                          <TableCell>{employee?.position || '-'}</TableCell>
                          <TableCell align="right">{calculation.regularHours}h</TableCell>
                          <TableCell align="right">{calculation.overtimeHours}h</TableCell>
                          <TableCell align="right">{formatCurrency(calculation.overtimePay)}</TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(calculation.totalSalary)}</strong>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={4}><strong>TOPLAM</strong></TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(unitCalculations.reduce((sum, calc) => sum + calc.overtimePay, 0))}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                          {formatCurrency(unitCalculations.reduce((sum, calc) => sum + calc.totalSalary, 0))}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Bu birimde çalışan bulunamadı.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnitResultsDialogOpen(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedEmployeeData?.firstName} {selectedEmployeeData?.lastName} - Maaş Ayarları
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Temel Maaş (₺)"
                type="number"
                value={tempSettings.baseSalary}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  baseSalary: parseFloat(e.target.value) || 0
                })}
                sx={{ mb: 3 }}
                InputProps={{
                  inputProps: { min: 0, step: 100 }
                }}
              />

              <TextField
                fullWidth
                label="Saatlik Ücret (₺)"
                type="number"
                value={tempSettings.hourlyRate}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  hourlyRate: parseFloat(e.target.value) || 0
                })}
                sx={{ mb: 3 }}
                InputProps={{
                  inputProps: { min: 0, step: 1 }
                }}
              />

              <TextField
                fullWidth
                label="Mesai Çarpanı"
                type="number"
                value={tempSettings.overtimeMultiplier}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  overtimeMultiplier: parseFloat(e.target.value) || 1.5
                })}
                sx={{ mb: 2 }}
                InputProps={{
                  inputProps: { min: 1, max: 3, step: 0.1 }
                }}
                helperText="Mesai saatleri için uygulanacak çarpan (örn: 1.5 = %50 fazla)"
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                Bu değişiklikler sadece gelecekteki maaş hesaplamalarını etkiler.
                Geçmiş hesaplamalar değişmez.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialogOpen(false)}>İptal</Button>
            <Button
              onClick={saveSettings}
              variant="contained"
              disabled={loading}
              sx={{ backgroundColor: '#1e293b' }}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default SalaryCalculationPage;