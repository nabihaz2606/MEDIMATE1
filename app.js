
const i18nData = {
    en: {
        welcomeTitle: "MediMate – Smart Medicine Reminder",
        welcomeSubtitle: "AI-Powered Multilingual Voice & Scanner Platform for Safe Medicine Management",
        getStarted: "GET STARTED",
        login: "LOG IN TO ACCOUNT",
        takeNow: "TAKE MEDICINE NOW",
        speakToAssist: "TAP TO SPEAK TO MEDIMATE",
        confirmTaken: "YES, I TOOK MY MEDICINE",
        snooze10: "SNOOZE (REMIND IN 10 MINS)",
        skipDose: "SKIP THIS DOSE"
    },
    te: {
        welcomeTitle: "మేడిమేట్ – స్మార్ట్ మందుల రిమైండర్",
        welcomeSubtitle: "సురక్షితమైన మందుల నిర్వహణ కోసం వాయిస్ మరియు స్కానర్ ప్లాట్‌ఫారమ్",
        getStarted: "ప్రారంభించండి",
        login: "లాగిన్ అవ్వండి",
        takeNow: "ఇప్పుడే మందు తీసుకోండి",
        speakToAssist: "మేడిమేట్‌తో మాట్లాడటానికి నొక్కండి",
        confirmTaken: "అవును, నేను మందులు తీసుకున్నాను",
        snooze10: "10 నిమిషాలు స్నూజ్ చేయండి",
        skipDose: "ఈ డోస్‌ను స్కిప్ చేయండి"
    },
    hi: {
        welcomeTitle: "मेडीमेट – स्मार्ट दवा रिमाइंडर",
        welcomeSubtitle: "सुरक्षित दवा प्रबंधन के लिए वॉइस और स्कैनर प्लेटफॉर्म",
        getStarted: "शुरू करें",
        login: "लॉग इन करें",
        takeNow: "अभी दवा लें",
        speakToAssist: "मेडीमेट से बात करने के लिए टैप करें",
        confirmTaken: "हाँ, मैंने अपनी दवा ले ली है",
        snooze10: "10 मिनट के लिए स्नूज़ करें",
        skipDose: "यह खुराक छोड़ें"
    },
    ta: {
        welcomeTitle: "மெடிமேட் – ஸ்மார்ட் மருந்து நினைவூட்டல்",
        welcomeSubtitle: "பாதுகாப்பான மருந்து நிர்வாகத்திற்கான குரல் மற்றும் ஸ்கேனர் தளம்",
        getStarted: "தொடங்குங்கள்",
        login: "உள்நுழையவும்",
        takeNow: "இப்போது மருந்து சாப்பிடுங்கள்",
        speakToAssist: "மெடிமேட்டிடம் பேச தட்டவும்",
        confirmTaken: "ஆம், நான் மருந்து சாப்பிட்டேன்",
        snooze10: "10 நிமிடங்கள் ஸ்னூஸ் செய்",
        skipDose: "இந்த டோஸைத் தவிர்க்கவும்"
    }
};

class MediMateApp {
    constructor() {
        this.currentLanguage = 'en';
        this.currentRole = 'elderly';
        this.synth = window.speechSynthesis;
        this.isListening = false;
        
        this.initDatabase();
        this.initSpeechRecognition();
        this.renderSchedule();
        this.renderHistory();
    }

    initDatabase() {
        if (!localStorage.getItem('medimate_reminders')) {
            const defaultReminders = [
                { id: '1', name: 'BP Tablet (Amlodipine 5mg)', dosage: '1 Pill', time: '20:00', freq: 'Daily', status: 'Pending' },
                { id: '2', name: 'Diabetes Medicine (Metformin)', dosage: '1 Tablet', time: '13:00', freq: 'Daily', status: 'Taken' },
                { id: '3', name: 'Multivitamin Supplement', dosage: '1 Capsule', time: '08:00', freq: 'Daily', status: 'Taken' }
            ];
            localStorage.setItem('medimate_reminders', JSON.stringify(defaultReminders));
        }

        if (!localStorage.getItem('medimate_history')) {
            const defaultHistory = [
                { date: 'Today, 8:00 AM', name: 'Multivitamin Supplement', status: 'Taken' },
                { date: 'Today, 1:00 PM', name: 'Diabetes Medicine (Metformin)', status: 'Taken' },
                { date: 'Yesterday, 8:00 PM', name: 'BP Tablet (Amlodipine 5mg)', status: 'Skipped' }
            ];
            localStorage.setItem('medimate_history', JSON.stringify(defaultHistory));
        }
    }

