<template>
  <div class="toolbar" :class="{ 'read-only': !canEdit }">
    <div class="tool-group">
      <button 
        v-for="tool in tools" 
        :key="tool.name"
        :class="['tool-btn', { active: currentTool === tool.name }]"
        :title="tool.title"
        @click="selectTool(tool.name)"
        :disabled="!canEdit"
      >
        <i :class="tool.icon"></i>
      </button>
    </div>

    <!-- Pen Properties -->
    <div v-if="currentTool === 'pen'" class="pen-properties properties-panel">
      <h6>Ustawienia pisaka</h6>
      <div class="brush-size">
        <span>Rozmiar:</span>
        <div class="brush-size-btns">
          <button 
            v-for="size in brushSizes" 
            :key="size"
            :class="['brush-size-btn', { active: penSize === size }]"
            :style="{ width: size + 'px', height: size + 'px' }"
            @click="updatePenSize(size)"
          ></button>
        </div>
      </div>
      <div class="pen-color mt-2">
        <span>Kolor:</span>
        <input type="color" v-model="penColor" class="form-control form-control-sm color-picker" />
      </div>
    </div>

    <!-- Shape Properties -->
    <div v-if="currentTool === 'shape'" class="shape-properties properties-panel">
      <h6>Ustawienia kształtu</h6>
      <div class="shape-type">
        <span>Typ:</span>
        <select v-model="shapeType" class="form-select form-select-sm">
          <option value="rectangle">Prostokąt</option>
          <option value="circle">Koło</option>
        </select>
      </div>
      <div class="shape-color mt-2">
        <span>Kolor wypełnienia:</span>
        <input type="color" v-model="shapeFill" class="form-control form-control-sm color-picker" />
      </div>
      <div class="shape-border mt-2">
        <span>Kolor obramowania:</span>
        <input type="color" v-model="shapeBorder" class="form-control form-control-sm color-picker" />
      </div>
    </div>

    <!-- Text Properties -->
    <div v-if="currentTool === 'text'" class="text-properties properties-panel">
      <h6>Ustawienia tekstu</h6>
      <div class="text-size">
        <span>Rozmiar:</span>
        <select v-model="textSize" class="form-select form-select-sm">
          <option value="12px">Mały (12px)</option>
          <option value="16px">Średni (16px)</option>
          <option value="24px">Duży (24px)</option>
          <option value="32px">Bardzo duży (32px)</option>
        </select>
      </div>
      <div class="text-color mt-2">
        <span>Kolor:</span>
        <input type="color" v-model="textColor" class="form-control form-control-sm color-picker" />
      </div>
    </div>

    <!-- Grid Settings -->
    <div class="grid-settings properties-panel">
      <h6>Ustawienia siatki</h6>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="showGrid" v-model="showGrid">
        <label class="form-check-label" for="showGrid">Pokaż siatkę</label>
      </div>
      <div class="grid-size mt-2">
        <span>Rozmiar siatki:</span>
        <select v-model="gridSize" class="form-select form-select-sm">
          <option :value="10">Mała (10px)</option>
          <option :value="20">Średnia (20px)</option>
          <option :value="40">Duża (40px)</option>
        </select>
      </div>
    </div>

    <!-- Read-only indicator -->
    <div v-if="!canEdit" class="read-only-indicator">
      <i class="bi bi-eye"></i> Tylko podgląd
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'BoardToolbar',

  props: {
    canEdit: {
      type: Boolean,
      default: false
    },
    initialTool: {
      type: String,
      default: 'select'
    }
  },

  emits: [
    'tool-change',
    'pen-settings-change',
    'shape-settings-change', 
    'text-settings-change',
    'grid-settings-change'
  ],

  setup(props, { emit }) {
    const currentTool = ref(props.initialTool);
    const penSize = ref(5);
    const penColor = ref('#000000');
    const shapeType = ref('rectangle');
    const shapeFill = ref('#3498db');
    const shapeBorder = ref('#2980b9');
    const textSize = ref('16px');
    const textColor = ref('#000000');
    const showGrid = ref(true);
    const gridSize = ref(20);

    const brushSizes = [2, 5, 10, 15];

    // List of available tools
    const tools = [
      { name: 'select', title: 'Wybierz element', icon: 'bi bi-cursor' },
      { name: 'pen', title: 'Rysuj odręcznie', icon: 'bi bi-pen' },
      { name: 'text', title: 'Dodaj tekst', icon: 'bi bi-fonts' },
      { name: 'sticky', title: 'Dodaj notatkę', icon: 'bi bi-sticky' },
      { name: 'shape', title: 'Dodaj kształt', icon: 'bi bi-square' },
      { name: 'line', title: 'Dodaj linię', icon: 'bi bi-slash-lg' },
      { name: 'image', title: 'Dodaj obraz', icon: 'bi bi-image' }
    ];

    // Select tool
    const selectTool = (toolName) => {
      if (!props.canEdit && toolName !== 'select') return;

      currentTool.value = toolName;
      emit('tool-change', toolName);
    };

    // Update pen size
    const updatePenSize = (size) => {
      penSize.value = size;
      emitPenSettings();
    };

    // Emit pen settings change
    const emitPenSettings = () => {
      emit('pen-settings-change', {
        size: penSize.value,
        color: penColor.value
      });
    };

    // Emit shape settings change
    const emitShapeSettings = () => {
      emit('shape-settings-change', {
        type: shapeType.value,
        fill: shapeFill.value,
        border: shapeBorder.value
      });
    };

    // Emit text settings change
    const emitTextSettings = () => {
      emit('text-settings-change', {
        size: textSize.value,
        color: textColor.value
      });
    };

    // Emit grid settings change
    const emitGridSettings = () => {
      emit('grid-settings-change', {
        show: showGrid.value,
        size: gridSize.value
      });
    };

    // Watch for changes
    watch(penColor, () => {
      emitPenSettings();
    });

    watch([shapeType, shapeFill, shapeBorder], () => {
      emitShapeSettings();
    });

    watch([textSize, textColor], () => {
      emitTextSettings();
    });

    watch([showGrid, gridSize], () => {
      emitGridSettings();
    });

    // Reset to select tool when changing to read-only mode
    watch(() => props.canEdit, (newValue) => {
      if (!newValue && currentTool.value !== 'select') {
        selectTool('select');
      }
    });

    return {
      currentTool,
      tools,
      penSize,
      penColor,
      shapeType,
      shapeFill,
      shapeBorder,
      textSize,
      textColor,
      showGrid,
      gridSize,
      brushSizes,
      selectTool,
      updatePenSize
    };
  }
};
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 70px;
  left: 10px;
  z-index: 1000;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  padding: 10px;
  width: 250px;
}

.tool-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background-color: #e9ecef;
}

.tool-btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.properties-panel {
  padding: 10px;
  border-top: 1px solid #dee2e6;
  margin-top: 10px;
}

.properties-panel h6 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.brush-size-btns {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.brush-size-btn {
  border-radius: 50%;
  background-color: #000;
  border: 1px solid #dee2e6;
  cursor: pointer;
}

.brush-size-btn.active {
  border: 2px solid #0d6efd;
}

.color-picker {
  width: 60px;
  height: 30px;
  padding: 0;
  margin-left: 5px;
}

.read-only {
  opacity: 0.8;
}

.read-only-indicator {
  margin-top: 10px;
  padding: 5px;
  background-color: rgba(255, 0, 0, 0.1);
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}
</style>