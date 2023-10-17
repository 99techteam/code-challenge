export function handleOnlyNumberKeyPress(e) {
	if (e.charCode < 48 || e.charCode > 57) {
		e.preventDefault();
	}
}
