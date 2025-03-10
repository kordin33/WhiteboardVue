<template>
  <div class="not-found">
    <div class="container text-center">
      <div class="error-code">404</div>
      <h1 class="mb-4">Strona nie została znaleziona</h1>
      <p class="lead mb-5">
        Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
      </p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary me-3">
          <i class="bi bi-house-door me-2"></i> Strona główna
        </router-link>
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i> Wróć
        </button>
      </div>

      <div class="illustration mt-5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="300" height="300">
          <path fill="#f2f2f2" d="M413.1,262.3c0,77.8-63.1,140.9-140.9,140.9S131.3,340.1,131.3,262.3s63.1-140.9,140.9-140.9S413.1,184.5,413.1,262.3z"/>
          <path fill="#ccc" d="M260.3,374.9c0,0-0.1-0.1-0.1-0.1c-7,3-14.6,4.7-22.6,4.7c-31.8,0-57.6-25.8-57.6-57.6c0-31.8,25.8-57.6,57.6-57.6
            c31.8,0,57.6,25.8,57.6,57.6c0,8-1.6,15.6-4.7,22.6c0,0,0.1,0.1,0.1,0.1L260.3,374.9z"/>
          <path fill="#b3b3b3" d="M348.3,131.2l-53.6,53.6c-43.8-1.9-80.5,32.2-82.8,76c-0.1,2.3-0.2,4.5-0.1,6.8c0,0.1,0,0.2,0,0.3
            c0.1,2.3,0.3,4.5,0.5,6.8l-53.6,53.6c-3.1,3.1-3.1,8.2,0,11.3l25.4,25.4c3.1,3.1,8.2,3.1,11.3,0l53.6-53.6c43.8,1.9,80.5-32.2,82.8-76
            c0.1-2.3,0.2-4.5,0.1-6.8c0-0.1,0-0.2,0-0.3c-0.1-2.3-0.3-4.5-0.5-6.8l53.6-53.6c3.1-3.1,3.1-8.2,0-11.3l-25.4-25.4
            C356.5,128.1,351.4,128.1,348.3,131.2z M237.7,321.9c-23.5,0-42.6-19.1-42.6-42.6c0-23.5,19.1-42.6,42.6-42.6
            c23.5,0,42.6,19.1,42.6,42.6C280.3,302.8,261.2,321.9,237.7,321.9z"/>
          <path fill="#e6e6e6" d="M237.7,236.7c-23.5,0-42.6,19.1-42.6,42.6c0,23.5,19.1,42.6,42.6,42.6c23.5,0,42.6-19.1,42.6-42.6
            C280.3,255.8,261.2,236.7,237.7,236.7z M252.3,297.1h-29.1c-3.5,0-6.3-2.8-6.3-6.3v-3.3c0-3.5,2.8-6.3,6.3-6.3h29.1
            c3.5,0,6.3,2.8,6.3,6.3v3.3C258.6,294.3,255.7,297.1,252.3,297.1z M252.3,266.3h-29.1c-3.5,0-6.3-2.8-6.3-6.3v-3.3
            c0-3.5,2.8-6.3,6.3-6.3h29.1c3.5,0,6.3,2.8,6.3,6.3v3.3C258.6,263.5,255.7,266.3,252.3,266.3z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'NotFoundView',

  setup() {
    const router = useRouter();

    const goBack = () => {
      router.go(-1);
    };

    return {
      goBack
    };
  }
};
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--bs-primary, #3498db);
  opacity: 0.7;
  line-height: 1;
}

h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--bs-gray-800, #343a40);
}

.lead {
  font-size: 1.25rem;
  color: var(--bs-gray-600, #6c757d);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.illustration {
  margin-top: 2rem;
  opacity: 0.8;
}

/* Dark theme */
:root.dark-theme .error-code {
  color: #4dabf7;
}

:root.dark-theme h1 {
  color: #f8f9fa;
}

:root.dark-theme .lead {
  color: #ced4da;
}
</style>
<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Strona nie znaleziona</h2>
        <p>Przepraszamy, ale strona której szukasz nie istnieje.</p>
        <router-link to="/" class="btn btn-primary">Wróć do strony głównej</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.not-found-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.not-found h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.not-found h2 {
  margin-bottom: 1rem;
}

.not-found p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
}
</style>
