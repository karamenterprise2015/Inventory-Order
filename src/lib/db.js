// Vercel-compatible in-memory database for demo purposes
// For production, replace with Vercel KV, Postgres, or other persistent storage

const INITIAL_ITEMS = [
  // Bakery
  { id: '1', name: 'Burger Bun', category: 'Bakery', unit: 'packet', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80' },
  { id: '2', name: 'Pizza Base', category: 'Bakery', unit: 'bag', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80' },
  { id: '3', name: 'Sandwich Bread', category: 'Bakery', unit: 'jambo', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80' },

  // Milk Products
  { id: '1', name: 'Cheese Block', category: 'Milk Products', unit: 'box', image: 'https://5.imimg.com/data5/SELLER/Default/2026/2/582570991/TM/FK/AZ/89400533/image.jpeg' },
  { id: '2', name: 'Cheese Slice', category: 'Milk Products', unit: 'box', image: 'https://www.bbassets.com/media/uploads/p/l/40005949_4-go-cheese-slice-plain.jpg' },
  { id: '3', name: 'White Cheese', category: 'Milk Products', unit: 'box', image: 'https://images.unsplash.com/photo-1624806992066-50efd09d8c41?w=400&auto=format&fit=crop&q=80' },
  { id: '4', name: 'Gouda', category: 'Milk Products', unit: 'packet', image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&auto=format&fit=crop&q=80' },

  // Sauces & Dressings
  { id: '8', name: 'Chinese Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80' },
  { id: '9', name: 'Momo Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=80' },
  { id: '10', name: 'Garlic Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?w=400&auto=format&fit=crop&q=80' },
  { id: '11', name: 'Tandoori Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80' },
  { id: '12', name: 'Mexican Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1618414241390-9ec1f55963e4?w=400&auto=format&fit=crop&q=80' },
  { id: '13', name: 'Schezwan Sauce', category: 'Sauces & Dressings', unit: 'box', image: 'https://images.unsplash.com/photo-1601314002592-b87400368c35?w=400&auto=format&fit=crop&q=80' },
  { id: '14', name: 'Thousand Island', category: 'Sauces & Dressings', unit: 'box', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80' },
  { id: '15', name: 'Mayonnaise', category: 'Sauces & Dressings', unit: 'packet', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?w=400&auto=format&fit=crop&q=80' },

  // Toppings
  { id: '16', name: 'Black Olives', category: 'Toppings', unit: 'unit', image: 'https://images.unsplash.com/photo-1541014741259-df5298b3b28a?w=400&auto=format&fit=crop&q=80' },
  { id: '17', name: 'Jalapeno', category: 'Toppings', unit: 'unit', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&auto=format&fit=crop&q=80' },

  // Frozen/Prepared Foods
  { id: '18', name: 'Tikki', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&auto=format&fit=crop&q=80' },
  { id: '19', name: 'French Fries', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80' },
  { id: '20', name: 'Manchurian', category: 'Frozen/Prepared Foods', unit: 'packet', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&auto=format&fit=crop&q=80' },
  { id: '21', name: 'Corn', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://images.unsplash.com/photo-1551754625-70c90487530d?w=400&auto=format&fit=crop&q=80' },

  // Packaging/Boxes
  { id: '22', name: 'Pizza Box', category: 'Packaging/Boxes', unit: 'box', image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&auto=format&fit=crop&q=80' },
  { id: '23', name: 'Parcel Ketchup', category: 'Packaging/Boxes', unit: 'box', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&auto=format&fit=crop&q=80' },

  // Spices/Seasonings
  { id: '24', name: 'Peri Peri Masala', category: 'Spices/Seasonings', unit: 'packet', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80' },
  { id: '25', name: 'Parcel Oregano', category: 'Spices/Seasonings', unit: 'packet', image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&auto=format&fit=crop&q=80' },
  { id: '26', name: 'Parcel Chilli Flakes', category: 'Spices/Seasonings', unit: 'packet', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80' },

  // Oils & Fats
  { id: '27', name: 'Oil', category: 'Oils & Fats', unit: 'box', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80' },
  { id: '28', name: 'Butter', category: 'Oils & Fats', unit: 'box', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80' }
];

// In-memory storage (resets on server restart)
let orders = [];

export const db = {
  getItems: () => {
    return INITIAL_ITEMS;
  },

  getOrders: () => {
    // Return orders sorted by creation date descending
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createOrder: (orderData) => {
    const newOrder = {
      id: `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      personName: orderData.personName || 'Unnamed Person',
      notes: orderData.notes || '',
      items: orderData.items || [],
      totalItems: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
      status: 'Ordered',
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    return newOrder;
  },

  cancelOrder: (orderId) => {
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex > -1) {
      orders[orderIndex].status = 'Cancelled';
      orders[orderIndex].cancelledAt = new Date().toISOString();
      return orders[orderIndex];
    }
    return null;
  },

  deleteOrder: (orderId) => {
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex > -1) {
      const deletedOrder = orders.splice(orderIndex, 1)[0];
      return deletedOrder;
    }
    return null;
  },

  getAnalytics: (year, month) => {
    const filteredOrders = orders.filter(order => {
      if (order.status === 'Cancelled') return false;
      
      const orderDate = new Date(order.createdAt);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();
      
      if (year && orderYear !== year) return false;
      if (month !== undefined && orderMonth !== month) return false;
      
      return true;
    });

    // Calculate analytics by category and item
    const analytics = {
      totalOrders: filteredOrders.length,
      totalItems: filteredOrders.reduce((sum, order) => sum + order.totalItems, 0),
      byCategory: {},
      byItem: {},
      byPerson: {}
    };

    filteredOrders.forEach(order => {
      // By person
      if (!analytics.byPerson[order.personName]) {
        analytics.byPerson[order.personName] = {
          orders: 0,
          items: 0
        };
      }
      analytics.byPerson[order.personName].orders += 1;
      analytics.byPerson[order.personName].items += order.totalItems;

      // By category and item
      order.items.forEach(item => {
        // By category
        if (!analytics.byCategory[item.category]) {
          analytics.byCategory[item.category] = {
            totalQuantity: 0,
            items: {}
          };
        }
        analytics.byCategory[item.category].totalQuantity += item.quantity;

        // By item within category
        if (!analytics.byCategory[item.category].items[item.name]) {
          analytics.byCategory[item.category].items[item.name] = 0;
        }
        analytics.byCategory[item.category].items[item.name] += item.quantity;

        // By item (global)
        if (!analytics.byItem[item.name]) {
          analytics.byItem[item.name] = {
            category: item.category,
            totalQuantity: 0,
            unit: item.unit
          };
        }
        analytics.byItem[item.name].totalQuantity += item.quantity;
      });
    });

    return analytics;
  }
};
