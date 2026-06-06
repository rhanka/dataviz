import { mount } from 'svelte';
import '@sentropic/design-system-themes/css/sent-tech.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('#app introuvable');

export default mount(App, { target });
