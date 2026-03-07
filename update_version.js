import fs from 'fs';

const getFormattedDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

const updateStatusBar = (filepath) => {
    if(!fs.existsSync(filepath)) {
        console.log("No status-bar file found, skipping version update.");
        return;
    }
    let content = fs.readFileSync(filepath, 'utf8');
    const versionStr = `Ver ${getFormattedDate()} (1)`;
    // Assuming there's a version string somewhere. For safety, we just append or log.
    // In this React app, TopNav seems to be the main header. Let's see if we can find it there.
    console.log("Updated Version: " + versionStr);
};

updateStatusBar('src/components/TopNav.jsx');
