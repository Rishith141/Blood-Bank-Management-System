// Admin Dashboard JavaScript
let inventoryChart;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboardData();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }
    
    document.getElementById('adminName').textContent = user.name;
}

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Load statistics
        const statsResponse = await fetch('/api/admin/stats', { headers });
        const stats = await statsResponse.json();
        
        if (statsResponse.ok) {
            document.getElementById('totalDonors').textContent = stats.totalDonors;
            document.getElementById('totalRecipients').textContent = stats.totalRecipients;
            document.getElementById('totalDonations').textContent = stats.totalDonations;
            document.getElementById('pendingRequests').textContent = stats.pendingRequests;
            document.getElementById('totalBloodUnits').textContent = stats.totalBloodUnits;
        }

        // Load inventory chart
        const inventoryResponse = await fetch('/api/inventory', { headers });
        const inventory = await inventoryResponse.json();
        
        if (inventoryResponse.ok) {
            createInventoryChart(inventory);
        }

        // Load recent donations
        const donationsResponse = await fetch('/api/admin/recent-donations', { headers });
        const donations = await donationsResponse.json();
        
        if (donationsResponse.ok) {
            displayRecentDonations(donations);
        }

        // Load recent requests
        const requestsResponse = await fetch('/api/admin/recent-requests', { headers });
        const requests = await requestsResponse.json();
        
        if (requestsResponse.ok) {
            displayRecentRequests(requests);
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Failed to load dashboard data', 'error');
    }
}

