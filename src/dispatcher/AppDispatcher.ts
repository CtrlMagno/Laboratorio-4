import { EventEmitter } from 'events';

interface Action<T = unknown> {
    type: string;
    payload?: T;
}

class AppDispatcher extends EventEmitter {
    private static instance: AppDispatcher;

    private constructor() {
        super();
    }

    static getInstance(): AppDispatcher {
        if (!AppDispatcher.instance) {
            AppDispatcher.instance = new AppDispatcher();
        }
        return AppDispatcher.instance;
    }

    dispatch<T>(action: Action<T>): void {
        this.emit('action', action);
    }
}

export default AppDispatcher.getInstance(); 