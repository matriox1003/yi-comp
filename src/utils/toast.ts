export function toast(msg: string) {
  const el = document.createElement("div");
  el.className = "toast-msg";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}
