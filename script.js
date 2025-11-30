
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        }
    });
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.menu-category, .about-content, .contact-content, .feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitButton = contactForm.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Envoi en cours...';
        submitButton.disabled = true;

        setTimeout(() => {
            submitButton.textContent = 'Message envoyé ! ✓';
            submitButton.style.background = '#28a745';
            contactForm.reset();

            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.style.background = '';
                submitButton.disabled = false;
            }, 3000);
        }, 1500);
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});


async function loadWeeklyMenu() {
    const container = document.getElementById('weekly-menu-container');

    if (!container) return;

    try {

        if (typeof db === 'undefined') {
            container.innerHTML = '<div class="loading-menu"><p>Configuration Firebase requise.</p></div>';
            return;
        }

        const isLoading = !container.querySelector('.weekly-menu-category-section') && !container.querySelector('.weekly-menu-image-container');
        if (isLoading) {
            container.innerHTML = '<div class="loading-menu"><p>Chargement de la carte...</p></div>';
        }

        const getWithCache = async (query) => {
            try {
                const cacheResult = await query.get({ source: 'cache' });
                query.get({ source: 'server' }).catch(() => {});
                return cacheResult;
            } catch {
                return await query.get();
            }
        };

        const configDoc = await getWithCache(db.collection('menuConfig').doc('display'));
        
        if (configDoc.exists) {
            const config = configDoc.data();
            if (config.useImageMode && config.imageUrl) {
                container.innerHTML = `
                    <div class="weekly-menu-image-container" style="grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; padding: 2rem;">
                        <img src="${config.imageUrl}" alt="Carte de la semaine" class="weekly-menu-image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); transition: transform 0.3s ease;">
                    </div>
                `;
                const img = container.querySelector('.weekly-menu-image');
                if (img) {
                    img.addEventListener('mouseenter', () => {
                        img.style.transform = 'scale(1.02)';
                    });
                    img.addEventListener('mouseleave', () => {
                        img.style.transform = 'scale(1)';
                    });
                }
                return;
            }
        }

        const [menuSnapshot, categoriesSnapshot] = await Promise.all([
            getWithCache(db.collection('menuSemaine')),
            getWithCache(db.collection('menuCategories').orderBy('order', 'asc'))
        ]);

        if (menuSnapshot.empty) {
            container.innerHTML = '<div class="loading-menu"><p>Aucune carte de la semaine disponible pour le moment.</p></div>';
            return;
        }

        const menuByCategory = {};

        menuSnapshot.forEach(doc => {
            const item = doc.data();
            if (!menuByCategory[item.category]) {
                menuByCategory[item.category] = [];
            }
            menuByCategory[item.category].push(item);
        });

        Object.keys(menuByCategory).forEach(category => {
            menuByCategory[category].sort((a, b) => {
                return (a.name || '').localeCompare(b.name || '');
            });
        });

        const categoriesMap = {};
        categoriesSnapshot.forEach(doc => {
            const cat = doc.data();
            categoriesMap[cat.name] = cat.order || 999;
        });

        const sortedCategories = Object.keys(menuByCategory).sort((a, b) => {
            const orderA = categoriesMap[a] !== undefined ? categoriesMap[a] : 999;
            const orderB = categoriesMap[b] !== undefined ? categoriesMap[b] : 999;
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
        });

        const fragment = document.createDocumentFragment();
        const itemsToAnimate = [];

        sortedCategories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'weekly-menu-category-section';
            categorySection.style.gridColumn = '1 / -1';
            categorySection.style.marginBottom = '2rem';

            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'weekly-menu-category-title';
            categoryTitle.textContent = category;
            categorySection.appendChild(categoryTitle);

            const categoryItems = document.createElement('div');
            categoryItems.className = 'weekly-menu-grid';
            categoryItems.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            categoryItems.style.gap = '2rem';
            categoryItems.style.marginTop = '1.5rem';

            menuByCategory[category].forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'weekly-menu-item';
                const name = item.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const description = item.description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                itemElement.innerHTML = `
                    <div class="weekly-menu-item-header">
                        <div class="weekly-menu-item-title">
                            ${name}
                        </div>
                        <div class="weekly-menu-item-price">${item.price}€</div>
                    </div>
                    <div class="weekly-menu-item-description">${description}</div>
                `;
                categoryItems.appendChild(itemElement);
                itemsToAnimate.push(itemElement);
            });

            categorySection.appendChild(categoryItems);
            fragment.appendChild(categorySection);
        });

        container.innerHTML = '';
        container.appendChild(fragment);

        requestAnimationFrame(() => {
            itemsToAnimate.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        });

    } catch (error) {
        console.error('Erreur lors du chargement de la carte de la semaine:', error);

        let errorMessage = 'Erreur lors du chargement de la carte. Veuillez réessayer plus tard.';
        let helpMessage = '';

        if (error.code === 'permission-denied' || error.message?.includes('permission')) {
            errorMessage = 'Erreur de permissions Firestore. Veuillez configurer les règles de sécurité dans Firebase Console.';
            helpMessage = 'Consultez CONFIGURATION_FIRESTORE.md pour configurer les règles Firestore.';
        }

        else if (error.code === 'failed-precondition' && error.message?.includes('index')) {
            errorMessage = 'Un index Firestore est requis pour cette requête.';
            helpMessage = 'Consultez CREATION_INDEX_FIRESTORE.md pour créer l\'index.';
            const indexUrl = error.message.match(/https:\/\/[^\s]+/)?.[0];
            if (indexUrl) {
                helpMessage += ` <a href="${indexUrl}" target="_blank" style="color: #667eea; text-decoration: underline;">Cliquez ici pour créer l'index</a>`;
            }
        }

        container.innerHTML = `<div class="loading-menu"><p>${errorMessage}</p>${helpMessage ? `<p style="font-size: 0.9em; margin-top: 0.5em; opacity: 0.8;">${helpMessage}</p>` : ''}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            clearInterval(checkFirebase);
            loadWeeklyMenu();

            db.collection('menuSemaine')
                .onSnapshot((snapshot) => {
                    loadWeeklyMenu();
                });
            
            db.collection('menuConfig').doc('display')
                .onSnapshot((snapshot) => {
                    loadWeeklyMenu();
                });
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkFirebase);
        if (typeof db === 'undefined') {
            const container = document.getElementById('weekly-menu-container');
            if (container) {
                container.innerHTML = '<div class="loading-menu"><p>Erreur : Firebase n\'est pas initialisé. Vérifiez votre configuration.</p></div>';
            }
        }
    }, 5000);
});

async function loadOrganigramme() {
    const container = document.getElementById('organigramme-container');

    if (!container) return;

    try {
        if (typeof db === 'undefined') {
            container.innerHTML = '<div class="loading-menu"><p>Configuration Firebase requise.</p></div>';
            return;
        }

        const membersSnapshot = await db.collection('organigramme').get();

        if (membersSnapshot.empty) {
            container.innerHTML = '<div class="loading-menu"><p>Aucun membre de l\'équipe pour le moment.</p></div>';
            return;
        }

        const members = [];
        membersSnapshot.forEach(doc => {
            members.push({ id: doc.id, ...doc.data() });
        });

        members.sort((a, b) => (a.order || 0) - (b.order || 0));

        container.innerHTML = '';

        members.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'team-member-card';
            memberCard.innerHTML = `
                <div class="team-member-photo">
                    ${member.photo ? `<img src="${member.photo}" alt="${member.name}">` : '<div class="team-member-placeholder">👤</div>'}
                </div>
                <div class="team-member-info">
                    <h3 class="team-member-name">${member.name}</h3>
                    <p class="team-member-role">${member.role}</p>
                    ${member.description ? `<p class="team-member-description">${member.description}</p>` : ''}
                </div>
            `;
            container.appendChild(memberCard);
        });

    } catch (error) {
        console.error('Erreur lors du chargement de l\'organigramme:', error);
        container.innerHTML = '<div class="loading-menu"><p>Erreur lors du chargement de l\'équipe.</p></div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            clearInterval(checkFirebase);
            setTimeout(() => {
                loadOrganigramme();
            }, 500);
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkFirebase);
        if (typeof db !== 'undefined') {
            loadOrganigramme();
        }
    }, 5000);
});
