const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu-principal");
const linksMenu = menu.querySelectorAll("a");

menuToggle.addEventListener("click", () => {
  const menuAberto = menu.classList.toggle("ativo");

  menuToggle.setAttribute(
    "aria-expanded",
    menuAberto ? "true" : "false"
  );

  menuToggle.textContent = menuAberto ? "✕" : "☰";
});

linksMenu.forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("ativo");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.textContent = "☰";
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1000) {
    menu.classList.remove("ativo");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.textContent = "☰";
  }
});