import React, { useState, useEffect } from 'react';
import { apiService, GroceryList, GroceryItem } from '../services/apiService';
import './GroceryListComponent.css';

const GroceryListComponent: React.FC = () => {
  const [groceryList, setGroceryList] = useState<GroceryList>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Set default dates (current week)
  useEffect(() => {
    const today = new Date();
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const currentWeekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    setStartDate(currentWeekStart.toISOString().split('T')[0]);
    setEndDate(currentWeekEnd.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await apiService.getGroceryList();
      setGroceryList(list);
    } catch (err) {
      setError('Failed to load grocery list');
      console.error('Error loading grocery list:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const list = await apiService.generateGroceryList(startDate, endDate);
      setGroceryList(list);
    } catch (err) {
      setError('Failed to generate grocery list');
      console.error('Error generating grocery list:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemChecked = async (index: number) => {
    const updatedItems = [...groceryList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      checked: !updatedItems[index].checked
    };

    try {
      const updatedList = await apiService.updateGroceryList(updatedItems);
      setGroceryList(updatedList);
    } catch (err) {
      setError('Failed to update grocery list');
      console.error('Error updating grocery list:', err);
    }
  };

  const updateItemQuantity = async (index: number, quantity: number) => {
    const updatedItems = [...groceryList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity
    };

    try {
      const updatedList = await apiService.updateGroceryList(updatedItems);
      setGroceryList(updatedList);
    } catch (err) {
      setError('Failed to update grocery list');
      console.error('Error updating grocery list:', err);
    }
  };

  const removeItem = async (index: number) => {
    const updatedItems = groceryList.items.filter((_, i) => i !== index);

    try {
      const updatedList = await apiService.updateGroceryList(updatedItems);
      setGroceryList(updatedList);
    } catch (err) {
      setError('Failed to remove item');
      console.error('Error removing item:', err);
    }
  };

  const addCustomItem = async () => {
    const name = prompt('Enter item name:');
    if (!name) return;

    const quantityStr = prompt('Enter quantity:', '1');
    const quantity = parseInt(quantityStr || '1', 10);

    const unit = prompt('Enter unit (optional):', '');

    const newItem: GroceryItem = {
      name,
      quantity,
      unit: unit || '',
      checked: false
    };

    const updatedItems = [...groceryList.items, newItem];

    try {
      const updatedList = await apiService.updateGroceryList(updatedItems);
      setGroceryList(updatedList);
    } catch (err) {
      setError('Failed to add item');
      console.error('Error adding item:', err);
    }
  };

  const getTotalItems = () => groceryList.items.length;
  const getCheckedItems = () => groceryList.items.filter(item => item.checked).length;

  return (
    <div className="grocery-list-container">
      <h1>🛒 Grocery List</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="controls-section">
        <h2>Generate New List</h2>
        <div className="date-controls">
          <div className="date-input">
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input">
            <label htmlFor="end-date">End Date:</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={generateGroceryList}
            disabled={loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate List'}
          </button>
        </div>
      </div>

      <div className="list-section">
        <div className="list-header">
          <h2>Current Grocery List</h2>
          <div className="list-stats">
            {getCheckedItems()}/{getTotalItems()} items completed
          </div>
          {groceryList.generatedAt && (
            <div className="generated-info">
              Generated: {new Date(groceryList.generatedAt).toLocaleString()}
              {groceryList.dateRange && (
                <span>
                  {' '}for {new Date(groceryList.dateRange.startDate).toLocaleDateString()} - {new Date(groceryList.dateRange.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="list-actions">
          <button onClick={addCustomItem} className="add-item-btn">
            + Add Custom Item
          </button>
          <button onClick={loadGroceryList} disabled={loading} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {groceryList.items.length === 0 ? (
          <div className="empty-list">
            <p>No items in your grocery list.</p>
            <p>Generate a list from your meal plan or add custom items.</p>
          </div>
        ) : (
          <div className="grocery-items">
            {groceryList.items.map((item, index) => (
              <div
                key={index}
                className={`grocery-item ${item.checked ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItemChecked(index)}
                  className="item-checkbox"
                />
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="item-quantity">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value, 10))}
                      min="1"
                      className="quantity-input"
                    />
                    {item.unit && <span className="item-unit">{item.unit}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="remove-btn"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryListComponent;
