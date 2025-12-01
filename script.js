
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
                const safeImageUrl = sanitizeUrl(config.imageUrl);
                if (!safeImageUrl) {
                    container.innerHTML = '<div class="loading-menu"><p>URL d\'image invalide.</p></div>';
                    return;
                }
                
                container.innerHTML = '';
                const imageContainer = document.createElement('div');
                imageContainer.className = 'weekly-menu-image-container';
                imageContainer.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; padding: 2rem;';
                
                const img = document.createElement('img');
                img.src = safeImageUrl;
                img.alt = 'Carte de la semaine';
                img.className = 'weekly-menu-image';
                img.style.cssText = 'max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); transition: transform 0.3s ease;';
                
                img.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.02)';
                });
                img.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
                
                imageContainer.appendChild(img);
                container.appendChild(imageContainer);
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
                
                const safeName = escapeHtml(String(item.name || ''));
                const safeDescription = escapeHtml(String(item.description || ''));
                const safePrice = escapeHtml(String(item.price || '0'));
                
                const header = document.createElement('div');
                header.className = 'weekly-menu-item-header';
                
                const title = document.createElement('div');
                title.className = 'weekly-menu-item-title';
                title.textContent = safeName;
                header.appendChild(title);
                
                const price = document.createElement('div');
                price.className = 'weekly-menu-item-price';
                price.textContent = safePrice + '€';
                header.appendChild(price);
                
                itemElement.appendChild(header);
                
                const description = document.createElement('div');
                description.className = 'weekly-menu-item-description';
                description.textContent = safeDescription;
                itemElement.appendChild(description);
                
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
            if (indexUrl && sanitizeUrl(indexUrl)) {
                const safeIndexUrl = sanitizeUrl(indexUrl);
                helpMessage += ` <a href="${escapeHtml(safeIndexUrl)}" target="_blank" style="color: #667eea; text-decoration: underline;">Cliquez ici pour créer l'index</a>`;
            }
        }

        container.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'loading-menu';
        
        const errorP = document.createElement('p');
        errorP.textContent = errorMessage;
        errorDiv.appendChild(errorP);
        
        if (helpMessage) {
            const helpP = document.createElement('p');
            helpP.style.cssText = 'font-size: 0.9em; margin-top: 0.5em; opacity: 0.8;';
            const linkMatch = helpMessage.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
            if (linkMatch) {
                const beforeLink = helpMessage.substring(0, helpMessage.indexOf('<a'));
                const linkText = linkMatch[2];
                const linkUrl = linkMatch[1];
                
                helpP.appendChild(document.createTextNode(beforeLink + ' '));
                const link = document.createElement('a');
                link.href = escapeHtml(linkUrl);
                link.target = '_blank';
                link.style.cssText = 'color: #667eea; text-decoration: underline;';
                link.textContent = linkText;
                helpP.appendChild(link);
            } else {
                helpP.textContent = helpMessage;
            }
            errorDiv.appendChild(helpP);
        }
        
        container.appendChild(errorDiv);
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
            
            const safeName = escapeHtml(String(member.name || ''));
            const safeRole = escapeHtml(String(member.role || ''));
            const safeDescription = member.description ? escapeHtml(String(member.description)) : null;
            const safePhoto = member.photo ? sanitizeUrl(member.photo) : null;
            
            const photoDiv = document.createElement('div');
            photoDiv.className = 'team-member-photo';
            
            if (safePhoto) {
                const img = document.createElement('img');
                img.src = safePhoto;
                img.alt = safeName;
                photoDiv.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'team-member-placeholder';
                placeholder.textContent = '👤';
                photoDiv.appendChild(placeholder);
            }
            
            memberCard.appendChild(photoDiv);
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'team-member-info';
            
            const nameH3 = document.createElement('h3');
            nameH3.className = 'team-member-name';
            nameH3.textContent = safeName;
            infoDiv.appendChild(nameH3);
            
            const roleP = document.createElement('p');
            roleP.className = 'team-member-role';
            roleP.textContent = safeRole;
            infoDiv.appendChild(roleP);
            
            if (safeDescription) {
                const descP = document.createElement('p');
                descP.className = 'team-member-description';
                descP.textContent = safeDescription;
                infoDiv.appendChild(descP);
            }
            
            memberCard.appendChild(infoDiv);
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

    const recruitmentBtn = document.getElementById('recrutement-btn');
    const recruitmentModal = document.getElementById('recruitment-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    
    if (recruitmentBtn && recruitmentModal) {
        recruitmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openRecruitmentModal();
        });
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeRecruitmentModal);
    }
    
    if (recruitmentModal) {
        recruitmentModal.addEventListener('click', (e) => {
            if (e.target === recruitmentModal) {
                closeRecruitmentModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && recruitmentModal.classList.contains('active')) {
                closeRecruitmentModal();
            }
        });
    }
    
    const recruitmentForm = document.getElementById('recruitment-form');
    if (recruitmentForm) {
        recruitmentForm.addEventListener('submit', handleRecruitmentSubmit);
    }
});

