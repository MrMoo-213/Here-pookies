window.addEventListener("DOMContentLoaded", () => {
    document.title = "Sparx Maths";

    let favicon = document.querySelector("link[rel='icon'], link[rel='shortcut icon']");

    if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
    }

    favicon.type = "image/png";
    favicon.href = "/assets/favicon.png";
});
