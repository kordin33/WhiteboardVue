<template>
  <div class="basic-view">
    <h1 style="color: red; font-size: 40px; margin-top: 100px; text-align: center;">
      THIS IS A BASIC TEST PAGE
    </h1>
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <p class="mb-2"><strong>Current route:</strong> {{ $route.path }}</p>
              <p class="mb-3"><strong>Time:</strong> {{ currentTime }}</p>
              <button @click="updateTime" class="btn btn-primary">Update Time</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasicView',
  data() {
    return {
      currentTime: new Date().toLocaleTimeString()
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date().toLocaleTimeString()
    }
  },
  mounted() {
    console.log('BasicView component mounted!')
    alert('BasicView component is mounted! If you see this alert, the component is working.')
  }
}
</script>

<style>
.basic-view {
  padding: 20px;
  min-height: 100vh;
  background-color: #f0f0f0;
}
</style>