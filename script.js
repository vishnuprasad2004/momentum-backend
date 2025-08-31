const APK_URL = "https://github.com/vishnuprasad2004/momentum/releases/download/v2.0.5-beta/application-07f1ae49-eadd-4a59-bc87-2904669f72c3.apk";

const qrDialog = document.getElementById("qr-dialog");


function isMobileDevice() {
	return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


function showQr() {
	qrDialog.showModal();
}

document.querySelectorAll(".download-btn").forEach((btn) => {
	btn.addEventListener("click", (e) => {
	  e.preventDefault(); // block <a> default
	  console.log("Download clicked, UA:", navigator.userAgent);
  
	  if (isMobileDevice()) {
		console.log("Mobile detected → redirecting to APK");
		window.location.href = APK_URL;
	  } else {
		console.log("Desktop detected → show QR");
		showQr();
	  }
	});
});
  

//  onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"
document.getElementById("mobile-menu-btn").addEventListener("click", () => {
	document.getElementById("mobile-menu").classList.toggle("hidden");
	console.log("Toggled mobile menu");

	// <i class="fa-solid fa-xmark"></i>
	document.getElementById("mobile-menu-btn").innerHTML = document
		.getElementById("mobile-menu")
		.classList.contains("hidden")
		? '<i class="fa-solid fa-bars font-xl"></i>'
		: '<i class="fa-solid fa-xmark font-xl"></i>';
});
