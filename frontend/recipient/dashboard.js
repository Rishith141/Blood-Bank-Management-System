// Global variables
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));

// Check if user is logged in and is a recipient
if (!token || !user || user.role !== 'recipient') {
    window.location.href = '../login.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('recipientName').textContent = user.name;
    loadProfile();
    loadRequestHistory();
});

// Load recipient profile
async function loadProfile() {
    try {
        const response = await fetch('/api/recipient/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }
        
        const profile = await response.json();
        
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileBloodType').value = profile.bloodType || '';
        document.getElementById('profileLocation').value = profile.location || '';
    } catch (err) {
        console.error('Error loading profile:', err);
        showAlert('Error loading profile', 'error');
    }
}

// Update profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        bloodType: formData.get('bloodType'),
        location: formData.get('location')
    };
    
    try {
        const response = await fetch('/api/recipient/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Profile updated successfully!', 'success');
            loadProfile();
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'error');
        }
    } catch (err) {
        showAlert('Error updating profile', 'error');
    }
});

// Create blood request
document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        bloodType: formData.get('bloodType'),
        units: parseInt(formData.get('units')),
        location: formData.get('location'),
        urgency: formData.get('urgency'),
        reason: formData.get('reason')
    };
    
    try {
        const response = await fetch('/api/recipient/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Blood request submitted successfully!', 'success');
            e.target.reset();
            loadRequestHistory();
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'error');
        }
    } catch (err) {
        showAlert('Error submitting request', 'error');
    }
});

// Load request history
async function loadRequestHistory() {
    try {
        const response = await fetch('/api/recipient/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load requests');
        }
        
        const requests = await response.json();
        
        const historyDiv = document.getElementById('requestHistory');
        if (requests.length === 0) {
            historyDiv.innerHTML = '<p>No requests found.</p>';
        } else {
            historyDiv.innerHTML = requests.map(request => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-date">${new Date(request.createdAt).toLocaleDateString()}</span>
                        <span class="status-${request.status}">${request.status.toUpperCase()}</span>
                    </div>
                    <p><strong>Blood Type:</strong> ${request.bloodType}</p>
                    <p><strong>Units:</strong> ${request.units}</p>
                    <p><strong>Location:</strong> ${request.location}</p>
                    <p><strong>Urgency:</strong> ${request.urgency}</p>
                    ${request.reason ? `<p><strong>Reason:</strong> ${request.reason}</p>` : ''}
                    ${request.status === 'pending' ? `<button onclick="cancelRequest('${request._id}')" class="btn-cancel">Cancel Request</button>` : ''}
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading requests:', err);
        document.getElementById('requestHistory').innerHTML = '<p>Error loading request history</p>';
    }
}

// Cancel request
async function cancelRequest(requestId) {
    if (!confirm('Are you sure you want to cancel this request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/recipient/requests/${requestId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showAlert('Request cancelled successfully!', 'success');
            loadRequestHistory();
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'error');
        }
    } catch (err) {
        showAlert('Error cancelling request', 'error');
    }
}

// Search blood availability
window.searchBlood = async function() {
    const bloodType = document.getElementById('searchBloodType').value;
    console.log('Searching for blood type:', bloodType);
    
    try {
        const url = bloodType ? `/api/inventory/search?bloodType=${bloodType}` : '/api/inventory';
        console.log('Making request to:', url);
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to search blood availability');
        }
        
        const inventory = await response.json();
        console.log('Inventory data:', inventory);
        
        const availabilityDiv = document.getElementById('bloodAvailability');
        if (inventory.length === 0) {
            availabilityDiv.innerHTML = '<p>No blood available for the selected type.</p>';
        } else {
            availabilityDiv.innerHTML = inventory.map(item => `
                <div class="availability-item">
                    <h4>${item.bloodType}</h4>
                    <p><strong>Available Units:</strong> ${item.units}</p>
                    <p><strong>Last Updated:</strong> ${new Date(item.updatedAt).toLocaleDateString()}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error searching blood:', err);
        document.getElementById('bloodAvailability').innerHTML = '<p>Error searching blood availability</p>';
    }
};

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../login.html';
}

// Utility function to show alerts
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
} 