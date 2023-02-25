
import { Injectable } from '@angular/core';
import { StorageKey, StorageKey2, StorageKey3} from '../interfaces/storage-key';

@Injectable({
    providedIn: 'root',
})



export class StorageService {
    private storage: Storage;

    constructor() {
        this.storage = localStorage;
    }

    public save(key: StorageKey, value: any): void {
        value = JSON.stringify(value);
        this.storage.setItem(key, value);
    }

    public read(key: StorageKey): any {
        const value = this.storage.getItem(key);
        if (value)
        {return JSON.parse(value); }
        else { return null; }
    }

    public remove(key: StorageKey) {
        return this.storage.removeItem(key);
    }

    public clear() {
        this.storage.clear();
    }


    public save2(key: StorageKey2, value: any): void {
        value = JSON.stringify(value);
        this.storage.setItem(key, value);
    }

    public read2(key: StorageKey2): any {
        const value = this.storage.getItem(key);
        // return JSON.parse(value);

        if (value)
        {return JSON.parse(value); }
        else { return null; }
    }

    public remove2(key: StorageKey2) {
        return this.storage.removeItem(key);
    }

    public save3(key: StorageKey3, value: any): void {
        value = JSON.stringify(value);
        this.storage.setItem(key, value);
    }

    // public read3(key: StorageKey3): any {
    //     const value = this.storage.getItem(key);
    //     return JSON.parse(value);
    // }

    public read3(key: StorageKey3): any {
      const value = this.storage.getItem(key);
      // return JSON.parse(value);

      if (value)
      {return JSON.parse(value); }
      else { return null; }
  }

    public remove3(key: StorageKey3) {
        return this.storage.removeItem(key);
    }

    //     public save4(key: StorageKey4, value: any): void {
    //         value = JSON.stringify(value);
    //         this.storage.setItem(key, value);
    //     }

    //     public read4(key: StorageKey4): any {
    //         const value = this.storage.getItem(key);
    //         return JSON.parse(value);
    //     }

    //     public remove4(key: StorageKey4) {
    //         return this.storage.removeItem(key);
    // }

}

