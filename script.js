document.addEventListener('DOMContentLoaded', function() {
  console.log('Site loaded successfully!');
  const header = document.querySelector('header');
  header.addEventListener('click', function() {
    alert('Welcome to nana-tarou.github.io!');
  });
});
