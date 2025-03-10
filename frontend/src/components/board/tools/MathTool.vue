<!-- MathEditor.vue - Zaawansowany edytor matematyczny -->
<template>
  <div class="math-editor">
    <div class="editor-header">
      <h2>Edytor matematyczny</h2>
      <button class="close-btn" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="editor-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        class="tab-btn" 
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="tab-content">
      <!-- Zakładka funkcji -->
      <div v-if="activeTab === 'function'" class="tab-pane function-tab">
        <div class="function-editor">
          <div class="input-group">
            <label>Funkcja:</label>
            <input type="text" v-model="functionExpression" placeholder="np. x^2 + 3*x - 2" />
            <div class="tooltip">
              <span class="tooltip-icon">?</span>
              <div class="tooltip-content">
                <p><strong>Przykłady funkcji:</strong></p>
                <ul>
                  <li>x^2 - 4 (parabola)</li>
                  <li>sin(x) (funkcja sinus)</li>
                  <li>cos(2*x) (funkcja cosinus)</li>
                  <li>sqrt(x) (pierwiastek)</li>
                  <li>abs(x) (wartość bezwzględna)</li>
                  <li>x^3 - 5*x (wielomian 3 stopnia)</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Zakres X min:</label>
              <input type="number" v-model.number="xMin" step="1" />
            </div>
            <div class="input-group">
              <label>Zakres X max:</label>
              <input type="number" v-model.number="xMax" step="1" />
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Kolor:</label>
              <input type="color" v-model="functionColor" />
            </div>
            <div class="input-group">
              <label>Grubość linii:</label>
              <select v-model="lineWidth">
                <option value="1">Cienka</option>
                <option value="2">Średnia</option>
                <option value="3">Gruba</option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <label>
              <input type="checkbox" v-model="showCoordinateSystem" />
              Pokaż układ współrzędnych
            </label>
          </div>

          <div class="function-preview">
            <h3>Podgląd</h3>
            <div class="preview-container" ref="previewContainer"></div>
          </div>

          <div class="button-row">
            <button @click="drawFunction" class="primary-btn">Rysuj funkcję</button>
            <button @click="close" class="secondary-btn">Anuluj</button>
          </div>
        </div>
      </div>

      <!-- Zakładka układu współrzędnych -->
      <div v-if="activeTab === 'coordinate'" class="tab-pane coordinate-tab">
        <div class="coordinate-editor">
          <div class="input-row">
            <div class="input-group">
              <label>Szerokość:</label>
              <input type="number" v-model.number="gridWidth" min="100" step="50" />
            </div>
            <div class="input-group">
              <label>Wysokość:</label>
              <input type="number" v-model.number="gridHeight" min="100" step="50" />
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Odstęp siatki:</label>
              <select v-model="gridSpacing">
                <option value="10">Mały (10px)</option>
                <option value="20">Średni (20px)</option>
                <option value="40">Duży (40px)</option>
              </select>
            </div>
            <div class="input-group">
              <label>Styl linii:</label>
              <select v-model="gridStyle">
                <option value="solid">Ciągła</option>
                <option value="dashed">Przerywana</option>
                <option value="dotted">Kropkowana</option>
              </select>
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Kolor osi:</label>
              <input type="color" v-model="axisColor" />
            </div>
            <div class="input-group">
              <label>Kolor siatki:</label>
              <input type="color" v-model="gridColor" />
            </div>
          </div>

          <div class="input-group">
            <label>
              <input type="checkbox" v-model="showNumbers" />
              Pokaż liczby
            </label>
          </div>

          <div class="coordinate-preview">
            <h3>Podgląd</h3>
            <div class="preview-container" ref="coordinatePreviewContainer"></div>
          </div>

          <div class="button-row">
            <button @click="addCoordinateSystem" class="primary-btn">Dodaj układ współrzędnych</button>
            <button @click="close" class="secondary-btn">Anuluj</button>
          </div>
        </div>
      </div>

      <!-- Zakładka geometrii -->
      <div v-if="activeTab === 'geometry'" class="tab-pane geometry-tab">
        <div class="geometry-editor">
          <div class="geometry-tools">
            <button 
              v-for="tool in geometryTools" 
              :key="tool.id"
              class="geometry-tool" 
              :class="{ active: activeGeometryTool === tool.id }"
              @click="activeGeometryTool = tool.id"
            >
              <div class="tool-icon" v-html="tool.icon"></div>
              <span>{{ tool.name }}</span>
            </button>
          </div>

          <div class="geometry-options">
            <div v-if="activeGeometryTool === 'triangle'" class="tool-options">
              <div class="input-group">
                <label>Pierwszy kąt (°):</label>
                <input type="number" v-model.number="triangleAngle1" min="1" max="178" />
              </div>
              <div class="input-group">
                <label>Drugi kąt (°):</label>
                <input type="number" v-model.number="triangleAngle2" min="1" max="178" />
              </div>
              <div class="input-group">
                <label>Długość boku:</label>
                <input type="number" v-model.number="triangleSide" min="10" step="10" />
              </div>
            </div>

            <div v-if="activeGeometryTool === 'circle'" class="tool-options">
              <div class="input-group">
                <label>Promień:</label>
                <input type="number" v-model.number="circleRadius" min="5" step="5" />
              </div>
              <div class="input-group">
                <label>Pokaż promień:</label>
                <input type="checkbox" v-model="showRadius" />
              </div>
            </div>

            <div v-if="activeGeometryTool === 'angle'" class="tool-options">
              <div class="input-group">
                <label>Wartość kąta (°):</label>
                <input type="number" v-model.number="angleValue" min="1" max="360" />
              </div>
              <div class="input-group">
                <label>Długość ramion:</label>
                <input type="number" v-model.number="angleSide" min="10" step="10" />
              </div>
            </div>

            <div v-if="activeGeometryTool === 'ruler'" class="tool-options">
              <div class="input-group">
                <label>Długość (px):</label>
                <input type="number" v-model.number="rulerLength" min="50" step="10" />
              </div>
              <div class="input-group">
                <label>Jednostka:</label>
                <select v-model="rulerUnit">
                  <option value="cm">Centymetry</option>
                  <option value="mm">Milimetry</option>
                  <option value="px">Piksele</option>
                </select>
              </div>
            </div>

            <div class="color-options">
              <div class="input-group">
                <label>Kolor wypełnienia:</label>
                <input type="color" v-model="geometryFillColor" />
              </div>
              <div class="input-group">
                <label>Kolor linii:</label>
                <input type="color" v-model="geometryStrokeColor" />
              </div>
            </div>

            <div class="input-group">
              <label>
                <input type="checkbox" v-model="showMeasurements" />
                Pokaż wymiary
              </label>
            </div>
          </div>

          <div class="geometry-preview">
            <h3>Podgląd</h3>
            <div class="preview-container" ref="geometryPreviewContainer"></div>
          </div>

          <div class="button-row">
            <button @click="addGeometryShape" class="primary-btn">Dodaj figurę</button>
            <button @click="close" class="secondary-btn">Anuluj</button>
          </div>
        </div>
      </div>

      <!-- Zakładka równań -->
      <div v-if="activeTab === 'equation'" class="tab-pane equation-tab">
        <div class="equation-editor">
          <div class="input-group">
            <label>Format:</label>
            <select v-model="equationFormat">
              <option value="latex">LaTeX</option>
              <option value="asciimath">AsciiMath</option>
            </select>
          </div>

          <div class="equation-input">
            <label>Równanie:</label>
            <textarea v-model="equationExpression" rows="3" placeholder="Wpisz równanie (np. \frac{-b \pm \sqrt{b^2-4ac}}{2a})"></textarea>

            <div class="equation-helpers">
              <button 
                v-for="helper in equationHelpers" 
                :key="helper.id" 
                class="helper-btn"
                @click="insertEquationSymbol(helper.value)"
                :title="helper.desc"
              >
                <span v-html="helper.display"></span>
              </button>
            </div>
          </div>

          <div class="equation-preview">
            <h3>Podgląd</h3>
            <div class="preview-container equation-preview-container" ref="equationPreviewContainer"></div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Rozmiar:</label>
              <select v-model="equationSize">
                <option value="small">Mały</option>
                <option value="medium">Średni</option>
                <option value="large">Duży</option>
              </select>
            </div>
            <div class="input-group">
              <label>Kolor:</label>
              <input type="color" v-model="equationColor" />
            </div>
          </div>

          <div class="button-row">
            <button @click="addEquation" class="primary-btn">Dodaj równanie</button>
            <button @click="close" class="secondary-btn">Anuluj</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
