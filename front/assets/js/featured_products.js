const slider = document.querySelector('.featured-products .productos');
const btnPrev = document.querySelector('.featured-products .ctrl-left');
const btnNext = document.querySelector('.featured-products .ctrl-right');

btnPrev.addEventListener('click', () => {
  slider.scrollBy({ left: -300, behavior: 'smooth' });
});

btnNext.addEventListener('click', () => {
  slider.scrollBy({ left: 300, behavior: 'smooth' });
});