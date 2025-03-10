<template>
  <div class="app-loader">
    <div class="loader-content">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
      <p class="mt-3">Proszę czekać...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppLoader'
};
</script>

<style scoped>
.app-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-content {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

p {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 0;
}

/* Dark theme */
:root.dark-theme .app-loader {
  background-color: rgba(0, 0, 0, 0.85);
}

:root.dark-theme .loader-content {
  background-color: #343a40;
}

:root.dark-theme p {
  color: #e9ecef;
}
</style>