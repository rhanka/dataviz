import { mount } from 'svelte';
// Global design-system component stylesheet (.st-* classes). Required so that
// Svelte components AND React/Vue islands all render with design-system styling
// (Svelte's scoped styles don't cover the islands).
import '@sentropic/design-system-react/styles.css';
import './app.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('#app introuvable');

export default mount(App, { target });