// Można zaimportować np. MathJax lub KaTeX do renderowania równań
// import { renderMathInElement } from 'katex';
// import 'katex/dist/katex.min.css';

export default {
  name: 'MathEditor',

  props: {
    initialTab: {
      type: String,
      default: 'function'
    }
  },

  emits: ['close', 'add-element'],

  setup(props, { emit }) {
    // Stan zakładek
    const tabs = [
      { id: 'function', name: 'Funkcja' },
      { id: 'coordinate', name: 'Układ współrzędnych' },
      { id: 'geometry', name: 'Geometria' },
      { id: 'equation', name: 'Równanie' }
    ];

    const activeTab = ref(props.initialTab);

    // Referencje do kontenerów podglądu
    const previewContainer = ref(null);
    const coordinatePreviewContainer = ref(null);
    const geometryPreviewContainer = ref(null);
    const equationPreviewContainer = ref(null);

    // Stan funkcji
    const functionExpression = ref('x^2');
    const xMin = ref(-10);
    const xMax = ref(10);
    const functionColor = ref('#1e88e5');
    const lineWidth = ref(2);
    const showCoordinateSystem = ref(true);

    // Stan układu współrzędnych
    const gridWidth = ref(400);
    const gridHeight = ref(300);
    const gridSpacing = ref(20);
    const gridStyle = ref('solid');
    const axisColor = ref('#000000');
    const gridColor = ref('#cccccc');
    const showNumbers = ref(true);

    // Stan narzędzi geometrycznych
    const geometryTools = [
      { 
        id: 'triangle', 
        name: 'Trójkąt', 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 20h18L12 4z"></path>
              </svg>` 
      },
      { 
        id: 'circle', 
        name: 'Koło', 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>` 
      },
      { 
        id: 'angle', 
        name: 'Kąt', 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 20L20 4"></path>
                <path d="M4 4v16"></path>
              </svg>` 
      },
      { 
        id: 'ruler', 
        name: 'Linijka', 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 5h18M3 10h18M3 15h18M3 20h18"></path>
              </svg>` 
      }
    ];

    const activeGeometryTool = ref('triangle');
    const triangleAngle1 = ref(30);
    const triangleAngle2 = ref(60);
    const triangleSide = ref(100);
    const circleRadius = ref(50);
    const showRadius = ref(false);
    const angleValue = ref(45);
    const angleSide = ref(80);
    const rulerLength = ref(200);
    const rulerUnit = ref('cm');
    const geometryFillColor = ref('#fff8e1');
    const geometryStrokeColor = ref('#ff9800');
    const showMeasurements = ref(true);

    // Stan równań
    const equationFormat = ref('latex');
    const equationExpression = ref('\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}');
    const equationSize = ref('medium');
    const equationColor = ref('#000000');

    // Pomocnicy dla równań
    const equationHelpers = [
      { id: 'frac', display: '\\(\\frac{a}{b}\\)', value: '\\frac{a}{b}', desc: 'Ułamek' },
      { id: 'sqrt', display: '\\(\\sqrt{x}\\)', value: '\\sqrt{x}', desc: 'Pierwiastek' },
      { id: 'sum', display: '\\(\\sum_{i=1}^{n}\\)', value: '\\sum_{i=1}^{n}', desc: 'Suma' },
      { id: 'int', display: '\\(\\int_{a}^{b}\\)', value: '\\int_{a}^{b}', desc: 'Całka' },
      { id: 'pi', display: '\\(\\pi\\)', value: '\\pi', desc: 'Pi' },
      { id: 'theta', display: '\\(\\theta\\)', value: '\\theta', desc: 'Theta' },
      { id: 'alpha', display: '\\(\\alpha\\)', value: '\\alpha', desc: 'Alpha' },
      { id: 'pm', display: '\\(\\pm\\)', value: '\\pm', desc: 'Plus-minus' }
    ];

    // Funkcja wstawiania symboli do równania
    const insertEquationSymbol = (symbol) => {
      const textarea = document.querySelector('textarea');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = equationExpression.value;

      equationExpression.value = text.substring(0, start) + symbol + text.substring(end);

      // Ustawienie kursora po wstawionym symbolu
      nextTick(() => {
        textarea.focus();
        textarea.selectionStart = start + symbol.length;
        textarea.selectionEnd = start + symbol.length;
      });
    };

    // Rysowanie funkcji
    const drawFunction = () => {
      // Tutaj byłaby implementacja rysowania funkcji
      // W rzeczywistej aplikacji użylibyśmy biblioteki jak Chart.js, Plotly lub D3.js

      // Przykładowa implementacja:
      // 1. Parsowanie wyrażenia funkcji
      // 2. Generowanie punktów dla wykresu
      // 3. Rysowanie na canvasie

      // Przykład danych wyjściowych
      const functionData = {
        type: 'function',
        expression: functionExpression.value,
        xRange: [xMin.value, xMax.value],
        color: functionColor.value,
        lineWidth: parseInt(lineWidth.value),
        showCoordinateSystem: showCoordinateSystem.value
      };

      // Emituj zdarzenie dodania elementu
      emit('add-element', functionData);
      close();
    };

    // Dodawanie układu współrzędnych
    const addCoordinateSystem = () => {
      const coordinateData = {
        type: 'coordinate',
        width: gridWidth.value,
        height: gridHeight.value,
        spacing: parseInt(gridSpacing.value),
        style: gridStyle.value,
        axisColor: axisColor.value,
        gridColor: gridColor.value,
        showNumbers: showNumbers.value
      };

      emit('add-element', coordinateData);
      close();
    };

    // Dodawanie figury geometrycznej
    const addGeometryShape = () => {
      let geometryData = {
        type: 'geometry',
        shape: activeGeometryTool.value,
        fillColor: geometryFillColor.value,
        strokeColor: geometryStrokeColor.value,
        showMeasurements: showMeasurements.value
      };

      // Dodanie specyficznych właściwości w zależności od typu figury
      if (activeGeometryTool.value === 'triangle') {
        geometryData = {
          ...geometryData,
          angle1: triangleAngle1.value,
          angle2: triangleAngle2.value,
          side: triangleSide.value
        };
      } else if (activeGeometryTool.value === 'circle') {
        geometryData = {
          ...geometryData,
          radius: circleRadius.value,
          showRadius: showRadius.value
        };
      } else if (activeGeometryTool.value === 'angle') {
        geometryData = {
          ...geometryData,
          angle: angleValue.value,
          side: angleSide.value
        };
      } else if (activeGeometryTool.value === 'ruler') {
        geometryData = {
          ...geometryData,
          length: rulerLength.value,
          unit: rulerUnit.value
        };
      }

      emit('add-element', geometryData);
      close();
    };

    // Dodawanie równania
    const addEquation = () => {
      const equationData = {
        type: 'equation',
        expression: equationExpression.value,
        format: equationFormat.value,
        size: equationSize.value,
        color: equationColor.value
      };

      emit('add-element', equationData);
      close();
    };

    // Zamknięcie edytora
    const close = () => {
      emit('close');
    };

    // Aktualizacja podglądu
    const updatePreviews = () => {
      // Implementacja aktualizacji podglądów
      // Dla każdego typu elementu matematycznego
    };

    // Obserwuj zmiany wartości i aktualizuj podglądy
    watch([
      functionExpression, xMin, xMax, functionColor, lineWidth, showCoordinateSystem,
      gridWidth, gridHeight, gridSpacing, gridStyle, axisColor, gridColor, showNumbers,
      activeGeometryTool, triangleAngle1, triangleAngle2, triangleSide, circleRadius,
      showRadius, angleValue, angleSide, rulerLength, rulerUnit, geometryFillColor,
      geometryStrokeColor, showMeasurements, equationExpression, equationFormat,
      equationSize, equationColor
    ], () => {
      updatePreviews();
    });

    // Inicjalizacja podglądów po zamontowaniu
    onMounted(() => {
      updatePreviews();
    });

    return {
      tabs,
      activeTab,
      previewContainer,
      coordinatePreviewContainer,
      geometryPreviewContainer,
      equationPreviewContainer,

      // Funkcje
      functionExpression,
      xMin,
      xMax,
      functionColor,
      lineWidth,
      showCoordinateSystem,

      // Układ współrzędnych
      gridWidth,
      gridHeight,
      gridSpacing,
      gridStyle,
      axisColor,
      gridColor,
      showNumbers,

      // Geometria
      geometryTools,
      activeGeometryTool,
      triangleAngle1,
      triangleAngle2,
      triangleSide,
      circleRadius,
      showRadius,
      angleValue,
      angleSide,
      rulerLength,
      rulerUnit,
      geometryFillColor,
      geometryStrokeColor,
      showMeasurements,

      // Równania
      equationFormat,
      equationExpression,
      equationSize,
      equationColor,
      equationHelpers,

      // Metody
      drawFunction,
      addCoordinateSystem,
      addGeometryShape,
      addEquation,
      insertEquationSymbol,
      close
    };
  }
};
</script>

