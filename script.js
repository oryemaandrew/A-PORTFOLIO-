const themeToggle = document.getElementById("navThemeToggle");
const themePreference = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(theme, persist = false) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-theme", isLight);

    if (themeToggle) {
        themeToggle.textContent = isLight ? "Dark" : "Light";
    }
    if (themeToggle) {
        themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
        "content",
        isLight ? "#f5f8f7" : "#10171b"
    );

    if (persist) {
        localStorage.setItem("portfolio-theme", theme);
    }
}

const savedTheme = localStorage.getItem("portfolio-theme");
applyTheme(savedTheme || (themePreference.matches ? "light" : "dark"));

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    applyTheme(nextTheme, true);
});

themePreference.addEventListener("change", (event) => {
    if (!localStorage.getItem("portfolio-theme")) {
        applyTheme(event.matches ? "light" : "dark");
    }
});

const menuButton = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

function setMenuOpen(isOpen) {
    menuButton?.classList.toggle("active", isOpen);
    navLinks?.classList.toggle("active", isOpen);
    menuButton?.setAttribute("aria-expanded", String(isOpen));
    menuButton?.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

menuButton?.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setMenuOpen(false);
    }
});

const sectionLinks = new Map(
    [...document.querySelectorAll(".nav-item[href^='#']")].map((link) => [
        link.getAttribute("href").slice(1),
        link
    ])
);

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = sectionLinks.get(entry.target.id);
            if (link && entry.isIntersecting) {
                sectionLinks.forEach((item) => item.classList.remove("active"));
                link.classList.add("active");
            }
        });
    }, { rootMargin: "-25% 0px -60% 0px" });

    document.querySelectorAll("main section[id]").forEach((section) => {
        sectionObserver.observe(section);
    });
}

const scrollProgress = document.querySelector(".scroll-progress");
const backToTop = document.getElementById("backToTop");
let scrollableHeight = 0;
let scrollUpdatePending = false;

function updateScrollUI() {
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight * 100 : 0;

    if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
    }
    backToTop?.classList.toggle("show", window.scrollY > 500);
}

function measureScrollRange() {
    scrollableHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    updateScrollUI();
}

window.addEventListener("scroll", () => {
    if (!scrollUpdatePending) {
        scrollUpdatePending = true;
        window.requestAnimationFrame(() => {
            updateScrollUI();
            scrollUpdatePending = false;
        });
    }
}, { passive: true });
window.addEventListener("resize", measureScrollRange);
if ("ResizeObserver" in window) {
    new ResizeObserver(measureScrollRange).observe(document.body);
}
measureScrollRange();

backToTop?.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
});

const year = document.getElementById("currentYear");
if (year) {
    year.textContent = String(new Date().getFullYear());
}

const contactForm = document.querySelector(".contact-form");
const formStatus = document.getElementById("formStatus");

function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
}

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    showFormStatus("Sending your message…", "pending");

    try {
        const response = await fetch(contactForm.action, {
            method: "POST",
            body: new FormData(contactForm),
            headers: { Accept: "application/json" }
        });

        if (!response.ok) {
            console.error(`Contact form submission failed with status ${response.status}.`);
            showFormStatus("Your message could not be sent. Please email me directly instead.", "error");
            return;
        }

        contactForm.reset();
        showFormStatus("Thanks for reaching out. Your message has been sent.", "success");
    } catch (error) {
        console.error("Contact form network error:", error);
        showFormStatus("A network error stopped your message from sending. Please email me directly.", "error");
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});
