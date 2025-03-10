// src/services/mockData.js

// Mock data for boards
const mockBoards = [
  {
    id: 1,
    title: "Planowanie Projektu",
    description: "Tablica do planowania projektu i generowania pomysłów",
    created_at: "2023-04-15T10:30:00Z",
    updated_at: "2023-04-16T14:20:00Z",
    is_public: false,
    user_permission: "owner",
    elements_count: 12
  },
  {
    id: 2,
    title: "Warsztat UX Design",
    description: "Wspólna tablica do sesji projektowania UX",
    created_at: "2023-04-10T09:15:00Z",
    updated_at: "2023-04-14T16:45:00Z",
    is_public: true,
    user_permission: "owner",
    elements_count: 28
  }
];

// Mock data for elements
const mockElements = [
  {
    id: 1,
    board: 1,
    element_type: "text",
    position_x: 100,
    position_y: 150,
    width: 200,
    height: 50,
    rotation: 0,
    z_index: 1,
    content: "Cele Projektu",
    properties: {
      color: "#000000",
      fontSize: "24px"
    }
  },
  {
    id: 2,
    board: 1,
    element_type: "shape",
    position_x: 400,
    position_y: 200,
    width: 150,
    height: 150,
    rotation: 0,
    z_index: 2,
    properties: {
      type: "rectangle",
      fill: "#3498db",
      stroke: "#2980b9"
    }
  }
];

// Mock for board history
const mockHistory = [
  {
    id: 1,
    board: 1,
    action_type: "create",
    element_type: "text",
    element_id: 1,
    user: "demo_user",
    timestamp: "2023-04-15T10:35:00Z",
    snapshot: null
  },
  {
    id: 2,
    board: 1,
    action_type: "create",
    element_type: "shape",
    element_id: 2,
    user: "demo_user",
    timestamp: "2023-04-15T10:40:00Z",
    snapshot: null
  }
];

// Serwisy mockujące
const mockBoardService = {
  getBoards: async () => Promise.resolve(mockBoards),

  getBoard: async (id) => Promise.resolve(mockBoards.find(board => board.id === parseInt(id)) || mockBoards[0]),

  createBoard: async (data) => {
    const newBoard = {
      id: mockBoards.length + 1,
      title: data.title || "Nowa Tablica",
      description: data.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: data.is_public || false,
      user_permission: "owner",
      elements_count: 0
    };
    mockBoards.push(newBoard);
    return Promise.resolve(newBoard);
  },

  updateBoard: async (id, data) => {
    const board = mockBoards.find(b => b.id === parseInt(id));
    if (board) {
      Object.assign(board, data, { updated_at: new Date().toISOString() });
    }
    return Promise.resolve(board);
  },

  deleteBoard: async (id) => {
    const index = mockBoards.findIndex(b => b.id === parseInt(id));
    if (index !== -1) {
      mockBoards.splice(index, 1);
    }
    return Promise.resolve(true);
  }
};

const mockElementService = {
  getBoardElements: async (boardId) => Promise.resolve(mockElements.filter(el => el.board === parseInt(boardId))),

  createElement: async (boardId, data) => {
    const newElement = {
      id: mockElements.length + 1,
      board: parseInt(boardId),
      element_type: data.element_type,
      position_x: data.position_x || 0,
      position_y: data.position_y || 0,
      width: data.width || 100,
      height: data.height || 100,
      rotation: data.rotation || 0,
      z_index: data.z_index || mockElements.length + 1,
      content: data.content || "",
      path: data.path || null,
      properties: data.properties || {}
    };
    mockElements.push(newElement);
    return Promise.resolve(newElement);
  },

  updateElement: async (boardId, elementId, data) => {
    const element = mockElements.find(el => el.id === parseInt(elementId) && el.board === parseInt(boardId));
    if (element) {
      Object.assign(element, data);
    }
    return Promise.resolve(element);
  },

  deleteElement: async (boardId, elementId) => {
    const index = mockElements.findIndex(el => el.id === parseInt(elementId) && el.board === parseInt(boardId));
    if (index !== -1) {
      mockElements.splice(index, 1);
    }
    return Promise.resolve(true);
  },

  getBoardHistory: async (boardId) => Promise.resolve(mockHistory.filter(h => h.board === parseInt(boardId))),

  undoAction: async (boardId) => Promise.resolve({ success: true })
};

const mockWebsocketService = {
  connect: (boardId) => {
    console.log(`[WebSocket] Mock connection to board: ${boardId}`);
  },
  disconnect: () => {
    console.log('[WebSocket] Mock disconnection');
  },
  send: (action, data) => {
    console.log(`[WebSocket] Mock send: ${action}`, data);
    return true;
  },
  addListener: (eventType, callback) => {
    console.log(`[WebSocket] Mock add listener for: ${eventType}`);
  },
  removeListener: (eventType, callback) => {
    console.log(`[WebSocket] Mock remove listener for: ${eventType}`);
  }
};

// Eksport funkcji instalującej mocki
export function installMockServices() {
  console.log('[Mock] Installing mock API services');

  // Zainstaluj globalne mocki
  window.boardService = mockBoardService;
  window.elementService = mockElementService;
  window.websocketService = mockWebsocketService;

  return {
    boardService: mockBoardService,
    elementService: mockElementService,
    websocketService: mockWebsocketService
  };
}

// Eksport dla testowania
export {
  mockBoards,
  mockElements,
  mockHistory,
  mockBoardService,
  mockElementService,
  mockWebsocketService
};