// Young Events & Travel - JavaScript Functionality
// This file contains all JavaScript functionality for login and registration pages

(function() {
    'use strict';

    // Utility functions
    const utils = {
        // Check if element exists
        exists: (selector) => document.querySelector(selector) !== null,
        
        // Get element safely
        getElement: (selector) => document.querySelector(selector),
        
        // Get all elements safely
        getAllElements: (selector) => document.querySelectorAll(selector),
        
        // Add event listener safely
        addEvent: (element, event, handler) => {
            if (element) {
                element.addEventListener(event, handler);
            }
        },
        
        // Remove event listener safely
        removeEvent: (element, event, handler) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        }
    };

    // Emoji flag support: replace flag emoji with Twemoji SVGs for cross-platform consistency
    const EmojiFlags = {
        cdnBaseUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/',

        emojiToCodePoints: function(emoji) {
            // Convert emoji string to lower-case hex codepoint list joined by '-'
            const codePoints = [];
            for (const symbol of Array.from(emoji)) {
                const cp = symbol.codePointAt(0);
                if (cp) codePoints.push(cp.toString(16));
            }
            return codePoints.join('-');
        },

        getFlagImgHTML: function(emoji) {
            const code = this.emojiToCodePoints(emoji);
            const src = `${this.cdnBaseUrl}${code}.svg`;
            return `<img class="flag-emoji-img" src="${src}" alt="${emoji}" loading="lazy" decoding="async"/>`;
        },

        replaceAllInDOM: function() {
            const elements = utils.getAllElements('.flag-emoji');
            elements.forEach(elem => {
                const emoji = elem.textContent.trim();
                if (!emoji) return;
                const html = this.getFlagImgHTML(emoji);
                // Replace the span entirely with an <img>
                const wrapper = document.createElement('span');
                wrapper.innerHTML = html;
                const img = wrapper.firstChild;
                elem.replaceWith(img);
            });
        }
    };

    // Password visibility toggle functionality
    const PasswordToggle = {
        init: function() {
            const passwordToggles = utils.getAllElements('[data-toggle-password]');
            passwordToggles.forEach(toggle => {
                utils.addEvent(toggle, 'click', this.handleToggle.bind(this));
            });
        },

        handleToggle: function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = utils.getElement('#' + targetId);
            const icon = this.querySelector('svg');
            
            if (!passwordInput || !icon) return;
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Switch to eye-off icon
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />';
            } else {
                passwordInput.type = 'password';
                // Switch to eye icon
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
            }
        }
    };

    // Dropdown functionality
    const Dropdown = {
        init: function() {
            this.sanitizeBillingOptions();
            this.initDropdownTriggers();
            this.initDropdownLabels();
            this.initDropdownOptions();
            this.initDropdownSearch();
            this.initOutsideClick();
        },

        sanitizeBillingOptions: function() {
            // For billing pages, hide country calling codes from the list while keeping data attributes
            const billingOptions = utils.getAllElements('.billing-dropdown .dropdown-option');
            if (!billingOptions || billingOptions.length === 0) return;
            billingOptions.forEach(option => {
                // Preserve the first flag element (img from Twemoji or original span)
                const flagEl = option.querySelector('.flag-emoji-img') || option.querySelector('.flag-emoji');
                const countryName = option.textContent.replace(/\(.*?\)/, '').trim();
                if (flagEl) {
                    const flagHTML = flagEl.outerHTML;
                    option.innerHTML = `${flagHTML} ${countryName}`;
                } else {
                    option.textContent = countryName;
                }
            });
        },

        initDropdownTriggers: function() {
            const dropdownTriggers = utils.getAllElements('.dropdown-trigger');
            console.log('Found dropdown triggers:', dropdownTriggers.length);
            dropdownTriggers.forEach((trigger, index) => {
                console.log(`Adding click event to dropdown trigger ${index + 1}`);
                console.log('Trigger element:', trigger);
                console.log('Trigger classes:', trigger.className);
                utils.addEvent(trigger, 'click', this.handleTriggerClick.bind(this));
            });
        },

        initDropdownLabels: function() {
            const dropdownLabels = utils.getAllElements('.dropdown-label');
            dropdownLabels.forEach(label => {
                utils.addEvent(label, 'click', this.handleLabelClick.bind(this));
            });
        },

        initDropdownOptions: function() {
            const dropdownOptions = utils.getAllElements('.dropdown-option');
            dropdownOptions.forEach(option => {
                utils.addEvent(option, 'click', this.handleOptionClick.bind(this));
            });
        },

        initDropdownSearch: function() {
            const searchInputs = utils.getAllElements('.dropdown-search');
            searchInputs.forEach(search => {
                this.setupSearchFunctionality(search);
            });
        },

        initOutsideClick: function() {
            utils.addEvent(document, 'click', this.handleOutsideClick.bind(this));
        },

        handleTriggerClick: function(e) {
            console.log('Dropdown trigger clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const trigger = e.currentTarget;
            
            // Find the dropdown menu and label
            const dropdownMenu = trigger.parentElement.querySelector('.dropdown-menu');
            const label = trigger.parentElement.querySelector('.dropdown-label');
            const chevronContainer = trigger.parentElement.querySelector('.dropdown-chevron');
            const icon = chevronContainer.querySelector('svg');
            const searchInput = dropdownMenu.querySelector('.dropdown-search');
            
            console.log('Found label:', label);
            console.log('Label classes before:', label.className);
            
            // Close other dropdowns and reset their labels
            this.closeOtherDropdowns(dropdownMenu);
            
            // Toggle current dropdown
            const isHidden = dropdownMenu.classList.contains('hidden');
            dropdownMenu.classList.toggle('hidden');
            icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            
            // Handle label animation
            if (isHidden) {
                // Opening dropdown - move label up
                console.log('Adding focused class to label');
                label.classList.add('focused');
                console.log('Label classes after adding focused:', label.className);
                
                // Auto-focus search input
                setTimeout(() => {
                    if (searchInput) searchInput.focus();
                }, 100);
            } else {
                // Closing dropdown - move label back down if empty
                if (trigger.getAttribute('data-empty') === 'true') {
                    console.log('Removing focused and active classes from label');
                    label.classList.remove('focused');
                    label.classList.remove('active');
                    console.log('Label classes after removing:', label.className);
                }
            }
        },

        handleLabelClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the corresponding dropdown trigger and trigger its click event
            const label = e.currentTarget;
            const dropdown = label.closest('.dropdown-wrapper');
            const trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) trigger.click();
        },

        handleOptionClick: function(e) {
            const option = e.currentTarget;
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            const countryCode = option.getAttribute('data-code');
            const dropdown = option.closest('.dropdown-wrapper');
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const valueSpan = trigger.querySelector('.dropdown-value');
            const label = dropdown.querySelector('.dropdown-label');
            const menu = dropdown.querySelector('.dropdown-menu');
            const chevronContainer = dropdown.querySelector('.dropdown-chevron');
            const icon = chevronContainer.querySelector('svg');
            
            // Extract country name without the code and flag for display
            let countryName = text.split('(')[0].trim();
            // Remove any flag emoji from the country name
            countryName = countryName.replace(/[\u{1F1E6}-\u{1F1FF}][\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
            
            // Get the flag emoji from the selected option (supports span or img)
            let flagEmoji = '';
            const flagSpan = option.querySelector('.flag-emoji');
            if (flagSpan && flagSpan.textContent) {
                flagEmoji = flagSpan.textContent.trim();
            } else {
                const flagImg = option.querySelector('.flag-emoji-img');
                if (flagImg) {
                    flagEmoji = flagImg.getAttribute('alt') || '';
                }
            }
            
            // Check if this is a billing page dropdown (has billing-dropdown class)
            const isBillingPage = dropdown.classList.contains('billing-dropdown');
            
            if (isBillingPage) {
                // For billing page: display full country name, keep label as "Country"
                valueSpan.textContent = countryName;
                valueSpan.classList.add('has-value');
                
                // Keep label in "up" position and mark as filled
                trigger.setAttribute('data-empty', 'false');
                console.log('Adding active class to billing dropdown label');
                label.classList.add('active');
                label.classList.remove('focused'); // Remove focused class, keep active
                console.log('Label classes after selection:', label.className);
                
                // Keep the label text as "Country" (don't change it)
                // label.textContent remains "Country"
                
                // Store the country name for later use
                trigger.setAttribute('data-country-name', countryName);
                trigger.setAttribute('data-country-code', countryCode);
                
                // Replace the field icon with the country flag (SVG via Twemoji)
                const inputIcon = dropdown.querySelector('.input-icon');
                if (inputIcon) {
                    inputIcon.innerHTML = EmojiFlags.getFlagImgHTML(flagEmoji);
                }
            } else {
                // For register page: display country code, update label to country name
                valueSpan.textContent = countryCode;
                valueSpan.classList.add('has-value');
                
                // Keep label in "up" position and mark as filled
                trigger.setAttribute('data-empty', 'false');
                label.classList.add('active');
                
                // Update the label text to show only the country name (no flag)
                label.textContent = countryName;
                
                // Store the country code for later use
                trigger.setAttribute('data-country-code', countryCode);
                
                // Replace the field icon with the country flag (SVG via Twemoji)
                const inputIcon = dropdown.querySelector('.input-icon');
                if (inputIcon) {
                    inputIcon.innerHTML = EmojiFlags.getFlagImgHTML(flagEmoji);
                }
                
                // Update phone number placeholder with country code (only for register page)
                const phoneInput = document.getElementById('phone_number');
                if (phoneInput) {
                    phoneInput.placeholder = `Phone Number (${countryCode})`;
                    
                    // If phone input has a value, update it to include country code
                    if (phoneInput.value) {
                        const currentValue = phoneInput.value.replace(/\D/g, '');
                        // Remove any existing country code and add the new one
                        const cleanValue = currentValue.replace(/^(\+?\d{1,4})/, '');
                        phoneInput.value = `${countryCode} ${cleanValue}`;
                    }
                }
            }
            
            // Close dropdown
            menu.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        },

        setupSearchFunctionality: function(search) {
            let selectedIndex = -1;
            
            utils.addEvent(search, 'input', function(e) {
                e.stopPropagation();
                const searchTerm = this.value.toLowerCase();
                const options = this.closest('.dropdown-menu').querySelectorAll('.dropdown-option');
                let visibleOptions = [];
                
                options.forEach(option => {
                    option.classList.remove('selected');
                    const text = option.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        option.style.display = 'block';
                        visibleOptions.push(option);
                    } else {
                        option.style.display = 'none';
                    }
                });
                
                selectedIndex = -1;
                if (visibleOptions.length > 0) {
                    selectedIndex = 0;
                    visibleOptions[0].classList.add('selected');
                }
            });
            
            utils.addEvent(search, 'keydown', function(e) {
                const options = this.closest('.dropdown-menu').querySelectorAll('.dropdown-option');
                const visibleOptions = Array.from(options).filter(option => option.style.display !== 'none');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (visibleOptions.length > 0) {
                        if (selectedIndex >= 0) {
                            visibleOptions[selectedIndex].classList.remove('selected');
                        }
                        selectedIndex = (selectedIndex + 1) % visibleOptions.length;
                        visibleOptions[selectedIndex].classList.add('selected');
                        visibleOptions[selectedIndex].scrollIntoView({ block: 'nearest' });
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (visibleOptions.length > 0) {
                        if (selectedIndex >= 0) {
                            visibleOptions[selectedIndex].classList.remove('selected');
                        }
                        selectedIndex = selectedIndex <= 0 ? visibleOptions.length - 1 : selectedIndex - 1;
                        visibleOptions[selectedIndex].classList.add('selected');
                        visibleOptions[selectedIndex].scrollIntoView({ block: 'nearest' });
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (selectedIndex >= 0 && visibleOptions[selectedIndex]) {
                        visibleOptions[selectedIndex].click();
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    const dropdown = this.closest('.dropdown-wrapper');
                    const trigger = dropdown.querySelector('.dropdown-trigger');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    const chevronContainer = dropdown.querySelector('.dropdown-chevron');
                    const icon = chevronContainer.querySelector('svg');
                    
                    menu.classList.add('hidden');
                    icon.style.transform = 'rotate(0deg)';
                    
                    // Reset label if empty
                    if (trigger.getAttribute('data-empty') === 'true') {
                        const label = dropdown.querySelector('.dropdown-label');
                        label.classList.remove('active');
                    }
                }
            });
            
            // Prevent dropdown from closing when clicking in search input
            utils.addEvent(search, 'click', function(e) {
                e.stopPropagation();
            });
        },

        closeOtherDropdowns: function(currentMenu) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== currentMenu) {
                    menu.classList.add('hidden');
                    const otherTrigger = menu.parentElement.querySelector('.dropdown-trigger');
                    const otherLabel = menu.parentElement.querySelector('.dropdown-label');
                    if (otherTrigger && otherTrigger.getAttribute('data-empty') === 'true') {
                        otherLabel.classList.remove('active');
                        otherLabel.classList.remove('focused');
                    }
                }
            });
            
            document.querySelectorAll('.dropdown-trigger').forEach(otherTrigger => {
                const otherChevronContainer = otherTrigger.parentElement.querySelector('.dropdown-chevron');
                const otherIcon = otherChevronContainer.querySelector('svg');
                otherIcon.style.transform = 'rotate(0deg)';
            });
        },

        handleOutsideClick: function(e) {
            if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-menu')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.add('hidden');
                    
                    // Reset label position for empty dropdowns
                    const trigger = menu.parentElement.querySelector('.dropdown-trigger');
                    const label = menu.parentElement.querySelector('.dropdown-label');
                    if (trigger && trigger.getAttribute('data-empty') === 'true') {
                        label.classList.remove('active');
                        label.classList.remove('focused');
                    }
                });
                document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
                    const chevronContainer = trigger.parentElement.querySelector('.dropdown-chevron');
                    const icon = chevronContainer.querySelector('svg');
                    icon.style.transform = 'rotate(0deg)';
                });
            }
        }
    };

    // Form validation functionality
    const FormValidation = {
        init: function() {
            this.initPasswordValidation();
            this.initPhoneFormatting();
        },

        initPasswordValidation: function() {
            const password = utils.getElement('#password');
            const passwordConfirm = utils.getElement('#password_confirm');
            
            if (password && passwordConfirm) {
                utils.addEvent(password, 'input', this.validatePasswords.bind(this));
                utils.addEvent(passwordConfirm, 'input', this.validatePasswords.bind(this));
            }
        },

        validatePasswords: function() {
            const password = utils.getElement('#password');
            const passwordConfirm = utils.getElement('#password_confirm');
            
            if (!password || !passwordConfirm) return;
            
            if (password.value && passwordConfirm.value) {
                const errorMessage = passwordConfirm.parentElement.querySelector('.error-message');
                const label = passwordConfirm.parentElement.querySelector('label');
                
                if (password.value !== passwordConfirm.value) {
                    passwordConfirm.classList.add('error');
                    if (label) label.classList.add('error');
                    if (errorMessage) errorMessage.classList.add('show');
                } else {
                    passwordConfirm.classList.remove('error');
                    if (label) label.classList.remove('error');
                    if (errorMessage) errorMessage.classList.remove('show');
                }
            }
        },

        initPhoneFormatting: function() {
            const phoneInput = utils.getElement('#phone_number');
            if (phoneInput) {
                utils.addEvent(phoneInput, 'input', function() {
                    let value = this.value.replace(/\D/g, '');
                    
                    // Get the selected country code
                    const countryTrigger = document.querySelector('[data-dropdown="country"]');
                    const countryCode = countryTrigger ? countryTrigger.getAttribute('data-country-code') : '';
                    
                    // Format based on country code length
                    if (countryCode) {
                        // Remove country code from input if user types it
                        if (value.startsWith(countryCode.replace('+', ''))) {
                            value = value.substring(countryCode.replace('+', '').length);
                        }
                        
                        // Format the local number
                        if (value.length <= 3) {
                            this.value = value;
                        } else if (value.length <= 6) {
                            this.value = value.replace(/(\d{3})(\d{0,3})/, '$1 $2');
                        } else {
                            this.value = value.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1 $2 $3');
                        }
                    } else {
                        // Default formatting
                        this.value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
                    }
                });
            }
        }
    };

    // 2FA Input functionality
    const TwoFAInput = {
        init: function() {
            this.initTwoFAInputs();
        },

        initTwoFAInputs: function() {
            const twofaInputs = utils.getAllElements('.twofa-input');
            if (twofaInputs.length > 0) {
                twofaInputs.forEach((input, index) => {
                    utils.addEvent(input, 'input', this.handleInput.bind(this, index));
                    utils.addEvent(input, 'keydown', this.handleKeydown.bind(this, index));
                    utils.addEvent(input, 'paste', this.handlePaste.bind(this));
                });
            }
        },

        handleInput: function(index, e) {
            const input = e.target;
            const value = input.value;
            
            // Only allow numeric input
            if (!/^\d*$/.test(value)) {
                input.value = value.replace(/\D/g, '');
                return;
            }
            
            // Limit to 1 character
            if (value.length > 1) {
                input.value = value.slice(0, 1);
            }
            
            // Auto-focus next input if current input has a value
            if (input.value && index < 5) {
                const nextInput = utils.getElement(`#code${index + 2}`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        },

        handleKeydown: function(index, e) {
            const input = e.target;
            
            // Handle backspace
            if (e.key === 'Backspace' && !input.value && index > 0) {
                const prevInput = utils.getElement(`#code${index}`);
                if (prevInput) {
                    prevInput.focus();
                }
            }
        },

        handlePaste: function(e) {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData('text');
            const numericData = pastedData.replace(/\D/g, '').slice(0, 6);
            
            if (numericData.length === 6) {
                for (let i = 0; i < 6; i++) {
                    const input = utils.getElement(`#code${i + 1}`);
                    if (input) {
                        input.value = numericData[i];
                    }
                }
                // Focus the last input
                const lastInput = utils.getElement('#code6');
                if (lastInput) {
                    lastInput.focus();
                }
            }
        }
    };

    // Form submission functionality
    const FormSubmission = {
        init: function() {
            this.initLoginForm();
            this.initRegisterForm();
            this.initTwoFAForm();
            DomainSearch.init();
            CreditCard.init();
            Checkout.init();
        },

        initLoginForm: function() {
            const loginForm = utils.getElement('.login-form');
            if (loginForm) {
                utils.addEvent(loginForm, 'submit', this.handleLoginSubmit.bind(this));
            }
        },

        initRegisterForm: function() {
            const registerForm = utils.getElement('.register-form');
            if (registerForm) {
                utils.addEvent(registerForm, 'submit', this.handleRegisterSubmit.bind(this));
            }
        },

        handleLoginSubmit: function(e) {
            e.preventDefault();
            
            // Get form data
            const email = utils.getElement('#email')?.value;
            const password = utils.getElement('#password')?.value;
            const remember = utils.getElement('#remember')?.checked;
            
            // Basic validation
            if (!email || !password) {
                alert('Te rugam sa completezi toate campurile obligatorii.');
                return;
            }
            
            // For demo purposes, accept any email and password
            // In a real application, you would validate these against your backend
            console.log('Login data:', { email, password, remember });
            
            // Redirect to dashboard
            window.location.href = '2fa.html';
        },

        handleRegisterSubmit: function(e) {
            e.preventDefault();
            
            // Basic validation
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            if (!data.terms) {
                alert('Te rugam sa accepti termenii si conditiile.');
                return;
            }
            
            if (data.password !== data.password_confirm) {
                alert('Parolele nu se potrivesc.');
                return;
            }
            
            console.log('Registration data:', data);
            alert('Contul a fost creat cu succes! Redirectionare catre selectia institutiei...');
            setTimeout(() => {
                window.location.href = 'choose-institution.html';
            }, 1500);
        },

        initTwoFAForm: function() {
            const twofaForm = utils.getElement('.login-form');
            if (twofaForm && utils.getElement('.twofa-input')) {
                utils.addEvent(twofaForm, 'submit', this.handleTwoFASubmit.bind(this));
            }
        },

        handleTwoFASubmit: function(e) {
            e.preventDefault();
            const code1 = utils.getElement('#code1')?.value || '';
            const code2 = utils.getElement('#code2')?.value || '';
            const code3 = utils.getElement('#code3')?.value || '';
            const code4 = utils.getElement('#code4')?.value || '';
            const code5 = utils.getElement('#code5')?.value || '';
            const code6 = utils.getElement('#code6')?.value || '';
            
            const fullCode = code1 + code2 + code3 + code4 + code5 + code6;
            
            if (fullCode.length !== 6) {
                alert('Te rugam sa introduci codul de 6 cifre.');
                return;
            }
            
            console.log('2FA code submitted:', fullCode);
            // Add your 2FA verification logic here
            alert('Codul a fost verificat cu succes!');
        }
    };

    // Payment page: lightweight credit card UX
    const CreditCard = {
        init: function() {
            if (!document.body.classList.contains('payment-page')) return;
            const number = utils.getElement('#cc_number');
            const exp = utils.getElement('#cc_exp');
            const cvc = utils.getElement('#cc_cvc');
            if (number) utils.addEvent(number, 'input', this.formatCardNumber.bind(this));
            if (exp) utils.addEvent(exp, 'input', this.formatExpiry.bind(this));
            if (cvc) utils.addEvent(cvc, 'input', this.onlyDigits.bind(this));

            this.initCurrencySelector();
        },

        onlyDigits: function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        },

        formatCardNumber: function(e) {
            let v = e.target.value.replace(/\D/g, '').slice(0, 19);
            // Group in 4s: 1234 5678 9012 3456 789
            v = v.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = v;
        },

        formatExpiry: function(e) {
            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
            if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
            e.target.value = v;
        },

        initCurrencySelector: function() {
            const toggle = utils.getElement('.cc-currency-toggle');
            const menu = utils.getElement('.cc-currency-menu');
            const amountEl = utils.getElement('#cc_total_display');
            const row = utils.getElement('.cc-total-amount-row');
            const payBtn = utils.getElement('#cc_pay_btn');
            if (!toggle || !menu || !amountEl) return;

            const setPayButton = (amountText) => {
                if (payBtn) {
                    payBtn.textContent = `Pay - ${amountText}`;
                }
            };

            // Initialize pay button with current amount
            setPayButton((amountEl.textContent || '').trim());

            utils.addEvent(toggle, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // prevent row click handler from firing too
                const isHidden = menu.classList.contains('hidden');
                menu.classList.toggle('hidden');
                toggle.setAttribute('aria-expanded', String(isHidden));
            });

            // Make entire total row clickable to toggle the currency menu
            if (row) {
                utils.addEvent(row, 'click', (e) => {
                    // Ignore clicks inside the open menu so option click doesn't re-toggle
                    if (e.target.closest('.cc-currency-menu')) return;
                    // Ignore direct clicks on the chevron button; it has its own handler
                    if (e.target.closest('.cc-currency-toggle')) return;
                    const isHidden = menu.classList.contains('hidden');
                    menu.classList.toggle('hidden');
                    toggle.setAttribute('aria-expanded', String(isHidden));
                });
            }

            menu.querySelectorAll('li[role="option"]').forEach(opt => {
                utils.addEvent(opt, 'click', () => {
                    // If the option contains a fully formatted amount (like "$ 647.21"), use it
                    const optionText = opt.textContent.replace(/\s+/g,' ').trim();
                    if (optionText) {
                        amountEl.textContent = optionText;
                        setPayButton(optionText);
                    } else {
                        const prefix = opt.getAttribute('data-symbol-prefix') || '';
                        const suffix = opt.getAttribute('data-symbol-suffix') || '';
                        const numeric = amountEl.textContent.replace(/[^0-9.,]/g, '');
                        const composed = `${prefix} ${numeric}${suffix}`.replace(/\s+/g,' ').trim();
                        amountEl.textContent = composed;
                        setPayButton(composed);
                    }
                    menu.classList.add('hidden');
                    toggle.setAttribute('aria-expanded', 'false');
                });
            });

            // Close when clicking outside
            utils.addEvent(document, 'click', (e) => {
                if (!e.target.closest('.cc-total-amount-row')) {
                    menu.classList.add('hidden');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    };

    // Checkout page interactions
    const Checkout = {
        init: function() {
            if (!document.body.classList.contains('checkout-page')) return;
            const applyBtn = utils.getElement('#co_apply_btn');
            if (applyBtn) {
                utils.addEvent(applyBtn, 'click', this.applyCoupon.bind(this));
            }
        },

        applyCoupon: function() {
            const area = utils.getElement('#co_coupon_area');
            if (!area) return;
            area.innerHTML = `
             <button class="co-coupon-close" type="button" aria-label="Remove">×</button>
                <div class="co-coupon-applied">
                    <div class="co-coupon-left">
                        <div class="co-coupon-badge">Code: <span class="co-coupon-name">Winter</span></div>
                        <div class="co-coupon-note">Applied every month</div>
                    </div>
                    <div class="co-coupon-right">
                        <div class="co-coupon-percent">- 50%</div>
                        <span class="co-coupon-discount">- $43,99</span>
                       
                    </div>
                </div>`;

            const closeBtn = area.querySelector('.co-coupon-close');
            if (closeBtn) {
                utils.addEvent(closeBtn, 'click', () => {
                    area.innerHTML = `
                        <div class="co-coupon-form">
                            <input id="co_coupon_input" type="text" class="co-coupon-input" placeholder="Add discount code" />
                            <button id="co_apply_btn" class="co-apply-btn" type="button">Apply</button>
                        </div>`;
                    // Re-bind
                    const btn = utils.getElement('#co_apply_btn');
                    if (btn) utils.addEvent(btn, 'click', this.applyCoupon.bind(this));
                });
            }
        }
    };

    // Domain search UI (domain.html only)
    const DomainSearch = {
        init: function() {
            if (!document.body.classList.contains('domain-page')) return;

            const input = utils.getElement('#domain_input');
            const button = utils.getElement('#domain_search_btn');
            const results = utils.getElement('#domain_results');
            const info = utils.getElement('#domain_info');
            const help = utils.getElement('#domain_help');
            if (!input || !button || !results) return;

            utils.addEvent(button, 'click', (e) => {
                e.preventDefault();
                this.renderResults(input.value.trim(), results, info, help);
            });

            utils.addEvent(input, 'keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.renderResults(input.value.trim(), results, info, help);
                }
            });

            // Reset UI when input becomes empty
            utils.addEvent(input, 'input', () => {
                if (input.value.trim() === '') {
                    results.classList.add('hidden');
                    if (info) info.classList.remove('hidden');
                    if (help) help.classList.remove('hidden');
                }
            });
        },

        renderResults: function(query, container, info, help) {
            if (!query) {
                container.classList.add('hidden');
                return;
            }

            if (info) info.classList.add('hidden');
            if (help) help.classList.add('hidden');

            // Fake data for demo; in real app this would come from an API
            const tlds = ['.tech', '.space', '.com'];
            const base = query.replace(/\..*$/, '').toLowerCase();
            const priceMap = {
                '.tech': '43,99',
                '.space': '43,99',
                '.com': '43,99'
            };
            const suggestions = tlds.map(tld => ({
                name: `${base}${tld}`,
                price: priceMap[tld]
            }));

            const top = `
                <div class="domain-top-result">
                  <div class="domain-top-row">
                    <div class="domain-top-info">
                      <div class="domain-top-name">${this.escapeHtml(query.toLowerCase())}</div>
                      <div class="domain-top-desc">Is this your domain? Add it to alien.host</div>
                    </div>
                    <div class="domain-top-action">
                      <span class="domain-status-chip">taken</span>
                      <button class="domain-thismine-btn" onclick="location.href='cart.html'" type="button">Is mine</button>
                    </div>
                  </div>
                </div>`;

            const list = suggestions.map(s => `
                <div class="domain-suggestion">
                    <div class="name">${this.escapeHtml(s.name)}</div>
                    <div class="action">
                        <span class="domain-price-chip">$${s.price}</span>
                        <button class="domain-choose-btn" onclick="location.href='cart.html'" type="button">Choose</button>
                    </div>
                </div>`).join('');

            const html = `
                <div class="domain-suggestions">
                  <div class="domain-suggestions-header">Suggestions <label style="display:flex;align-items:center;gap:8px"><span>Hide unavailable domains?</span> <input type="checkbox" checked disabled></label></div>
                  <div class="domain-suggestions-list">${list}</div>
                </div>`;

            container.innerHTML = top + html;
            container.classList.remove('hidden');
        },

        escapeHtml: function(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    };

    // Main initialization function
    function init() {
        // Initialize all modules
        // Ensure emoji flags render consistently across platforms
        EmojiFlags.replaceAllInDOM();
        PasswordToggle.init();
        Dropdown.init();
        FormValidation.init();
        TwoFAInput.init();
        FormSubmission.init();
        
        console.log('Young Events & Travel - JavaScript initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for potential external use
    window.YoungEvents = {
        PasswordToggle,
        Dropdown,
        FormValidation,
        TwoFAInput,
        FormSubmission,
        utils
    };

})(); 