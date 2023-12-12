setTimeout(() => {
  document?.getElementById("lgpd_form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    var checkeds = [];
    var form = document.querySelectorAll('[name="lgpd[]"]:checked');

    form.forEach((item) => {
      checkeds.push(item.value);
    });

    localStorage?.setItem("lgpd_fiestou", JSON.stringify(checkeds));
    localStorage?.setItem("allow_fiestou", "true");

    document.location.reload();

    return false;
  });

  document?.getElementById("lgpd_reset")?.addEventListener("click", (e) => {
    localStorage.removeItem("lgpd_fiestou");
    localStorage.removeItem("allow_fiestou");

    document.location.reload();
  });
}, 100);
