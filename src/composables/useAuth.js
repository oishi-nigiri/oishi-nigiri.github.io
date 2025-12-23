import { ref, computed } from 'vue'
import { getDb } from './useFirebase'
import { doc, getDoc } from 'firebase/firestore'
import { ADMIN_IDS } from './useFirebase'

const user = ref(null)
const isAdmin = ref(false)
const isSuperAdmin = ref(false)
const permissions = ref({})

export function useAuth() {
  const loginWithDiscord = () => {
    if (typeof DISCORD_CONFIG === 'undefined') {
      console.error('DISCORD_CONFIG n\'est pas défini')
      return
    }
    
    const params = new URLSearchParams({
      client_id: DISCORD_CONFIG.clientId,
      redirect_uri: DISCORD_CONFIG.redirectUri,
      response_type: 'token',
      scope: DISCORD_CONFIG.scope
    })
    
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  const logout = () => {
    localStorage.removeItem('discordUser')
    localStorage.removeItem('discordToken')
    localStorage.removeItem('discord_user')
    localStorage.removeItem('discord_token')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminPermissions')
    localStorage.removeItem('isSuperAdmin')
    user.value = null
    isAdmin.value = false
    isSuperAdmin.value = false
    permissions.value = {}
    window.location.reload()
  }

  const checkAuth = async () => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      
      if (accessToken) {
        const userInfo = await getDiscordUserInfo(accessToken)
        if (userInfo) {
          localStorage.setItem('discord_user', JSON.stringify(userInfo))
          localStorage.setItem('discord_token', accessToken)
          const adminStatus = await checkAdminStatus(userInfo.id)
          
          if (adminStatus) {
            localStorage.setItem('discordUser', JSON.stringify(userInfo))
            localStorage.setItem('discordToken', accessToken)
            localStorage.setItem('isAdmin', 'true')
            user.value = userInfo
            window.history.replaceState({}, document.title, window.location.pathname)
            return true
          }
        }
      }
    }
    
    const discordUser = localStorage.getItem('discord_user')
    const discordToken = localStorage.getItem('discord_token')
    
    if (discordUser && discordToken) {
      const parsedUser = JSON.parse(discordUser)
      const adminStatus = await checkAdminStatus(parsedUser.id)
      
      if (adminStatus) {
        localStorage.setItem('discordUser', JSON.stringify(parsedUser))
        localStorage.setItem('discordToken', discordToken)
        localStorage.setItem('isAdmin', 'true')
        user.value = parsedUser
        return true
      }
    }
    
    return false
  }

  const getDiscordUserInfo = async (accessToken) => {
    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos Discord:', error)
    }
    return null
  }

  const isSuperAdminCheck = (userId) => {
    const userIdString = String(userId)
    
    if (typeof DISCORD_CONFIG !== 'undefined' && DISCORD_CONFIG.adminManagerIds) {
      if (DISCORD_CONFIG.adminManagerIds.includes(userIdString)) {
        return true
      }
    }
    
    if (ADMIN_IDS.includes(userIdString)) {
      return true
    }
    
    return false
  }

  const checkAdminStatus = async (userId) => {
    if (!userId) return false
    
    try {
      const userIdString = String(userId)
      
      if (isSuperAdminCheck(userIdString)) {
        permissions.value = {
          menu: true,
          team: true,
          sales: true,
          employees: true,
          ranks: true,
          admins: true
        }
        localStorage.setItem('adminPermissions', JSON.stringify(permissions.value))
        localStorage.setItem('isSuperAdmin', 'true')
        isSuperAdmin.value = true
        isAdmin.value = true
        return true
      }
      
      const db = getDb()
      const adminDoc = await getDoc(doc(db, 'admins', userIdString))
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data()
        if (adminData.isAdmin === true) {
          permissions.value = adminData.permissions || {}
          localStorage.setItem('adminPermissions', JSON.stringify(permissions.value))
          localStorage.setItem('isSuperAdmin', 'false')
          isSuperAdmin.value = false
          isAdmin.value = true
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error)
      return false
    }
  }

  const hasPermission = (section) => {
    if (isSuperAdmin.value) return true
    
    const permissionsStr = localStorage.getItem('adminPermissions')
    if (!permissionsStr) return false
    
    try {
      const perms = JSON.parse(permissionsStr)
      return perms[section] === true
    } catch (error) {
      return false
    }
  }

  const getAvatarUrl = (user) => {
    if (!user || !user.id) {
      return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }
    
    const userId = String(user.id)
    if (!/^\d{17,19}$/.test(userId)) {
      return 'https://cdn.discordapp.com/embed/avatars/0.png'
    }
    
    if (user.avatar && typeof user.avatar === 'string') {
      if (!/^[a-zA-Z0-9_-]+$/.test(user.avatar)) {
        return `https://cdn.discordapp.com/embed/avatars/${(parseInt(userId) >> 22) % 6}.png`
      }
      return `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`
    }
    return `https://cdn.discordapp.com/embed/avatars/${(parseInt(userId) >> 22) % 6}.png`
  }

  const getUsername = (user) => {
    if (user.discriminator && user.discriminator !== '0') {
      return `${user.username}#${user.discriminator}`
    }
    return user.global_name || user.username
  }

  return {
    user: computed(() => user.value),
    isAdmin: computed(() => isAdmin.value),
    isSuperAdmin: computed(() => isSuperAdmin.value),
    permissions: computed(() => permissions.value),
    loginWithDiscord,
    logout,
    checkAuth,
    hasPermission,
    getAvatarUrl,
    getUsername
  }
}




