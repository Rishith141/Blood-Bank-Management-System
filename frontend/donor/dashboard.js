// Global variables
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));

// Check if user is logged in and is a donor
if (!token || !user || user.role !== 'donor') {
    window.location.href = '../login.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('donorName').textContent = user.name;
    loadProfile();
    checkEligibility();
    loadDonationHistory();
});

// Load donor profile
async function loadProfile() {
    try {
        const response = await fetch('http://localhost:5000/api/donor/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }
        
        const profile = await response.json();
        
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileBloodType').value = profile.bloodType || '';
        document.getElementById('profileLocation').value = profile.location || '';
        document.getElementById('profileDateOfBirth').value = profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '';
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
        location: formData.get('location'),
        dateOfBirth: formData.get('dateOfBirth')
    };
    
    console.log('Sending profile update data:', data); // Debug log
    
    try {
        const response = await fetch('http://localhost:5000/api/donor/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const updatedProfile = await response.json();
            console.log('Profile updated successfully:', updatedProfile); // Debug log
            showAlert('Profile updated successfully!', 'success');
            loadProfile();
            checkEligibility(); // Recheck eligibility after profile update
        } else {
            const error = await response.json();
            console.error('Profile update error:', error); // Debug log
            showAlert('Error: ' + error.error, 'error');
        }
    } catch (err) {
        console.error('Profile update catch error:', err); // Debug log
        showAlert('Error updating profile', 'error');
    }
});

// Check donation eligibility
async function checkEligibility() {
    try {
        const response = await fetch('http://localhost:5000/api/donor/eligibility', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to check eligibility');
        }
        
        const eligibility = await response.json();
        console.log('Eligibility data received:', eligibility); // Debug log
        
        const eligibilityDiv = document.getElementById('eligibility');
        if (eligibility.isEligible) {
            eligibilityDiv.innerHTML = `
                <div class="eligible">
                    <p><i class="fas fa-check-circle"></i> You are eligible to donate blood!</p>
                    <p><strong>Age:</strong> ${eligibility.currentAge ? eligibility.currentAge + ' years old' : 'Not provided'} ✅</p>
                    <p><strong>Last donation:</strong> ${eligibility.lastDonationDate ? new Date(eligibility.lastDonationDate).toLocaleDateString() : 'Never'}</p>
                </div>
            `;
        } else {
            let reasons = [];
            if (!eligibility.ageEligible) reasons.push(eligibility.ageReason);
            if (!eligibility.timeEligible) reasons.push(eligibility.timeReason);
            
            eligibilityDiv.innerHTML = `
                <div class="not-eligible">
                    <p><i class="fas fa-times-circle"></i> You are not eligible to donate yet.</p>
                    <p><strong>Age:</strong> ${eligibility.currentAge ? eligibility.currentAge + ' years old' : 'Not provided'} ${eligibility.ageEligible ? '✅' : '❌'}</p>
                    <p><strong>Last donation:</strong> ${eligibility.lastDonationDate ? new Date(eligibility.lastDonationDate).toLocaleDateString() : 'Never'}</p>
                    <p><strong>Reasons:</strong></p>
                    <ul>
                        ${reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                    ${eligibility.nextEligibleDate ? `<p><strong>Next eligible date:</strong> ${new Date(eligibility.nextEligibleDate).toLocaleDateString()}</p>` : ''}
                </div>
            `;
        }
    } catch (err) {
        console.error('Error checking eligibility:', err);
        document.getElementById('eligibility').innerHTML = '<p>Error checking eligibility</p>';
    }
}

// Schedule donation
document.getElementById('donationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        date: formData.get('date'),
        location: formData.get('location')
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/donor/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Donation scheduled successfully!', 'success');
            e.target.reset();
            loadDonationHistory();
            checkEligibility();
        } else {
            const error = await response.json();
            showAlert('Error: ' + error.error, 'error');
        }
    } catch (err) {
        showAlert('Error scheduling donation', 'error');
    }
});

// Load donation history
async function loadDonationHistory() {
    try {
        const response = await fetch('http://localhost:5000/api/donor/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load history');
        }
        
        const donations = await response.json();
        
        const historyDiv = document.getElementById('donationHistory');
        if (donations.length === 0) {
            historyDiv.innerHTML = '<p>No donation history found.</p>';
        } else {
            historyDiv.innerHTML = donations.map(donation => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-date">${new Date(donation.date).toLocaleDateString()}</span>
                        <span class="status-${donation.status}">${donation.status.toUpperCase()}</span>
                    </div>
                    <p><strong>Location:</strong> ${donation.location}</p>
                    <p><strong>Blood Type:</strong> ${donation.bloodType}</p>
                    <p><strong>Units:</strong> ${donation.units}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading history:', err);
        document.getElementById('donationHistory').innerHTML = '<p>Error loading donation history</p>';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../login.html';
}

// Utility function to show alerts
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
} 