function createInventoryChart(inventory) {
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    
    if (inventoryChart) {
        inventoryChart.destroy();
    }
    
    const bloodTypes = inventory.map(item => item.bloodType);
    const quantities = inventory.map(item => item.units);
    
    inventoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bloodTypes,
            datasets: [{
                label: 'Available Units',
                data: quantities,
                backgroundColor: [
                    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
                    '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
                ],
                borderColor: [
                    '#c0392b', '#2980b9', '#27ae60', '#e67e22',
                    '#8e44ad', '#d35400', '#16a085', '#2c3e50'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                },
                title: {
                    display: true,
                    text: 'Blood Inventory Status',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#333',
                    padding: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#666'
                    },
                    grid: {
                        color: '#e0e0e0',
                        lineWidth: 1
                    },
                    title: {
                        display: true,
                        text: 'Units Available',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#666'
                    },
                    grid: {
                        color: '#e0e0e0',
                        lineWidth: 1
                    },
                    title: {
                        display: true,
                        text: 'Blood Types',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function displayRecentDonations(donations) {
    const container = document.getElementById('recentDonations');
    
    if (donations.length === 0) {
        container.innerHTML = '<p>No recent donations</p>';
        return;
    }
    
    const html = donations.map(donation => `
        <div class="recent-item">
            <div class="recent-info">
                <strong>${donation.donorName}</strong>
                <span>${donation.bloodType}</span>
            </div>
            <div class="recent-date">${new Date(donation.date).toLocaleDateString()}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function displayRecentRequests(requests) {
    const container = document.getElementById('recentRequests');
    
    if (requests.length === 0) {
        container.innerHTML = '<p>No recent requests</p>';
        return;
    }
    
    const html = requests.map(request => `
        <div class="recent-item">
            <div class="recent-info">
                <strong>${request.recipientName}</strong>
                <span>${request.bloodType}</span>
            </div>
            <div class="recent-status ${request.status}">${request.status}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Quick Actions - Updated with real functionality
async function showUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            displayUsersModal(users);
        } else {
            showAlert('Failed to load users', 'error');
        }
    } catch (error) {
        showAlert('Error loading users', 'error');
    }
}

function displayUsersModal(users) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const html = `
        <h2><i class="fas fa-users"></i> User Management</h2>
        <div class="user-list">
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Blood Type</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="role-badge ${user.role}">${user.role}</span></td>
                            <td>${user.bloodType || 'N/A'}</td>
                            <td>${user.location || 'N/A'}</td>
                            <td>
                                <button onclick="editUser('${user._id}')" class="btn-edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteUser('${user._id}')" class="btn-delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
}

async function showDonations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/donations', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const donations = await response.json();
            displayDonationsModal(donations);
        } else {
            showAlert('Failed to load donations', 'error');
        }
    } catch (error) {
        showAlert('Error loading donations', 'error');
    }
}

function displayDonationsModal(donations) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const html = `
        <h2><i class="fas fa-tint"></i> Donation Management</h2>
        <div class="donation-list">
            <table class="donation-table">
                <thead>
                    <tr>
                        <th>Donor</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${donations.map(donation => `
                        <tr>
                            <td>${donation.donorName}</td>
                            <td>${donation.bloodType}</td>
                            <td>${donation.units}</td>
                            <td>${new Date(donation.date).toLocaleDateString()}</td>
                            <td><span class="status-badge ${donation.status}">${donation.status}</span></td>
                            <td>
                                <button onclick="updateDonationStatus('${donation._id}', 'completed')" class="btn-approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="updateDonationStatus('${donation._id}', 'rejected')" class="btn-reject">
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
}

async function showRequests() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/requests', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayRequestsModal(requests);
        } else {
            showAlert('Failed to load requests', 'error');
        }
    } catch (error) {
        showAlert('Error loading requests', 'error');
    }
}

function displayRequestsModal(requests) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const html = `
        <h2><i class="fas fa-hand-holding-heart"></i> Request Management</h2>
        <div class="request-list">
            <table class="request-table">
                <thead>
                    <tr>
                        <th>Recipient</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(request => `
                        <tr>
                            <td>${request.recipientName}</td>
                            <td>${request.bloodType}</td>
                            <td>${request.units}</td>
                            <td>${new Date(request.createdAt).toLocaleDateString()}</td>
                            <td><span class="status-badge ${request.status}">${request.status}</span></td>
                            <td>
                                <button onclick="updateRequestStatus('${request._id}', 'fulfilled')" class="btn-approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="updateRequestStatus('${request._id}', 'rejected')" class="btn-reject">
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
}

async function showInventory() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/inventory', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const inventory = await response.json();
            displayInventoryModal(inventory);
        } else {
            showAlert('Failed to load inventory', 'error');
        }
    } catch (error) {
        showAlert('Error loading inventory', 'error');
    }
}

function displayInventoryModal(inventory) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    const html = `
        <h2><i class="fas fa-boxes"></i> Inventory Management</h2>
        <div class="inventory-list">
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Blood Type</th>
                        <th>Available Units</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventory.map(item => `
                        <tr>
                            <td>${item.bloodType}</td>
                            <td>${item.units}</td>
                            <td>${new Date(item.updatedAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="updateInventory('${item.bloodType}')" class="btn-edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
}

// User management functions
async function editUser(userId) {
    const newName = prompt('Enter new name:');
    if (!newName) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        
        if (response.ok) {
            showAlert('User updated successfully', 'success');
            showUsers(); // Refresh the list
        } else {
            showAlert('Failed to update user', 'error');
        }
    } catch (error) {
        showAlert('Error updating user', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showAlert('User deleted successfully', 'success');
            showUsers(); // Refresh the list
        } else {
            showAlert('Failed to delete user', 'error');
        }
    } catch (error) {
        showAlert('Error deleting user', 'error');
    }
}

// Donation management functions
async function updateDonationStatus(donationId, status) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/donations/${donationId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showAlert(`Donation ${status} successfully`, 'success');
            showDonations(); // Refresh the list
        } else {
            showAlert('Failed to update donation status', 'error');
        }
    } catch (error) {
        showAlert('Error updating donation status', 'error');
    }
}

// Request management functions
async function updateRequestStatus(requestId, status) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showAlert(`Request ${status} successfully`, 'success');
            showRequests(); // Refresh the list
        } else {
            showAlert('Failed to update request status', 'error');
        }
    } catch (error) {
        showAlert('Error updating request status', 'error');
    }
}

// Inventory management functions
async function updateInventory(bloodType) {
    const newUnits = prompt(`Enter new units for ${bloodType}:`);
    if (!newUnits || isNaN(newUnits)) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/inventory/${bloodType}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ units: parseInt(newUnits) })
        });
        
        if (response.ok) {
            showAlert('Inventory updated successfully', 'success');
            showInventory(); // Refresh the list
        } else {
            showAlert('Failed to update inventory', 'error');
        }
    } catch (error) {
        showAlert('Error updating inventory', 'error');
    }
}

// Tab Navigation Functions
function showTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab pane
    const selectedPane = document.getElementById(tabName);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Load data for specific tabs if needed
    if (tabName === 'dashboard') {
        loadDashboardData();
    }
}

// Enhanced User Management Functions
async function showDonors() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const donors = users.filter(user => user.role === 'donor');
            displayUsersInTab(donors, 'usersContent', 'Donors');
        } else {
            showAlert('Failed to load donors', 'error');
        }
    } catch (error) {
        showAlert('Error loading donors', 'error');
    }
}

async function showRecipients() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const recipients = users.filter(user => user.role === 'recipient');
            displayUsersInTab(recipients, 'usersContent', 'Recipients');
        } else {
            showAlert('Failed to load recipients', 'error');
        }
    } catch (error) {
        showAlert('Error loading recipients', 'error');
    }
}

async function showAdmins() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const admins = users.filter(user => user.role === 'admin');
            displayUsersInTab(admins, 'usersContent', 'Admins');
        } else {
            showAlert('Failed to load admins', 'error');
        }
    } catch (error) {
        showAlert('Error loading admins', 'error');
    }
}

function displayUsersInTab(users, contentId, title) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>${title} (${users.length})</h3>
        <div class="user-list">
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Blood Type</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.bloodType || 'N/A'}</td>
                            <td>${user.location || 'N/A'}</td>
                            <td>
                                <button onclick="editUser('${user._id}')" class="btn-edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteUser('${user._id}')" class="btn-delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    contentArea.innerHTML = html;
}

// Enhanced Donation Management Functions
async function showPendingDonations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/donations', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const donations = await response.json();
            const pendingDonations = donations.filter(donation => donation.status === 'scheduled');
            displayDonationsInTab(pendingDonations, 'donationsContent', 'Pending Donations');
        } else {
            showAlert('Failed to load pending donations', 'error');
        }
    } catch (error) {
        showAlert('Error loading pending donations', 'error');
    }
}

async function showCompletedDonations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/donations', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const donations = await response.json();
            const completedDonations = donations.filter(donation => donation.status === 'completed');
            displayDonationsInTab(completedDonations, 'donationsContent', 'Completed Donations');
        } else {
            showAlert('Failed to load completed donations', 'error');
        }
    } catch (error) {
        showAlert('Error loading completed donations', 'error');
    }
}

function displayDonationsInTab(donations, contentId, title) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>${title} (${donations.length})</h3>
        <div class="donation-list">
            <table class="donation-table">
                <thead>
                    <tr>
                        <th>Donor</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${donations.map(donation => `
                        <tr>
                            <td>${donation.donorName}</td>
                            <td>${donation.bloodType}</td>
                            <td>${donation.units}</td>
                            <td>${new Date(donation.date).toLocaleDateString()}</td>
                            <td><span class="status-badge ${donation.status}">${donation.status}</span></td>
                            <td>
                                <button onclick="updateDonationStatus('${donation._id}', 'completed')" class="btn-approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="updateDonationStatus('${donation._id}', 'cancelled')" class="btn-reject">
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    contentArea.innerHTML = html;
}

// Enhanced Request Management Functions
async function showPendingRequests() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/requests', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            const pendingRequests = requests.filter(request => request.status === 'pending');
            displayRequestsInTab(pendingRequests, 'requestsContent', 'Pending Requests');
        } else {
            showAlert('Failed to load pending requests', 'error');
        }
    } catch (error) {
        showAlert('Error loading pending requests', 'error');
    }
}

async function showFulfilledRequests() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/requests', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            const fulfilledRequests = requests.filter(request => request.status === 'fulfilled');
            displayRequestsInTab(fulfilledRequests, 'requestsContent', 'Fulfilled Requests');
        } else {
            showAlert('Failed to load fulfilled requests', 'error');
        }
    } catch (error) {
        showAlert('Error loading fulfilled requests', 'error');
    }
}

