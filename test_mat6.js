import { SPL2_DB } from './src/utils/spl2_database.js';
console.log(Object.keys(SPL2_DB.stress.values).filter(k=>k.includes('Carbon')));
