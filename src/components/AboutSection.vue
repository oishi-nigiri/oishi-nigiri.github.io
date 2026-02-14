<template>
  <section id="apropos" class="about-section">
    <div class="container">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title">
            <span class="title-decor">━</span>
            Notre Histoire
            <span class="title-decor">━</span>
          </h2>
          <p class="lead-text">
            Bienvenue chez Oishi Nigiri, où la tradition japonaise rencontre l'excellence culinaire.
          </p>
          <p>
            Fondé par un chef japonais passionné, notre restaurant vous propose une expérience authentique 
            avec des ingrédients frais importés directement du Japon. Chaque plat est préparé avec soin 
            et respect de la tradition culinaire japonaise.
          </p>
          <div class="features">
            <div class="feature">
              <span class="feature-icon">🎌</span>
              <h4>Authenticité</h4>
              <p>Recettes traditionnelles japonaises</p>
            </div>
            <div class="feature">
              <span class="feature-icon">🐟</span>
              <h4>Fraîcheur</h4>
              <p>Poissons frais quotidiennement</p>
            </div>
            <div class="feature">
              <span class="feature-icon">👨‍🍳</span>
              <h4>Excellence</h4>
              <p>Chef expérimenté du Japon</p>
            </div>
          </div>
        </div>
        <div class="about-image">
          <div class="image-placeholder">
            <span>🍱</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.about-section {
  background: #141414;
  padding: 5rem 0;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  margin-bottom: 3rem;
  color: #fff;
  font-weight: 400;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.section-title .title-decor {
  color: #e85a4f;
  margin: 0 1rem;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-text {
  line-height: 1.8;
}

.lead-text {
  font-size: 1.1rem;
  color: #e85a4f;
  font-weight: 400;
  margin-bottom: 1.25rem;
}

.about-text p {
  margin-bottom: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.feature {
  text-align: center;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.feature:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(232, 90, 79, 0.3);
}

.feature-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.feature h4 {
  color: #fff;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.feature p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin: 0;
}

.about-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-placeholder {
  width: 100%;
  height: 350px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border: 1px solid rgba(232, 90, 79, 0.2);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder span {
  font-size: 6rem;
  opacity: 0.3;
}

@media (max-width: 768px) {
  .about-section {
    padding: 3.5rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 1.4rem;
    letter-spacing: 2px;
    margin-bottom: 2.5rem;
  }

  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .lead-text {
    font-size: 1rem;
  }

  .features {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .feature {
    padding: 1rem 0.5rem;
  }

  .feature-icon {
    font-size: 1.5rem;
  }

  .feature h4 {
    font-size: 0.7rem;
  }

  .feature p {
    display: none;
  }

  .image-placeholder {
    height: 250px;
  }

  .image-placeholder span {
    font-size: 4rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.2rem;
  }

  .section-title .title-decor {
    display: none;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    padding: 0.75rem 1rem;
  }

  .feature-icon {
    margin-bottom: 0;
    font-size: 1.25rem;
  }

  .feature h4 {
    font-size: 0.8rem;
  }
}
</style>

