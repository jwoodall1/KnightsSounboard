class SoundboardApp {
    constructor() {
        this.sections = {
            section1: {
                buttons: [],
                maxButtons: 4
            },
            section2: {
                buttons: [],
                maxButtons: 4
            },
            section3: {
                buttons: [],
                maxButtons: 50
            },
            section4: {
                buttons: [],
                maxButtons: 60
            }
        };
        
        this.currentSection = null;
        this.audioContext = null;
        this.playingSounds = new Map();
        this.teamLogo = null;
        this.currentlyPlayingButtonId = null;
        this.teamColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#4CAF50'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createInitialButtons();
        this.updateButtonCounts();
        this.renderButtons();
        this.updateFloatingControlButton();
        this.initializeAudioContext();
    }

    setupEventListeners() {
        // Save/Load controls
        document.getElementById('saveBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadProject());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAll());

        // File inputs
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('projectInput').addEventListener('change', (e) => this.handleProjectUpload(e));
        
        // Floating control button
        document.getElementById('floatingControlButton').addEventListener('click', () => this.toggleCurrentSound());
    }

    createInitialButtons(force = false) {
        // Only create buttons if they don't exist (to preserve loaded data)
        if (this.sections.section1.buttons.length === 0) {
            // Create 4 Down buttons
            for (let i = 0; i < 4; i++) {
                const buttonId = `btn_section1_${i}`;
                const newButton = {
                    id: buttonId,
                    label: `Down ${i + 1}`,
                    soundFile: null,
                    soundData: null,
                    color: 'linear-gradient(135deg, var(--primary-color) 0%, var(--button-secondary) 100%)',
                    isPlaying: false,
                    isPaused: false
                };
                this.sections.section1.buttons.push(newButton);
            }
        }

        if (this.sections.section2.buttons.length === 0) {
            // Create 4 Team buttons
            for (let i = 0; i < 4; i++) {
                const buttonId = `btn_section2_${i}`;
                const newButton = {
                    id: buttonId,
                    label: `Team ${i + 1}`,
                    soundFile: null,
                    soundData: null,
                    color: 'linear-gradient(135deg, var(--primary-color) 0%, var(--button-secondary) 100%)',
                    isPlaying: false,
                    isPaused: false
                };
                this.sections.section2.buttons.push(newButton);
            }
        }

        if (this.sections.section3.buttons.length === 0) {
            // Create 50 Miscellaneous buttons
            for (let i = 0; i < 50; i++) {
                const buttonId = `btn_section3_${i}`;
                const newButton = {
                    id: buttonId,
                    label: `Misc ${i + 1}`,
                    soundFile: null,
                    soundData: null,
                    color: 'linear-gradient(135deg, var(--primary-color) 0%, var(--button-secondary) 100%)',
                    isPlaying: false,
                    isPaused: false
                };
                this.sections.section3.buttons.push(newButton);
            }
        }

        if (this.sections.section4.buttons.length === 0) {
            // Create 60 Player buttons (0-59)
            for (let i = 0; i < 60; i++) {
                const buttonId = `btn_section4_${i}`;
                const newButton = {
                    id: buttonId,
                    label: `Player ${i}`,
                    soundFile: null,
                    soundData: null,
                    color: 'linear-gradient(135deg, var(--primary-color) 0%, var(--button-secondary) 100%)',
                    isPlaying: false,
                    isPaused: false
                };
                this.sections.section4.buttons.push(newButton);
            }
        }
    }

    resetAll() {
        const confirmed = confirm('Are you sure you want to reset everything? This will delete all uploaded sounds. This action cannot be undone.');
        
        if (confirmed) {
            // Stop all playing sounds
            this.playingSounds.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            this.playingSounds.clear();
            this.currentlyPlayingButtonId = null;
            this.updateFloatingControlButton();
            
            // Reset sections to empty arrays
            this.sections.section1.buttons = [];
            this.sections.section2.buttons = [];
            this.sections.section3.buttons = [];
            this.sections.section4.buttons = [];
            
            // Recreate initial buttons
            this.createInitialButtons();
            this.updateButtonCounts();
            this.renderButtons();
            
            this.showMessage('All data has been reset!', 'success');
        }
    }

    getCleanInitialState() {
        return {
            sections: {
                section1: {
                    buttons: [],
                    maxButtons: 4
                },
                section2: {
                    buttons: [],
                    maxButtons: 4
                },
                section3: {
                    buttons: [],
                    maxButtons: 50
                },
                section4: {
                    buttons: [],
                    maxButtons: 60
                }
            },
            timestamp: new Date().toISOString(),
            version: '1.1'
        };
    }

    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio context initialization failed:', error);
            this.showMessage('Audio not supported in this browser', 'error');
        }
    }


    updateButtonCounts() {
        document.getElementById('count1').textContent = this.sections.section1.buttons.length;
        document.getElementById('count2').textContent = this.sections.section2.buttons.length;
        document.getElementById('count3').textContent = this.sections.section3.buttons.length;
        document.getElementById('count4').textContent = this.sections.section4.buttons.length;
    }

    renderButtons() {
        this.renderSectionButtons('section1');
        this.renderSectionButtons('section2');
        this.renderSectionButtons('section3');
        this.renderSectionButtons('section4');
    }

    renderSectionButtons(sectionId) {
        const sectionNumber = sectionId.replace('section', '');
        const grid = document.getElementById(`buttonGrid${sectionNumber}`);
        const section = this.sections[sectionId];
        
        grid.innerHTML = '';

        section.buttons.forEach(button => {
            const buttonElement = this.createButtonElement(button, sectionId);
            grid.appendChild(buttonElement);
        });
    }

    createButtonElement(button, sectionId) {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = button.soundData ? 'sound-button' : 'empty-button';
        buttonDiv.id = button.id;
        
        if (button.soundData) {
            buttonDiv.style.background = button.color;
            
            // Determine the icon based on state
            let icon = '';
            if (button.isPlaying) {
                icon = '⏸️';
            } else if (button.isPaused) {
                icon = '▶️';
            }
            
            buttonDiv.innerHTML = `
                <div class="button-icon">${icon}</div>
                <div class="button-label">${button.label}</div>
                <div class="upload-icon">✓</div>
                <div class="delete-button" title="Delete sound">🗑️</div>
            `;
            buttonDiv.addEventListener('click', (e) => {
                // Don't trigger play/pause if delete button was clicked
                if (e.target.classList.contains('delete-button')) {
                    e.stopPropagation();
                    this.deleteButton(button.id, sectionId);
                } else {
                    this.togglePlayPause(button.id);
                }
            });
        } else {
            buttonDiv.innerHTML = `
                <div class="upload-icon">📁</div>
                <div class="upload-text">Upload Sound</div>
            `;
            buttonDiv.addEventListener('click', () => this.uploadSound(button.id, sectionId));
        }


        return buttonDiv;
    }

    uploadSound(buttonId, sectionId) {
        this.currentSection = sectionId;
        this.currentButtonId = buttonId;
        document.getElementById('fileInput').click();
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('audio/')) {
            this.showMessage('Please select an audio file', 'error');
            return;
        }

        this.loadSoundFile(file);
        event.target.value = ''; // Reset file input
    }

    loadSoundFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const audioData = e.target.result;
            this.assignSoundToButton(this.currentButtonId, this.currentSection, file.name, audioData);
        };
        reader.readAsDataURL(file);
    }

    assignSoundToButton(buttonId, sectionId, fileName, audioData) {
        const section = this.sections[sectionId];
        const button = section.buttons.find(b => b.id === buttonId);
        
        if (button) {
            button.soundFile = fileName;
            button.soundData = audioData;
            button.label = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
            button.isPlaying = false;
            button.isPaused = false;
            
            this.renderButtons();
            this.showMessage(`Sound uploaded: ${fileName}`, 'success');
        }
    }

    togglePlayPause(buttonId) {
        const button = this.findButtonById(buttonId);
        if (!button || !button.soundData) return;

        // If this button is currently playing, pause it
        if (button.isPlaying) {
            this.pauseSound(buttonId);
            return;
        }

        // If this button is paused, resume it
        if (button.isPaused) {
            this.resumeSound(buttonId);
            return;
        }

        // If this button is not playing or paused, start it
        this.startSound(buttonId);
    }

    updateFloatingControlButton() {
        this.updateFloatingButtonIcon();
    }

    updateFloatingButtonIcon() {
        const icon = document.getElementById('floatingControlIcon');
        const button = document.getElementById('floatingControlButton');
        
        if (!this.currentlyPlayingButtonId) {
            icon.textContent = '⏸️';
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            return;
        }

        const currentButton = this.findButtonById(this.currentlyPlayingButtonId);
        if (currentButton) {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            
            if (currentButton.isPlaying) {
                icon.textContent = '⏸️'; // Pause icon when playing
            } else if (currentButton.isPaused) {
                icon.textContent = '▶️'; // Play icon when paused
            } else {
                icon.textContent = '⏸️'; // Default pause icon
            }
        }
    }

    toggleCurrentSound() {
        if (this.currentlyPlayingButtonId) {
            this.togglePlayPause(this.currentlyPlayingButtonId);
        } else {
            this.showMessage('No sound is currently playing', 'error');
        }
    }

    deleteButton(buttonId, sectionId) {
        const confirmed = confirm('Are you sure you want to delete this sound? This action cannot be undone.');
        
        if (confirmed) {
            // Stop the sound if it's currently playing
            if (this.currentlyPlayingButtonId === buttonId) {
                this.stopAllSounds();
            }
            
            // Find and reset the button
            const section = this.sections[sectionId];
            const buttonIndex = section.buttons.findIndex(btn => btn.id === buttonId);
            
            if (buttonIndex !== -1) {
                // Reset button to empty state
                section.buttons[buttonIndex] = {
                    id: buttonId,
                    label: section.buttons[buttonIndex].label, // Keep the original label
                    soundFile: null,
                    soundData: null,
                    color: 'linear-gradient(135deg, var(--primary-color) 0%, var(--button-secondary) 100%)',
                    isPlaying: false,
                    isPaused: false
                };
                
                // Re-render the section
                this.renderSectionButtons(sectionId);
                this.updateButtonCounts();
                
                this.showMessage('Sound deleted successfully', 'success');
            }
        }
    }

    startSound(buttonId) {
        const button = this.findButtonById(buttonId);
        if (!button || !button.soundData) return;

        // Stop any other currently playing sounds
        this.stopAllSounds();

        try {
            const audio = new Audio(button.soundData);
            audio.volume = 0.8;
            
            // Update button state
            button.isPlaying = true;
            button.isPaused = false;
            
            // Add visual feedback
            const buttonElement = document.getElementById(buttonId);
            buttonElement.classList.add('playing');
            
            audio.addEventListener('ended', () => {
                button.isPlaying = false;
                button.isPaused = false;
                buttonElement.classList.remove('playing');
                this.playingSounds.delete(buttonId);
                this.currentlyPlayingButtonId = null;
                this.renderButtons(); // Update the icon
                this.updateFloatingControlButton();
            });

            audio.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                button.isPlaying = false;
                button.isPaused = false;
                buttonElement.classList.remove('playing');
                this.currentlyPlayingButtonId = null;
                this.showMessage('Error playing sound', 'error');
                this.renderButtons(); // Update the icon
                this.updateFloatingControlButton();
            });

            this.playingSounds.set(buttonId, audio);
            this.currentlyPlayingButtonId = buttonId;
            audio.play();
            this.renderButtons(); // Update the icon
            this.updateFloatingControlButton();
            
        } catch (error) {
            console.error('Error playing sound:', error);
            this.showMessage('Error playing sound', 'error');
        }
    }

    pauseSound(buttonId) {
        const button = this.findButtonById(buttonId);
        const audio = this.playingSounds.get(buttonId);
        
        if (audio && button) {
            audio.pause();
            button.isPlaying = false;
            button.isPaused = true;
            
            const buttonElement = document.getElementById(buttonId);
            if (buttonElement) {
                buttonElement.classList.remove('playing');
            }
            
            this.renderButtons(); // Update the icon
            this.updateFloatingControlButton();
        }
    }

    resumeSound(buttonId) {
        const button = this.findButtonById(buttonId);
        const audio = this.playingSounds.get(buttonId);
        
        if (audio && button) {
            audio.play();
            button.isPlaying = true;
            button.isPaused = false;
            this.currentlyPlayingButtonId = buttonId;
            
            const buttonElement = document.getElementById(buttonId);
            if (buttonElement) {
                buttonElement.classList.add('playing');
            }
            
            this.renderButtons(); // Update the icon
            this.updateFloatingControlButton();
        }
    }

    stopAllSounds() {
        this.playingSounds.forEach((audio, buttonId) => {
            audio.pause();
            audio.currentTime = 0;
            
            const button = this.findButtonById(buttonId);
            if (button) {
                button.isPlaying = false;
                button.isPaused = false;
            }
            
            const buttonElement = document.getElementById(buttonId);
            if (buttonElement) {
                buttonElement.classList.remove('playing');
            }
        });
        this.playingSounds.clear();
        this.currentlyPlayingButtonId = null;
        this.renderButtons(); // Update all icons
        this.updateFloatingControlButton();
    }

    stopSound(buttonId) {
        const audio = this.playingSounds.get(buttonId);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.playingSounds.delete(buttonId);
        }
        
        const button = this.findButtonById(buttonId);
        if (button) {
            button.isPlaying = false;
            button.isPaused = false;
        }
        
        const buttonElement = document.getElementById(buttonId);
        if (buttonElement) {
            buttonElement.classList.remove('playing');
        }
        
        if (this.currentlyPlayingButtonId === buttonId) {
            this.currentlyPlayingButtonId = null;
            this.updateFloatingControlButton();
        }
        
        this.renderButtons(); // Update the icon
    }

    findButtonById(buttonId) {
        for (const section of Object.values(this.sections)) {
            const button = section.buttons.find(b => b.id === buttonId);
            if (button) return button;
        }
        return null;
    }


    saveProject() {
        try {
            const dataToSave = {
                sections: this.sections,
                timestamp: new Date().toISOString(),
                version: '1.1'
            };
            
            const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `knights-soundboard-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Project saved successfully!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showMessage('Error saving project', 'error');
        }
    }


    loadProject() {
        document.getElementById('projectInput').click();
    }

    handleProjectUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.sections) {
                    this.sections = data.sections;
                    this.updateButtonCounts();
                    this.renderButtons();
                    this.updateFloatingControlButton();
                    this.showMessage('Project loaded successfully!', 'success');
                } else {
                    this.showMessage('Invalid project file', 'error');
                }
            } catch (error) {
                console.error('File load error:', error);
                this.showMessage('Error loading project file', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    applySavedTheme() {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', this.teamColors.primary);
        root.style.setProperty('--secondary-color', this.teamColors.secondary);
        root.style.setProperty('--accent-color', this.teamColors.accent);
        
        document.body.style.background = `linear-gradient(135deg, ${this.teamColors.primary} 0%, ${this.teamColors.secondary} 100%)`;
    }


    uploadLogo() {
        document.getElementById('logoInput').click();
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.setTeamLogo(e.target.result);
            this.extractColorsFromImage(e.target.result);
        };
        reader.readAsDataURL(file);
        
        event.target.value = ''; // Reset file input
    }

    setTeamLogo(logoData) {
        this.teamLogo = logoData;
        const logoImg = document.getElementById('teamLogo');
        const logoPlaceholder = document.getElementById('logoPlaceholder');
        
        logoImg.src = logoData;
        logoImg.style.display = 'block';
        logoPlaceholder.style.display = 'none';
        
        this.showMessage('Team logo uploaded successfully!', 'success');
    }

    extractColorsFromImage(imageData) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize image for faster processing
                const maxSize = 100;
                const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = this.extractDominantColors(imageData);
                
                this.updateThemeColors(colors);
            } catch (error) {
                console.error('Color extraction error:', error);
                this.showMessage('Could not extract colors from logo', 'error');
            }
        };
        
        img.src = imageData;
    }

    extractDominantColors(imageData) {
        const data = imageData.data;
        const colorCounts = new Map();
        
        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent or very dark pixels
            if (a < 128 || (r + g + b) < 100) continue;
            
            const color = `rgb(${r},${g},${b})`;
            colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
        }
        
        // Sort by frequency and get top colors
        const sortedColors = Array.from(colorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color]) => color);
        
        return sortedColors;
    }

    updateThemeColors(colors) {
        if (colors.length === 0) return;
        
        // Convert RGB to hex
        const hexColors = colors.map(rgb => this.rgbToHex(rgb));
        
        // Update CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--primary-color', hexColors[0] || this.teamColors.primary);
        root.style.setProperty('--secondary-color', hexColors[1] || this.teamColors.secondary);
        root.style.setProperty('--accent-color', hexColors[2] || this.teamColors.accent);
        
        // Update body background gradient
        const primary = hexColors[0] || this.teamColors.primary;
        const secondary = hexColors[1] || this.teamColors.secondary;
        document.body.style.background = `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
        
        // Update team colors for saving
        this.teamColors = {
            primary: hexColors[0] || this.teamColors.primary,
            secondary: hexColors[1] || this.teamColors.secondary,
            accent: hexColors[2] || this.teamColors.accent
        };
        
        this.showMessage('Theme updated with team colors!', 'success');
    }


    rgbToHex(rgb) {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return '#667eea';
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    showMessage(text, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.soundboardApp = new SoundboardApp();
});

// Handle page visibility changes to pause sounds when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.soundboardApp) {
        // Pause all playing sounds when tab becomes hidden
        window.soundboardApp.playingSounds.forEach(audio => {
            audio.pause();
        });
    }
});