function displayRequestsInTab(requests, contentId, title) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>${title} (${requests.length})</h3>
        <div class="request-list">
            <table class="request-table">
                <thead>
                    <tr>
                        <th>Recipient</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(request => `
                        <tr>
                            <td>${request.recipientName}</td>
                            <td>${request.bloodType}</td>
                            <td>${request.units}</td>
                            <td>${new Date(request.createdAt).toLocaleDateString()}</td>
                            <td><span class="status-badge ${request.status}">${request.status}</span></td>
                            <td>
                                <button onclick="updateRequestStatus('${request._id}', 'fulfilled')" class="btn-approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button onclick="updateRequestStatus('${request._id}', 'rejected')" class="btn-reject">
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    contentArea.innerHTML = html;
}

// Report Functions
async function showDonationReports() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/reports/donations?period=week', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const report = await response.json();
            displayReportInTab(report, 'reportsContent', 'Donation Report (This Week)');
        } else {
            showAlert('Failed to load donation report', 'error');
        }
    } catch (error) {
        showAlert('Error loading donation report', 'error');
    }
}

async function showRequestReports() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/reports/requests?period=week', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const report = await response.json();
            displayReportInTab(report, 'reportsContent', 'Request Report (This Week)');
        } else {
            showAlert('Failed to load request report', 'error');
        }
    } catch (error) {
        showAlert('Error loading request report', 'error');
    }
}

async function showInventoryReports() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/reports/inventory', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const report = await response.json();
            displayInventoryReportInTab(report, 'reportsContent');
        } else {
            showAlert('Failed to load inventory report', 'error');
        }
    } catch (error) {
        showAlert('Error loading inventory report', 'error');
    }
}

async function showActiveDonors() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/reports/active-donors?limit=10', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const report = await response.json();
            displayActiveDonorsInTab(report, 'reportsContent');
        } else {
            showAlert('Failed to load active donors report', 'error');
        }
    } catch (error) {
        showAlert('Error loading active donors report', 'error');
    }
}

function displayReportInTab(report, contentId, title) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>${title}</h3>
        <div class="report-summary">
            <div class="report-stats">
                <div class="stat-item">
                    <strong>Total:</strong> ${report.totalDonations || report.totalRequests}
                </div>
                <div class="stat-item">
                    <strong>Units:</strong> ${report.totalUnits}
                </div>
            </div>
            <div class="report-details">
                <h4>Details:</h4>
                <pre>${JSON.stringify(report, null, 2)}</pre>
            </div>
        </div>
    `;
    
    contentArea.innerHTML = html;
}

