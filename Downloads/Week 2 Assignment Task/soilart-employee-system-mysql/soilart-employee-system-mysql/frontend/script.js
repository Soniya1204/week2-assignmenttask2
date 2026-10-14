/* ==========================================================================
   SOILART EMPLOYEE MANAGEMENT SYSTEM - FETCH API BACKEND LOGIC
   ========================================================================== */

const API_URL = 'http://localhost:5000/api/employees';

let employees = [];
let currentRole = 'Admin';
let currentPage = 1;
const rowsPerPage = 5;
let filteredEmployees = [];
let employeeToDeleteId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
});

// Fetch All Employees from Express MySQL Backend
async function fetchEmployees() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.success) {
            employees = result.data.map(emp => ({
                id: emp.id,
                name: emp.name,
                phone: emp.phone,
                email: emp.email,
                division: emp.division,
                role: emp.role,
                salary: emp.salary,
                joinDate: emp.join_date ? emp.join_date.split('T')[0] : '',
                status: emp.status
            }));
            filteredEmployees = [...employees];
            renderTable();
            updateDashboardStats();
        } else {
            showToast('Failed to fetch employee data!');
        }
    } catch (error) {
        showToast('Error connecting to MySQL Node.js server!');
        console.error('Fetch error:', error);
    }
}

// Update Header Dashboard Stats
function updateDashboardStats() {
    const totalStaff = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);
    const avgSalary = totalStaff > 0 ? Math.round(totalSalary / totalStaff) : 0;
    const activeStaff = employees.filter(emp => emp.status === 'Active').length;
    const uniqueUnits = new Set(employees.map(emp => emp.division)).size;

    document.getElementById('statTotalStaff').innerText = totalStaff;
    document.getElementById('statAvgSalary').innerText = `₹${avgSalary.toLocaleString('en-IN')}`;
    document.getElementById('statTotalUnits').innerText = uniqueUnits;
    document.getElementById('statActiveStaff').innerText = activeStaff;
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredEmployees.slice(start, end);

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 2rem;">No staff records found.</td></tr>`;
    } else {
        paginatedData.forEach(emp => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-active';
            if (emp.status === 'On Leave') badgeClass = 'badge-leave';
            if (emp.status === 'Inactive') badgeClass = 'badge-inactive';

            tr.innerHTML = `
                <td><strong>${emp.id}</strong></td>
                <td>${emp.name}</td>
                <td>${emp.division}</td>
                <td>${emp.role}</td>
                <td>₹${Number(emp.salary).toLocaleString('en-IN')}</td>
                <td>${emp.joinDate}</td>
                <td><span class="badge ${badgeClass}">${emp.status}</span></td>
                <td class="text-center">
                    <button class="btn-icon" onclick="openViewModal('${emp.id}')" title="View ID Card"><i class="fa-solid fa-id-card"></i></button>
                    ${currentRole !== 'Studio Lead' ? `
                        <button class="btn-icon" onclick="openEditModal('${emp.id}')" title="Edit Staff"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-icon text-danger" onclick="openDeleteModal('${emp.id}', '${emp.name}')" title="Delete Staff"><i class="fa-solid fa-trash"></i></button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    updatePaginationInfo();
}

function updatePaginationInfo() {
    const totalEntries = filteredEmployees.length;
    const start = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalEntries);

    document.getElementById('tableInfo').innerText = `Showing ${start} to ${end} of ${totalEntries} entries`;
    document.getElementById('pageNumbers').innerText = `Page ${currentPage} of ${Math.ceil(totalEntries / rowsPerPage) || 1}`;

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage * rowsPerPage >= totalEntries;
}

function changePage(direction) {
    currentPage += direction;
    renderTable();
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const selectedDivision = document.getElementById('divisionFilter').value;

    filteredEmployees = employees.filter(emp => {
        const matchesQuery = emp.name.toLowerCase().includes(query) ||
                             emp.id.toLowerCase().includes(query) ||
                             emp.role.toLowerCase().includes(query);
        const matchesDivision = selectedDivision === 'ALL' || emp.division === selectedDivision;
        return matchesQuery && matchesDivision;
    });

    currentPage = 1;
    renderTable();
}

function handleFilter() {
    handleSearch();
}

