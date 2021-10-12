/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const theme = new URLSearchParams(window.location.search).get('theme');
document.documentElement.dataset.theme = theme;

const base = document.createElement('base');
base.setAttribute('target', '_blank');
document.head.appendChild(base);

const style = document.createElement('style');
let styleString = `
button#openFile, button#download, a#viewBookmark, button#secondaryOpenFile, button#secondaryDownload, a#secondaryViewBookmark {
    display: none!important;
}
#viewerContainer {
    contain: layout paint;
}
`;
if (theme === 'dark') {
    styleString += `
    :root {
        color-scheme: dark;
    }
    `;
}
style.textContent = styleString;
document.head.appendChild(style);

document.addEventListener('webviewerloaded', () => {
    PDFViewerApplication.pdfLinkService.externalLinkTarget = 2;
});
