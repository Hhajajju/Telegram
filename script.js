// Global variables for the balance and reward process
let userBalance = 0.000; // User's initial balance
let referralEarnings = 0.000; // Referral earnings
let claimAmounts = 0.005; // Reward for each claim

// Show the section when clicked
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}

// Show the loading screen and navigate to the home section after loading
window.onload = function () {
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none"; // Hide loading screen
        showSection('home-section'); // Show home section
    }, 2000); // Simulate loading for 2 seconds
};

// Function to update the balance displayed in the UI
function updateBalance() {
    document.getElementById("balance").textContent = userBalance.toFixed(3);
}

// Function to handle the ad-watching process for each button
function watchAds(adIndex) {
    const adButton = document.querySelectorAll('.claim-btn')[adIndex];
    const timerElement = document.getElementById(`timer-${adIndex}`);
    
    // Ensure the ad button starts independently for each ad
    if (adButton.dataset.claimInProgress === 'true') return; // Prevent starting if claim is in progress

    // Remove the alert for watching the ad
    // alert(`You are watching ad ${adIndex + 1}.`);

    // Change button to show "Claim" after watching the ad
    adButton.textContent = "Claim";
    adButton.style.backgroundColor = "green"; // Change button color to green

    // Set the short cooldown timer before the claim button is active
    startClaimTimer(adIndex);

    // Mark this ad as "claim in progress"
    adButton.dataset.claimInProgress = 'true';

    // Start the ad-watching timer and allow claim
    adButton.onclick = function () {
        claimReward(adIndex);
    };
}

// Function to handle the claiming process
function claimReward(adIndex) {
    const adButton = document.querySelectorAll('.claim-btn')[adIndex];
    const timerElement = document.getElementById(`timer-${adIndex}`);

    if (adButton.dataset.claimInProgress !== 'true') return; // Prevent claiming if not in progress

    // Add reward to user's balance
    userBalance += claimAmounts;
    updateBalance();

    // Change button text to "Claimed" and set color to orange
    adButton.textContent = "Claimed";
    adButton.style.backgroundColor = "orange";

    // Disable the claim button
    adButton.disabled = true;

    // Start the 2-hour cooldown timer for this specific ad button
    startCooldownTimer(adIndex);
}

// Function to start the 2-hour cooldown timer after claiming
function startCooldownTimer(adIndex) {
    const adButton = document.querySelectorAll('.claim-btn')[adIndex];
    const timerElement = document.getElementById(`timer-${adIndex}`);
    let remainingTime = 2 * 60 * 60; // 2 hours in seconds

    function updateTimer() {
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        timerElement.textContent = `Next claim in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(adButton.timer); // Stop the timer
            adButton.textContent = "Start"; // Reset button text to "Start"
            adButton.style.backgroundColor = "gold"; // Reset color to gold
            adButton.disabled = false; // Enable the button again

            // Mark claim as finished and reset the claim state
            adButton.dataset.claimInProgress = 'false';
            timerElement.textContent = "Next claim in: 00:00:00";
        }
    }

    adButton.timer = setInterval(updateTimer, 1000); // Store the timer reference for this button
}

// Function to start the short cooldown timer before claiming
function startClaimTimer(adIndex) {
    const timerElement = document.getElementById(`timer-${adIndex}`);
    let remainingTime = 5; // A quick cooldown before the claim button is active again, can be adjusted

    function updateClaimTimer() {
        const seconds = remainingTime;
        timerElement.textContent = `Next claim in: 00:00:0${seconds}`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(timerElement.timer); // Stop the timer
            timerElement.textContent = "Ready to claim!";
        }
    }

    timerElement.timer = setInterval(updateClaimTimer, 1000); // Store the timer reference for this button
}

// Add event listeners for "Start" button clicks in all ad containers
document.querySelectorAll('.claim-btn').forEach((button, index) => {
    button.dataset.claimInProgress = 'false'; // Initialize the claim progress state
    button.onclick = function () {
        if (button.dataset.claimInProgress === 'false') {
            watchAds(index); // Start the ad-watching process when clicked
        }
    };
});

// Add event listeners for daily claim, withdrawal, etc.
document.getElementById('claim-daily-reward').addEventListener('click', claimDailyReward);

// Handle withdrawal form submission
document.getElementById('withdraw-form').addEventListener('submit', handleWithdrawal);

// Daily claim reward functionality
let dailyClaimTimer = null; // Timer for daily claim button
let dailyClaimTimeRemaining = 0; // Remaining time for daily claim

function updateDailyClaimTimer() {
    const timerElement = document.getElementById('timer-daily-reward');
    
    if (dailyClaimTimeRemaining > 0) {
        dailyClaimTimeRemaining--;
        const hours = Math.floor(dailyClaimTimeRemaining / 3600);
        const minutes = Math.floor((dailyClaimTimeRemaining % 3600) / 60);
        const seconds = dailyClaimTimeRemaining % 60;
        timerElement.innerText = `Next claim in: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        timerElement.innerText = "You can claim now!";
    }
}

