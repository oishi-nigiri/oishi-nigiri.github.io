<template>
  <Transition name="laugh-fall">
    <div v-if="isTrolledUser && isVisible" class="troll-overlay">
      <div class="emoji-rain">
        <span v-for="n in 20" :key="n" class="falling-emoji" :style="emojiStyle(n)">😂</span>
      </div>
      <div class="troll-modal">
        <div class="troll-header">
          <i class="fas fa-laugh-squint"></i>
        </div>
        <h1 class="troll-text">Connasse</h1>
        <div class="emoji-rain-bottom">
          <span v-for="n in 20" :key="n" class="falling-emoji" :style="emojiStyle(n)">🤣</span>
        </div>
        <button class="troll-close-btn" @click="closeTroll">
          Je suis désolée 😔
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
const isVisible = ref(false)

const trolledEmails = [
  'rompteau.cassandra@gmail.com',
  'zyrexiw.dev@gmail.com'
]

onMounted(() => {
  isVisible.value = true
})

const isTrolledUser = computed(() => {
  return user.value && trolledEmails.includes(user.value.email)
})

const closeTroll = () => {
  isVisible.value = false
}

const emojiStyle = (n) => {
  const left = Math.random() * 100
  const duration = 2 + Math.random() * 3
  const delay = Math.random() * 5
  const size = 1.5 + Math.random() * 2
  return {
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    fontSize: `${size}rem`
  }
}
</script>

<style scoped>
.troll-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  overflow: hidden;
}

.troll-modal {
  background: #1a1a1a;
  padding: 3rem;
  border-radius: 20px;
  border: 4px solid #c41e3a;
  text-align: center;
  position: relative;
  box-shadow: 0 0 50px rgba(196, 30, 58, 0.5);
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

.troll-header {
  font-size: 5rem;
  color: #c41e3a;
  margin-bottom: 2rem;
}

.troll-text {
  font-family: 'Playfair Display', serif;
  font-size: 5rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 5px;
  margin: 0 0 2rem 0;
  text-shadow: 0 0 10px #c41e3a;
}

.troll-close-btn {
  background: #c41e3a;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(196, 30, 58, 0.4);
}

.troll-close-btn:hover {
  transform: scale(1.1) rotate(-2deg);
  background: #a01a2e;
  box-shadow: 0 0 30px rgba(196, 30, 58, 0.6);
}

.emoji-rain {
  position: absolute;
  top: -100px;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.falling-emoji {
  position: absolute;
  animation: fall linear infinite;
}

@keyframes fall {
  from { transform: translateY(-100px) rotate(0deg); }
  to { transform: translateY(110vh) rotate(360deg); }
}

.laugh-fall-enter-active {
  transition: all 0.5s ease;
}

.laugh-fall-enter-from {
  opacity: 0;
  transform: scale(2);
}
</style>
