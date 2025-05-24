document.addEventListener('DOMContentLoaded', () => {
            // --- DOM Elements ---
            const quizForm = document.getElementById('quizForm');
            const quizSteps = document.querySelectorAll('.quiz-step');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const resultContainer = document.getElementById('resultContainer');
            const feedbackFormContainer = document.getElementById('feedbackFormContainer');
            const feedbackForm = document.getElementById('feedbackForm');
            const cancelFeedbackButton = document.getElementById('cancelFeedback');
            const restartQuizFromFeedbackButton = document.getElementById('restartQuizFromFeedback');

            const themeToggle = document.getElementById('themeToggle');
            const body = document.body;

            // --- Page Navigation ---
            const pageSections = document.querySelectorAll('.page-section');
            const navLinks = document.querySelectorAll('.nav-links a, .brand-logo, .btn-primary[data-section="quiz"]');

            function showSection(sectionId) {
                pageSections.forEach(section => {
                    section.classList.add('hidden');
                    section.classList.remove('active');
                });
                const activeSection = document.getElementById(sectionId);
                if (activeSection) {
                    activeSection.classList.remove('hidden');
                    activeSection.classList.add('active');

                    // If going to quiz, initialize its state
                    if (sectionId === 'quiz') {
                        restartQuiz(); // Always start quiz from beginning when navigating to the page
                    }
                }
            }

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = e.currentTarget.dataset.section;
                    if (sectionId) {
                        showSection(sectionId);
                    }
                });
            });

            // --- Dark Theme Logic ---
            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-theme');
                body.classList.toggle('light-theme');
                // Save user preference in localStorage
                if (body.classList.contains('dark-theme')) {
                    localStorage.setItem('theme', 'dark');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark theme
                } else {
                    localStorage.setItem('theme', 'light');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light theme
                }
            });

            // Apply theme when page loads
            function applySavedTheme() {
                const savedTheme = localStorage.getItem('theme') || 'light';
                if (savedTheme === 'dark') {
                    body.classList.remove('light-theme');
                    body.classList.add('dark-theme');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                } else {
                    body.classList.remove('dark-theme');
                    body.classList.add('light-theme');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                }
            }
            applySavedTheme();

            // --- Quiz Logic ---
            let currentStep = 0;
            const totalSteps = quizSteps.length;
            let quizAnswers = {};

            function showErrorMessage(message) {
                let errorMessageDiv = document.querySelector('.error-message');
                if (!errorMessageDiv) {
                    errorMessageDiv = document.createElement('div');
                    errorMessageDiv.classList.add('error-message');
                    document.body.appendChild(errorMessageDiv);
                }
                errorMessageDiv.textContent = message;
                errorMessageDiv.style.display = 'block';

                setTimeout(() => {
                    errorMessageDiv.style.display = 'none';
                }, 3000);
            }

            function updateProgressBar() {
                const progress = ((currentStep + 1) / totalSteps) * 100;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
            }

            function nextStep() {
                const activeStep = quizSteps[currentStep];
                const inputs = activeStep.querySelectorAll('input[type="radio"], input[type="checkbox"]');
                let isValid = false;

                if (inputs.length > 0) {
                    isValid = Array.from(inputs).some(input => input.checked);
                } else {
                    isValid = true;
                }

                if (!isValid) {
                    showErrorMessage('Please select an answer to continue.');
                    return;
                }

                const stepName = inputs[0] ? inputs[0].name : `step${currentStep + 1}`;
                if (inputs[0] && inputs[0].type === 'checkbox') {
                    quizAnswers[stepName] = Array.from(inputs)
                        .filter(input => input.checked)
                        .map(input => input.value);
                } else if (inputs[0] && inputs[0].type === 'radio') {
                    const selected = Array.from(inputs).find(input => input.checked);
                    if (selected) {
                        quizAnswers[stepName] = selected.value;
                    }
                }

                activeStep.classList.remove('active');
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    quizSteps[currentStep].classList.add('active');
                    updateProgressBar();
                }
                console.log('Current quiz answers:', quizAnswers);
            }

            function prevStep() {
                if (currentStep > 0) {
                    quizSteps[currentStep].classList.remove('active');
                    currentStep--;
                    quizSteps[currentStep].classList.add('active');
                    updateProgressBar();
                }
            }

            function clearForm() {
                quizAnswers = {};
                quizSteps.forEach(step => {
                    step.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
                    step.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
                    step.classList.remove('active');
                    // Remove selected styling
                    step.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
                });
                quizSteps[0].classList.add('active');
                currentStep = 0;
                updateProgressBar();
            }

            function restartQuiz() {
                clearForm();
                resultContainer.classList.add('hidden');
                feedbackFormContainer.classList.add('hidden');
                quizForm.classList.remove('hidden');
                quizForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll to quiz
                console.log('Quiz restarted.');
            }

            quizSteps.forEach(step => {
                const nextButton = step.querySelector('.btn-next');
                const prevButton = step.querySelector('.btn-prev');

                if (nextButton) {
                    nextButton.addEventListener('click', nextStep);
                }
                if (prevButton) {
                    prevButton.addEventListener('click', prevStep);
                }

                // Add event listeners for option card selection
                const optionCards = step.querySelectorAll('.option-card');
                optionCards.forEach(card => {
                    card.addEventListener('click', () => {
                        const input = card.querySelector('input');
                        if (input.type === 'radio') {
                            // Deselect all other radio buttons in the same step
                            card.closest('.options-grid').querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                        }
                        // Toggle selected class for checkbox, add for radio
                        if (input.checked) {
                            card.classList.remove('selected');
                            input.checked = false;
                        } else {
                            card.classList.add('selected');
                            input.checked = true;
                        }
                    });
                });
            });

            quizForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const activeStep = quizSteps[currentStep];
                const inputs = activeStep.querySelectorAll('input[type="radio"], input[type="checkbox"]');
                let isValid = false;

                if (inputs.length > 0) {
                    isValid = Array.from(inputs).some(input => input.checked);
                } else {
                    isValid = true;
                }

                if (!isValid) {
                    showErrorMessage('Please select an answer to get recommendations.');
                    return;
                }

                const stepName = inputs[0] ? inputs[0].name : `step${currentStep + 1}`;
                if (inputs[0] && inputs[0].type === 'checkbox') {
                    quizAnswers[stepName] = Array.from(inputs)
                        .filter(input => input.checked)
                        .map(input => input.value);
                } else if (inputs[0] && inputs[0].type === 'radio') {
                    const selected = Array.from(inputs).find(input => input.checked);
                    if (selected) {
                        quizAnswers[stepName] = selected.value;
                    }
                }

                console.log('All quiz answers:', quizAnswers);
                const recommendations = getRecommendation(quizAnswers);

                showResult(recommendations);
            });

            function showResult(recommendations) {
                quizForm.classList.add('hidden');
                resultContainer.classList.remove('hidden');
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

                let recommendationsHTML = `
                    <h2><i class="fas fa-route"></i> Your Recommendations:</h2>
                    <p>Here are the perfect travel destinations based on your answers:</p>
                    <div class="recommendations-grid">
                `;

                if (recommendations.length > 0) {
                    recommendations.forEach(rec => {
                        const tagsHtml = rec.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                        const detailsHtml = `
                            ${rec.budget ? `<span class="detail-item"><i class="fas fa-dollar-sign"></i> ${rec.budget === 'low' ? 'Budget' : rec.budget === 'medium' ? 'Mid-range' : 'Premium'}</span>` : ''}
                            ${rec.season ? `<span class="detail-item"><i class="fas fa-sun"></i> ${rec.season === 'spring' ? 'Spring' : rec.season === 'summer' ? 'Summer' : rec.season === 'autumn' ? 'Autumn' : rec.season === 'winter' ? 'Winter' : 'Any season'}</span>` : ''}
                            ${rec.duration ? `<span class="detail-item"><i class="fas fa-hourglass-half"></i> ${rec.duration === 'short' ? '2-3 days' : rec.duration === 'medium' ? '4-7 days' : '1+ week'}</span>` : ''}
                        `;

                        recommendationsHTML += `
                            <div class="result-card">
                                <div class="result-image" style="background-image: url('${rec.image || 'https://placehold.co/600x400?text=Destination'}');"></div>
                                <div class="result-content">
                                    <h3>${rec.name}</h3>
                                    <p>${rec.description}</p>
                                    <div class="result-details">
                                        ${detailsHtml}
                                    </div>
                                    <div class="result-tags">
                                        ${tagsHtml}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    recommendationsHTML += `<p>Unfortunately, we couldn't find perfect matches for your criteria. Try changing your answers!</p>`;
                }

                recommendationsHTML += `
                    </div>
                    <div class="section-actions">
                        <button type="button" class="btn-primary" id="showFeedbackFormButton"><i class="fas fa-comment-dots"></i> Leave Feedback</button>
                        <button type="button" class="btn-secondary" id="restartQuizButtonAfterResults"><i class="fas fa-redo"></i> Try Again</button>
                    </div>
                `;

                resultContainer.innerHTML = recommendationsHTML;

                const showFeedbackBtn = document.getElementById('showFeedbackFormButton');
                const restartAfterResultsBtn = document.getElementById('restartQuizButtonAfterResults');

                if(showFeedbackBtn) {
                    showFeedbackBtn.addEventListener('click', () => {
                        resultContainer.classList.add('hidden');
                        feedbackFormContainer.classList.remove('hidden');
                        feedbackFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }

                if(restartAfterResultsBtn) {
                    restartAfterResultsBtn.addEventListener('click', restartQuiz);
                }
            }

            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const rating = document.getElementById('rating').value;
                const comments = document.getElementById('comments').value;

                console.log('Feedback submitted:', { rating, comments });
                showErrorMessage('Thank you for your feedback!');

                feedbackFormContainer.classList.add('hidden');
                resultContainer.classList.remove('hidden');

                const restartAfterResultsBtn = document.getElementById('restartQuizButtonAfterResults');
                if (restartAfterResultsBtn) {
                    restartAfterResultsBtn.classList.remove('hidden');
                }
                const showFeedbackBtn = document.getElementById('showFeedbackFormButton');
                if (showFeedbackBtn) {
                    showFeedbackBtn.classList.add('hidden'); // Hide feedback button after submitting
                }

                document.getElementById('rating').value = '0';
                feedbackForm.querySelectorAll('.rating-stars i').forEach(s => {
                    s.classList.remove('fas');
                    s.classList.add('far');
                });
                document.getElementById('comments').value = '';
            });

            const ratingStars = feedbackForm.querySelectorAll('.rating-stars i');
            const ratingInput = document.getElementById('rating');

            ratingStars.forEach(star => {
                star.addEventListener('click', function() {
                    const value = parseInt(this.dataset.value);
                    ratingInput.value = value;
                    ratingStars.forEach(s => {
                        s.classList.remove('fas', 'far');
                        if (parseInt(s.dataset.value) <= value) {
                            s.classList.add('fas');
                        } else {
                            s.classList.add('far');
                        }
                    });
                });
            });

            if (cancelFeedbackButton) {
                cancelFeedbackButton.addEventListener('click', () => {
                    feedbackFormContainer.classList.add('hidden');
                    resultContainer.classList.remove('hidden');

                    const restartAfterResultsBtn = document.getElementById('restartQuizButtonAfterResults');
                    if (restartAfterResultsBtn) {
                        restartAfterResultsBtn.classList.remove('hidden');
                    }
                    const showFeedbackBtn = document.getElementById('showFeedbackFormButton');
                    if (showFeedbackBtn) {
                        showFeedbackBtn.classList.remove('hidden');
                    }
                });
            }

            if (restartQuizFromFeedbackButton) {
                restartQuizFromFeedbackButton.addEventListener('click', restartQuiz);
            }

            // --- Recommendation Logic (with updated images) ---
            const allRecommendations = [
                // Relax
                {
                    name: "Bali, Indonesia",
                    description: "The enchanting 'Island of the Gods' where emerald jungles meet turquoise waves. Immerse yourself in ancient Hindu temples at sunrise, unwind at world-class beachfront spas, or find zen in a cliffside yoga session. The rhythmic gamelan music, fragrant frangipani flowers, and warm Balinese smiles create a paradise for soul-searching travelers and honeymooners alike.",
                    image: "https://images.pexels.com/photos/1643130/pexels-photo-1643130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                    style: ["relax", "nature", "culture"],
                    budget: "medium",
                    season: ["summer", "spring", "autumn"],
                    duration: "long",
                    special: ["romantic", "solo"],
                    tags: ["Beach", "Spa", "Yoga", "Culture"]
                },
                {
                    name: "Maldives",
                    description: "Exclusive vacation on white-sand beaches, overwater bungalows, diving and complete relaxation. Designed for luxury and romantic seclusion.",
                    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&auto=format&fit=crop&q=60",
                    style: ["relax"],
                    budget: "high",
                    season: ["winter", "spring", "summer"],
                    duration: "medium",
                    special: ["romantic"],
                    tags: ["Luxury", "Beach", "Diving", "Seclusion"]
                },
                {
                    name: "Canary Islands, Spain",
                    description: "Where Europe meets Africa under perpetual sunshine. Hike lunar-like volcanic craters at dawn, black sand beaches glow under your feet, while banana plantations scent the ocean breeze. By night, stargaze at some of the world's clearest skies. Perfect for active families and couples seeking diverse landscapes with year-round spring climate.",
                    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=60",
                    style: ["relax", "adventure", "nature", "family"],
                    budget: "medium",
                    season: ["winter", "spring", "summer", "autumn"],
                    duration: "medium",
                    special: ["family"],
                    tags: ["Beach", "Active", "Nature", "Europe"]
                },
                // Adventure
                {
                    name: "Nepal (Himalayas)",
                    description: "Trekking in the Himalayas, cultural discoveries in Kathmandu, encounters with Buddhist monks. For those seeking physical challenges and spiritual experiences.",
                    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=60",
                    style: ["adventure", "nature", "culture"],
                    budget: "medium",
                    season: ["spring", "autumn"],
                    duration: "long",
                    special: ["solo"],
                    tags: ["Trekking", "Mountains", "Culture", "Extreme"]
                },
                {
                    name: "New Zealand",
                    description:"Midle-earth comes alive with heart-pumping adventures! Bungee jump where the sport was born, raft through glowworm-lit caves, then heli-hike active glaciers. When your adrenaline crashes, soak in geothermal hot springs under the Southern Cross. Every landscape feels stolen from a fantasy novel",
                    image: "https://images.unsplash.com/photo-1547314283-befb6cc5cf29?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    style: ["adventure", "nature"],
                    budget: "high",
                    season: ["summer", "autumn"],
                    duration: "long",
                    special: ["solo"],
                    tags: ["Extreme Sports", "Nature", "Fjords", "Hiking"]
                },
                // Culture
                {
                    name: "Rome, Italy",
                    description: "Colosseum, Vatican, Roman Forum, Trevi Fountain. Historical landmarks at every turn, delicious cuisine and the special atmosphere of the eternal city.",
                    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=60",
                    style: ["culture", "food", "city_break"],
                    budget: "medium",
                    season: ["spring", "autumn"],
                    duration: "short",
                    special: ["romantic"],
                    tags: ["History", "Architecture", "Gastronomy", "City", "Europe"]
                },
                {
                    name: "Kyoto, Japan",
                    description: "Ancient temples, traditional gardens, geishas and tea ceremonies. Immersion in unique Japanese culture and traditions.",
                    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&auto=format&fit=crop&q=60",
                    style: ["culture", "food"],
                    budget: "high",
                    season: ["spring", "autumn"],
                    duration: "medium",
                    special: ["solo"],
                    tags: ["Temples", "Traditions", "Japan", "Gardens"]
                },
                // Food
                {
                    name: "Provence, France",
                    description: "Lavender fields, vineyards, local markets and exquisite dishes. A journey for gourmets and wine connoisseurs.",
                    image: "https://images.unsplash.com/photo-1500380804539-4e1e8c1e7118?w=600&auto=format&fit=crop&q=60",
                    style: ["food", "relax", "nature"],
                    budget: "medium",
                    season: ["summer"],
                    duration: "medium",
                    special: ["romantic"],
                    tags: ["Wine", "French Cuisine", "Nature", "Countryside"]
                },
                {
                    name: "Bologna, Italy",
                    description: "Culinary capital of Italy, home of Bolognese pasta and other delicacies. Perfect for gastronomic tourism.",
                    image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&auto=format&fit=crop&q=60",
                    style: ["food", "culture", "city_break"],
                    budget: "low",
                    season: ["spring", "autumn"],
                    duration: "short",
                    special: [],
                    tags: ["Italian Cuisine", "City", "Cooking Classes"]
                },
                // Nature
                {
                    name: "Yosemite National Park, USA",
                    description: "Grand cliffs, waterfalls, deep valleys and majestic sequoias. For lovers of hiking, camping and nature photography.",
                    image: "https://images.pexels.com/photos/21771042/pexels-photo-21771042/free-photo-of-mountain-nights.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                    style: ["nature", "adventure"],
                    budget: "medium",
                    season: ["summer", "spring", "autumn"],
                    duration: "medium",
                    special: ["family", "solo"],
                    tags: ["Hiking", "National Park", "Waterfalls", "Camping"]
                },
                {
                    name: "Iceland",
                    description: "Glaciers, hot springs, waterfalls and northern lights. Unique natural landscapes for unforgettable experiences.",
                    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&auto=format&fit=crop&q=60",
                    style: ["nature", "adventure"],
                    budget: "high",
                    season: ["winter", "summer"],
                    duration: "medium",
                    special: ["solo"],
                    tags: ["Glaciers", "Northern Lights", "Waterfalls", "Hot Springs"]
                },
                // City Break
                {
                    name: "New York, USA",
                    description: "The city that never sleeps: world-class museums, theater shows, shopping and countless restaurants.",
                    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=600&auto=format&fit=crop&q=60",
                    style: ["city_break", "culture", "food"],
                    budget: "high",
                    season: ["all"],
                    duration: "short",
                    special: ["solo", "family"],
                    tags: ["Museums", "Shopping", "Theaters", "Nightlife"]
                },
                {
                    name: "Berlin, Germany",
                    description: "City with rich history, vibrant art scene, museums and nightlife. Modern and dynamic.",
                    image: "https://images.pexels.com/photos/1128408/pexels-photo-1128408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                    style: ["city_break", "culture", "food"],
                    budget: "medium",
                    season: ["all"],
                    duration: "short",
                    special: ["solo"],
                    tags: ["History", "Art", "Nightlife", "Museums", "Europe"]
                },
                {
                    name: "Paris, France",
                    description: "City of love and light, famous for its architecture, museums, fashion and exquisite cuisine.",
                    image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=600&auto=format&fit=crop&q=60",
                    style: ["culture", "food", "city_break", "romantic"],
                    budget: "high",
                    season: ["spring", "autumn"],
                    duration: "short",
                    special: ["romantic"],
                    tags: ["Romance", "Art", "Fashion", "Europe"]
                },
                {
                    name: "Thailand",
                    description: "From the golden spires of Bangkok's Grand Palace to the limestone karsts of Krabi, this is Asia's smile-filled playground. Train with elephants in jungle sanctuaries, float through flower markets at dawn, then party on bioluminescent beaches. The land of a thousand temples knows how to feed your soul - and your Instagram feed",
                    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&auto=format&fit=crop&q=60",
                    style: ["relax", "adventure", "culture", "food"],
                    budget: "medium",
                    season: ["winter", "spring"],
                    duration: "long",
                    special: ["solo", "family"],
                    tags: ["Beaches", "Temples", "Cuisine", "Exotic"]
                },
                {
                    name: "Cape Town, South Africa",
                    description: "Amazing nature, scenic beaches, Table Mountain and rich history. A place for adventure and exploration.",
                    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&auto=format&fit=crop&q=60",
                    style: ["adventure", "nature", "culture", "city_break"],
                    budget: "medium",
                    season: ["autumn", "spring"],
                    duration: "medium",
                    special: ["solo", "romantic"],
                    tags: ["Mountains", "Beaches", "Culture", "Safari"]
                }
            ];

            function getRecommendation(answers) {
                console.log('Starting recommendation matching for answers:', answers);

                const userStyles = Array.isArray(answers.style) ? answers.style : [];
                const userBudget = answers.budget;
                const userSeason = answers.season;
                const userDuration = answers.duration;
                const userSpecial = Array.isArray(answers.special) ? answers.special : [];

                let matchedRecommendations = allRecommendations.map(rec => {
                    let score = 0;

                    if (userStyles.length > 0) {
                        const styleMatch = userStyles.some(style => rec.style.includes(style));
                        if (styleMatch) {
                            score += 3;
                        }
                    }
                    if (userBudget === rec.budget) {
                        score += 2;
                    }

                    if (rec.season.includes(userSeason) || rec.season.includes("all")) {
                        score += 2;
                    }

                    if (userDuration === rec.duration) {
                        score += 1;
                    }
                    if (userSpecial.length > 0) {
                        const specialMatch = userSpecial.some(s => rec.special.includes(s));
                        if (specialMatch) {
                            score += 1;
                        }
                    }

                    return { ...rec, score };
                });

              
                matchedRecommendations = matchedRecommendations.filter(rec => rec.score > 0);
                matchedRecommendations.sort((a, b) => b.score - a.score);

                console.log('Matched recommendations with scores:', matchedRecommendations);
                let finalRecommendations = [];
                if (matchedRecommendations.length > 0) {
                    const maxScore = matchedRecommendations[0].score;
                
                    finalRecommendations = matchedRecommendations.filter(rec => rec.score === maxScore);
                    console.log('Found perfect matches:', finalRecommendations);
                }

                if (finalRecommendations.length === 0 && matchedRecommendations.length > 0) {
                    finalRecommendations = matchedRecommendations.slice(0, 3); 
                    console.log('No exact matches found, taking top-3:', finalRecommendations);
                } else if (finalRecommendations.length > 5) {
              
                    finalRecommendations = finalRecommendations.slice(0, 5);
                }

               
                if (finalRecommendations.length === 0) {
                    console.log('No exact or good matches found. Generating random recommendations.');
                    const shuffled = [...allRecommendations].sort(() => 0.5 - Math.random());
                    return shuffled.slice(0, 3);
                }

                return finalRecommendations;
            }

            // --- Function to render gallery on home page ---
            function renderGallery() {
                const galleryGrid = document.querySelector('.gallery-grid');
                if (!galleryGrid) return;

                let galleryHTML = '';
                // Select 6 random recommendations for gallery
                const shuffledRecommendations = [...allRecommendations].sort(() => 0.5 - Math.random()).slice(0, 6);

                shuffledRecommendations.forEach(rec => {
                    const tagsHtml = rec.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                    galleryHTML += `
                        <div class="result-card gallery-card">
                            <div class="result-image" style="background-image: url('${rec.image || 'https://placehold.co/600x400?text=Destination'}');"></div>
                            <div class="result-content">
                                <h3>${rec.name}</h3>
                                <p>${rec.description}</p>
                                <div class="result-tags">
                                    ${tagsHtml}
                                </div>
                            </div>
                        </div>
                    `;
                });
                galleryGrid.innerHTML = galleryHTML;
            }

            // --- Initialize when page loads ---
            updateProgressBar(); // Initialize progress bar for quiz
            renderGallery();     // Fill gallery on home page
            showSection('home'); // Show home page by default
        });