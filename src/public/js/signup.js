console.log("Signup frontend javascript file");

// prerendering the image
$(function () {
	const fileTarget = $(".file-box .upload-hidden");

	fileTarget.on("change", function () {
		if (window.FileReader) {
			const uploadFile = $(this)[0].files[0];
			const fileType = uploadFile["type"];
			const validImageType = ["image/jpg", "image/jpeg", "image/png"];
			if (!validImageType.includes(fileType)) {
				alert("Please insert only jpeg, jpg and png!");
			} else {
				if (uploadFile) {
					$(".upload-img-frame")
						.attr("src", URL.createObjectURL(uploadFile))
						.addClass("success");
				}
			}
			const filename = uploadFile.name;
			$(this).siblings(".upload-name").val(filename);
		}
	});
});

function validateSignupForm() {
	const memberNick = $(".member-nick").val();
	const memberPassword = $(".member-password").val();
	const confirmPassword = $(".confirm-password").val();
	const memberPhone = $(".member-phone").val();

	if (
		memberNick === "" ||
		memberPassword === "" ||
		memberPhone === "" ||
		memberPassword === "" ||
		confirmPassword === ""
	) {
		alert("Please insert all required inputs!");
		return false;
	}

	if (memberPassword !== confirmPassword) {
		alert("Password does not match!");
		return false;
	}

	const memberImage = $(".member-image").get(0).files[0].name
		? $(".member-image").get(0).files[0].name
		: null;

	if (!memberImage) {
		alert("Please insert restaurant image");
		return false;
	}
	return true;
}