function displayInventoryReportInTab(report, contentId) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>Inventory Report</h3>
        <div class="report-summary">
            <div class="report-stats">
                <div class="stat-item">
                    <strong>Total Blood Types:</strong> ${report.totalBloodTypes}
                </div>
                <div class="stat-item">
                    <strong>Total Units:</strong> ${report.totalUnits}
                </div>
                <div class="stat-item">
                    <strong>Low Stock Items:</strong> ${report.lowStockItems.length}
                </div>
            </div>
            <div class="inventory-list">
                <h4>Inventory Status:</h4>
                <table class="inventory-table">
                    <thead>
                        <tr>
                            <th>Blood Type</th>
                            <th>Units</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.byBloodType.map(item => `
                            <tr>
                                <td>${item.bloodType}</td>
                                <td>${item.units}</td>
                                <td><span class="status-badge ${item.status}">${item.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    contentArea.innerHTML = html;
}

function displayActiveDonorsInTab(report, contentId) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>Top Active Donors</h3>
        <div class="active-donors-list">
            <table class="user-table">
                <thead>
                    <tr>
                        <th>Donor Name</th>
                        <th>Email</th>
                        <th>Blood Type</th>
                        <th>Total Donations</th>
                        <th>Total Units</th>
                        <th>Last Donation</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.topDonors.map(donor => `
                        <tr>
                            <td>${donor.donor.name}</td>
                            <td>${donor.donor.email}</td>
                            <td>${donor.donor.bloodType || 'N/A'}</td>
                            <td>${donor.totalDonations}</td>
                            <td>${donor.totalUnits}</td>
                            <td>${new Date(donor.lastDonation).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    contentArea.innerHTML = html;
}

// Notification Functions
async function showNotifications() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const notifications = await response.json();
            displayNotificationsInTab(notifications, 'notificationsContent');
        } else {
            showAlert('Failed to load notifications', 'error');
        }
    } catch (error) {
        showAlert('Error loading notifications', 'error');
    }
}

