<template>
  <div class="element-properties" v-if="element && isVisible">
    <div class="properties-header">
      <h5>Właściwości elementu <small>({{ elementTypeLabel }})</small></h5>
      <button class="close-btn" @click="hidePanel">×</button>
    </div>

    <!-- Common Properties -->
    <div class="common-props">
      <div class="form-group">
        <label for="element-z-index">Warstwa (Z-Index)</label>
        <input 
          type="number" 
          class="form-control form-control-sm" 
          id="element-z-index" 
          v-model.number="zIndex"
          @change="updateElement"
        >
      </div>

      <div class="form-group mt-2">
        <label for="element-position">Pozycja</label>
        <div class="position-inputs">
          <div class="input-group input-group-sm">
            <span class="input-group-text">X</span>
            <input 
              type="number" 
              class="form-control" 
              v-model.number="positionX"
              @change="updateElement"
            >
          </div>
          <div class="input-group input-group-sm">
            <span class="input-group-text">Y</span>
            <input 
              type="number" 
              class="form-control" 
              v-model.number="positionY"
              @change="updateElement"
            >
          </div>
        </div>
      </div>

      <div class="form-group mt-2">
        <label for="element-size">Rozmiar</label>
        <div class="size-inputs">
          <div class="input-group input-group-sm">
            <span class="input-group-text">W</span>
            <input 
              type="number" 
              class="form-control" 
              v-model.number="width"
              @change="updateElement"
            >
          </div>
          <div class="input-group input-group-sm">
            <span class="input-group-text">H</span>
            <input 
              type="number" 
              class="form-control" 
              v-model.number="height"
              @change="updateElement"
            >
          </div>
        </div>
      </div>

      <div class="form-group mt-2">
        <label for="element-rotation">Obrót</label>
        <input 
          type="range" 
          class="form-range" 
          min="0" 
          max="360" 
          v-model.number="rotation"
          @input="updateElement"
        >
        <div class="rotation-value">{{ rotation }}°</div>
      </div>
    </div>

    <!-- Text Properties -->
    <div class="text-props" v-if="element.element_type === 'text'">
      <div class="form-group mt-3">
        <label for="text-content">Tekst</label>
        <textarea 
          class="form-control form-control-sm" 
          id="text-content" 
          v-model="content"
          rows="3"
          @input="updateElement"
        ></textarea>
      </div>

      <div class="form-group mt-2">
        <label for="text-color">Kolor</label>
        <input 
          type="color" 
          class="form-control form-control-sm color-picker" 
          id="text-color" 
          v-model="textColor"
          @input="updateElement"
        >
      </div>

      <div class="form-group mt-2">
        <label for="text-size">Rozmiar czcionki</label>
        <select 
          class="form-select form-select-sm" 
          id="text-size" 
          v-model="fontSize"
          @change="updateElement"
        >
          <option value="12px">Mały (12px)</option>
          <option value="16px">Średni (16px)</option>
          <option value="24px">Duży (24px)</option>
          <option value="32px">Bardzo duży (32px)</option>
        </select>
      </div>
    </div>

    <!-- Shape Properties -->
    <div class="shape-props" v-if="element.element_type === 'shape'">
      <div class="form-group mt-3">
        <label for="shape-type">Kształt</label>
        <select 
          class="form-select form-select-sm" 
          id="shape-type" 
          v-model="shapeType"
          @change="updateShapeType"
        >
          <option value="rectangle">Prostokąt</option>
          <option value="circle">Koło</option>
        </select>
      </div>

      <div class="form-group mt-2">
        <label for="shape-fill">Kolor wypełnienia</label>
        <input 
          type="color" 
          class="form-control form-control-sm color-picker" 
          id="shape-fill" 
          v-model="shapeFill"
          @input="updateElement"
        >
      </div>

      <div class="form-group mt-2">
        <label for="shape-stroke">Kolor obramowania</label>
        <input 
          type="color" 
          class="form-control form-control-sm color-picker" 
          id="shape-stroke" 
          v-model="shapeStroke"
          @input="updateElement"
        >
      </div>
    </div>

    <!-- Note Properties -->
    <div class="sticky-props" v-if="element.element_type === 'sticky'">
      <div class="form-group mt-3">
        <label for="sticky-content">Tekst notatki</label>
        <textarea 
          class="form-control form-control-sm" 
          id="sticky-content" 
          v-model="content"
          rows="3"
          @input="updateElement"
        ></textarea>
      </div>

      <div class="form-group mt-2">
        <label for="sticky-color">Kolor tła</label>
        <input 
          type="color" 
          class="form-control form-control-sm color-picker" 
          id="sticky-color" 
          v-model="stickyColor"
          @input="updateElement"
        >
      </div>
    </div>

    <!-- Line Properties -->
    <div class="line-props" v-if="element.element_type === 'line'">
      <div class="form-group mt-3">
        <label for="line-color">Kolor linii</label>
        <input 
          type="color" 
          class="form-control form-control-sm color-picker" 
          id="line-color" 
          v-model="lineColor"
          @input="updateElement"
        >
      </div>

      <div class="form-group mt-2">
        <label for="line-width">Grubość linii</label>
        <input 
          type="range" 
          class="form-range" 
          min="1" 
          max="20" 
          v-model.number="lineWidth"
          @input="updateElement"
        >
        <div class="width-value">{{ lineWidth }}px</div>
      </div>
    </div>

    <!-- Delete Button -->
    <button class="btn btn-danger btn-sm mt-3" @click="deleteElement">
      <i class="bi bi-trash"></i> Usuń element
    </button>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ElementProperties',

  props: {
    element: {
      type: Object,
      default: null
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update', 'delete', 'hide'],

  setup(props, { emit }) {
    // Common properties
    const zIndex = ref(0);
    const positionX = ref(0);
    const positionY = ref(0);
    const width = ref(100);
    const height = ref(100);
    const rotation = ref(0);
    const content = ref('');

    // Text specific properties
    const textColor = ref('#000000');
    const fontSize = ref('16px');

    // Shape specific properties
    const shapeType = ref('rectangle');
    const shapeFill = ref('#3498db');
    const shapeStroke = ref('#2980b9');

    // Sticky note specific properties
    const stickyColor = ref('#FFFF88');

    // Line specific properties
    const lineColor = ref('#000000');
    const lineWidth = ref(2);

    // Element type label
    const elementTypeLabel = computed(() => {
      if (!props.element) return '';

      switch (props.element.element_type) {
        case 'text': return 'Tekst';
        case 'shape': return 'Kształt';
        case 'sticky': return 'Notatka';
        case 'line': return 'Linia';
        case 'path': return 'Rysunek odręczny';
        case 'image': return 'Obraz';
        default: return props.element.element_type;
      }
    });

    // Update properties when element changes
    watch(() => props.element, (newElement) => {
      if (!newElement) return;

      // Update common properties
      zIndex.value = newElement.z_index || 0;
      positionX.value = newElement.position_x || 0;
      positionY.value = newElement.position_y || 0;
      width.value = newElement.width || 100;
      height.value = newElement.height || 100;
      rotation.value = newElement.rotation || 0;
      content.value = newElement.content || '';

      // Update specific properties based on element type
      if (newElement.element_type === 'text') {
        textColor.value = newElement.properties?.color || '#000000';
        fontSize.value = newElement.properties?.fontSize || '16px';
      } 
      else if (newElement.element_type === 'shape') {
        shapeType.value = newElement.properties?.type || 'rectangle';
        shapeFill.value = newElement.properties?.fill || '#3498db';
        shapeStroke.value = newElement.properties?.stroke || '#2980b9';
      }
      else if (newElement.element_type === 'sticky') {
        stickyColor.value = newElement.properties?.fill || '#FFFF88';
      }
      else if (newElement.element_type === 'line') {
        lineColor.value = newElement.properties?.stroke || '#000000';
        lineWidth.value = newElement.properties?.strokeWidth || 2;
      }
    }, { immediate: true });

    // Update element data
    const updateElement = () => {
      if (!props.element) return;

      const elementData = {
        id: props.element.id,
        element_type: props.element.element_type,
        content: content.value,
        position_x: positionX.value,
        position_y: positionY.value,
        width: width.value,
        height: height.value,
        rotation: rotation.value,
        z_index: zIndex.value,
        properties: {}
      };

      // Add specific properties based on element type
      if (props.element.element_type === 'text') {
        elementData.properties.color = textColor.value;
        elementData.properties.fontSize = fontSize.value;
      } 
      else if (props.element.element_type === 'shape') {
        elementData.properties.type = shapeType.value;
        elementData.properties.fill = shapeFill.value;
        elementData.properties.stroke = shapeStroke.value;
      }
      else if (props.element.element_type === 'sticky') {
        elementData.properties.fill = stickyColor.value;
      }
      else if (props.element.element_type === 'line') {
        elementData.properties.stroke = lineColor.value;
        elementData.properties.strokeWidth = lineWidth.value;
      }

      emit('update', elementData);
    };

    // Change shape type
    const updateShapeType = () => {
      // When shape type changes, we need special handling
      // This may require recreating the shape in the parent component
      emit('update', {
        id: props.element.id,
        element_type: 'shape',
        position_x: positionX.value,
        position_y: positionY.value,
        width: width.value,
        height: height.value,
        rotation: rotation.value,
        z_index: zIndex.value,
        properties: {
          type: shapeType.value,
          fill: shapeFill.value,
          stroke: shapeStroke.value
        }
      });
    };

    // Delete element
    const deleteElement = () => {
      if (!props.element) return;
      emit('delete', props.element.id);
    };

    // Hide panel
    const hidePanel = () => {
      emit('hide');
    };

    return {
      zIndex,
      positionX,
      positionY,
      width,
      height,
      rotation,
      content,
      textColor,
      fontSize,
      shapeType,
      shapeFill,
      shapeStroke,
      stickyColor,
      lineColor,
      lineWidth,
      elementTypeLabel,
      updateElement,
      updateShapeType,
      deleteElement,
      hidePanel
    };
  }
};
</script>

<style scoped>
.element-properties {
  position: fixed;
  top: 70px;
  right: 10px;
  width: 280px;
  z-index: 1000;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  padding: 15px;
}

.properties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.properties-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.properties-header small {
  font-size: 12px;
  color: #6c757d;
  font-weight: normal;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.close-btn:hover {
  color: #495057;
}

.form-group label {
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}

.position-inputs, .size-inputs {
  display: flex;
  gap: 10px;
}

.rotation-value, .width-value {
  text-align: center;
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.color-picker {
  height: 30px;
  padding: 0;
}
</style>