export default defineNuxtPlugin(async () => {
  const { fetchUser, isChecked } = useAuth();

  if (!isChecked.value) {
    await fetchUser();
  }
});
