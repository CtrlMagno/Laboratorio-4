import AppDispatcher from '../dispatcher/AppDispatcher';
import { CartItem } from '../store/CartStore';

export const CartActionTypes = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART'
};

export const CartActions = {
    addItem(item: Omit<CartItem, 'quantity'>): void {
        console.log('CartActions: Dispatching ADD_ITEM', item);
        AppDispatcher.dispatch({
            type: CartActionTypes.ADD_ITEM,
            payload: item
        });
    },

    removeItem(id: string): void {
        AppDispatcher.dispatch({
            type: CartActionTypes.REMOVE_ITEM,
            payload: id
        });
    },

    updateQuantity(id: string, quantity: number): void {
        AppDispatcher.dispatch({
            type: CartActionTypes.UPDATE_QUANTITY,
            payload: { id, quantity }
        });
    },

    clearCart(): void {
        AppDispatcher.dispatch({
            type: CartActionTypes.CLEAR_CART
        });
    }
}; 