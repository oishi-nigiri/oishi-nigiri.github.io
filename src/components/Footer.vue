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
  background: #0a0a0a;
  color: #fff;
  padding: 3rem 0 1.5rem;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  color: #fff;
  font-weight: 400;
  letter-spacing: 2px;
}

.footer-section h4 {
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
  color: #e85a4f;
  font-weight: 400;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.footer-section p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: #e85a4f;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.75rem;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .footer {
    padding: 2.5rem 0 1.5rem;
  }

  .container {
    padding: 0 1rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .footer-bottom {
    font-size: 0.7rem;
  }

  .footer-section h3 {
    font-size: 1rem;
  }
}
</style>