// Low Stock Alerts Function
async function showLowStockAlerts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/alerts/low-stock', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const alerts = await response.json();
            const contentArea = document.getElementById('inventoryContent');
            
            if (alerts.length === 0) {
                contentArea.innerHTML = '<h3>Low Stock Alerts</h3><p>No low stock alerts at this time.</p>';
            } else {
                const html = `
                    <h3>Low Stock Alerts (${alerts.length})</h3>
                    <div class="alert-list">
                        <table class="alert-table">
                            <thead>
                                <tr>
                                    <th>Blood Type</th>
                                    <th>Current Units</th>
                                    <th>Threshold</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alerts.map(alert => `
                                    <tr>
                                        <td>${alert.bloodType}</td>
                                        <td>${alert.currentUnits}</td>
                                        <td>${alert.threshold}</td>
                                        <td><span class="status-badge ${alert.urgency}">${alert.urgency}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                contentArea.innerHTML = html;
            }
        } else {
            showAlert('Failed to load low stock alerts', 'error');
        }
    } catch (error) {
        showAlert('Error loading low stock alerts', 'error');
    }
}

// Make functions globally accessible
window.updateRequestStatus = updateRequestStatus;
window.updateDonationStatus = updateDonationStatus;
window.updateInventory = updateInventory;
window.showTab = showTab;
window.showDonors = showDonors;
window.showRecipients = showRecipients;
window.showAdmins = showAdmins;
window.showPendingDonations = showPendingDonations;
window.showCompletedDonations = showCompletedDonations;
window.showPendingRequests = showPendingRequests;
window.showFulfilledRequests = showFulfilledRequests;
window.showDonationReports = showDonationReports;
window.showRequestReports = showRequestReports;
window.showInventoryReports = showInventoryReports;
window.showActiveDonors = showActiveDonors;
window.showNotifications = showNotifications;
window.showLowStockAlerts = showLowStockAlerts;
window.sendNotification = sendNotification;
window.updateInventoryManually = updateInventoryManually;
window.closeModal = closeModal;
window.logout = logout;

function displayNotificationsInTab(notifications, contentId) {
    const contentArea = document.getElementById(contentId);
    
    const html = `
        <h3>Notifications (${notifications.length})</h3>
        <div class="notifications-list">
            ${notifications.map(notification => `
                <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                    <div class="notification-content">
                        <p>${notification.message}</p>
                        <small>${new Date(notification.timestamp).toLocaleString()}</small>
                    </div>
                    <div class="notification-type">
                        <span class="badge ${notification.type}">${notification.type}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    contentArea.innerHTML = html;
}

async function sendNotification() {
    const message = prompt('Enter notification message:');
    if (!message) return;
    
    const bloodType = prompt('Enter blood type (optional):');
    const type = prompt('Enter notification type (low_stock, request_approved, etc.):');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type || 'general',
                message,
                bloodType,
                recipients: ['all']
            })
        });
        
        if (response.ok) {
            showAlert('Notification sent successfully', 'success');
        } else {
            showAlert('Failed to send notification', 'error');
        }
    } catch (error) {
        showAlert('Error sending notification', 'error');
    }
}

async function updateInventoryManually() {
    const bloodType = prompt('Enter blood type (A+, B+, O+, etc.):');
    if (!bloodType) return;
    
    const units = prompt('Enter new units:');
    if (!units || isNaN(units)) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/inventory/${bloodType}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ units: parseInt(units) })
        });
        
        if (response.ok) {
            showAlert('Inventory updated successfully', 'success');
            showInventory(); // Refresh the inventory view
        } else {
            showAlert('Failed to update inventory', 'error');
        }
    } catch (error) {
        showAlert('Error updating inventory', 'error');
    }
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
} 