// Account Page JavaScript - Lightweight version
document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Functionality
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to switch tabs
    function switchTab(tabName) {
        navItems.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
        const activeTabContent = document.getElementById(`${tabName}-tab`);

        if (activeNavItem && activeTabContent) {
            activeNavItem.classList.add('active');
            activeTabContent.classList.add('active');
        }
    }

    // Add click event listeners to nav items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Profile Form Handling
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        // Store original values for cancel functionality
        const originalValues = {};
        const inputs = profileForm.querySelectorAll('input');
        
        inputs.forEach(input => {
            originalValues[input.id] = input.value;
        });

        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const username = document.getElementById('username').value;
            if (!username.trim()) {
                alert('Пожалуйста, заполните никнейм');
                return;
            }

            // Simulate form submission
            console.log('Profile data saved');
            alert('Профиль успешно сохранен!');
        });

        // Cancel button functionality
        const cancelBtn = document.getElementById('cancelProfile');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                inputs.forEach(input => {
                    input.value = originalValues[input.id];
                });
            });
        }
    }

    // Password Form Handling
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Basic validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('Пароли не совпадают!');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }
            
            // Simulate password change
            console.log('Password changed');
            alert('Пароль успешно изменен!');
            passwordForm.reset();
        });
    }

    // New Project Button
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            alert('Функция создания нового проекта будет доступна в следующем обновлении!');
        });
    }

    // Export Data
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert('Экспорт данных будет доступен в следующем обновлении!');
        });
    }

    // Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccount');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            const confirmed = confirm('Вы уверены, что хотите удалить аккаунт? Это действие невозможно отменить.');
            if (confirmed) {
                alert('Функция удаления аккаунта будет доступна в следующем обновлении.');
            }
        });
    }

    // Toggle switches functionality
    const toggleSwitches = document.querySelectorAll('.toggle input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log(`Toggle ${this.id} changed to: ${this.checked}`);
        });
    });

    console.log('Account page initialized - lightweight version');
});