function openRecruitmentModal() {
    const modal = document.getElementById('recruitment-modal');
    if (modal) {
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
    }
}

function closeRecruitmentModal() {
    const modal = document.getElementById('recruitment-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
            }
        }, 200);
        document.body.style.overflow = '';
    }
}

function truncateText(text, maxLength = 1024) {
    if (!text || text.length <= maxLength) {
        return text || '';
    }
    return text.substring(0, maxLength - 3) + '...';
}

async function handleRecruitmentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('.submit-button');
    const messageDiv = document.getElementById('form-message');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
    messageDiv.className = 'form-message';
    messageDiv.style.display = 'none';
    
    const nomPrenom = form.querySelector('#nom-prenom').value.trim();
    const emailDiscord = form.querySelector('#email-discord').value.trim();
    const motivations = form.querySelector('#motivations').value.trim();
    const experiences = form.querySelector('#experiences').value.trim();
    const espritEquipeRadio = form.querySelector('input[name="esprit-equipe"]:checked');
    const espritEquipe = espritEquipeRadio ? espritEquipeRadio.value === 'oui' : false;
    const motFin = form.querySelector('#mot-fin').value.trim();
    
    if (!nomPrenom || !emailDiscord || !motivations || !espritEquipeRadio) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Veuillez remplir tous les champs obligatoires.';
        messageDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Envoyer ma candidature';
        return;
    }
    
    const webhookUrl = 'https://discord.com/api/webhooks/1387143202825441332/OugXbubAkFW7B_ntaKlfY-nQwPKqQU225kERi4Lze6Q_74B-rJ0cUw_-n1WilcX2AEl0';
    const roleId = '1115376476875923476';
    
    const embed = {
        title: '🎯 Nouvelle Candidature',
        color: 0xc41e3a,
        fields: [
            {
                name: '👤 Nom & Prénom',
                value: truncateText(escapeHtml(nomPrenom)) || '*Non renseigné*',
                inline: false
            },
            {
                name: '📧 Email / Pseudo Discord',
                value: truncateText(escapeHtml(emailDiscord)) || '*Non renseigné*',
                inline: false
            },
            {
                name: '💭 Motivations',
                value: truncateText(escapeHtml(motivations)) || '*Non renseigné*',
                inline: false
            },
            {
                name: '📚 Expériences',
                value: truncateText(escapeHtml(experiences)) || '*Aucune expérience renseignée*',
                inline: false
            },
            {
                name: '🤝 Esprit d\'équipe',
                value: espritEquipe ? '✅ Oui' : '❌ Non',
                inline: true
            },
            {
                name: '💬 Le mot de la fin',
                value: truncateText(escapeHtml(motFin)) || '*Aucun message*',
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Formulaire de recrutement - Oishi Nigiri'
        }
    };
    
    const payload = {
        content: `<@&${roleId}>`,
        embeds: [embed]
    };
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = '✅ Votre candidature a été envoyée avec succès ! Nous vous recontacterons bientôt.';
            messageDiv.style.display = 'block';
            form.reset();
            
            setTimeout(() => {
                closeRecruitmentModal();
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer ma candidature';
            }, 2000);
        } else {
            throw new Error('Erreur lors de l\'envoi');
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du formulaire:', error);
        messageDiv.className = 'form-message error';
        messageDiv.textContent = '❌ Une erreur est survenue lors de l\'envoi. Veuillez réessayer plus tard.';
        messageDiv.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'Envoyer ma candidature';
    }
}