<style lang="scss" scoped>
.math-editor {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;

  .tab-btn {
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    &.active {
      color: #1976d2;
      border-bottom-color: #1976d2;
    }
  }
}

.tab-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.tab-pane {
  height: 100%;
}

.input-group {
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  input, select, textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      border-color: #1976d2;
      outline: none;
    }
  }

  input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
  }
}

.input-row {
  display: flex;
  gap: 16px;

  .input-group {
    flex: 1;
  }
}

.function-preview, .coordinate-preview, .geometry-preview, .equation-preview {
  margin-top: 24px;

  h3 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .preview-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    height: 200px;
    background-color: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .equation-preview-container {
    height: 100px;
    padding: 16px;
  }
}

.button-row {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &.primary-btn {
      background-color: #1976d2;
      color: white;
      border: none;

      &:hover {
        background-color: #1565c0;
      }
    }

    &.secondary-btn {
      background-color: white;
      color: #333;
      border: 1px solid #ddd;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}

.tooltip {
  display: inline-block;
  position: relative;
  margin-left: 8px;

  .tooltip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #1976d2;
    color: white;
    font-size: 12px;
    cursor: help;
  }

  .tooltip-content {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 12px;
    width: 250px;
    z-index: 100;
    display: none;

    p {
      margin-top: 0;
      margin-bottom: 8px;
    }

    ul {
      margin: 0;
      padding-left: 16px;

      li {
        margin-bottom: 4px;
      }
    }
  }

  &:hover .tooltip-content {
    display: block;
  }
}

.geometry-tools {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 8px;

  .geometry-tool {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 70px;

    .tool-icon {
      width: 24px;
      height: 24px;
      margin-bottom: 4px;
    }

    span {
      font-size: 12px;
    }

    &:hover {
      background-color: #f5f5f5;
    }

    &.active {
      background-color: #e3f2fd;
      border-color: #1976d2;
      color: #1976d2;
    }
  }
}

.geometry-options {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.tool-options {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.color-options {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  .input-group {
    flex: 1;
  }
}

.equation-input {
  margin-bottom: 16px;

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    resize: vertical;
    margin-bottom: 8px;
  }
}

.equation-helpers {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .helper-btn {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

// Responsywność
@media (max-width: 768px) {
  .math-editor {
    width: 100%;
    border-radius: 0;
    height: 100vh;
    max-height: none;
  }

  .input-row {
    flex-direction: column;
    gap: 8px;
  }

  .editor-tabs {
    overflow-x: auto;

    .tab-btn {
      padding: 12px 12px;
      white-space: nowrap;
    }
  }
}
</style>

<!-- FunctionGraph.vue - Komponent wykresu funkcji -->
<template>
  <div class="function-graph" ref="graphContainer">
    <canvas ref="graphCanvas" width="400" height="300"></canvas>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Generowanie wykresu...</span>
    </div>

    <div v-if="error" class="error-message">
      <div class="error-icon">!</div>
      <span>{{ error }}</span>
    </div>

    <div v-if="showControls" class="graph-controls">
      <button @click="zoomIn" title="Przybliż">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button @click="zoomOut" title="Oddal">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button @click="resetView" title="Resetuj widok">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v6h6"></path>
          <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
          <path d="M21 22v-6h-6"></path>
          <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue';
// W rzeczywistej implementacji importowałbym bibliotekę matematyczną
// import * as mathjs from 'mathjs';

// Prosta implementacja parsera wyrażeń matematycznych
function evaluateExpression(expression, x) {
  // W rzeczywistej implementacji używalibyśmy:
  // return mathjs.evaluate(expression, { x: x });

  // Prosta implementacja dla demonstracji
  const safeExpression = expression
    .replace(/\^/g, '**')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs')
    .replace(/log/g, 'Math.log')
    .replace(/exp/g, 'Math.exp')
    .replace(/pi/g, 'Math.PI');

  try {
    // eslint-disable-next-line no-new-func
    return new Function('x', `return ${safeExpression}`)(x);
  } catch (e) {
    console.error('Error evaluating expression:', e);
    return NaN;
  }
}

export default {
  name: 'FunctionGraph',

  props: {
    expressions: {
      type: Array,
      default: () => [{ expr: 'x^2', color: '#1e88e5', width: 2 }]
    },
    xRange: {
      type: Array,
      default: () => [-10, 10]
    },
    yRange: {
      type: Array,
      default: null // Automatyczne
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 300
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    showAxis: {
      type: Boolean,
      default: true
    },
    showLabels: {
      type: Boolean,
      default: true
    },
    gridColor: {
      type: String,
      default: '#e0e0e0'
    },
    axisColor: {
      type: String,
      default: '#000000'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    showControls: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    // Referencje do elementów DOM
    const graphContainer = ref(null);
    const graphCanvas = ref(null);

    // Stan komponentu
    const loading = ref(false);
    const error = ref(null);
    const currentXRange = ref([...props.xRange]);
    const currentYRange = ref(props.yRange || [-10, 10]); // Domyślny zakres Y

    // Kontekst rysowania
    let ctx = null;

    // Inicjalizacja Canvas po zamontowaniu
    onMounted(() => {
      ctx = graphCanvas.value.getContext('2d');

      // Ustaw wymiary canvas
      graphCanvas.value.width = props.width;
      graphCanvas.value.height = props.height;

      // Narysuj wykres
      drawGraph();

      // Dodaj obsługę zdarzeń (powiększanie, przeciąganie)
      setupEvents();
    });

    // Czyszczenie zdarzeń przy odmontowaniu
    onUnmounted(() => {
      cleanupEvents();
    });

    // Obserwuj zmiany właściwości
    watch([
      () => props.expressions,
      () => props.xRange,
      () => props.yRange,
      () => props.width,
      () => props.height,
      () => props.showGrid,
      () => props.showAxis,
      () => props.showLabels,
      () => props.gridColor,
      () => props.axisColor,
      () => props.backgroundColor
    ], () => {
      // Aktualizacja wykresu przy zmianie właściwości
      if (ctx) {
        // Ustaw wymiary canvas
        graphCanvas.value.width = props.width;
        graphCanvas.value.height = props.height;

        // Aktualizuj zakresy
        currentXRange.value = [...props.xRange];
        currentYRange.value = props.yRange || [-10, 10];

        // Narysuj wykres
        drawGraph();
      }
    });

    // Funkcja rysująca wykres
    const drawGraph = () => {
      if (!ctx) return;

      loading.value = true;
      error.value = null;

      try {
        // Czyszczenie canvas
        ctx.fillStyle = props.backgroundColor;
        ctx.fillRect(0, 0, props.width, props.height);

        // Rysowanie siatki
        if (props.showGrid) {
          drawGrid();
        }

        // Rysowanie osi
        if (props.showAxis) {
          drawAxes();
        }

        // Rysowanie funkcji
        props.expressions.forEach(expr => {
          drawFunction(expr.expr, expr.color, expr.width);
        });

        // Etykiety
        if (props.showLabels) {
          drawLabels();
        }
      } catch (e) {
        console.error('Error drawing graph:', e);
        error.value = 'Błąd rysowania wykresu: ' + e.message;
      } finally {
        loading.value = false;
      }
    };

    // Rysowanie siatki
    const drawGrid = () => {
      const { width, height } = props;

      // Oblicz odstępy siatki
      const xRange = currentXRange.value[1] - currentXRange.value[0];
      const yRange = currentYRange.value[1] - currentYRange.value[0];

      // Dostosuj odstępy siatki w zależności od zakresu
      const xSpacing = getGridSpacing(xRange);
      const ySpacing = getGridSpacing(yRange);

      // Rysuj linie siatki
      ctx.strokeStyle = props.gridColor;
      ctx.lineWidth = 0.5;

      // Linie pionowe
      for (let x = Math.ceil(currentXRange.value[0] / xSpacing) * xSpacing; x <= currentXRange.value[1]; x += xSpacing) {
        const pixelX = mapXToPixel(x);
        ctx.beginPath();
        ctx.moveTo(pixelX, 0);
        ctx.lineTo(pixelX, height);
        ctx.stroke();
      }

      // Linie poziome
      for (let y = Math.ceil(currentYRange.value[0] / ySpacing) * ySpacing; y <= currentYRange.value[1]; y += ySpacing) {
        const pixelY = mapYToPixel(y);
        ctx.beginPath();
        ctx.moveTo(0, pixelY);
        ctx.lineTo(width, pixelY);
        ctx.stroke();
      }
    };

    // Obliczanie odpowiedniego odstępu siatki
    const getGridSpacing = (range) => {
      const roughCount = 10; // Przybliżona liczba linii siatki
      const roughSpacing = range / roughCount;

      // Zaokrąglij do "ładnych" liczb (1, 2, 5, 10, 20, 50, ...)
      const magnitude = Math.pow(10, Math.floor(Math.log10(roughSpacing)));
      const normalized = roughSpacing / magnitude;

      if (normalized < 1.5) return magnitude;
      if (normalized < 3.5) return 2 * magnitude;
      if (normalized < 7.5) return 5 * magnitude;
      return 10 * magnitude;
    };

    // Rysowanie osi
    const drawAxes = () => {
      const { width, height } = props;

      ctx.strokeStyle = props.axisColor;
      ctx.lineWidth = 1.5;

      // Oś X
      const yAxisPixelX = mapXToPixel(0);
      if (yAxisPixelX >= 0 && yAxisPixelX <= width) {
        ctx.beginPath();
        ctx.moveTo(yAxisPixelX, 0);
        ctx.lineTo(yAxisPixelX, height);
        ctx.stroke();
      }

      // Oś Y
      const xAxisPixelY = mapYToPixel(0);
      if (xAxisPixelY >= 0 && xAxisPixelY <= height) {
        ctx.beginPath();
        ctx.moveTo(0, xAxisPixelY);
        ctx.lineTo(width, xAxisPixelY);
        ctx.stroke();
      }
    };

    // Rysowanie etykiet
    const drawLabels = () => {
      const { width, height } = props;

      // Oblicz odstępy etykiet
      const xRange = currentXRange.value[1] - currentXRange.value[0];
      const yRange = currentYRange.value[1] - currentYRange.value[0];

      // Dostosuj odstępy etykiet w zależności od zakresu
      const xSpacing = getGridSpacing(xRange);
      const ySpacing = getGridSpacing(yRange);

      ctx.fillStyle = props.axisColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Etykiety na osi X
      for (let x = Math.ceil(currentXRange.value[0] / xSpacing) * xSpacing; x <= currentXRange.value[1]; x += xSpacing) {
        if (Math.abs(x) < 1e-10) continue; // Pomijamy zero

        const pixelX = mapXToPixel(x);
        if (pixelX >= 0 && pixelX <= width) {
          ctx.fillText(x.toString(), pixelX, mapYToPixel(0) + 5);
        }
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Etykiety na osi Y
      for (let y = Math.ceil(currentYRange.value[0] / ySpacing) * ySpacing; y <= currentYRange.value[1]; y += ySpacing) {
        if (Math.abs(y) < 1e-10) continue; // Pomijamy zero

        const pixelY = mapYToPixel(y);
        if (pixelY >= 0 && pixelY <= height) {
          ctx.fillText(y.toString(), mapXToPixel(0) - 5, pixelY);
        }
      }
    };

    // Rysowanie funkcji
    const drawFunction = (expression, color, lineWidth) => {
      const { width } = props;
      const pixelsPerPoint = 1; // Rozdzielczość rysowania (więcej punktów = wyższa jakość, ale niższa wydajność)

      ctx.strokeStyle = color || '#1e88e5';
      ctx.lineWidth = lineWidth || 2;
      ctx.beginPath();

      let isFirstPoint = true;
      let prevY = null;

      // Rysujemy funkcję punkt po punkcie
      for (let pixelX = 0; pixelX <= width; pixelX += pixelsPerPoint) {
        const x = mapPixelToX(pixelX);
        const y = evaluateExpression(expression, x);

        if (isNaN(y)) {
          // Przerwa w ciągłości - zaczynamy nową ścieżkę
          isFirstPoint = true;
          continue;
        }

        const pixelY = mapYToPixel(y);

        // Sprawdzenie czy mamy do czynienia z pionową asymptotą
        if (prevY !== null && Math.abs(pixelY - prevY) > 100) {
          // Przerwa w ciągłości - zaczynamy nową ścieżkę
          isFirstPoint = true;
        }

        if (isFirstPoint) {
          ctx.moveTo(pixelX, pixelY);
          isFirstPoint = false;
        } else {
          ctx.lineTo(pixelX, pixelY);
        }

        prevY = pixelY;
      }

      ctx.stroke();
    };

    // Mapowanie współrzędnej X na piksel
    const mapXToPixel = (x) => {
      const { width } = props;
      const xRange = currentXRange.value[1] - currentXRange.value[0];
      return ((x - currentXRange.value[0]) / xRange) * width;
    };

    // Mapowanie współrzędnej Y na piksel (odwrócone, bo w canvas 0 jest na górze)
    const mapYToPixel = (y) => {
      const { height } = props;
      const yRange = currentYRange.value[1] - currentYRange.value[0];
      return height - ((y - currentYRange.value[0]) / yRange) * height;
    };

    // Mapowanie piksela na współrzędną X
    const mapPixelToX = (pixelX) => {
      const { width } = props;
      const xRange = currentXRange.value[1] - currentXRange.value[0];
      return currentXRange.value[0] + (pixelX / width) * xRange;
    };

    // Mapowanie piksela na współrzędną Y
    const mapPixelToY = (pixelY) => {
      const { height } = props;
      const yRange = currentYRange.value[1] - currentYRange.value[0];
      return currentYRange.value[0] + ((height - pixelY) / height) * yRange;
    };

    // Funkcje kontroli wykresu
    const zoomIn = () => {
      // Zmniejszamy zakres X i Y o 20%
      const xCenter = (currentXRange.value[0] + currentXRange.value[1]) / 2;
      const xHalfRange = (currentXRange.value[1] - currentXRange.value[0]) * 0.4;
      currentXRange.value = [xCenter - xHalfRange, xCenter + xHalfRange];

      const yCenter = (currentYRange.value[0] + currentYRange.value[1]) / 2;
      const yHalfRange = (currentYRange.value[1] - currentYRange.value[0]) * 0.4;
      currentYRange.value = [yCenter - yHalfRange, yCenter + yHalfRange];

      drawGraph();
    };

    const zoomOut = () => {
      // Zwiększamy zakres X i Y o 25% (odwrotność 20% zoom in)
      const xCenter = (currentXRange.value[0] + currentXRange.value[1]) / 2;
      const xHalfRange = (currentXRange.value[1] - currentXRange.value[0]) * 0.625;
      currentXRange.value = [xCenter - xHalfRange, xCenter + xHalfRange];

      const yCenter = (currentYRange.value[0] + currentYRange.value[1]) / 2;
      const yHalfRange = (currentYRange.value[1] - currentYRange.value[0]) * 0.625;
      currentYRange.value = [yCenter - yHalfRange, yCenter + yHalfRange];

      drawGraph();
    };

    const resetView = () => {
      currentXRange.value = [...props.xRange];
      currentYRange.value = props.yRange || [-10, 10];
      drawGraph();
    };

    // Obsługa zdarzeń
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      graphContainer.value.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;

      // Konwertujemy piksele na jednostki wykresu
      const xRange = currentXRange.value[1] - currentXRange.value[0];
      const yRange = currentYRange.value[1] - currentYRange.value[0];

      const xPerPixel = xRange / props.width;
      const yPerPixel = yRange / props.height;

      // Przesuwamy zakres w przeciwną stronę niż ruch myszą
      currentXRange.value = [
        currentXRange.value[0] - deltaX * xPerPixel,
        currentXRange.value[1] - deltaX * xPerPixel
      ];

      currentYRange.value = [
        currentYRange.value[0] + deltaY * yPerPixel,
        currentYRange.value[1] + deltaY * yPerPixel
      ];

      lastX = e.clientX;
      lastY = e.clientY;

      drawGraph();
    };

    const onMouseUp = () => {
      isDragging = false;
      graphContainer.value.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();

      const rect = graphCanvas.value.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Konwertujemy pozycję myszy na jednostki wykresu
      const xAtMouse = mapPixelToX(mouseX);
      const yAtMouse = mapPixelToY(mouseY);

      // Współczynnik przybliżenia
      const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;

      // Aktualizujemy zakres, zachowując punkt pod kursorem myszy
      const xRange = currentXRange.value[1] - currentXRange.value[0];
      const yRange = currentYRange.value[1] - currentYRange.value[0];

      const newXRange = xRange * scaleFactor;
      const newYRange = yRange * scaleFactor;

      const xRatio = (xAtMouse - currentXRange.value[0]) / xRange;
      const yRatio = (yAtMouse - currentYRange.value[0]) / yRange;

      currentXRange.value = [
        xAtMouse - xRatio * newXRange,
        xAtMouse + (1 - xRatio) * newXRange
      ];

      currentYRange.value = [
        yAtMouse - yRatio * newYRange,
        yAtMouse + (1 - yRatio) * newYRange
      ];

      drawGraph();
    };

    // Konfiguracja obsługi zdarzeń
    const setupEvents = () => {
      const canvas = graphCanvas.value;

      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('wheel', onWheel, { passive: false });

      // Styl kursora
      graphContainer.value.style.cursor = 'grab';
    };

    // Czyszczenie obsługi zdarzeń
    const cleanupEvents = () => {
      const canvas = graphCanvas.value;

      if (canvas) {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('wheel', onWheel);
      }

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    return {
      graphContainer,
      graphCanvas,
      loading,
      error,
      zoomIn,
      zoomOut,
      resetView,
      showControls: props.showControls
    };
  }
};
</script>

<style lang="scss" scoped>
.function-graph {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  canvas {
    display: block;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #1976d2;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  span {
    font-size: 14px;
    color: #333;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffebee;
  color: #d32f2f;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  max-width: 80%;
  z-index: 10;

  .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #d32f2f;
    color: white;
    font-weight: bold;
    margin-right: 8px;
    flex-shrink: 0;
  }

  span {
    font-size: 14px;
  }
}

.graph-controls {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  button {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: none;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}
</style>

<!-- EquationDisplay.vue - Komponent do wyświetlania równań matematycznych -->
<template>
  <div class="equation-display" :class="sizeClass">
    <div 
      ref="equationContainer" 
      class="equation-content"
      :style="{ color: color }"
    ></div>

    <div v-if="error" class="equation-error">
      <span>{{ error }}</span>
    </div>

    <div v-if="editable && !isEditing" class="equation-actions">
      <button class="action-btn edit-btn" @click="startEditing" title="Edytuj równanie">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
    </div>

    <div v-if="isEditing" class="equation-editor">
      <div class="editor-header">
        <h3>Edycja równania</h3>
        <button class="close-btn" @click="cancelEditing">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="editor-content">
        <div class="input-group">
          <label>Format:</label>
          <select v-model="editFormat">
            <option value="latex">LaTeX</option>
            <option value="asciimath">AsciiMath</option>
          </select>
        </div>

        <div class="input-group">
          <label>Równanie:</label>
          <textarea v-model="editExpression" rows="3" placeholder="Wpisz równanie"></textarea>
        </div>

        <div class="equation-helpers">
          <button 
            v-for="helper in equationHelpers" 
            :key="helper.id" 
            class="helper-btn"
            @click="insertEquationSymbol(helper.value)"
            :title="helper.desc"
          >
            <span v-html="helper.display"></span>
          </button>
        </div>

        <div class="input-row">
          <div class="input-group">
            <label>Rozmiar:</label>
            <select v-model="editSize">
              <option value="small">Mały</option>
              <option value="medium">Średni</option>
              <option value="large">Duży</option>
            </select>
          </div>
          <div class="input-group">
            <label>Kolor:</label>
            <input type="color" v-model="editColor" />
          </div>
        </div>

        <div class="button-row">
          <button @click="saveEditing" class="primary-btn">Zapisz</button>
          <button @click="cancelEditing" class="secondary-btn">Anuluj</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
// W rzeczywistej implementacji importowałbym bibliotekę do renderowania równań
// import katex from 'katex';
// import 'katex/dist/katex.min.css';
// lub
// import { renderMathInElement } from 'mathjax';

export default {
  name: 'EquationDisplay',

  props: {
    expression: {
      type: String,
      required: true
    },
    format: {
      type: String,
      default: 'latex',
      validator: (value) => ['latex', 'asciimath'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    color: {
      type: String,
      default: '#000000'
    },
    editable: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update'],

  setup(props, { emit }) {
    // Referencje do elementów DOM
    const equationContainer = ref(null);

    // Stan komponentu
    const error = ref(null);
    const isEditing = ref(false);

    // Stan edycji
    const editExpression = ref(props.expression);
    const editFormat = ref(props.format);
    const editSize = ref(props.size);
    const editColor = ref(props.color);

    // Obliczane klasy CSS
    const sizeClass = computed(() => `equation-size-${props.size}`);

    // Pomocnicy dla równań
    const equationHelpers = [
      { id: 'frac', display: '\\(\\frac{a}{b}\\)', value: '\\frac{a}{b}', desc: 'Ułamek' },
      { id: 'sqrt', display: '\\(\\sqrt{x}\\)', value: '\\sqrt{x}', desc: 'Pierwiastek' },
      { id: 'sum', display: '\\(\\sum_{i=1}^{n}\\)', value: '\\sum_{i=1}^{n}', desc: 'Suma' },
      { id: 'int', display: '\\(\\int_{a}^{b}\\)', value: '\\int_{a}^{b}', desc: 'Całka' },
      { id: 'pi', display: '\\(\\pi\\)', value: '\\pi', desc: 'Pi' },
      { id: 'theta', display: '\\(\\theta\\)', value: '\\theta', desc: 'Theta' },
      { id: 'alpha', display: '\\(\\alpha\\)', value: '\\alpha', desc: 'Alpha' },
      { id: 'pm', display: '\\(\\pm\\)', value: '\\pm', desc: 'Plus-minus' }
    ];

    // Renderowanie równania
    const renderEquation = () => {
      if (!equationContainer.value) return;

      error.value = null;

      try {
        // W rzeczywistej implementacji używalibyśmy biblioteki KaTeX lub MathJax
        // Na przykład:
        // if (props.format === 'latex') {
        //   katex.render(props.expression, equationContainer.value, {
        //     throwOnError: false,
        //     displayMode: true
        //   });
        // } else {
        //   // AsciiMath - conversion to LaTeX first
        //   const latexExpression = asciimath.parse(props.expression);
        //   katex.render(latexExpression, equationContainer.value, {
        //     throwOnError: false,
        //     displayMode: true
        //   });
        // }

        // Tymczasowe rozwiązanie dla demonstracji
        equationContainer.value.innerHTML = `<div class="mock-equation">${props.expression}</div>`;
      } catch (e) {
        console.error('Error rendering equation:', e);
        error.value = 'Błąd renderowania równania: ' + e.message;
      }
    };

    // Rozpoczęcie edycji
    const startEditing = () => {
      editExpression.value = props.expression;
      editFormat.value = props.format;
      editSize.value = props.size;
      editColor.value = props.color;
      isEditing.value = true;
    };

    // Zapisanie zmian
    const saveEditing = () => {
      emit('update', {
        expression: editExpression.value,
        format: editFormat.value,
        size: editSize.value,
        color: editColor.value
      });

      isEditing.value = false;
    };

    // Anulowanie edycji
    const cancelEditing = () => {
      isEditing.value = false;
    };

    // Wstawianie symboli do równania
    const insertEquationSymbol = (symbol) => {
      const textarea = document.querySelector('textarea');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editExpression.value;

      editExpression.value = text.substring(0, start) + symbol + text.substring(end);

      // Ustawienie kursora po wstawionym symbolu
      nextTick(() => {
        textarea.focus();
        textarea.selectionStart = start + symbol.length;
        textarea.selectionEnd = start + symbol.length;
      });
    };

    // Renderowanie równania po zamontowaniu
    onMounted(() => {
      renderEquation();
    });

    // Obserwuj zmiany właściwości
    watch([
      () => props.expression,
      () => props.format,
      () => props.size,
      () => props.color
    ], () => {
      renderEquation();
    });

    return {
      equationContainer,
      error,
      sizeClass,
      isEditing,
      editExpression,
      editFormat,
      editSize,
      editColor,
      equationHelpers,
      startEditing,
      saveEditing,
      cancelEditing,
      insertEquationSymbol
    };
  }
};
</script>

<style lang="scss" scoped>
.equation-display {
  margin: 16px 0;
  position: relative;

  &:hover .equation-actions {
    opacity: 1;
  }

  &.equation-size-small {
    font-size: 16px;
  }

  &.equation-size-medium {
    font-size: 24px;
  }

  &.equation-size-large {
    font-size: 32px;
  }
}

.equation-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  min-height: 50px;

  .mock-equation {
    font-family: 'Times New Roman', serif;
    font-style: italic;
  }
}

.equation-error {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 8px;
}

.equation-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 2px;

  .action-btn {
    background: transparent;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.equation-editor {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  z-index: 1000;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }

  .close-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.editor-content {
  padding: 16px;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
}

.input-group {
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  input, select, textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      border-color: #1976d2;
      outline: none;
    }
  }

  textarea {
    font-family: monospace;
    resize: vertical;
  }
}

.input-row {
  display: flex;
  gap: 16px;

  .input-group {
    flex: 1;
  }
}

.equation-helpers {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;

  .helper-btn {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;

  button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &.primary-btn {
      background-color: #1976d2;
      color: white;
      border: none;

      &:hover {
        background-color: #1565c0;
      }
    }

    &.secondary-btn {
      background-color: white;
      color: #333;
      border: 1px solid #ddd;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>