import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Employee, Department, Unit } from '../types/api';
import { employeeAPI, departmentAPI, unitAPI } from '../services/api';

interface OrganizationNode {
  employee: Employee;
  children: OrganizationNode[];
}

const OrganizationChart: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [organizationTree, setOrganizationTree] = useState<OrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const buildOrganizationTree = useCallback(() => {
    let filteredEmployees = employees;

    if (selectedUnit) {
      filteredEmployees = employees.filter(emp => emp.unit.id.toString() === selectedUnit);
    } else if (selectedDepartment) {
      filteredEmployees = employees.filter(emp => emp.unit?.department?.id?.toString() === selectedDepartment);
    }

    const tree = buildTree(filteredEmployees);
    setOrganizationTree(tree);
  }, [employees, selectedDepartment, selectedUnit]);

  useEffect(() => {
    buildOrganizationTree();
  }, [buildOrganizationTree]);

  const fetchData = async () => {
    try {
      const [employeesData, departmentsData, unitsData] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll(),
        unitAPI.getAll(),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setUnits(unitsData);
    } catch (error) {
      setError('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  const buildTree = (employeeList: Employee[]): OrganizationNode[] => {
    // Birime göre grupla
    const employeesByUnit = employeeList.reduce((acc, employee) => {
      const unitId = employee.unit?.id || 'no-unit';
      if (!acc[unitId]) {
        acc[unitId] = [];
      }
      acc[unitId].push(employee);
      return acc;
    }, {} as Record<string, Employee[]>);

    // Her birim içinde kademeye göre sırala ve hiyerarşi oluştur
    const allNodes: OrganizationNode[] = [];

    Object.values(employeesByUnit).forEach(unitEmployees => {
      // Birim içindeki çalışanları kademeye göre grupla
      const employeesByLevel = unitEmployees.reduce((acc, employee) => {
        const level = employee.level || 99;
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(employee);
        return acc;
      }, {} as Record<number, Employee[]>);

      // Kademe seviyelerini sırala (1 en yüksek)
      const sortedLevels = Object.keys(employeesByLevel)
        .map(Number)
        .sort((a, b) => a - b);

      let currentLevelNodes: OrganizationNode[] = [];

      sortedLevels.forEach((level, levelIndex) => {
        const levelEmployees = employeesByLevel[level];

        // Aynı kademe içinde role göre sırala
        levelEmployees.sort((a, b) => {
          const roleA = a.role || '';
          const roleB = b.role || '';
          return roleA.localeCompare(roleB, 'tr', { sensitivity: 'base' });
        });

        // Bu kademe için node'ları oluştur
        const levelNodes: OrganizationNode[] = levelEmployees.map(employee => ({
          employee,
          children: []
        }));

        if (levelIndex === 0) {
          // İlk kademe (en yüksek) - root level
          currentLevelNodes = levelNodes;
          allNodes.push(...levelNodes);
        } else {
          // Alt kademe - bir üst kademeye bağla
          distributeChildrenAmongParents(currentLevelNodes, levelNodes);
          currentLevelNodes = levelNodes;
        }
      });
    });

    return allNodes;
  };

  // Alt kademe çalışanlarını üst kademe çalışanları arasında dağıtır
  const distributeChildrenAmongParents = (parentNodes: OrganizationNode[], childNodes: OrganizationNode[]) => {
    if (parentNodes.length === 0) return;

    childNodes.forEach((childNode, index) => {
      // Çocukları parent'ler arasında eşit dağıt
      const parentIndex = index % parentNodes.length;
      parentNodes[parentIndex].children.push(childNode);
    });
  };

  const EmployeeCard: React.FC<{ employee: Employee }> = ({ employee }) => (
    <Card
      sx={{
        minWidth: 200,
        maxWidth: 250,
        margin: 1,
        boxShadow: 3,
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 2 }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            margin: '0 auto 1rem auto',
            backgroundColor: '#1e293b',
          }}
        >
          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
        </Avatar>
        <Typography variant="h6" component="div" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          {employee.firstName} {employee.lastName}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {employee.position}
        </Typography>
        {employee.role && (
          <Chip
            label={employee.role}
            size="small"
            color="secondary"
            variant="filled"
            sx={{ mb: 1, mr: 1 }}
          />
        )}
        {employee.level && (
          <Chip
            label={`Kademe ${employee.level}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}
        <br />
        <Chip
          label={employee.unit?.name || 'Birim Atanmamış'}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
          {employee.unit?.department?.name || 'Departman N/A'}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderTree = (nodes: OrganizationNode[]): React.ReactNode => {
    return nodes.map((node, index) => (
      <TreeNode
        key={node.employee.id}
        label={<EmployeeCard employee={node.employee} />}
      >
        {node.children.length > 0 && renderTree(node.children)}
      </TreeNode>
    ));
  };

  const filteredUnits = selectedDepartment
    ? units.filter(unit => unit.department?.id?.toString() === selectedDepartment)
    : units;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Organizasyon Şeması
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            select
            label="Departman Filtresi"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedUnit('');
            }}
            sx={{ minWidth: 200 }}
            size="small"
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
            label="Birim Filtresi"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            sx={{ minWidth: 200 }}
            size="small"
            disabled={!selectedDepartment}
          >
            <MenuItem value="">Tüm Birimler</MenuItem>
            {filteredUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id.toString()}>
                {unit.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            onClick={() => {
              setSelectedDepartment('');
              setSelectedUnit('');
            }}
          >
            Filtreleri Temizle
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, overflow: 'auto', minHeight: 400 }}>
        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : organizationTree.length > 0 ? (
          <Tree
            lineWidth="2px"
            lineColor="#90a4ae"
            lineBorderRadius="10px"
            label={
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedUnit
                    ? units.find(u => u.id.toString() === selectedUnit)?.name
                    : selectedDepartment
                    ? departments.find(d => d.id.toString() === selectedDepartment)?.name
                    : 'Tüm Organizasyon'}
                </Typography>
              </Box>
            }
          >
            {renderTree(organizationTree)}
          </Tree>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Seçilen kriterlere uygun çalışan bulunamadı
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OrganizationChart;