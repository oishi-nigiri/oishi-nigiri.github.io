<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Oishi Nigiri</h3>
          <p>L'authenticité du Japon dans chaque bouchée.</p>
        </div>
        <div class="footer-section">
          <h4>Navigation</h4>
          <ul>
            <li><a href="#/" @click.prevent="scrollTo('accueil')">Accueil</a></li>
            <li><a href="#/" @click.prevent="scrollTo('carte-semaine')">Menu</a></li>
            <li><a href="#/" @click.prevent="scrollTo('apropos')">À Propos</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Oishi Nigiri GPRP. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const scrollTo = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const offsetTop = element.offsetTop - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
.footer {
  background: #2c1810;
  color: #fff8f0;
  padding: 3rem 0 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: #f5deb3;
}

.footer-section p {
  color: #666;
  font-size: 0.9rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #c41e3a;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1rem;
  }

  .container {
    padding: 0 15px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }

  .footer-section {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .footer-bottom {
    font-size: 0.8rem;
  }
}
</style>