function claimDailyReward() {
    if (dailyClaimTimeRemaining > 0) return; // Prevent claim if timer is not done
    
    userBalance += 0.003; // Add reward
    document.getElementById('balance').innerText = userBalance.toFixed(3); // Update balance
    dailyClaimTimeRemaining = 86400; // 24 hours in seconds
    dailyClaimTimer = setInterval(updateDailyClaimTimer, 1000); // Start daily claim countdown
    document.getElementById('claim-daily-reward').innerText = 'Claimed'; // Change button text
    document.getElementById('claim-daily-reward').disabled = true; // Disable button after claim
}

// Referral commission claim functionality
function claimReferralCommission() {
    if (referralEarnings > 0) {
        userBalance += referralEarnings; // Add referral earnings to the user balance
        updateBalance(); // Update balance display
        referralEarnings = 0; // Reset referral earnings
        alert('Referral commission claimed successfully!');
    } else {
        alert('No referral commission available.');
    }
}

// Generate referral link
function generateReferralLink() {
    let referralLink = "https://t.me/yourbot?start=" + generateRandomReferralCode();
    document.getElementById('referral-link').innerText = referralLink;
    return referralLink;
}

// Generate a random referral code
function generateRandomReferralCode() {
    return Math.random().toString(36).substring(2, 10); // Random 8 character code
}

// Copy referral link to clipboard
function copyReferralLink() {
    let referralLink = document.getElementById('referral-link').innerText;
    navigator.clipboard.writeText(referralLink).then(() => {
        alert('Referral link copied to clipboard!');
    });
}

// Handle referral list display
function updateReferralList(referrals) {
    const referralList = document.getElementById('referral-list');
    if (referrals.length > 0) {
        referralList.innerHTML = referrals.join('<br>');
    } else {
        referralList.innerHTML = 'No referrals yet.';
    }
}

// Claim referral earnings
function claimReferralEarnings() {
    userBalance += referralEarnings;
    document.getElementById('balance').innerText = userBalance.toFixed(3);
    document.getElementById('referral-earnings').innerText = '$0.00'; // Reset referral earnings
    alert('Referral earnings claimed successfully!');
}

// Handle withdrawal process
function handleWithdrawal(event) {
    event.preventDefault();

    const withdrawalAmount = parseFloat(document.getElementById('withdraw-amount').value);
    const withdrawalAddress = document.getElementById('withdraw-address').value;

    if (isNaN(withdrawalAmount) || withdrawalAmount < 3) {
        alert("Minimum withdrawal is $3.");
        return;
    }

    if (withdrawalAddress === "") {
        alert("Please enter a valid address.");
        return;
    }

    if (withdrawalAmount > userBalance) {
        alert("Insufficient balance.");
        return;
    }

    // Deduct withdrawal amount from balance
    userBalance -= withdrawalAmount;
    document.getElementById('balance').innerText = userBalance.toFixed(3); // Update balance

    // Update withdrawal status
    document.getElementById('withdraw-status').innerText = `Withdrawal of $${withdrawalAmount} to ${withdrawalAddress} is pending.`;
}

// Add event listener for Referral Commission Button
document.getElementById('claim-referral-commission').addEventListener('click', claimReferralCommission);