let sortDirection = true;
function sortTable(column) {
    filteredEmployees.sort((a, b) => {
        if (column === 'salary') {
            return sortDirection ? a.salary - b.salary : b.salary - a.salary;
        } else if (column === 'name') {
            return sortDirection ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
    });
    sortDirection = !sortDirection;
    renderTable();
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function openAddModal() {
    document.getElementById('employeeForm').reset();
    document.getElementById('empId').value = '';
    document.getElementById('modalTitle').innerText = 'Add New Staff / Artisan';
    openModal('employeeModal');
}

function openEditModal(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('empId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empPhone').value = emp.phone;
    document.getElementById('empEmail').value = emp.email;
    document.getElementById('empDivision').value = emp.division;
    document.getElementById('empRole').value = emp.role;
    document.getElementById('empSalary').value = emp.salary;
    document.getElementById('empJoinDate').value = emp.joinDate;
    document.getElementById('empStatus').value = emp.status;

    document.getElementById('modalTitle').innerText = 'Edit Staff Record';
    openModal('employeeModal');
}

// SAVE EMPLOYEE (POST or PUT via Fetch API)
async function saveEmployee(event) {
    event.preventDefault();

    const id = document.getElementById('empId').value;
    const payload = {
        name: document.getElementById('empName').value,
        phone: document.getElementById('empPhone').value,
        email: document.getElementById('empEmail').value,
        division: document.getElementById('empDivision').value,
        role: document.getElementById('empRole').value,
        salary: Number(document.getElementById('empSalary').value),
        joinDate: document.getElementById('empJoinDate').value,
        status: document.getElementById('empStatus').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            showToast(id ? 'Staff updated successfully!' : 'Staff added successfully!');
            fetchEmployees();
            closeModal('employeeModal');
        } else {
            showToast(`Error: ${result.error}`);
        }
    } catch (error) {
        showToast('Error saving employee data!');
        console.error('Save error:', error);
    }
}

function openDeleteModal(id, name) {
    employeeToDeleteId = id;
    document.getElementById('deleteEmpName').innerText = name;
    openModal('deleteModal');
}

// DELETE EMPLOYEE (DELETE via Fetch API)
async function confirmDelete() {
    if (employeeToDeleteId) {
        try {
            const response = await fetch(`${API_URL}/${employeeToDeleteId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                showToast('Staff deleted successfully!');
                fetchEmployees();
            } else {
                showToast(`Error: ${result.error}`);
            }
        } catch (error) {
            showToast('Error deleting employee!');
            console.error('Delete error:', error);
        }
        employeeToDeleteId = null;
    }
    closeModal('deleteModal');
}

function openViewModal(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('cardName').innerText = emp.name;
    document.getElementById('cardRole').innerText = emp.role;
    document.getElementById('cardId').innerText = emp.id;
    document.getElementById('cardDivision').innerText = emp.division;
    document.getElementById('cardPhone').innerText = emp.phone;
    document.getElementById('cardEmail').innerText = emp.email;
    document.getElementById('cardJoinDate').innerText = emp.joinDate;

    openModal('viewModal');
}

function changeUserRole(role) {
    currentRole = role;
    const addBtn = document.getElementById('addStaffBtn');
    if (role === 'Studio Lead') {
        addBtn.classList.add('hidden');
    } else {
        addBtn.classList.remove('hidden');
    }
    renderTable();
    showToast(`Switched access level to: ${role}`);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Staff ID,Name,Mobile,Email,Division,Role,Monthly Salary (INR),Join Date,Status\n";

    employees.forEach(e => {
        csvContent += `"${e.id}","${e.name}","${e.phone}","${e.email}","${e.division}","${e.role}","${e.salary}","${e.joinDate}","${e.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SoilArt_Employees_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToExcel() {
    let excelContent = "Staff ID\tName\tMobile\tEmail\tDivision\tRole\tMonthly Salary (INR)\tJoin Date\tStatus\n";

    employees.forEach(e => {
        excelContent += `${e.id}\t${e.name}\t${e.phone}\t${e.email}\t${e.division}\t${e.role}\t${e.salary}\t${e.joinDate}\t${e.status}\n`;
    });

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "SoilArt_Employees_Report.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
