// Vercel-compatible database with Supabase integration
// For production, ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set

import { supabase } from './supabase.js';

const INITIAL_ITEMS = [
  // Bakery
  { id: '1', name: 'Burger Bun', category: 'Bakery', unit: 6.75, image: 'https://natashaskitchen.com/wp-content/uploads/2024/05/Burger-Buns-4.jpg', price: null },
  { id: '2', name: 'Pizza ', category: 'Bakery', unit: 19, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKeb7exNWkqx2mBz9hpgLmvlNqI5kUGkRiEosYy_1lMw&s=10', price: null },
  { id: '3', name: 'Jambo', category: 'Bakery', unit: 57, image: 'https://www.girlversusdough.com/wp-content/uploads/2025/05/sandwich-bread-two-slices.jpg', price: null },

  // Milk Products
  { id: '4', name: 'Cheese Block', category: 'Milk Products', unit: 'box', image: 'https://5.imimg.com/data5/SELLER/Default/2026/2/582570991/TM/FK/AZ/89400533/image.jpeg', price: 6798.33 },
  { id: '5', name: 'Cheese Slice', category: 'Milk Products', unit: 'box', image: 'https://www.bbassets.com/media/uploads/p/l/40005949_4-go-cheese-slice-plain.jpg', price: 5440.01 },
  { id: '6', name: 'White Cheese', category: 'Milk Products', unit: 'box', image: 'https://m.media-amazon.com/images/I/61i+xZXRZ2L._AC_UF894,1000_QL80_.jpg', price: 1900.21 },
  { id: '7', name: 'Gouda', category: 'Milk Products', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCS0ToFqulGdWqPyEiq9d71Wab962yz7y3UUEAEGLauQ&s', price: 230.60 },

  // Sauces & Dressings
  { id: '8', name: 'Chinese Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREBBXf4fQbb2FLL2D0MWk87Ss0aq3GIfXWJwVHP-C-kw&s', price: 209.00 },
  { id: '9', name: 'Momo Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzk0a-EvqPOTuKpLnsD2TdZRRSdwH9Ebwoz2tcXuqQzVScZ8MMKvpQOTtS&s=10', price: 195.39 },
  { id: '10', name: 'Creamy Garlic Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://5.imimg.com/data5/SELLER/Default/2024/12/471753006/AX/NX/JP/126961935/veeba-garlic-mayonnaise.jpg', price: 196.39 },
  { id: '11', name: 'Tandoori Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ5Ep05V1xQPC-1YtNkOc97Sz02cQW7ukjQEVrAnY9d8Z6Gnc92a-709vV&s=10', price: 231.85 },
  { id: '12', name: 'Mexican Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://assets.hyperpure.com/data/images/products/76346bedc39b74f0db8927c6c46ab637.png', price: 220.01 },
  { id: '13', name: 'Schezwan Sauce', category: 'Sauces & Dressings', unit: 'box', image: 'https://objectstorage.ap-hyderabad-1.oraclecloud.com/n/axg29whcmhb3/b/tbn-prod-assets/o/PRODUCT_1696394336616.webp', price: 1839.60 },
  { id: '14', name: 'Thousand Island', category: 'Sauces & Dressings', unit: 'box', image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/sauce-ketchup/5/m/x/1-thousand-dressing-1kg-pouch-1-sauce-veeba-original-imagucjx5frgqmm9.jpeg?q=90', price: 2045.11 },
  { id: '15', name: 'Mayonnaise', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPTaRmOYiLhFgK5RGEV_CSvEtDpabWyDnT9bzRuQjywTkYuSELABS9fLA&s=10', price: null },
  { id: '16', name: 'Chipotle Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUEhwtmdU1xLZe76akZnCT9EnKgVGBopM-5OD40N2CnCgYeauDuvshysI&s=10', price: 240.01 },
  { id: '17', name: 'Customized Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6jvFtBuTjezcbiHQN57KIwm0kjLC35Z1VV4Cr2gNb-KwT2U7n39KjTHE&s=10', price: null },
  { id: '18', name: 'Pizza Sauce', category: 'Sauces & Dressings', unit: 'box', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPv7HxAHbKAHqCEbh-jFkncUBJnr_GNZTdGJdKHgf5SA&s=10', price: 1359.67 },
  { id: '19', name: 'Makhni Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2VcFpI0Yc-44bBng9q-VwAbhGtnYA2QglmdtRDWviLw&s=10', price: 229.75 },
  { id: '20', name: 'Peri Peri', category: 'Sauces & Dressings', unit: 'packet', image: 'https://assets.hyperpure.com/data/images/products/b119d62ac06254c71c88a59807ee4a23.png', price: 238.00 },
  { id: '21', name: 'Korean Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://5.imimg.com/data5/SELLER/Default/2025/7/532155818/TV/XZ/LQ/123815550/1kg-korean-barbeque-chilli-sauce.png', price: null },
  { id: '22', name: 'Spicy Garlic Sauce', category: 'Sauces & Dressings', unit: 'packet', image: 'https://assets.hyperpure.com/data/images/products/691d5aef911e761fe41d11f7ed8acec7.png', price: 236.50 },

  // Toppings
  { id: '23', name: 'Black Olives', category: 'Toppings', unit: 'unit', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp3rbaW0gq8v72wtto_EYKtMA1M6LNj5Himn5Exm1JPA&s', price: null },
  { id: '24', name: 'Jalapeno', category: 'Toppings', unit: 'unit', image: 'https://www.kiranapoorti.com/image/cache/catalog/SARWAR%20JALAPINOS-225x225.jpeg', price: null },

  // Frozen/Prepared Foods
  { id: '25', name: 'Tikki', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvjJXD77qjfaFYWCFh_u0R8ge0ClCc21YRtpC_frUI5Q&s=10', price: 855.60 },
  { id: '26', name: 'French Fries', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8KIENaZXAqzthNmim8Q0rteZHRZP4zt8XPsjdfSeXkmspBCfCXsBhmcA&s=10', price: 1481.97 },
  { id: '27', name: 'Manchurian', category: 'Frozen/Prepared Foods', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQe2lMhfvV5d1ndzon5uE1fk_Iu6uIeB-cDou4b1n8cqJVX8FV-SQdmr8&s=10', price: 132.01 },
  { id: '28', name: 'Corn', category: 'Frozen/Prepared Foods', unit: 'box', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5nrBTErra1HdFfQQQ6tjjiVd4hB7h9PZA5WQOurHTavnqjEpbEL-CXPS_&s=10', price: 1260.00 },

  // Packaging/Boxes
  { id: '29', name: 'Pizza Box', category: 'Packaging/Boxes', unit: 'box', image: 'https://m.media-amazon.com/images/I/717u+nWAaTL._AC_UF894,1000_QL80_.jpg', price: 475.01 },
  { id: '30', name: 'Parcel Ketchup', category: 'Packaging/Boxes', unit: 'box', image: 'https://m.media-amazon.com/images/I/71nqJAlHjnL._AC_UF894,1000_QL80_.jpg', price: null },
  { id: '31', name: 'Ketchup', category: 'Packaging/Boxes', unit: 'box', image: 'https://www.bbassets.com/media/uploads/p/l/40032979_4-heinz-tomato-ketchup.jpg', price: 204.75 },

  // Spices/Seasonings
  { id: '32', name: 'Peri Peri Masala', category: 'Spices/Seasonings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1rr9FY5j2eam3mJb62JHrZCQCAv89AXWwX0kwR-Uriw&s=10', price: null },
  { id: '33', name: 'Parcel Oregano', category: 'Spices/Seasonings', unit: 'packet', image: 'https://5.imimg.com/data5/DB/RX/ZI/SELLER-1442638/vkl-oregano-seasoning-sachet-0-8gm-pouch.jpg', price: 172.30 },
  { id: '34', name: 'Parcel Chilli Flakes', category: 'Spices/Seasonings', unit: 'packet', image: 'https://5.imimg.com/data5/SELLER/Default/2023/8/339475399/NY/CM/AW/93581834/chilli-flakes-sachet-500x500.jpg', price: 162.50 },
  { id: '35', name: 'Oregano', category: 'Spices/Seasonings', unit: 'packet', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt7rE7c01frkhQi4y1iqgvI9NTbB9Oyo3Fw6kf2Y1vQw&s=10', price: null },
  { id: '36', name: 'Chilli Flakes', category: 'Spices/Seasonings', unit: 'packet', image: 'https://m.media-amazon.com/images/I/613boUkik6L.jpg', price: null },

  // Oils & Fats
  { id: '37', name: 'Oil', category: 'Oils & Fats', unit: 'box', image: 'https://m.media-amazon.com/images/I/71XEWRivd9L._AC_UF350,350_QL80_.jpg', price: 1821.00 },
  { id: '38', name: 'Butter', category: 'Oils & Fats', unit: 'box', image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/butter/w/e/i/-original-imagz7ffvezgmzfk.jpeg?q=90', price: null },
  { id: '39', name: 'Paneer', category: 'Oils & Fats', unit: 'Gms', image: 'https://newsmeter.in/h-upload/2025/02/13/394708-20250213175015.webp', price: null },
 ];

// In-memory storage (resets on server restart) - fallback if Supabase not configured
let orders = [];

export const db = {
  getItems: () => {
    return INITIAL_ITEMS;
  },

  getOrders: async () => {
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getOrders error:', error);
        throw error;
      }

      // Transform Supabase data to match expected format
      return data.map(order => ({
        id: order.id,
        personName: order.person_name,
        notes: order.notes,
        items: order.items,
        totalItems: order.total_items,
        status: order.status,
        createdAt: order.created_at,
        cancelledAt: order.cancelled_at
      }));
    } catch (error) {
      console.error('Supabase error, using in-memory fallback:', error.message);
      console.error('Full error:', error);
      // Return in-memory orders sorted by creation date descending
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  createOrder: async (orderData) => {
    // Try Supabase first
    try {
      const newOrder = {
        id: `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        person_name: orderData.personName || 'Unnamed Person',
        notes: orderData.notes || '',
        items: orderData.items || [],
        total_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
        status: 'Ordered',
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        console.error('Supabase createOrder error:', error);
        throw error;
      }

      // Transform back to expected format
      return {
        id: data.id,
        personName: data.person_name,
        notes: data.notes,
        items: data.items,
        totalItems: data.total_items,
        status: data.status,
        createdAt: data.created_at,
        cancelledAt: data.cancelled_at
      };
    } catch (error) {
      console.error('Supabase error, using in-memory fallback:', error.message);
      console.error('Full error:', error);
      // Fallback to in-memory storage
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
    }
  },

  cancelOrder: async (orderId) => {
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'Cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Transform back to expected format
      return {
        id: data.id,
        personName: data.person_name,
        notes: data.notes,
        items: data.items,
        totalItems: data.total_items,
        status: data.status,
        createdAt: data.created_at,
        cancelledAt: data.cancelled_at
      };
    } catch (error) {
      console.warn('Supabase error, using in-memory fallback:', error.message);
      // Fallback to in-memory storage
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex > -1) {
        orders[orderIndex].status = 'Cancelled';
        orders[orderIndex].cancelledAt = new Date().toISOString();
        return orders[orderIndex];
      }
      return null;
    }
  },

  deleteOrder: async (orderId) => {
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Transform back to expected format
      return {
        id: data.id,
        personName: data.person_name,
        notes: data.notes,
        items: data.items,
        totalItems: data.total_items,
        status: data.status,
        createdAt: data.created_at,
        cancelledAt: data.cancelled_at
      };
    } catch (error) {
      console.warn('Supabase error, using in-memory fallback:', error.message);
      // Fallback to in-memory storage
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex > -1) {
        const deletedOrder = orders.splice(orderIndex, 1)[0];
        return deletedOrder;
      }
      return null;
    }
  },

  getAnalytics: async (year, month) => {
    // Try Supabase first
    try {
      let query = supabase
        .from('orders')
        .select('*');

      // Filter by year if provided
      if (year) {
        const startDate = new Date(year, 0, 1).toISOString();
        const endDate = new Date(year + 1, 0, 1).toISOString();
        query = query.gte('created_at', startDate).lt('created_at', endDate);
      }

      // Filter by month if provided
      if (month !== undefined) {
        const startDate = new Date(year || new Date().getFullYear(), month, 1).toISOString();
        const endDate = new Date(year || new Date().getFullYear(), month + 1, 1).toISOString();
        query = query.gte('created_at', startDate).lt('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter out cancelled orders and transform data
      const filteredOrders = data
        .filter(order => order.status !== 'Cancelled')
        .map(order => ({
          id: order.id,
          personName: order.person_name,
          notes: order.notes,
          items: order.items,
          totalItems: order.total_items,
          status: order.status,
          createdAt: order.created_at,
          cancelledAt: order.cancelled_at
        }));

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
    } catch (error) {
      console.warn('Supabase error, using in-memory fallback:', error.message);
      // Fallback to in-memory storage
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
  }
};
