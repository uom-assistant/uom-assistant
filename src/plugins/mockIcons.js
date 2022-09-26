if (process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
        const style = document.createElement('link');
        style.setAttribute('type', 'text/css');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css');
        document.getElementsByTagName('head')[0].appendChild(style);
    });
}