    getReminders() { return JSON.parse(localStorage.getItem('medimate_reminders')) || []; }
    saveReminders(list) { localStorage.setItem('medimate_reminders', JSON.stringify(list)); }
    getHistory() { return JSON.parse(localStorage.getItem('medimate_history')) || []; }
    saveHistory(list) { localStorage.setItem('medimate_history', JSON.stringify(list)); }

    navigateTo(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        }
    }

    backToDashboard() {
        if (this.currentRole === 'caregiver') {
            this.navigateTo('caregiver-dashboard');
        } else {
            this.navigateTo('elderly-dashboard');
        }
    }

    selectRole(role) {
        this.currentRole = role;
        if (role === 'caregiver') {
            this.speakText("Caregiver Mode activated.");
            this.renderCaregiverView();
            this.navigateTo('caregiver-dashboard');
        } else {
            this.speakText("Senior Mode activated.");
            this.navigateTo('elderly-dashboard');
        }
    }

    login() {
        const val = document.getElementById('login-input').value;
        this.speakText("Sign in successful.");
        this.navigateTo('role-screen');
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        document.getElementById('current-lang-badge').innerText = lang.toUpperCase();
        
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            if (i18nData[lang] && i18nData[lang][key]) {
                elem.innerText = i18nData[lang][key];
            }
        });

        const langGreetings = {
            en: "Language set to English.",
            te: "భాష తెలుగులోకి మార్చబడింది.",
            hi: "भाषा हिंदी में सेट की गई है।",
            ta: "மொழி தமிழில் மாற்றப்பட்டது."
        };
        this.speakText(langGreetings[lang] || "Language updated.");
    }

    speakText(text) {
        if (!this.synth) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = { en: 'en-US', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN' };
        utterance.lang = langMap[this.currentLanguage] || 'en-US';
        utterance.rate = parseFloat(localStorage.getItem('medimate_voice_speed') || '1.0');
        this.synth.speak(utterance);
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const speechResult = event.results.transcript;
                document.getElementById('voice-transcript').innerText = `"${speechResult}"`;
                this.processVoiceCommand(speechResult);
            };

            this.recognition.onerror = () => {
                document.getElementById('voice-status').innerText = "Could not hear clearly. Please tap to try again.";
            };
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.speakText("Voice recognition is simulated in this browser.");
            document.getElementById('voice-transcript').innerText = '"What medicine should I take now?"';
            document.getElementById('voice-response').innerText = 'You have 1 medicine scheduled: BP Tablet at 8:00 PM.';
            this.speakText("You have 1 medicine scheduled: BP Tablet at 8:00 PM.");
            return;
        }

        try {
            this.recognition.start();
            document.getElementById('voice-status').innerText = "Listening now... Speak into microphone.";
        } catch(e) {
            this.recognition.stop();
            document.getElementById('voice-status').innerText = "Listening stopped.";
        }
    }

    processVoiceCommand(cmd) {
        const lower = cmd.toLowerCase();
        let response = "I understood your command.";
        
        if (lower.includes("medicine") || lower.includes("take") || lower.includes("now")) {
            response = "You have 1 dose due: BP Tablet at 8:00 PM.";
        } else if (lower.includes("history")) {
            response = "You have taken 2 medicines today.";
            this.navigateTo('history-screen');
        } else if (lower.includes("help") || lower.includes("sos")) {
            response = "Sending emergency alert to caregiver.";
            this.navigateTo('sos-screen');
        }

        document.getElementById('voice-response').innerText = `"${response}"`;
        this.speakText(response);
    }

    repeatVoiceResponse() {
        const text = document.getElementById('voice-response').innerText;
        this.speakText(text);
    }

    startVoiceLogin() {
        this.speakText("Please speak your phone number or PIN.");
        setTimeout(() => {
            document.getElementById('login-input').value = "9876543210";
            this.login();
        }, 2000);
    }

    triggerReminderPopup() {
        this.navigateTo('reminder-popup');
        this.speakText("It's time to take your BP medicine. Please take 1 tablet with water now.");
    }

    recordIntake(action) {
        const history = this.getHistory();
        history.unshift({
            date: 'Just Now',
            name: 'BP Tablet (Amlodipine 5mg)',
            status: action
        });
        this.saveHistory(history);
        this.renderHistory();

        if (action === 'Taken') {
            this.speakText("Great job! Your medicine intake has been recorded.");
        } else if (action === 'Snoozed') {
            this.speakText("Reminder snoozed for 10 minutes.");
        } else if (action === 'Skipped') {
            this.speakText("Dose recorded as skipped.");
        }

        this.navigateTo('elderly-dashboard');
    }

    saveNewMedicine() {
        const name = document.getElementById('add-med-name').value || 'Amlodipine BP Tablet';
        const dosage = document.getElementById('add-med-dosage').value || '1 Pill';
        const time = document.getElementById('add-med-time').value || '20:00';
        const freq = document.getElementById('add-med-freq').value || 'Daily';

        const list = this.getReminders();
        list.push({ id: Date.now().toString(), name, dosage, time, freq, status: 'Pending' });
        this.saveReminders(list);

        this.renderSchedule();
        this.speakText(`New medicine ${name} added successfully.`);
        this.backToDashboard();
    }

    simulateScan() {
        document.getElementById('ocr-text-output').innerText = "Scanned: Amlodipine 5mg BP Tablet. Match Confirmed!";
        this.speakText("Scanned label detected Amlodipine 5 milligram BP Tablet.");
    }

    readScanTextAloud() {
        const text = document.getElementById('ocr-text-output').innerText;
        this.speakText(text);
    }

    applyScannedMedicine() {
        document.getElementById('add-med-name').value = "Amlodipine 5mg BP Tablet";
        this.navigateTo('add-medicine-screen');
    }

    dictateToInput(inputId) {
        this.speakText("Dictate medicine name.");
        setTimeout(() => {
            document.getElementById(inputId).value = "Amlodipine 5mg";
        }, 1500);
    }

    adjustStepper(inputId, delta) {
        const input = document.getElementById(inputId);
        let val = parseInt(input.value) || 1;
        val = Math.max(1, val + delta);
        input.value = `${val} Pill${val > 1 ? 's' : ''}`;
    }

    renderSchedule() {
        const list = this.getReminders();
        const container = document.getElementById('elderly-schedule-list');
        if (!container) return;

        container.innerHTML = list.map(item => `
            <div class="med-card-item">
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>⏰ ${item.time} • ${item.dosage}</p>
                </div>
                <span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span>
            </div>
        `).join('');
    }

    renderHistory() {
        const list = this.getHistory();
        const container = document.getElementById('history-list');
        if (!container) return;

        container.innerHTML = list.map(item => `
            <div class="history-card-item">
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>📅 ${item.date}</p>
                </div>
                <span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span>
            </div>
        `).join('');
    }

    filterHistory(filter, btn) {
        document.querySelectorAll('.filter-bar .btn-filter').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');

        const list = this.getHistory();
        const filtered = filter === 'all' ? list : list.filter(i => i.status === filter);
        
        const container = document.getElementById('history-list');
        container.innerHTML = filtered.map(item => `
            <div class="history-card-item">
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>📅 ${item.date}</p>
                </div>
                <span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span>
            </div>
        `).join('');
    }

    readHistorySummary() {
        const list = this.getHistory();
        const taken = list.filter(i => i.status === 'Taken').length;
        this.speakText(`You have taken ${taken} out of ${list.length} recorded medicine doses. Excellent job!`);
    }

    renderCaregiverView() {
        const list = this.getReminders();
        const container = document.getElementById('caregiver-med-stack');
        if (!container) return;

        container.innerHTML = list.map(item => `
            <div class="med-card-item">
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>⏰ ${item.time} • ${item.dosage} (${item.freq})</p>
                </div>
                <button class="btn btn-danger" style="min-height:40px; padding:6px 12px;" onclick="app.deleteMedicine('${item.id}')">Delete</button>
            </div>
        `).join('');
    }

    deleteMedicine(id) {
        let list = this.getReminders();
        list = list.filter(i => i.id !== id);
        this.saveReminders(list);
        this.renderSchedule();
        this.renderCaregiverView();
        this.speakText("Medicine removed.");
    }

    sendRemoteNudge() {
        this.speakText("Remote voice reminder nudge sent to senior user's interface.");
        alert("Voice nudge alert transmitted to senior user.");
    }

    callPatient() {
        window.location.href = "tel:+919876543210";
    }

    markMissedAsTaken() {
        this.recordIntake('Taken');
        alert("Marked overdue medicine as taken.");
        this.backToDashboard();
    }

    triggerSOSAlert() {
        document.getElementById('sos-status').innerText = "🚨 EMERGENCY ALERT SENT TO CAREGIVER!";
        this.speakText("Emergency alert sent to your caregiver. Stay calm, help is on the way!");
    }

    cancelSOS() {
        document.getElementById('sos-status').innerText = "System Ready";
        this.backToDashboard();
    }

    setFontSize(size) {
        document.body.className = `high-contrast-theme font-${size}`;
        this.speakText(`Font size set to ${size}.`);
    }

    toggleTheme() {
        document.body.classList.toggle('high-contrast-theme');
        this.speakText("Theme contrast toggled.");
    }

    setVoiceSpeed(speed) {
        localStorage.setItem('medimate_voice_speed', speed);
        this.speakText("Voice speed updated.");
    }

    saveSettings() {
        this.speakText("Accessibility preferences saved.");
        this.backToDashboard();
    }
}

let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new MediMateApp();
});