document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('user-profile-button').addEventListener('click', function() {
        window.location.href = 'account.html'; 
    });

    // Tab functionality for agent-details.html
    const tabButtons = document.querySelectorAll('.agent-tabs .tab-button');
    const tabPanes = document.querySelectorAll('.tab-content .tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to the clicked button
            this.classList.add('active');
            console.log(`Activating button: ${this.dataset.target}`); // Debugging line for button

            // Get the ID of the tab pane to show from data-target attribute
            const targetTabId = this.dataset.target;

            // Add active class to the corresponding tab pane
            const targetPane = document.getElementById(targetTabId);
            if (targetPane) {
                targetPane.classList.add('active');
                console.log(`Activating tab pane: ${targetTabId}`); // Debugging line for pane
            }
        });
    });

    // Set the first tab as active by default if no tab is active
    if (tabButtons.length > 0 && !document.querySelector('.agent-tabs .tab-button.active')) {
        tabButtons[0].click();
    }

    // Disclaimer Popup Logic
    const disclaimerPopup = document.getElementById('disclaimer-popup');
    const cancelDisclaimerButton = document.getElementById('cancel-disclaimer');
    const continueToAgentButton = document.getElementById('continue-to-agent');
    const agentCards = document.querySelectorAll('.ai-card');

    let currentAgentHref = '';

    agentCards.forEach(card => {
        card.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent immediate navigation
            currentAgentHref = this.href; // Store the href of the clicked card
            disclaimerPopup.classList.remove('hidden'); // Show the popup
            document.body.classList.add('no-scroll'); // Disable scrolling on body
        });
    });

    cancelDisclaimerButton.addEventListener('click', function() {
        disclaimerPopup.classList.add('hidden'); // Hide the popup
        document.body.classList.remove('no-scroll'); // Enable scrolling on body
        currentAgentHref = ''; // Clear the stored href
    });

    continueToAgentButton.addEventListener('click', function() {
        disclaimerPopup.classList.add('hidden'); // Hide the popup
        document.body.classList.remove('no-scroll'); // Enable scrolling on body
        if (currentAgentHref) {
            window.location.href = currentAgentHref; // Navigate to the stored href
        }
        currentAgentHref = ''; // Clear the stored href
    });
});