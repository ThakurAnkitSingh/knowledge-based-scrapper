// Polyfills for Node.js compatibility
import { Blob } from 'buffer';

// Define File globally if it doesn't exist
if (typeof globalThis.File === 'undefined') {
    globalThis.File = class File extends Blob {
        constructor(chunks, name, options = {}) {
            super(chunks, options);
            this.name = name;
            this.lastModified = options.lastModified || Date.now();
        }
    };
}
