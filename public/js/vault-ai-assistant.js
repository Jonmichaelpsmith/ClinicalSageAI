/**
 * Vault™ AI Assistant
 * 
 * This module handles the personalized AI assistant experience for onboarding
 * new users to the Vault™ platform.
 */

class VaultAIAssistant {
    constructor(options = {}) {
        this.options = {
            initialDelay: 1500,
            typingSpeed: 30,
            assistantName: 'Vault™ Assistant',
            primaryColor: '#0078d4', // MS 365 blue
            ...options
        };

        this.state = {
            initialized: false,
            onboardingStep: 0,
            userPreferences: {
                role: null,
                department: null,
                useCase: null,
                experience: null
            },
            interactions: []
        };

        this.elements = {
            container: null,
            header: null,
            chat: null,
            input: null,
            assistant: null
        };
    }

    /**
     * Initialize the assistant UI and begin the onboarding experience
     */
    initialize(containerSelector = '#ai-assistant-container') {
        if (this.state.initialized) return;

        // Create assistant DOM elements
        this.createAssistantUI(containerSelector);
        
        // Bind event handlers
        this.bindEvents();
        
        // Start the onboarding process
        setTimeout(() => {
            this.showWelcomeMessage();
        }, this.options.initialDelay);

        this.state.initialized = true;
    }

    /**
     * Create the assistant UI elements
     */
    createAssistantUI(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error('AI Assistant container not found:', containerSelector);
            return;
        }

        container.innerHTML = `
            <div class="vault-assistant">
                <div class="vault-assistant-header">
                    <div class="assistant-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${this.options.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                    </div>
                    <div class="assistant-title">${this.options.assistantName}</div>
                    <div class="assistant-actions">
                        <button class="assistant-minimize" title="Minimize">−</button>
                        <button class="assistant-close" title="Close">×</button>
                    </div>
                </div>
                <div class="vault-assistant-chat">
                    <!-- Chat messages will be added here -->
                </div>
                <div class="vault-assistant-input">
                    <input type="text" placeholder="Type your response..." />
                    <button class="assistant-send">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Cache DOM references
        this.elements.container = container;
        this.elements.assistant = container.querySelector('.vault-assistant');
        this.elements.header = container.querySelector('.vault-assistant-header');
        this.elements.chat = container.querySelector('.vault-assistant-chat');
        this.elements.input = container.querySelector('.vault-assistant-input input');
        this.elements.sendButton = container.querySelector('.assistant-send');
        this.elements.minimizeButton = container.querySelector('.assistant-minimize');
        this.elements.closeButton = container.querySelector('.assistant-close');
    }

    /**
     * Bind event handlers for user interactions
     */
    bindEvents() {
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        this.elements.sendButton.addEventListener('click', () => {
            this.handleUserInput();
        });

        this.elements.minimizeButton.addEventListener('click', () => {
            this.toggleMinimize();
        });

        this.elements.closeButton.addEventListener('click', () => {
            this.closeAssistant();
        });
    }

    /**
     * Show welcome message and start onboarding
     */
    showWelcomeMessage() {
        const welcomeMessage = "Welcome to Vault™! I'm your personal assistant to help you get started. Let's personalize your experience. What's your primary role?";
        
        this.addAssistantMessage(welcomeMessage);
        this.showRoleOptions();
    }

    /**
     * Display role selection options
     */
    showRoleOptions() {
        const roles = [
            { id: 'regulatory', label: 'Regulatory Affairs' },
            { id: 'clinical', label: 'Clinical Operations' },
            { id: 'medical', label: 'Medical Affairs' },
            { id: 'quality', label: 'Quality Assurance' },
            { id: 'research', label: 'Research & Development' }
        ];

        const optionsHtml = roles.map(role => 
            `<button class="assistant-option" data-role="${role.id}">${role.label}</button>`
        ).join('');

        this.addOptionsMessage(optionsHtml);

        // Bind event handlers to role buttons
        document.querySelectorAll('.assistant-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedRole = e.target.getAttribute('data-role');
                this.handleRoleSelection(selectedRole, e.target.textContent);
            });
        });
    }

    /**
     * Handle role selection from the user
     */
    handleRoleSelection(roleId, roleLabel) {
        this.state.userPreferences.role = roleId;
        this.addUserMessage(roleLabel);
        
        // Next step: ask about experience level
        setTimeout(() => {
            this.askExperienceLevel();
        }, 1000);
    }

    /**
     * Ask about user's experience level
     */
    askExperienceLevel() {
        const message = "Great! How would you describe your experience level with regulatory document management systems?";
        this.addAssistantMessage(message);

        const experienceLevels = [
            { id: 'beginner', label: 'Beginner' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' },
            { id: 'expert', label: 'Expert' }
        ];

        const optionsHtml = experienceLevels.map(level => 
            `<button class="assistant-option" data-experience="${level.id}">${level.label}</button>`
        ).join('');

        this.addOptionsMessage(optionsHtml);

        // Bind event handlers to experience buttons
        document.querySelectorAll('.assistant-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedExp = e.target.getAttribute('data-experience');
                this.handleExperienceSelection(selectedExp, e.target.textContent);
            });
        });
    }

    /**
     * Handle experience level selection
     */
    handleExperienceSelection(expId, expLabel) {
        this.state.userPreferences.experience = expId;
        this.addUserMessage(expLabel);
        
        // Next step: suggest modules based on role and experience
        setTimeout(() => {
            this.suggestModules();
        }, 1000);
    }

    /**
     * Suggest modules based on user preferences
     */
    suggestModules() {
        const { role, experience } = this.state.userPreferences;
        
        let message = "Based on your role and experience, I recommend starting with these Vault™ modules:";
        
        // Personalized module recommendations based on role
        const moduleRecommendations = {
            regulatory: [
                "eCTD Submission Planner",
                "Auto-Retention Scheduler",
                "ICH Wiz™ Compliance Guide"
            ],
            clinical: [
                "Study Architect™",
                "Site Startup Checklist",
                "CSR Intelligence™"
            ],
            medical: [
                "Publication Planning",
                "Medical Information Management",
                "CSR Intelligence™"
            ],
            quality: [
                "Quality Dashboard",
                "SOP Training Workflow",
                "Validation Documentation"
            ],
            research: [
                "IND Wizard™",
                "CMC Blueprint Generator",
                "Study Architect™"
            ]
        };

        // Add module recommendations to message
        const modules = moduleRecommendations[role] || moduleRecommendations.regulatory;
        
        this.addAssistantMessage(message);

        // Create clickable module list
        const modulesHtml = modules.map(module => 
            `<button class="assistant-module-option">${module}</button>`
        ).join('');

        this.addModulesMessage(modulesHtml);

        // Add explanation based on experience level
        let explanationMessage = "";
        
        if (experience === 'beginner') {
            explanationMessage = "I've selected modules with guided workflows to help you learn our system with minimal complexity.";
        } else if (experience === 'intermediate') {
            explanationMessage = "These modules offer a balance of guidance and advanced features to match your experience level.";
        } else {
            explanationMessage = "These advanced modules will leverage your expertise while introducing you to our powerful automation capabilities.";
        }

        setTimeout(() => {
            this.addAssistantMessage(explanationMessage);
            this.offerGuidedTour();
        }, 2000);

        // Bind event handlers to module buttons
        document.querySelectorAll('.assistant-module-option').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleModuleSelection(e.target.textContent);
            });
        });
    }

    /**
     * Handle module selection
     */
    handleModuleSelection(moduleName) {
        this.addUserMessage(`I'd like to explore ${moduleName}`);
        
