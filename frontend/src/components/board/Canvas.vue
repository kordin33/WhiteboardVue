<!-- Canvas.vue - Komponent płótna rysowania -->
<template>
  <div ref="canvasContainer" class="canvas-container" 
    @wheel="handleWheel" 
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave">

    <canvas ref="fabricCanvas" 
      :width="canvasWidth" 
      :height="canvasHeight"></canvas>

    <!-- Wskaźniki innych użytkowników -->
    <div v-for="collaborator in collaborators" :key="collaborator.id" 
         class="collaborator-cursor"
         :style="{
           left: `${transformPositionX(collaborator.cursorPosition.x)}px`,
           top: `${transformPositionY(collaborator.cursorPosition.y)}px`,
           backgroundColor: collaborator.color
         }">
      <div class="collaborator-label">
        {{ collaborator.username }}
      </div>
    </div>

    <!-- Overlay dla trybu rysowania kształtów -->
    <div v-if="isDrawingShape" class="shape-overlay"
         :style="{
           left: `${Math.min(startPoint.x, currentPoint.x)}px`,
           top: `${Math.min(startPoint.y, currentPoint.y)}px`,
           width: `${Math.abs(currentPoint.x - startPoint.x)}px`,
           height: `${Math.abs(currentPoint.y - startPoint.y)}px`,
           borderColor: shapeStrokeColor
         }"></div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { fabric } from 'fabric';

