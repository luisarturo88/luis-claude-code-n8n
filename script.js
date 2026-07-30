const DOCTOR_PHONE = "593980973781";

const bookingForm = document.querySelector("#bookingForm");
const emergencyModal = document.querySelector("#emergencyModal");
const serviceSelector = document.querySelector(".service-selector");
const visitDateInput = bookingForm.elements.visitDate;
const lastVisitInput = bookingForm.elements.lastVisit;
const toast = document.querySelector("#toast");

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "No registrada";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3600);
};

const today = toLocalDateString(new Date());
visitDateInput.min = today;
lastVisitInput.max = today;

document.querySelectorAll("[data-open-emergency]").forEach((button) => {
  button.addEventListener("click", () => emergencyModal.showModal());
});

document.querySelectorAll("[data-close-emergency]").forEach((button) => {
  button.addEventListener("click", () => emergencyModal.close());
});

emergencyModal.addEventListener("click", (event) => {
  if (event.target === emergencyModal) emergencyModal.close();
});

document.querySelectorAll("[data-service]").forEach((card) => {
  card.addEventListener("click", () => {
    const selectedService = card.dataset.service;
    const radio = bookingForm.querySelector(`input[name="service"][value="${selectedService}"]`);

    if (radio) {
      radio.checked = true;
      serviceSelector.classList.remove("invalid");
    }

    document.querySelector("#reserva").scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => radio?.focus(), 650);
  });
});

bookingForm.addEventListener("change", (event) => {
  if (event.target.name === "service") serviceSelector.classList.remove("invalid");
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  bookingForm.classList.add("was-validated");

  const service = bookingForm.querySelector('input[name="service"]:checked');
  serviceSelector.classList.toggle("invalid", !service);

  if (!bookingForm.checkValidity() || !service) {
    const firstInvalid = bookingForm.querySelector(":invalid");
    firstInvalid?.focus();
    showToast("Revisa los campos marcados antes de continuar.");
    return;
  }

  const formData = new FormData(bookingForm);
  const details = {
    service: formData.get("service"),
    owner: formData.get("ownerName").trim(),
    pet: formData.get("petName").trim(),
    species: formData.get("species"),
    breed: formData.get("breed").trim() || "No indicada",
    age: formData.get("petAge").trim() || "No indicada",
    visitDate: formatDate(formData.get("visitDate")),
    lastVisit: formatDate(formData.get("lastVisit")),
    notes: formData.get("notes").trim() || "Sin notas adicionales",
  };

  const message = [
    "Hola Dr. Luis Arturo García, quisiera solicitar una cita veterinaria.",
    "",
    `Servicio: ${details.service}`,
    `Responsable: ${details.owner}`,
    `Mascota: ${details.pet}`,
    `Especie: ${details.species}`,
    `Raza: ${details.breed}`,
    `Edad: ${details.age}`,
    `Fecha deseada: ${details.visitDate}`,
    `Última visita: ${details.lastVisit}`,
    `Notas o síntomas: ${details.notes}`,
    "",
    "Quedo pendiente de su confirmación. Gracias.",
  ].join("\n");

  const whatsappUrl = `https://wa.me/${DOCTOR_PHONE}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(whatsappUrl, "_blank");

  if (!whatsappWindow) {
    window.location.href = whatsappUrl;
  } else {
    whatsappWindow.opener = null;
    showToast("WhatsApp está listo. Envía el mensaje para solicitar la cita.");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  revealObserver.observe(element);
});