        setTimeout(() => {
            this.addAssistantMessage(`Great choice! Let me take you to ${moduleName} and show you around.`);
            
            // Simulate redirection
            setTimeout(() => {
                this.addAssistantMessage("I'll redirect you to that module now. You'll find me there to guide you through the key features.");
            }, 1500);
        }, 1000);
    }

    /**
     * Offer a guided tour
     */
    offerGuidedTour() {
        setTimeout(() => {
            this.addAssistantMessage("Would you like me to guide you through a quick tour of the platform now?");
            
            const tourOptions = `
                <button class="assistant-option tour-option" data-tour="yes">Yes, show me around</button>
                <button class="assistant-option tour-option" data-tour="no">No, I'll explore on my own</button>
            `;
            
            this.addOptionsMessage(tourOptions);
            
            // Bind event handlers
            document.querySelectorAll('.tour-option').forEach(button => {
                button.addEventListener('click', (e) => {
                    const tourChoice = e.target.getAttribute('data-tour');
                    this.handleTourSelection(tourChoice, e.target.textContent);
                });
            });
        }, 2000);
    }

    /**
     * Handle tour selection
     */
    handleTourSelection(choice, label) {
        this.addUserMessage(label);
        
        if (choice === 'yes') {
            setTimeout(() => {
                this.startGuidedTour();
            }, 1000);
        } else {
            setTimeout(() => {
                this.addAssistantMessage("No problem! I'll be here when you need me. You can click on any module to get started, or ask me questions anytime by clicking on the assistant icon in the bottom right corner.");
                this.addAssistantMessage("Happy exploring!");
            }, 1000);
        }
    }

    /**
     * Start the guided tour
     */
    startGuidedTour() {
        this.addAssistantMessage("Great! Let me walk you through the key features of Vault™.");
        
        const tourSteps = [
            "First, let's look at the document repository. This is where all your regulatory documents are stored and managed.",
            "Next, the dashboard gives you a quick overview of document status, upcoming deadlines, and recent activities.",
            "The workflow section helps you track approval processes and ensures compliance with your SOPs.",
            "Finally, the reporting tools provide insights into your regulatory activities and help identify optimization opportunities."
        ];
        
        let stepIndex = 0;
        
        const showNextStep = () => {
            if (stepIndex < tourSteps.length) {
                this.addAssistantMessage(tourSteps[stepIndex]);
                stepIndex++;
                setTimeout(showNextStep, 3000);
            } else {
                setTimeout(() => {
                    this.concludeTour();
                }, 2000);
            }
        };
        
        setTimeout(showNextStep, 1500);
    }

    /**
     * Conclude the guided tour
     */
    concludeTour() {
        this.addAssistantMessage("That completes our quick tour! Remember, I'm here to help whenever you need assistance.");
        
        const finalOptions = `
            <button class="assistant-option final-option" data-action="explore">Start exploring</button>
            <button class="assistant-option final-option" data-action="questions">I have questions</button>
        `;
        
        this.addOptionsMessage(finalOptions);
        
        // Bind event handlers
        document.querySelectorAll('.final-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleFinalSelection(action, e.target.textContent);
            });
        });
    }

    /**
     * Handle final selection after tour
     */
    handleFinalSelection(action, label) {
        this.addUserMessage(label);
        
        if (action === 'explore') {
            setTimeout(() => {
                this.addAssistantMessage("Fantastic! Feel free to explore the platform. I'll minimize myself, but you can click my icon anytime you need help.");
                setTimeout(() => {
                    this.toggleMinimize();
                }, 2000);
            }, 1000);
        } else {
            setTimeout(() => {
                this.addAssistantMessage("What questions do you have? You can type them below, and I'll do my best to help.");
                this.elements.input.focus();
            }, 1000);
        }
    }

    /**
     * Handle user text input
     */
    handleUserInput() {
        const userInput = this.elements.input.value.trim();
        if (!userInput) return;
        
        this.addUserMessage(userInput);
        this.elements.input.value = '';
        
        setTimeout(() => {
            // Simple response based on input keywords
            if (userInput.toLowerCase().includes('thank')) {
                this.addAssistantMessage("You're welcome! I'm here to help you get the most out of Vault™.");
            } else if (userInput.toLowerCase().includes('help')) {
                this.addAssistantMessage("I can help with navigating the platform, finding documents, or understanding features. What specifically would you like help with?");
            } else if (userInput.toLowerCase().includes('document') || userInput.toLowerCase().includes('upload')) {
                this.addAssistantMessage("To upload documents, go to the Documents tab and click the '+' button. You can drag and drop files or browse to select them.");
            } else {
                this.addAssistantMessage("I'll help you with that. Let me look into your question and get back to you shortly.");
                
                // Simulate thinking and provide a more detailed response
                setTimeout(() => {
                    this.addAssistantMessage("For more detailed assistance with this question, I recommend checking our Knowledge Base or contacting support at vault@concept2cures.com.");
                }, 2000);
            }
        }, 1000);
    }

    /**
     * Add a message from the assistant to the chat
     */
    addAssistantMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'assistant-message';
        this.elements.chat.appendChild(messageEl);
        
        // Simulate typing effect
        let i = 0;
        const typing = setInterval(() => {
            messageEl.textContent = message.substring(0, i);
            i++;
            
            // Scroll to bottom
            this.elements.chat.scrollTop = this.elements.chat.scrollHeight;
            
            if (i > message.length) {
                clearInterval(typing);
            }
        }, this.options.typingSpeed);
        
        // Store in interaction history
        this.state.interactions.push({
            type: 'assistant',
            message: message,
            timestamp: new Date()
        });
    }

    /**
     * Add a message from the user to the chat
     */
    addUserMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'user-message';
        messageEl.textContent = message;
        this.elements.chat.appendChild(messageEl);
        
        // Scroll to bottom
        this.elements.chat.scrollTop = this.elements.chat.scrollHeight;
        
        // Store in interaction history
        this.state.interactions.push({
            type: 'user',
            message: message,
            timestamp: new Date()
        });
    }

    /**
     * Add option buttons to the chat
     */
    addOptionsMessage(optionsHtml) {
        const optionsEl = document.createElement('div');
        optionsEl.className = 'assistant-options';
        optionsEl.innerHTML = optionsHtml;
        this.elements.chat.appendChild(optionsEl);
        
        // Scroll to bottom
        this.elements.chat.scrollTop = this.elements.chat.scrollHeight;
    }

    /**
     * Add module recommendation buttons
     */
    addModulesMessage(modulesHtml) {
        const modulesEl = document.createElement('div');
        modulesEl.className = 'assistant-modules';
        modulesEl.innerHTML = modulesHtml;
        this.elements.chat.appendChild(modulesEl);
        
        // Scroll to bottom
        this.elements.chat.scrollTop = this.elements.chat.scrollHeight;
    }

    /**
     * Toggle minimize state of the assistant
     */
    toggleMinimize() {
        this.elements.assistant.classList.toggle('minimized');
        
        if (this.elements.assistant.classList.contains('minimized')) {
            this.elements.minimizeButton.textContent = '+';
            this.elements.minimizeButton.title = 'Expand';
        } else {
            this.elements.minimizeButton.textContent = '−';
            this.elements.minimizeButton.title = 'Minimize';
        }
    }

    /**
     * Close the assistant
     */
    closeAssistant() {
        this.elements.container.style.display = 'none';
    }
}

// Create global instance
window.vaultAssistant = new VaultAIAssistant();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if the assistant container exists before initializing
    if (document.querySelector('#ai-assistant-container')) {
        window.vaultAssistant.initialize();
    }
});