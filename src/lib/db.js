import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_ITEMS = [
  // Milk Products
  { id: '1', name: 'Cheese Block', category: 'Milk Products', unit: 'box', image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=400&auto=format&fit=crop&q=80' },
  { id: '2', name: 'Cheese Slice', category: 'Milk Products', unit: 'box', image: 'https://images.unsplash.com/photo-1528750901443-d93a7782d132?w=400&auto=format&fit=crop&q=80' },
  { id: '3', name: 'White Cheese', category: 'Milk Products', unit: 'box', image: 'https://images.unsplash.com/photo-1624806992066-50efd09d8c41?w=400&auto=format&fit=crop&q=80' },
  { id: '4', name: 'Gouda', category: 'Milk Products', unit: 'packet', image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&auto=format&fit=crop&q=80' },

  // Sauces & Dressings
  { id: '5', name: 'Chinese Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80' },
  { id: '6', name: 'Momo Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=80' },
  { id: '7', name: 'Garlic Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?w=400&auto=format&fit=crop&q=80' },
  { id: '8', name: 'Tandoori Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80' },
  { id: '9', name: 'Mexican Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1618414241390-9ec1f55963e4?w=400&auto=format&fit=crop&q=80' },
  { id: '10', name: 'Schezwan Sauce', category: 'Sauces & Dressings', unit: 'box', image: 'https://images.unsplash.com/photo-1601314002592-b87400368c35?w=400&auto=format&fit=crop&q=80' },
  { id: '11', name: 'Thousand Island', category: 'Sauces & Dressings', unit: 'box', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80' },
  { id: '12', name: 'Mayonnaise', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?w=400&auto=format&fit=crop&q=80' },

  // Toppings
  { id: '13', name: 'Black Olives', category: 'Toppings', unit: 'unit', image: 'https://images.unsplash.com/photo-1541014741259-df5298b3b28a?w=400&auto=format&fit=crop&q=80' },
  { id: '14', name: 'Jalapeno', category: 'Toppings', unit: 'unit', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&auto=format&fit=crop&q=80' },

  // Frozen/Prepared Foods
  { id: '15', name: 'Tikki', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&auto=format&fit=crop&q=80' },
  { id: '16', name: 'French Fries', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80' },
  { id: '17', name: 'Manchurian', category: 'Frozen/Prepared Foods', unit: 'packet', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&auto=format&fit=crop&q=80' },
  { id: '18', name: 'Corn', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://images.unsplash.com/photo-1551754625-70c90487530d?w=400&auto=format&fit=crop&q=80' },

  // Packaging/Boxes
  { id: '19', name: 'Pizza Box', category: 'Packaging/Boxes', unit: 'box', image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&auto=format&fit=crop&q=80' },
  { id: '20', name: 'Parcel Ketchup', category: 'Packaging/Boxes', unit: 'box', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&auto=format&fit=crop&q=80' },

  // Spices/Seasonings
  { id: '21', name: 'Peri Peri Masala', category: 'Spices/Seasonings', unit: 'packet', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80' },
  { id: '22', name: 'Parcel Oregano', category: 'Spices/Seasonings', unit: 'packet', image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&auto=format&fit=crop&q=80' },
  { id: '23', name: 'Parcel Chilli Flakes', category: 'Spices/Seasonings', unit: 'packet', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80' },

  // Oils & Fats
  { id: '24', name: 'Oil', category: 'Oils & Fats', unit: 'box', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80' },
  { id: '25', name: 'Butter', category: 'Oils & Fats', unit: 'box', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80' }
];

function initializeDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const data = {
      items: INITIAL_ITEMS,
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

function readDb() {
  initializeDb();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read database file, resetting database:', error);
    const data = { items: INITIAL_ITEMS, orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }
}

function writeDb(data) {
  initializeDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getItems: () => {
    const data = readDb();
    return data.items;
  },

  getOrders: () => {
    const data = readDb();
    // Return orders sorted by creation date descending
    return data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createOrder: (orderData) => {
    const data = readDb();
    const newOrder = {
      id: `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      storeName: orderData.storeName || 'Unnamed Store',
      notes: orderData.notes || '',
      items: orderData.items || [],
      totalItems: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
      status: 'Ordered',
      createdAt: new Date().toISOString(),
    };
    
    data.orders.push(newOrder);
    writeDb(data);
    return newOrder;
  }
};