export default {
  name: 'Canvas',

  props: {
    currentTool: {
      type: String,
      default: 'select'
    },
    penColor: {
      type: String,
      default: '#000000'
    },
    penSize: {
      type: Number,
      default: 5
    },
    penSmoothing: {
      type: Boolean,
      default: true
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    gridSize: {
      type: Number,
      default: 20
    },
    elements: {
      type: Array,
      default: () => []
    },
    collaborators: {
      type: Array,
      default: () => []
    }
  },

  emits: [
    'canvas-ready',
    'element-created',
    'element-updated',
    'element-deleted',
    'element-selected'
  ],

  setup(props, { emit }) {
    // Referencje DOM
    const canvasContainer = ref(null);
    const fabricCanvas = ref(null);

    // Instancja Fabric.js canvas
    let canvas = null;

    // Wymiary canvasa
    const canvasWidth = ref(3000);
    const canvasHeight = ref(2000);

    // Stan rysowania i przeciągania
    const isDrawing = ref(false);
    const isDragging = ref(false);
    const isDrawingShape = ref(false);
    const startPoint = reactive({ x: 0, y: 0 });
    const currentPoint = reactive({ x: 0, y: 0 });
    const shapeStrokeColor = ref(props.penColor);

    // Stan wyświetlania i przeglądania
    const viewportTransform = reactive({
      x: 0,
      y: 0,
      zoom: 1
    });

    // Linie siatki
    const gridLines = ref([]);

    // Transformacja współrzędnych
    const transformPositionX = (x) => {
      return x * viewportTransform.zoom + viewportTransform.x;
    };

    const transformPositionY = (y) => {
      return y * viewportTransform.zoom + viewportTransform.y;
    };

    // Inicjalizacja Fabric.js canvas
    const initCanvas = () => {
      canvas = new fabric.Canvas(fabricCanvas.value, {
        width: canvasWidth.value,
        height: canvasHeight.value,
        backgroundColor: 'white',
        selection: props.currentTool === 'select',
        preserveObjectStacking: true
      });

      // Konfiguracja rysowania odręcznego
      configureFreeDrawing();

      // Utwórz siatkę
      if (props.showGrid) {
        createGrid();
      }

      // Przypisz obsługę zdarzeń
      setupCanvasEvents();

      // Powiadom rodzica o gotowości canvas
      emit('canvas-ready');
    };

    // Konfiguracja rysowania odręcznego
    const configureFreeDrawing = () => {
      if (!canvas) return;

      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = props.penColor;
      canvas.freeDrawingBrush.width = props.penSize;

      if (props.penSmoothing) {
        canvas.freeDrawingBrush.strokeLineCap = 'round';
        canvas.freeDrawingBrush.strokeLineJoin = 'round';
        canvas.freeDrawingBrush.decimate = 8; // Redukcja liczby punktów dla wygładzania
      }

      // Włącz tryb rysowania tylko jeśli narzędzie to ołówek/pióro
      canvas.isDrawingMode = props.currentTool === 'pen';
    };

    // Tworzenie siatki
    const createGrid = () => {
      if (!canvas) return;

      // Usuń istniejące linie siatki
      gridLines.value.forEach(line => {
        canvas.remove(line);
      });
      gridLines.value = [];

      const width = canvasWidth.value;
      const height = canvasHeight.value;
      const gridSize = props.gridSize;

      // Tworzenie linii pionowych
      for (let i = 0; i < width; i += gridSize) {
        const line = new fabric.Line([i, 0, i, height], {
          stroke: '#ddd',
          selectable: false,
          strokeWidth: i % (gridSize * 5) === 0 ? 1 : 0.5,
          element_type: 'grid'
        });
        gridLines.value.push(line);
        canvas.add(line);
      }

      // Tworzenie linii poziomych
      for (let i = 0; i < height; i += gridSize) {
        const line = new fabric.Line([0, i, width, i], {
          stroke: '#ddd',
          selectable: false,
          strokeWidth: i % (gridSize * 5) === 0 ? 1 : 0.5,
          element_type: 'grid'
        });
        gridLines.value.push(line);
        canvas.add(line);
      }

      // Przesuń siatkę na spód
      gridLines.value.forEach(line => {
        line.moveTo(0);
      });

      canvas.renderAll();
    };

    // Konfiguracja obsługi zdarzeń canvas
    const setupCanvasEvents = () => {
      if (!canvas) return;

      // Obsługa zaznaczenia
      canvas.on('selection:created', (options) => {
        const selected = options.selected[0];
        if (selected && selected.element_type !== 'grid') {
          emit('element-selected', {
            id: selected.id,
            type: selected.element_type,
            properties: {
              fill: selected.fill,
              stroke: selected.stroke,
              fontSize: selected.fontSize,
              width: selected.width,
              height: selected.height,
              // Inne właściwości w zależności od typu elementu
            }
          });
        }
      });

      canvas.on('selection:updated', (options) => {
        const selected = options.selected[0];
        if (selected && selected.element_type !== 'grid') {
          emit('element-selected', {
            id: selected.id,
            type: selected.element_type,
            properties: {
              fill: selected.fill,
              stroke: selected.stroke,
              fontSize: selected.fontSize,
              width: selected.width,
              height: selected.height,
              // Inne właściwości w zależności od typu elementu
            }
          });
        }
      });

      canvas.on('selection:cleared', () => {
        emit('element-selected', null);
      });

      // Obsługa modyfikacji obiektów
      canvas.on('object:modified', (options) => {
        const obj = options.target;
        if (obj && obj.element_type && obj.element_type !== 'grid') {
          const elementData = serializeElement(obj);
          emit('element-updated', elementData);
        }
      });

      // Obsługa zakończenia rysowania odręcznego
      canvas.on('path:created', (e) => {
        const path = e.path;
        if (path) {
          path.element_type = 'path';

          const elementData = {
            element_type: 'path',
            path: path.path,
            position_x: path.left,
            position_y: path.top,
            width: path.width,
            height: path.height,
            properties: {
              stroke: path.stroke,
              strokeWidth: path.strokeWidth
            }
          };

          emit('element-created', elementData).then(newElement => {
            if (newElement) {
              path.id = newElement.id;
            }
          });
        }
      });
    };

    // Serializacja elementu do formatu API
    const serializeElement = (obj) => {
      const baseData = {
        id: obj.id,
        element_type: obj.element_type,
        position_x: obj.left,
        position_y: obj.top,
        width: obj.width || (obj.radius ? obj.radius * 2 : 100),
        height: obj.height || (obj.radius ? obj.radius * 2 : 100),
        rotation: obj.angle || 0,
        z_index: obj.zIndex || canvas.getObjects().indexOf(obj),
        properties: {}
      };

      // Dodanie specyficznych właściwości w zależności od typu
      if (obj.element_type === 'text') {
        baseData.content = obj.text;
        baseData.properties = {
          color: obj.fill,
          fontSize: obj.fontSize
        };
      } else if (obj.element_type === 'path') {
        baseData.path = obj.path;
        baseData.properties = {
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth
        };
      } else if (obj.element_type === 'shape') {
        baseData.properties = {
          type: obj.type === 'circle' ? 'circle' : 
                obj.type === 'triangle' ? 'triangle' : 'rectangle',
          fill: obj.fill,
          stroke: obj.stroke
        };
      } else if (obj.element_type === 'line') {
        baseData.properties = {
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth
        };
      }

      return baseData;
    };

    // Ładowanie elementów
    const loadElements = (elementsData) => {
      if (!canvas) return;

      elementsData.forEach(element => {
        addElementFromData(element);
      });
    };

    // Dodawanie elementu z danych
    const addElementFromData = (data) => {
      if (!canvas) return;

      switch (data.element_type) {
        case 'text':
          addTextElement(data);
          break;
        case 'path':
          addPathElement(data);
          break;
        case 'shape':
          addShapeElement(data);
          break;
        case 'line':
          addLineElement(data);
          break;
        case 'image':
          addImageElement(data);
          break;
      }
    };

    // Dodawanie tekstu
    const addTextElement = (data) => {
      const fontSize = data.properties?.fontSize || '16px';
      const color = data.properties?.color || '#000000';

      const textObj = new fabric.Textbox(data.content || 'Nowy tekst', {
        id: data.id,
        left: data.position_x || 100,
        top: data.position_y || 100,
        width: data.width || 200,
        fontSize: fontSize,
        fill: color,
        fontFamily: 'Arial',
        element_type: 'text',
        selectable: true
      });

      canvas.add(textObj);
      canvas.renderAll();

      return textObj;
    };

    // Dodawanie ścieżki (rysowanie odręczne)
    const addPathElement = (data) => {
      if (!data.path) return null;

      const pathObj = new fabric.Path(data.path, {
        id: data.id,
        left: data.position_x || 0,
        top: data.position_y || 0,
        stroke: data.properties?.stroke || '#000000',
        strokeWidth: data.properties?.strokeWidth || 5,
        fill: null,
        element_type: 'path',
        selectable: true
      });

      canvas.add(pathObj);
      canvas.renderAll();

      return pathObj;
    };

    // Dodawanie kształtu
    const addShapeElement = (data) => {
      const type = data.properties?.type || 'rectangle';
      const fill = data.properties?.fill || '#3498db';
      const stroke = data.properties?.stroke || '#2980b9';
      let shape;

      if (type === 'circle') {
        shape = new fabric.Circle({
          radius: data.width/2 || 50,
          fill: fill,
          stroke: stroke,
          strokeWidth: 2
        });
      } else if (type === 'triangle') {
        shape = new fabric.Triangle({
          width: data.width || 100,
          height: data.height || 100,
          fill: fill,
          stroke: stroke,
          strokeWidth: 2
        });
      } else {
        // Default: rectangle
        shape = new fabric.Rect({
          width: data.width || 100,
          height: data.height || 100,
          fill: fill,
          stroke: stroke,
          strokeWidth: 2,
          rx: 5,
          ry: 5
        });
      }

      shape.set({
        id: data.id,
        left: data.position_x || 100,
        top: data.position_y || 100,
        element_type: 'shape',
        selectable: true
      });

      canvas.add(shape);
      canvas.renderAll();

      return shape;
    };

    // Dodawanie linii
    const addLineElement = (data) => {
      const stroke = data.properties?.stroke || '#000000';
      const strokeWidth = data.properties?.strokeWidth || 2;

      const line = new fabric.Line(
        [0, 0, data.width || 100, 0],
        {
          id: data.id,
          left: data.position_x || 100,
          top: data.position_y || 100,
          stroke: stroke,
          strokeWidth: strokeWidth,
          element_type: 'line',
          selectable: true
        }
      );

      canvas.add(line);
      canvas.renderAll();

      return line;
    };

    // Dodawanie obrazu
    const addImageElement = (data) => {
      const imgElement = document.createElement('img');
      imgElement.src = data.image || '/static/placeholder.png';

      imgElement.onload = function() {
        const imgInstance = new fabric.Image(imgElement, {
          id: data.id,
          left: data.position_x || 100,
          top: data.position_y || 100,
          scaleX: (data.width || 200) / imgElement.width,
          scaleY: (data.height || 200) / imgElement.height,
          element_type: 'image',
          selectable: true
        });

        canvas.add(imgInstance);
        canvas.renderAll();
      };
    };

    // Aktualizacja elementu z danych
    const updateElementFromData = (data) => {
      if (!canvas) return;

      const objects = canvas.getObjects();
      const element = objects.find(obj => obj.id === data.id);

      if (element) {
        // Aktualizacja wspólnych właściwości
        element.set({
          left: data.position_x,
          top: data.position_y,
          width: data.width,
          height: data.height,
          angle: data.rotation
        });

        // Aktualizacja specyficznych właściwości
        if (data.element_type === 'text' && data.content) {
          element.set('text', data.content);

          if (data.properties?.color) {
            element.set('fill', data.properties.color);
          }

          if (data.properties?.fontSize) {
            element.set('fontSize', data.properties.fontSize);
          }
        } else if (data.element_type === 'path') {
          if (data.properties?.stroke) {
            element.set('stroke', data.properties.stroke);
          }
          if (data.properties?.strokeWidth) {
            element.set('strokeWidth', data.properties.strokeWidth);
          }
          if (data.path) {
            element.set('path', data.path);
          }
        } else if (['shape', 'line'].includes(data.element_type) && data.properties) {
          if (data.properties.fill) {
            element.set('fill', data.properties.fill);
          }

          if (data.properties.stroke) {
            element.set('stroke', data.properties.stroke);
          }
        }

        canvas.renderAll();
      }
    };

    // Aktualizacja właściwości elementu
    const updateElementProperties = (elementId, properties) => {
      if (!canvas) return;

      const objects = canvas.getObjects();
      const element = objects.find(obj => obj.id === elementId);

      if (element) {
        // Aktualizacja właściwości elementu
        Object.entries(properties).forEach(([key, value]) => {
          if (key === 'fill' || key === 'stroke' || key === 'fontSize') {
            element.set(key, value);
          }
        });

        canvas.renderAll();

        // Serializuj element i wyślij aktualizację
        const elementData = serializeElement(element);
        emit('element-updated', elementData);
      }
    };

    // Usunięcie elementu po ID
    const deleteElementById = (elementId) => {
      if (!canvas) return;

      const objects = canvas.getObjects();
      const element = objects.find(obj => obj.id === elementId);

      if (element) {
        canvas.remove(element);
        canvas.renderAll();
      }
    };

    // Usunięcie elementu
    const deleteElement = (elementId) => {
      if (!canvas) return;

      deleteElementById(elementId);
      emit('element-deleted', elementId);
    };

    // Ustawienie narzędzia
    const setTool = (toolName) => {
      if (!canvas) return;

      // Wyłącz tryb rysowania
      canvas.isDrawingMode = toolName === 'pen';

      // Włącz/wyłącz zaznaczanie
      canvas.selection = toolName === 'select';

      // Zaktualizuj kursor
      let cursorStyle = 'default';
      switch (toolName) {
        case 'select':
          cursorStyle = 'default';
          break;
        case 'pen':
          cursorStyle = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>'), auto`;
          break;
        case 'shape':
          cursorStyle = 'crosshair';
          break;
        case 'text':
          cursorStyle = 'text';
          break;
        default:
          cursorStyle = 'default';
      }
      canvasContainer.value.style.cursor = cursorStyle;

      // Skonfiguruj rysowanie odręczne jeśli to narzędzie pióra
      if (toolName === 'pen') {
        configureFreeDrawing();
      }
    };

    // Wykonanie zrzutu ekranu
    const takeSnapshot = () => {
      if (!canvas) return null;

      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.5 // Zmniejsza rozmiar obrazu dla szybszego przetwarzania
      });

      return dataURL;
    };

    // Obsługa kółka myszy (zoom)
    const handleWheel = (e) => {
      e.preventDefault();

      if (!canvas) return;

      const delta = e.deltaY;
      let zoom = viewportTransform.zoom;

      // Zmień zoom
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(0.1, zoom), 10); // Ogranicz zoom

      // Zapisz starą pozycję kursora względem dokumentu
      const pointer = {
        x: e.clientX - canvasContainer.value.getBoundingClientRect().left,
        y: e.clientY - canvasContainer.value.getBoundingClientRect().top
      };

      // Oblicz starą pozycję kursora względem zawartości
      const oldX = (pointer.x - viewportTransform.x) / viewportTransform.zoom;
      const oldY = (pointer.y - viewportTransform.y) / viewportTransform.zoom;

      // Zaktualizuj skalę
      viewportTransform.zoom = zoom;

      // Oblicz nowe położenie
      viewportTransform.x = pointer.x - oldX * zoom;
      viewportTransform.y = pointer.y - oldY * zoom;

      // Zastosuj transformację
      canvas.setViewportTransform([
        zoom, 0, 0, zoom, viewportTransform.x, viewportTransform.y
      ]);

      // Wyrenderuj widok
      canvas.requestRenderAll();
    };

    // Obsługa wciśnięcia przycisku myszy
    const handleMouseDown = (e) => {
      if (!canvas) return;

      // Jeśli tryb zaznaczania i klawisz Alt, rozpocznij przeciąganie canvasa
      if (props.currentTool === 'select' && e.altKey) {
        isDragging.value = true;
        canvasContainer.value.style.cursor = 'grab';
        startPoint.x = e.clientX;
        startPoint.y = e.clientY;
        return;
      }

      // Obsługa rozpoczęcia rysowania kształtu
      if (props.currentTool === 'shape') {
        isDrawingShape.value = true;
        shapeStrokeColor.value = props.penColor;

        const rect = canvasContainer.value.getBoundingClientRect();
        startPoint.x = e.clientX - rect.left;
        startPoint.y = e.clientY - rect.top;
        currentPoint.x = startPoint.x;
        currentPoint.y = startPoint.y;
      }
    };

    // Obsługa ruchu myszy
    const handleMouseMove = (e) => {
      if (!canvas) return;

      // Obsługa przeciągania canvasa
      if (isDragging.value) {
        const dx = e.clientX - startPoint.x;
        const dy = e.clientY - startPoint.y;

        viewportTransform.x += dx;
        viewportTransform.y += dy;

        canvas.setViewportTransform([
          viewportTransform.zoom, 0, 0, viewportTransform.zoom, viewportTransform.x, viewportTransform.y
        ]);

        canvas.requestRenderAll();

        startPoint.x = e.clientX;
        startPoint.y = e.clientY;
      }

      // Obsługa rysowania kształtu
      if (isDrawingShape.value) {
        const rect = canvasContainer.value.getBoundingClientRect();
        currentPoint.x = e.clientX - rect.left;
        currentPoint.y = e.clientY - rect.top;
      }
    };

    // Obsługa puszczenia przycisku myszy
    const handleMouseUp = (e) => {
      if (!canvas) return;

      // Zakończ przeciąganie canvasa
      if (isDragging.value) {
        isDragging.value = false;
        canvasContainer.value.style.cursor = props.currentTool === 'select' ? 'default' : canvasContainer.value.style.cursor;
      }

      // Obsługa zakończenia rysowania kształtu
      if (isDrawingShape.value) {
        isDrawingShape.value = false;

        // Sprawdzenie czy kształt ma minimalny rozmiar
        const minSize = 5;
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);

        if (width >= minSize && height >= minSize) {
          // Utwórz odpowiedni kształt
          const x = Math.min(startPoint.x, currentPoint.x);
          const y = Math.min(startPoint.y, currentPoint.y);

          // Przekształć pozycję na współrzędne Fabric.js
          const fabricPos = canvas.getPointer({
            clientX: x + canvasContainer.value.getBoundingClientRect().left,
            clientY: y + canvasContainer.value.getBoundingClientRect().top
          });

          // Wybierz typ kształtu (domyślnie prostokąt)
          const shapeType = 'rectangle'; // Można dodać wybór typu kształtu w UI

          // Dane dla nowego elementu
          const elementData = {
            element_type: 'shape',
            position_x: fabricPos.x,
            position_y: fabricPos.y,
            width: width / viewportTransform.zoom,
            height: height / viewportTransform.zoom,
            properties: {
              type: shapeType,
              fill: props.penColor + '40', // Dodaj przezroczystość
              stroke: props.penColor
            }
          };

          // Utwórz element i wyślij do API
          emit('element-created', elementData).then(newElement => {
            if (newElement) {
              addElementFromData(newElement);
            }
          });
        }
      }
    };

    // Obsługa opuszczenia obszaru canvasa przez mysz
    const handleMouseLeave = (e) => {
      if (!canvas) return;

      // Zakończ przeciąganie
      isDragging.value = false;

      // Zakończ rysowanie kształtu
      isDrawingShape.value = false;
    };

    // Inicjalizacja po zamontowaniu
    onMounted(() => {
      setTimeout(() => {
        initCanvas();
      }, 0);
    });

    // Czyszczenie przed odmontowaniem
    onBeforeUnmount(() => {
      if (canvas) {
        canvas.dispose();
      }
    });

    // Obserwuj zmiany właściwości
    watch(() => props.currentTool, (newTool) => {
      setTool(newTool);
    });

    watch(() => props.penColor, (newColor) => {
      if (canvas && canvas.isDrawingMode) {
        canvas.freeDrawingBrush.color = newColor;
      }
      shapeStrokeColor.value = newColor;
    });

    watch(() => props.penSize, (newSize) => {
      if (canvas && canvas.isDrawingMode) {
        canvas.freeDrawingBrush.width = newSize;
      }
    });

    watch(() => props.penSmoothing, (newValue) => {
      if (canvas && canvas.isDrawingMode) {
        configureFreeDrawing();
      }
    });

    watch(() => props.showGrid, (newValue) => {
      if (newValue) {
        createGrid();
      } else {
        // Usuń siatkę
        gridLines.value.forEach(line => {
          canvas.remove(line);
        });
        gridLines.value = [];
        canvas.renderAll();
      }
    });

    watch(() => props.gridSize, (newValue) => {
      if (props.showGrid) {
        createGrid();
      }
    });

    // Eksportuj metody publiczne
    return {
      canvasContainer,
      fabricCanvas,
      canvasWidth,
      canvasHeight,
      isDrawingShape,
      startPoint,
      currentPoint,
      shapeStrokeColor,
      transformPositionX,
      transformPositionY,
      handleWheel,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      // Metody do wywoływania z zewnątrz
      setTool,
      loadElements,
      addElementFromData,
      updateElementFromData,
      updateElementProperties,
      deleteElement,
      deleteElementById,
      takeSnapshot
    };
  }
};
</script>

<style lang="scss" scoped>
.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
}

.collaborator-cursor {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid inherit;
    transform: translate(-50%, -100%) rotate(-45deg);
  }

  .collaborator-label {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: inherit;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
    white-space: nowrap;
    margin-bottom: 5px;
  }
}

.shape-overlay {
  position: absolute;
  z-index: 50;
  border: 2px dashed;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>