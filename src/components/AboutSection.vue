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
  background: white;
  padding: 5rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2c1810;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.title-decor {
  color: #c41e3a;
  font-size: 2rem;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.about-text {
  line-height: 1.8;
}

.lead-text {
  font-size: 1.3rem;
  color: #c41e3a;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.about-text p {
  margin-bottom: 1.5rem;
  color: #666;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}

.feature {
  text-align: center;
  padding: 1.5rem;
  background: #fff8f0;
  border-radius: 10px;
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.feature h4 {
  color: #2c1810;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #666;
  font-size: 0.9rem;
}

.about-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-placeholder {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #c41e3a 0%, #2c1810 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.image-placeholder span {
  font-size: 8rem;
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .about-content {
    gap: 2rem;
  }

  .features {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: 3rem 0;
  }

  .container {
    padding: 0 15px;
  }

  .section-title {
    font-size: 2rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .title-decor {
    font-size: 1.5rem;
  }

  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .lead-text {
    font-size: 1.1rem;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .feature {
    padding: 1.25rem;
  }

  .image-placeholder {
    height: 300px;
  }

  .image-placeholder span {
    font-size: 6rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }

  .title-decor {
    display: none;
  }

  .lead-text {
    font-size: 1rem;
  }

  .image-placeholder {
    height: 250px;
  }

  .image-placeholder span {
    font-size: 4rem;
  }
}
</style>

