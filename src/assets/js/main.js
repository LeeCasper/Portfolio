// Add your javascript here
import AOS from "aos";

window.darkMode = false;

const stickyClasses = [];
const unstickyClasses = [];
const stickyClassesContainer = [
	"shadow-[0px_1px_4px_0_rgba(25,33,61,0.06)]",
	"rounded-[20px]",
	"bg-[#ffffff]/65",
	"border-[#ffffff]/65",
	"dark:border-neutral-600/40",
	"dark:bg-neutral-900/60",
	"backdrop-blur-2xl",
	"backdrop-brightness-120",
];
const unstickyClassesContainer = ["shadow-none", "border-transparent", "rounded-none", "bg-transparent"];
let headerElement = null;

document.addEventListener("DOMContentLoaded", () => {
	headerElement = document.getElementById("header");

	window.darkMode = document.documentElement.classList.contains("dark");
	stickyHeaderFuncionality();
	applyMenuItemClasses();
	evaluateHeaderPosition();
	mobileMenuFunctionality();

	// 初始化 AOS
	AOS.init({
		duration: 400,
		easing: "ease-out-cubic",
		once: true,
		offset: 20,
		delay: 0,
	});
});

// window.toggleDarkMode = function(){
//     document.documentElement.classList.toggle('dark');
//     if(document.documentElement.classList.contains('dark')){
//         localStorage.setItem('dark_mode', true);
//         window.darkMode = true;
//     } else {
//         window.darkMode = false;
//         localStorage.setItem('dark_mode', false);
//     }
// }

window.stickyHeaderFuncionality = () => {
	window.addEventListener("scroll", () => {
		evaluateHeaderPosition();
	});
};

window.evaluateHeaderPosition = () => {
	if (window.scrollY > 48) {
		headerElement.firstElementChild.classList.add(...stickyClassesContainer);
		headerElement.firstElementChild.classList.remove(...unstickyClassesContainer);
		headerElement.classList.add(...stickyClasses);
		headerElement.classList.remove(...unstickyClasses);
		// document.getElementById("menu").classList.add("top-[75px]");
		// document.getElementById("menu").classList.remove("top-[75px]");
	} else {
		headerElement.firstElementChild.classList.remove(...stickyClassesContainer);
		headerElement.firstElementChild.classList.add(...unstickyClassesContainer);
		headerElement.classList.add(...unstickyClasses);
		headerElement.classList.remove(...stickyClasses);
		// document.getElementById("menu").classList.remove("top-[56px]");
		// document.getElementById("menu").classList.add("top-[75px]");
	}
};

const themeRoot = document.documentElement;
let themeTransitionTimer = 0;

/**
 * 立即切换主题：先加 dark 类，再让配色做 260ms 过渡。
 * 旧实现要把太阳/月亮动画跑完（500ms）才真正换色，观感上就是「点了没反应」。
 */
function applyTheme(isDark) {
	themeRoot.classList.toggle("theme-transition", true);
	themeRoot.classList.toggle("dark", isDark);

	window.clearTimeout(themeTransitionTimer);
	themeTransitionTimer = window.setTimeout(() => {
		themeRoot.classList.remove("theme-transition");
	}, 280);

	if (isDark) {
		localStorage.setItem("dark_mode", true);
	} else {
		localStorage.removeItem("dark_mode");
	}

	window.darkMode = isDark;
}

document.getElementById("darkToggle").addEventListener("click", () => {
	applyTheme(!themeRoot.classList.contains("dark"));
});

window.applyMenuItemClasses = () => {
	const menuItems = document.querySelectorAll("#menu a");
	for (let i = 0; i < menuItems.length; i++) {
		if (menuItems[i].pathname === window.location.pathname) {
			menuItems[i].classList.add("text-neutral-900", "dark:text-white");
		}
	}
	//:class="{ 'text-neutral-900 dark:text-white': window.location.pathname == '{menu.url}', 'text-neutral-700 dark:text-neutral-400': window.location.pathname != '{menu.url}' }"
};

function mobileMenuFunctionality() {
	document.getElementById("openMenu").addEventListener("click", () => {
		openMobileMenu();
	});

	document.getElementById("closeMenu").addEventListener("click", () => {
		closeMobileMenu();
	});
}

window.openMobileMenu = () => {
	document.getElementById("openMenu").classList.add("hidden");
	document.getElementById("closeMenu").classList.remove("hidden");
	document.getElementById("menu").classList.remove("hidden");
	document.getElementById("mobileMenuBackground").classList.add("opacity-0");
	document.getElementById("mobileMenuBackground").classList.remove("hidden");

	setTimeout(() => {
		document.getElementById("mobileMenuBackground").classList.remove("opacity-0");
	}, 1);
};

window.closeMobileMenu = () => {
	document.getElementById("closeMenu").classList.add("hidden");
	document.getElementById("openMenu").classList.remove("hidden");
	document.getElementById("menu").classList.add("hidden");
	document.getElementById("mobileMenuBackground").classList.add("hidden");
};
